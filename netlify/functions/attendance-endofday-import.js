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

const { importAttendanceForDate, todayColomboDateKey } = require("./lib/attendanceDailyImport");

const JSON_HEADERS = { "content-type": "application/json" };

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

exports.handler = async function handler(event) {
  // Netlify's scheduler invokes this internally rather than as a normal public request, so
  // only manual/backfill calls need to prove they are allowed to run it.
  const isScheduledInvocation = Boolean(event.headers?.["netlify-event"] || event.headers?.["x-nf-event"]) || !event.httpMethod;

  if (!isScheduledInvocation) {
    const secret = process.env.FINGERPRINT_BRIDGE_SECRET;
    const provided = event.headers["x-bridge-secret"] || event.headers["X-Bridge-Secret"];
    if (!secret || provided !== secret) {
      return json(401, { ok: false, message: "Invalid or missing bridge secret for manual invocation." });
    }
  }

  let requestedDate = "";
  try {
    requestedDate = JSON.parse(event.body || "{}").date || "";
  } catch {
    // no body / not JSON -- falls back to today
  }

  const dateKey = requestedDate || todayColomboDateKey();

  try {
    const result = await importAttendanceForDate(dateKey);
    return json(200, { ok: true, ...result });
  } catch (error) {
    return json(500, { ok: false, message: error.message || "End of day attendance import failed." });
  }
};
