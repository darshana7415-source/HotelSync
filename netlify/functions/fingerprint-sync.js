// POST /.netlify/functions/fingerprint-sync
// Called only by the bridge program running on the reception PC (never by the browser).
// Requires header: x-bridge-secret: <FINGERPRINT_BRIDGE_SECRET>
//
// Body: { events: [ { serialNo, employeeNo, name, time }, ... ] }
//   serialNo   - the device's AcsEvent "serialNo" field (per-device incrementing ID, used for idempotency)
//   employeeNo - the device's "employeeNoString" field (raw, as returned by ISAPI)
//   time       - ISO timestamp string from the device event ("time" field)
//
// For each event: looks up the mapping in fingerprint_device_users, then either opens a new
// attendance_records row (check-in) or closes the existing open one (check-out) for that staff
// member, exactly mirroring how the phone clock-in/out flow already works. Unmapped device
// employee numbers (e.g. an ex-staff member still enrolled on the machine) are skipped and logged,
// never written to attendance_records.

const { restRequest, selectOne, insertRow, updateRows } = require("./lib/supabaseAdmin");

const JSON_HEADERS = { "content-type": "application/json" };
const DUPLICATE_SCAN_WINDOW_MS = 60 * 1000; // ignore a second scan within 60s of clock-in as an accidental double-tap

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

async function findOpenAttendanceRecord(staffProfileId) {
  const rows = await restRequest("attendance_records", {
    query: {
      select: "id,clock_in_at",
      staff_profile_id: `eq.${staffProfileId}`,
      clock_out_at: "is.null",
      order: "clock_in_at.desc",
      limit: "1"
    }
  });
  return (rows && rows[0]) || null;
}

async function alreadyProcessed(serialNo) {
  const existing = await selectOne("fingerprint_events", {
    select: "device_serial_no",
    eq: { device_serial_no: serialNo }
  });
  return Boolean(existing);
}

async function logEvent({ serialNo, employeeNo, eventTime, staffProfileId, attendanceRecordId, action }) {
  try {
    await insertRow("fingerprint_events", {
      device_serial_no: serialNo,
      device_employee_no: employeeNo,
      event_time: eventTime,
      staff_profile_id: staffProfileId || null,
      attendance_record_id: attendanceRecordId || null,
      action
    });
  } catch {
    // Logging failure shouldn't block the actual attendance write -- it already happened.
  }
}

async function processOneEvent(evt) {
  const serialNo = Number(evt.serialNo);
  const employeeNo = String(evt.employeeNo || "");
  const eventTime = evt.time ? new Date(evt.time).toISOString() : new Date().toISOString();

  if (!serialNo || !employeeNo) {
    return { serialNo, action: "skipped_invalid" };
  }

  if (await alreadyProcessed(serialNo)) {
    return { serialNo, action: "already_processed" };
  }

  const mapping = await selectOne("fingerprint_device_users", {
    select: "staff_profile_id,device_name",
    eq: { device_employee_no: employeeNo }
  });

  if (!mapping) {
    await logEvent({ serialNo, employeeNo, eventTime, action: "skipped_unmapped" });
    return { serialNo, action: "skipped_unmapped", employeeNo };
  }

  const staffProfileId = mapping.staff_profile_id;
  const open = await findOpenAttendanceRecord(staffProfileId);

  if (open) {
    const msSinceClockIn = new Date(eventTime).getTime() - new Date(open.clock_in_at).getTime();
    if (msSinceClockIn >= 0 && msSinceClockIn < DUPLICATE_SCAN_WINDOW_MS) {
      await logEvent({ serialNo, employeeNo, eventTime, staffProfileId, attendanceRecordId: open.id, action: "ignored_duplicate_scan" });
      return { serialNo, action: "ignored_duplicate_scan", staffProfileId };
    }

    await updateRows("attendance_records", {
      eq: { id: open.id },
      patch: { clock_out_at: eventTime, status: "completed" }
    });
    await logEvent({ serialNo, employeeNo, eventTime, staffProfileId, attendanceRecordId: open.id, action: "checkOut" });
    return { serialNo, action: "checkOut", staffProfileId };
  }

  const created = await insertRow("attendance_records", {
    staff_profile_id: staffProfileId,
    clock_in_at: eventTime,
    status: "present"
  });
  await logEvent({ serialNo, employeeNo, eventTime, staffProfileId, attendanceRecordId: created?.id, action: "checkIn" });
  return { serialNo, action: "checkIn", staffProfileId };
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, message: "Method not allowed." });
  }

  const secret = process.env.FINGERPRINT_BRIDGE_SECRET;
  if (!secret) {
    return json(500, { ok: false, message: "FINGERPRINT_BRIDGE_SECRET is not set in Netlify environment variables." });
  }
  const provided = event.headers["x-bridge-secret"] || event.headers["X-Bridge-Secret"];
  if (provided !== secret) {
    return json(401, { ok: false, message: "Invalid bridge secret." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, message: "Invalid request body." });
  }

  const events = Array.isArray(payload.events) ? payload.events : [];
  if (!events.length) {
    return json(200, { ok: true, results: [] });
  }

  const results = [];
  try {
    // Process sequentially (not in parallel) so check-in/check-out ordering stays correct
    // for the same staff member across consecutive events in this batch.
    for (const evt of events) {
      // eslint-disable-next-line no-await-in-loop
      results.push(await processOneEvent(evt));
    }
    return json(200, { ok: true, results });
  } catch (error) {
    return json(500, { ok: false, message: error.message || "Fingerprint sync failed.", results });
  }
};

