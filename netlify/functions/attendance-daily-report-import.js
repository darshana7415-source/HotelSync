// Scheduled function -- runs every day at 08:00 Asia/Colombo (cron "30 2 * * *" in UTC,
// see netlify.toml).
//
// This is the morning CATCH-UP pass. attendance-endofday-import.js already captured this
// date at 23:59, but anyone still clocked in at that moment (a rostered night shift, or a
// checkout that landed after midnight) was written with a blank checkout. Re-importing the
// same date here fills those in once the real checkouts exist.
//
// Both runs share lib/attendanceDailyImport.js and upsert on
// (hotel_id, staff_profile_id, attendance_date, source), so this overwrites the earlier
// partial row rather than duplicating it.
//
// Manual/backfill invocation:
//   POST /.netlify/functions/attendance-daily-report-import
//   header: x-bridge-secret: <FINGERPRINT_BRIDGE_SECRET>
//   body:   { "date": "YYYY-MM-DD" }   (optional -- defaults to yesterday in Sri Lanka)

const { importAttendanceForDate, recordImportHeartbeat, yesterdayColomboDateKey, colomboDateKeyDaysAgo } = require("./lib/attendanceDailyImport");

// How many recent days the morning pass re-imports.
//
// One day was not enough. Both scheduled imports read attendance_records at the moment they
// run, so if the fingerprint bridge is lagging or was down (it hung for hours on the 29th and
// 30th), they capture shifts that have no checkout yet -- and nothing ever revisited those
// dates, leaving the report permanently showing "No check out" for people who had in fact
// checked out. Re-importing a few days each morning lets late-arriving scans correct the
// record by themselves. Every write is an upsert, so re-running is free of side effects.
const CATCHUP_DAYS = 3;

const JSON_HEADERS = { "content-type": "application/json" };

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

exports.handler = async function handler(event) {
  // Same auth model as attendance-endofday-import.js: the default run is always allowed
  // (idempotent, derived entirely from existing data), and only an explicit date override
  // requires the bridge secret. Sniffing for Netlify's scheduler headers was what silently
  // 401'd every scheduled run before.
  let requestedDate = "";
  try {
    requestedDate = JSON.parse(event.body || "{}").date || "";
  } catch {
    // no body / not JSON -- falls back to yesterday
  }

  if (requestedDate) {
    const secret = process.env.FINGERPRINT_BRIDGE_SECRET;
    const provided = event.headers?.["x-bridge-secret"] || event.headers?.["X-Bridge-Secret"];
    if (!secret || provided !== secret) {
      return json(401, { ok: false, message: "Importing a specific date requires the bridge secret." });
    }
  }

  try {
    // An explicit date backfills just that day; the scheduled run sweeps the last few days.
    const dateKeys = requestedDate
      ? [requestedDate]
      : Array.from({ length: CATCHUP_DAYS }, (unused, index) => colomboDateKeyDaysAgo(index + 1));

    const results = [];
    for (const dateKey of dateKeys) {
      // eslint-disable-next-line no-await-in-loop
      results.push(await importAttendanceForDate(dateKey));
    }

    const newest = results[0] || { date: dateKeys[0], staffCount: 0 };
    await recordImportHeartbeat(
      "attendance_morning_import",
      newest.date,
      newest.staffCount,
      `re-imported ${dateKeys.join(", ")}`
    );
    return json(200, { ok: true, dates: dateKeys, results });
  } catch (error) {
    return json(500, { ok: false, message: error.message || "Daily attendance import failed." });
  }
};
