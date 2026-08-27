// Shared logic for turning a day's live attendance_records into the summarised
// attendance_imports rows that the Attendance Reports page reads.
//
// Used by two scheduled functions:
//   attendance-endofday-import.js   23:59 Asia/Colombo -- captures the day that is ending
//   attendance-daily-report-import.js  08:00 Asia/Colombo -- re-imports the previous day
//
// Running both is deliberate. The 23:59 capture is what the owner asked for (the day's
// in/out times land in the report as the day closes), but anyone still clocked in at that
// moment -- a rostered night shift, or someone who simply hasn't tapped out yet -- has no
// checkout to record. The morning run re-imports the same date once those checkouts exist,
// and because every write is an upsert keyed on
// (hotel_id, staff_profile_id, attendance_date, source) it simply overwrites the earlier
// partial row instead of duplicating it.

const { restRequest, upsertRow } = require("./supabaseAdmin");

// Records that an import actually ran, so a silently-failing scheduler is visible in the
// database instead of only being noticed when someone asks why the reports are empty --
// which is exactly how the first (broken) version went unnoticed.
async function recordImportHeartbeat(id, dateKey, staffCount, note) {
  try {
    await upsertRow("system_heartbeats", {
      id,
      last_run_at: new Date().toISOString(),
      last_event_count: staffCount || 0,
      note: note || `imported ${dateKey}`
    }, { onConflict: "id" });
  } catch {
    // Never let heartbeat bookkeeping fail the import itself.
  }
}

const HOTEL_ID = "00000000-0000-0000-0000-000000000001";
const TIMEZONE = "Asia/Colombo";
const SOURCE = "fingerprint_auto";
// Attendance Reports shows the current month plus the two before it, so anything older than
// this many whole months is no longer reachable in the UI and gets pruned nightly.
const RETENTION_MONTHS = 3;

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

function todayColomboDateKey() {
  return colomboDateKey(new Date());
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
  let stillOpen = 0;
  byStaff.forEach(({ fullName, rows }, staffProfileId) => {
    const segments = rows.map((row) => ({
      in: localTimeText(row.clock_in_at),
      out: row.clock_out_at ? localTimeText(row.clock_out_at) : ""
    }));
    if (segments.some((segment) => !segment.out)) stillOpen += 1;
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

  return { date: dateKey, staffCount: importRows.length, stillOpen };
}

// Deletes attendance_imports rows older than the retention window. Runs as part of the
// nightly capture so the table stays bounded without anyone maintaining it.
//
// Only attendance_imports (the summarised report rows) is pruned. The underlying
// attendance_records are deliberately left alone -- they are the raw source of truth and are
// what any future correction or recalculation would have to be rebuilt from.
async function pruneOldImports(referenceDateKey) {
  const [year, month] = String(referenceDateKey).split("-").map(Number);
  // First day of the month RETENTION_MONTHS-1 back, so the current month plus the previous
  // two are always kept in full.
  const cutoff = new Date(Date.UTC(year, month - 1 - (RETENTION_MONTHS - 1), 1));
  const cutoffKey = `${cutoff.getUTCFullYear()}-${String(cutoff.getUTCMonth() + 1).padStart(2, "0")}-01`;

  const deleted = await restRequest("attendance_imports", {
    method: "DELETE",
    query: { attendance_date: `lt.${cutoffKey}` },
    prefer: "return=representation"
  });

  return { cutoff: cutoffKey, deleted: Array.isArray(deleted) ? deleted.length : 0 };
}

module.exports = {
  importAttendanceForDate,
  pruneOldImports,
  recordImportHeartbeat,
  todayColomboDateKey,
  yesterdayColomboDateKey,
  RETENTION_MONTHS
};
