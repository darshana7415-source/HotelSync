// POST /.netlify/functions/fingerprint-sync
// Called only by the bridge program running on the reception PC (never by the browser).
// Requires header: x-bridge-secret: <FINGERPRINT_BRIDGE_SECRET>
//
// Body: { events: [ { serialNo, employeeNo, name, time, minor }, ... ] }
//   serialNo   - the device's AcsEvent "serialNo" field (per-device incrementing ID, used for idempotency)
//   employeeNo - the device's "employeeNoString" field (raw, as returned by ISAPI)
//   time       - ISO timestamp string from the device event ("time" field)
//   minor      - the device's AcsEvent "minor" field. Only minor === 38 ("real person verification
//                passed") is trusted. A FAILED face/fingerprint match can still carry an
//                employeeNoString (the device's best-guess candidate), so this check is what tells
//                a real scan apart from a failed one -- it's enforced here (not just in the bridge
//                script) so a future bridge reinstall/misconfiguration can't silently reopen this hole.
//
// For each event: looks up the mapping in fingerprint_device_users, then either opens a new
// attendance_records row (check-in) or closes the existing open one (check-out) for that staff
// member, exactly mirroring how the phone clock-in/out flow already works. Unmapped device
// employee numbers (e.g. an ex-staff member still enrolled on the machine) are skipped and logged,
// never written to attendance_records.
//
// A scan is only ever allowed to close an open shift from a PREVIOUS calendar day if it doesn't
// land near that person's scheduled start time for today (see ROSTER_MATCH_WINDOW_MINUTES below) --
// otherwise it starts a fresh shift instead, since that's almost always what a scan near a
// scheduled start time means, regardless of how long the previous shift has been open.

const { restRequest, selectOne, insertRow, updateRows } = require("./lib/supabaseAdmin");

const JSON_HEADERS = { "content-type": "application/json" };
// Ignore a second scan within this window of clock-in (or of a just-recorded checkout) as an
// accidental double-tap. Widened from 60s to 5 minutes after seeing real double-fires ranging
// from 2 seconds to 3 minutes apart -- a person walking off after a tap they weren't sure
// registered, or the sensor itself double-triggering.
const DUPLICATE_SCAN_WINDOW_MS = 5 * 60 * 1000;
const SUCCESSFUL_VERIFY_MINOR = 38;
// If someone's open shift is older than this, a new scan should NOT be treated as closing it --
// it almost certainly means the original clock-out was simply never captured (forgotten, device
// offline, staff used the old phone flow and never tapped out, etc.), and the stale record has
// been sitting open for a day or more. Closing it with today's scan produces nonsense like
// "checked in 3 weeks ago, checked out just now" and swallows what should have been a fresh
// check-in. Past this age, a new scan starts a brand new shift instead; the old one is left
// alone (still open) for a manager to close manually with the right context.
const MAX_OPEN_SHIFT_HOURS = 20;
// Below MAX_OPEN_SHIFT_HOURS, duration alone can't tell a real long overnight shift (some staff
// legitimately run ~13h shifts) apart from a missed checkout followed by the next scheduled shift
// starting the next day -- both just look like "a scan N hours after the last one." When there's
// an open record from a PREVIOUS calendar day and the new scan lands close to that person's
// *scheduled* start time for today (per daily_rosters), that's a strong independent signal this
// is a fresh check-in, not a checkout of the old shift -- regardless of the elapsed hours.
const ROSTER_MATCH_WINDOW_MINUTES = 90;
const TIMEZONE = "Asia/Colombo";

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

// Returns { dateKey: "YYYY-MM-DD", minutesOfDay } for a UTC ISO timestamp, in hotel-local time.
function localDateAndMinutes(isoString) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date(isoString));
  const v = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return { dateKey: `${v.year}-${v.month}-${v.day}`, minutesOfDay: Number(v.hour) * 60 + Number(v.minute) };
}

function circularMinuteDiff(a, b) {
  const diff = Math.abs(a - b) % 1440;
  return Math.min(diff, 1440 - diff);
}

// Looks up the person's scheduled shift start time for a given local calendar date, if any.
async function getScheduledStartMinutes(staffProfileId, dateKey) {
  const row = await selectOne("daily_rosters", {
    select: "in_time",
    eq: { staff_profile_id: staffProfileId, roster_date: dateKey }
  });
  if (!row || !row.in_time) return null;
  const [h, m] = String(row.in_time).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

async function findOpenAttendanceRecord(staffProfileId, eventTime) {
  const cutoffIso = new Date(new Date(eventTime).getTime() - MAX_OPEN_SHIFT_HOURS * 3600000).toISOString();
  const rows = await restRequest("attendance_records", {
    query: {
      select: "id,clock_in_at",
      staff_profile_id: `eq.${staffProfileId}`,
      clock_out_at: "is.null",
      clock_in_at: `gte.${cutoffIso}`,
      order: "clock_in_at.desc",
      limit: "1"
    }
  });
  return (rows && rows[0]) || null;
}

// Some scans arrive as two device events a few seconds (or a couple of minutes) apart for a
// single physical tap -- a sensor double-trigger, or someone tapping again right after a
// checkout beep they didn't notice. If the first event just closed a shift, the second one
// has no open record to close, so without this check it gets treated as a brand new check-in
// and creates a phantom "still working" shift that then sits open until someone notices it on
// the dashboard. This looks for a record that was closed within the duplicate-scan window
// immediately before this event, so that second stray scan can be ignored instead.
async function findRecentlyClosedRecord(staffProfileId, eventTime) {
  const cutoffIso = new Date(new Date(eventTime).getTime() - DUPLICATE_SCAN_WINDOW_MS).toISOString();
  const rows = await restRequest("attendance_records", {
    query: {
      select: "id,clock_out_at",
      staff_profile_id: `eq.${staffProfileId}`,
      clock_out_at: `gte.${cutoffIso}`,
      order: "clock_out_at.desc",
      limit: "1"
    }
  });
  const candidate = (rows && rows[0]) || null;
  if (!candidate) return null;
  // Guard against matching a close that happens to be timestamped after this event (should be
  // rare, but events aren't guaranteed to be processed in strict time order).
  if (new Date(candidate.clock_out_at).getTime() > new Date(eventTime).getTime()) return null;
  return candidate;
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

  // Server-side enforcement of the verification-success gate. If the caller didn't send a
  // minor code at all (older bridge build), fail closed and reject rather than assume success.
  if (Number(evt.minor) !== SUCCESSFUL_VERIFY_MINOR) {
    await logEvent({ serialNo, employeeNo, eventTime, action: "skipped_failed_verify" });
    return { serialNo, action: "skipped_failed_verify", employeeNo };
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
  const open = await findOpenAttendanceRecord(staffProfileId, eventTime);

  if (open) {
    const msSinceClockIn = new Date(eventTime).getTime() - new Date(open.clock_in_at).getTime();
    if (msSinceClockIn >= 0 && msSinceClockIn < DUPLICATE_SCAN_WINDOW_MS) {
      await logEvent({ serialNo, employeeNo, eventTime, staffProfileId, attendanceRecordId: open.id, action: "ignored_duplicate_scan" });
      return { serialNo, action: "ignored_duplicate_scan", staffProfileId };
    }

    if (msSinceClockIn < 0) {
      // This event happened BEFORE the currently open record's clock-in (a stale/backlogged
      // device event arriving out of order, e.g. after a checkpoint reset). Closing the open
      // record with an earlier timestamp would create an impossible checkout-before-checkin
      // record, so skip it instead of writing bad data.
      await logEvent({ serialNo, employeeNo, eventTime, staffProfileId, attendanceRecordId: open.id, action: "ignored_stale_event" });
      return { serialNo, action: "ignored_stale_event", staffProfileId };
    }

    const eventLocal = localDateAndMinutes(eventTime);
    const openLocal = localDateAndMinutes(open.clock_in_at);
    if (eventLocal.dateKey !== openLocal.dateKey) {
      const scheduledStart = await getScheduledStartMinutes(staffProfileId, eventLocal.dateKey);
      if (scheduledStart !== null && circularMinuteDiff(eventLocal.minutesOfDay, scheduledStart) <= ROSTER_MATCH_WINDOW_MINUTES) {
        // This scan lands right around today's scheduled shift start, while the open record is
        // from a previous day -- treat it as a fresh check-in rather than closing the old one.
        // The old record is left open on purpose; a manager can close it once they know the real
        // end time, rather than us guessing and writing a wrong checkout.
        const created = await insertRow("attendance_records", {
          staff_profile_id: staffProfileId,
          clock_in_at: eventTime,
          status: "present"
        });
        await logEvent({ serialNo, employeeNo, eventTime, staffProfileId, attendanceRecordId: created?.id, action: "checkIn" });
        return { serialNo, action: "checkIn_new_scheduled_shift", staffProfileId };
      }
    }

    await updateRows("attendance_records", {
      eq: { id: open.id },
      patch: { clock_out_at: eventTime, status: "completed" }
    });
    await logEvent({ serialNo, employeeNo, eventTime, staffProfileId, attendanceRecordId: open.id, action: "checkOut" });
    return { serialNo, action: "checkOut", staffProfileId };
  }

  const recentlyClosed = await findRecentlyClosedRecord(staffProfileId, eventTime);
  if (recentlyClosed) {
    await logEvent({ serialNo, employeeNo, eventTime, staffProfileId, attendanceRecordId: recentlyClosed.id, action: "ignored_duplicate_scan" });
    return { serialNo, action: "ignored_duplicate_scan", staffProfileId };
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

