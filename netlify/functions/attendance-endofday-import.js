// Scheduled function -- runs every day at 23:59 Asia/Colombo (cron "29 18 * * *" in UTC,
// see netlify.toml). Captures the in/out times shown on the live "Staff on shift" dashboard
// for the day that is closing, and writes them into attendance_imports so they appear in
// Attendance Reports without anyone touching a spreadsheet.
//
// Anyone still clocked in at 23:59 (a rostered night shift, or a forgotten checkout) is
// written with their check-in time and a blank checkout. The 08:00 run the next morning
// re-imports the same date and overwrites that row once the real checkout exists -- both
// runs upsert on (hotel_id, staff_profile_id, attendance_date, source), so re-running is
// always safe and never duplicates.
//
// Manual/backfill invocation:
//   POST /.netlify/functions/attendance-endofday-import
//   header: x-bridge-secret: <FINGERPRINT_BRIDGE_SECRET>
//   body:   { "date": "YYYY-MM-DD" }   (optional -- defaults to today in Sri Lanka)

const { importAttendanceForDate, pruneOldImports, recordImportHeartbeat, todayColomboDateKey } = require("./lib/attendanceDailyImport");

const JSON_HEADERS = { "content-type": "application/json" };

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

exports.handler = async function handler(event) {
  // Auth model, deliberately NOT based on detecting "is this the scheduler?".
  //
  // The first version tried to recognise Netlify's own invocation by sniffing for
  // netlify-event / x-nf-event headers and required a bridge secret otherwise. Those header
  // names were a guess, they did not match, and so every single scheduled run was rejected
  // with 401 and silently imported nothing -- attendance_imports stayed empty for weeks.
  //
  // Instead: the default run (no explicit date) is always allowed. It is idempotent and
  // derives everything from data that already exists, so re-running it can only ever
  // reproduce the same result. Only an explicit date override -- the backfill path, which
  // can rewrite historical rows -- requires the bridge secret.
  let requestedDate = "";
  try {
    requestedDate = JSON.parse(event.body || "{}").date || "";
  } catch {
    // no body / not JSON -- falls back to today
  }

  if (requestedDate) {
    const secret = process.env.FINGERPRINT_BRIDGE_SECRET;
    const provided = event.headers?.["x-bridge-secret"] || event.headers?.["X-Bridge-Secret"];
    if (!secret || provided !== secret) {
      return json(401, { ok: false, message: "Importing a specific date requires the bridge secret." });
    }
  }

  const dateKey = requestedDate || todayColomboDateKey();

  try {
    const result = await importAttendanceForDate(dateKey);

    // Prune after a successful import, never before -- a failed import must not be able to
    // delete history as a side effect. A pruning failure is reported but does not fail the
    // run, since the day's attendance has already been saved correctly by that point.
    let pruned = null;
    try {
      pruned = await pruneOldImports(dateKey);
    } catch (pruneError) {
      pruned = { error: pruneError.message || "prune failed" };
    }

    await recordImportHeartbeat("attendance_endofday_import", dateKey, result.staffCount);

    return json(200, { ok: true, ...result, pruned });
  } catch (error) {
    return json(500, { ok: false, message: error.message || "End of day attendance import failed." });
  }
};
