// Scheduled function -- runs automatically every day at 08:00 Asia/Colombo (see the
// [functions."attendance-daily-report-import"] schedule entry in netlify.toml, cron
// "30 2 * * *" in UTC).
//
// Replaces the old manual workflow of downloading a Hikvision Excel attendance sheet and
// uploading it through attendance-upload.html. Attendance is now captured live by the
// fingerprint bridge straight into attendance_records, so there is a fully reliable source
// to build yesterday's report from automatically -- no Excel step needed at all.
//
// For "yesterday" (the Sri Lanka calendar date that just ended), this reads every
// attendance_records row for each staff member and writes one summarized row per person into
// attendance_imports (the same table + shape the Excel upload used to write into), so the
// existing "Saved Attendance Report" UI in attendance-upload.html keeps working unchanged --
// it just gets fed automatically now instead of by hand.
//
// Can also be triggered manually (e.g. to backfill a date) with:
//   POST /.netlify/functions/attendance-daily-report-import
//   header: x-bridge-secret: <FINGERPRINT_BRIDGE_SECRET>
//   body: { "date": "YYYY-MM-DD" }   (optional -- defaults to yesterday)

const { restRequest, upsertRow } = require("./lib/supabaseAdmin");

const JSON_HEADERS = { "content-type": "application/json" };
const HOTEL_ID = "00000000-0000-0000-0000-000000000001"; // matches the constant already used throughout attendance-upload.html
const TIMEZONE = "Asia/Colombo";
const SOURCE = "fingerprint_auto";

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

function colomboDateKey(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const v = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${v.year}-${v.month}-${v.day}`;
}

function yesterdayColomboDateKey() {
  // Subtracting a fixed 24h before formatting is safe here because Sri Lanka has no DST --
  // "now minus 24h" always lands on the correct previous calendar day in Asia/Colombo.
  return colomboDateKey(new Date(Date.now() - 24 * 3600 * 1000));
}

function colomboDateTimeToUtcIso(dateKey, timeText) {
  return new Date(`${dateKey}T${timeText}+05:30`).toISOString();
}

function localTimeText(isoString) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date(isoString));
  const v = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${v.hour}:${v.minute}`;
}

function minutesBetween(startIso, endIso) {
  return Math.max(0, Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000));
}

async function importAttendanceForDate(dateKey) {
  const rangeStartIso = colomboDateTimeToUtcIso(dateKey, "00:00:00");
  const rangeEndIso = colomboDateTimeToUtcIso(dateKey, "23:59:59");

  // Every shift that STARTED on this Sri Lanka calendar day -- including ones still open (no
  // checkout yet) or ones that ran past midnight -- is attributed to this date, mirroring how
  // the roster-aware fingerprint-sync logic already keys a shift to its check-in day.
  const records = await restRequest("attendance_records", {
    query: {
      select: "staff_profile_id,clock_in_at,clock_out_at,staff_profiles(full_name)",
      clock_in_at: `gte.${rangeStartIso}`,
      order: "clock_in_at.asc"
    }
  });

  const inRange = (records || []).filter((row) => new Date(row.clock_in_at).getTime() <= new Date(rangeEndIso).getTime());

  const byStaff = new Map();
  inRange.forEach((row) => {
    const key = row.staff_profile_id;
    if (!byStaff.has(key)) byStaff.set(key, { fullName: row.staff_profiles?.full_name || "", rows: [] });
    byStaff.get(key).rows.push(row);
  });

  const importRows = [];
  byStaff.forEach(({ fullName, rows }, staffProfileId) => {
    const segments = rows.map((row) => ({
      in: localTimeText(row.clock_in_at),
      out: row.clock_out_at ? localTimeText(row.clock_out_at) : ""
    }));
    const totalMinutes = rows.reduce(
      (sum, row) => sum + (row.clock_out_at ? minutesBetween(row.clock_in_at, row.clock_out_at) : 0),
      0
    );

    importRows.push({
      hotel_id: HOTEL_ID,
      staff_profile_id: staffProfileId,
      attendance_date: dateKey,
      source_name: fullName,
      clock_in: segments[0]?.in || null,
      clock_out: segments[segments.length - 1]?.out || null,
      segments,
      total_minutes: totalMinutes,
      source: SOURCE
    });
  });

  for (const row of importRows) {
    // eslint-disable-next-line no-await-in-loop
    await upsertRow("attendance_imports", row, { onConflict: "hotel_id,staff_profile_id,attendance_date,source" });
  }

  return { date: dateKey, staffCount: importRows.length };
}

exports.handler = async function handler(event) {
  // Netlify's own scheduler calls this with no auth header at all (it invokes internally, not
  // over the public internet the same way a regular request would) -- so only manual/backfill
  // invocations need to prove they're allowed to run this.
  const isScheduledInvocation = Boolean(event.headers["netlify-event"] || event.headers["x-nf-event"]) || !event.httpMethod;

  if (!isScheduledInvocation) {
    const secret = process.env.FINGERPRINT_BRIDGE_SECRET;
    const provided = event.headers["x-bridge-secret"] || event.headers["X-Bridge-Secret"];
    if (!secret || provided !== secret) {
      return json(401, { ok: false, message: "Invalid or missing bridge secret for manual invocation." });
    }
  }

  let requestedDate = "";
  try {
    const payload = JSON.parse(event.body || "{}");
    requestedDate = payload.date || "";
  } catch {
    // no body / not JSON -- fine, falls back to yesterday
  }

  const dateKey = requestedDate || yesterdayColomboDateKey();

  try {
    const result = await importAttendanceForDate(dateKey);
    return json(200, { ok: true, ...result });
  } catch (error) {
    return json(500, { ok: false, message: error.message || "Daily attendance import failed." });
  }
};
