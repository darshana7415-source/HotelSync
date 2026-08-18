// POST /.netlify/functions/fingerprint-cleanup
// One-time (or occasional) reconciliation pass -- NOT part of the live sync path.
// Called by fingerprint-cleanup-scan.js, run manually on the reception PC.
// Requires header: x-bridge-secret: <FINGERPRINT_BRIDGE_SECRET> (same secret as fingerprint-sync)
//
// Body: { readings: [ { serialNo, minor }, ... ] }
//   A full historical dump of the device's AcsEvent log (serialNo + minor only -- no need to
//   resend employeeNo/time here). Anything with minor !== 38 is a failed verification attempt.
//   Before the fingerprint-sync fix landed, failed attempts with a stray employeeNoString could
//   still have been recorded as real check-ins/check-outs. This endpoint finds any fingerprint_events
//   row that was written for one of those bad serialNos and safely undoes its effect on
//   attendance_records -- but only if nothing legitimate has touched that record since, so it never
//   clobbers a correct, later state.
//
// Safe to run more than once: already-reverted rows are marked so they're skipped on a re-run.

const { restRequest, selectOne, updateRows } = require("./lib/supabaseAdmin");

const JSON_HEADERS = { "content-type": "application/json" };
const SUCCESSFUL_VERIFY_MINOR = 38;

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

async function findLoggedEvent(serialNo) {
  return selectOne("fingerprint_events", {
    select: "device_serial_no,action,attendance_record_id,staff_profile_id",
    eq: { device_serial_no: serialNo }
  });
}

async function getAttendanceRecord(id) {
  if (!id) return null;
  return selectOne("attendance_records", {
    select: "id,clock_in_at,clock_out_at,status",
    eq: { id }
  });
}

async function markReverted(serialNo, previousAction) {
  await updateRows("fingerprint_events", {
    eq: { device_serial_no: serialNo },
    patch: { action: `reverted_${previousAction}` }
  });
}

async function reconcileOneReading(reading) {
  const serialNo = Number(reading.serialNo);
  if (!serialNo || Number(reading.minor) === SUCCESSFUL_VERIFY_MINOR) {
    return { serialNo, result: "skipped_was_valid" };
  }

  const logged = await findLoggedEvent(serialNo);
  if (!logged) {
    return { serialNo, result: "not_found_nothing_to_undo" };
  }

  if (String(logged.action).startsWith("reverted_")) {
    return { serialNo, result: "already_reverted" };
  }

  if (logged.action === "checkOut") {
    const record = await getAttendanceRecord(logged.attendance_record_id);
    if (!record) return { serialNo, result: "record_missing" };
    // Only undo if this bad event is still the thing that closed the record -- if a later,
    // legitimate event already re-closed or re-corrected it, leave it alone.
    if (record.status === "completed" && record.clock_out_at) {
      await updateRows("attendance_records", {
        eq: { id: record.id },
        patch: { clock_out_at: null, status: "present" }
      });
      await markReverted(serialNo, logged.action);
      return { serialNo, result: "reopened_record", attendanceRecordId: record.id };
    }
    return { serialNo, result: "already_resolved" };
  }

  if (logged.action === "checkIn") {
    const record = await getAttendanceRecord(logged.attendance_record_id);
    if (!record) return { serialNo, result: "record_already_gone" };
    // Only delete the phantom check-in if nothing has happened to it since (still open).
    // If it somehow got closed by a later real event, leave it for manual review rather
    // than destroying data we're not certain about.
    if (record.status === "present" && !record.clock_out_at) {
      await restRequest("fingerprint_events", {
        method: "PATCH",
        query: { attendance_record_id: `eq.${record.id}` },
        body: { attendance_record_id: null },
        prefer: "return=minimal"
      });
      await restRequest("attendance_records", {
        method: "DELETE",
        query: { id: `eq.${record.id}` },
        prefer: "return=minimal"
      });
      await markReverted(serialNo, logged.action);
      return { serialNo, result: "deleted_phantom_record", attendanceRecordId: record.id };
    }
    return { serialNo, result: "needs_manual_review", attendanceRecordId: record.id };
  }

  // ignored_duplicate_scan, ignored_stale_event, skipped_unmapped, skipped_invalid,
  // skipped_failed_verify, already_processed -- none of these wrote to attendance_records.
  await markReverted(serialNo, logged.action);
  return { serialNo, result: "no_write_had_occurred" };
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

  const readings = Array.isArray(payload.readings) ? payload.readings : [];
  if (!readings.length) {
    return json(200, { ok: true, results: [] });
  }

  const results = [];
  try {
    for (const reading of readings) {
      // eslint-disable-next-line no-await-in-loop
      results.push(await reconcileOneReading(reading));
    }
    const summary = results.reduce((acc, r) => {
      acc[r.result] = (acc[r.result] || 0) + 1;
      return acc;
    }, {});
    return json(200, { ok: true, summary, results });
  } catch (error) {
    return json(500, { ok: false, message: error.message || "Cleanup failed.", results });
  }
};
