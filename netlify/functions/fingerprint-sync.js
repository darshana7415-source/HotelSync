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
// Nobody at this hotel ever STARTS a shift between midnight and 04:00 (owner-confirmed). Any
// scan in that window is therefore someone finishing a late shift, never someone arriving.
//
// This is the rule that finally fixes the long-running "after-midnight checkout became a
// check-in, and the real morning arrival became the checkout" bug. The earlier roster-based
// guard could not catch it: a person rostered 13:00-23:00 who actually leaves at 00:30 is not
// "rostered overnight", so their 00:30 checkout was treated as a brand new shift.
//
// Unlike the roster checks, this needs no daily_rosters row to exist, which matters because
// rosters are frequently not saved yet at the moment someone scans.
const NO_CHECKIN_BEFORE_MINUTES = 4 * 60; // 04:00 local

function isAfterMidnightBeforeMorning(minutesOfDay) {
  return minutesOfDay < NO_CHECKIN_BEFORE_MINUTES;
}

// Recognising a night shift WITHOUT needing the roster.
//
// The roster-based check below is correct but unreliable in practice: rosters are often saved
// hours after the fact (Mohotti's night-shift roster for the 28th was entered at 09:58 on the
// 29th, ~3h after his 07:15 checkout), so at scan time the code simply could not know he was a
// night worker and started a phantom day shift instead.
//
// What IS always available is when the open shift began. A shift that started in the evening
// and is being scanned the next morning is somebody finishing nights. A shift that started in
// the morning or afternoon and is still open the next morning is a forgotten checkout, and
// that scan is a fresh arrival -- which is the distinction that actually matters.
const EVENING_START_MINUTES = 16 * 60; // 16:00 - shifts starting this late run into the night
const MORNING_END_LIMIT_MINUTES = 11 * 60; // 11:00 - latest a night shift plausibly ends

function looksLikeOvernightShiftEnding(openMinutesOfDay, eventMinutesOfDay) {
  return openMinutesOfDay >= EVENING_START_MINUTES && eventMinutesOfDay <= MORNING_END_LIMIT_MINUTES;
}
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

function timeToMinutes(value) {
  const [h, m] = String(value || "").split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

// Looks up the person's scheduled shift start/end times for a given local calendar date, if any.
async function getScheduledMinutes(staffProfileId, dateKey) {
  const row = await selectOne("daily_rosters", {
    select: "in_time,out_time",
    eq: { staff_profile_id: staffProfileId, roster_date: dateKey }
  });
  if (!row) return { start: null, end: null };
  return { start: timeToMinutes(row.in_time), end: timeToMinutes(row.out_time) };
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

async function logEvent({ serialNo, employeeNo, eventTime, minor, staffProfileId, attendanceRecordId, action }) {
  try {
    await insertRow("fingerprint_events", {
      device_serial_no: serialNo,
      device_employee_no: employeeNo,
      event_time: eventTime,
      staff_profile_id: staffProfileId || null,
      attendance_record_id: attendanceRecordId || null,
      action,
      // Storing the device's raw minor code on every event (not just the ones we act on) --
      // previously only the *decision* ("skipped_failed_verify") was kept, with no way to go
      // back and check whether that decision was actually right. Without this, a report like
      // "the device says this scan succeeded but StaffSync never picked it up" is unanswerable
      // after the fact -- this is what makes it answerable next time.
      minor: Number.isFinite(minor) ? minor : null
    });
  } catch {
    // Logging failure shouldn't block the actual attendance write -- it already happened.
  }
}

async function processOneEvent(evt) {
  const serialNo = Number(evt.serialNo);
  const employeeNo = String(evt.employeeNo || "");
  const eventTime = evt.time ? new Date(evt.time).toISOString() : new Date().toISOString();
  const minor = Number(evt.minor);

  if (!serialNo || !employeeNo) {
    return { serialNo, action: "skipped_invalid" };
  }

  if (await alreadyProcessed(serialNo)) {
    return { serialNo, action: "already_processed" };
  }

  // Server-side enforcement of the verification-success gate. If the caller didn't send a
  // minor code at all (older bridge build), fail closed and reject rather than assume success.
  if (Number(evt.minor) !== SUCCESSFUL_VERIFY_MINOR) {
    await logEvent({ serialNo, employeeNo, eventTime, minor, action: "skipped_failed_verify" });
    return { serialNo, action: "skipped_failed_verify", employeeNo };
  }

  const mapping = await selectOne("fingerprint_device_users", {
    select: "staff_profile_id,device_name",
    eq: { device_employee_no: employeeNo }
  });

  if (!mapping) {
    await logEvent({ serialNo, employeeNo, eventTime, minor, action: "skipped_unmapped" });
    return { serialNo, action: "skipped_unmapped", employeeNo };
  }

  const staffProfileId = mapping.staff_profile_id;
  const open = await findOpenAttendanceRecord(staffProfileId, eventTime);

  if (open) {
    const msSinceClockIn = new Date(eventTime).getTime() - new Date(open.clock_in_at).getTime();
    if (msSinceClockIn >= 0 && msSinceClockIn < DUPLICATE_SCAN_WINDOW_MS) {
      await logEvent({ serialNo, employeeNo, eventTime, minor, staffProfileId, attendanceRecordId: open.id, action: "ignored_duplicate_scan" });
      return { serialNo, action: "ignored_duplicate_scan", staffProfileId };
    }

    if (msSinceClockIn < 0) {
      // This event happened BEFORE the currently open record's clock-in (a stale/backlogged
      // device event arriving out of order, e.g. after a checkpoint reset). Closing the open
      // record with an earlier timestamp would create an impossible checkout-before-checkin
      // record, so skip it instead of writing bad data.
      await logEvent({ serialNo, employeeNo, eventTime, minor, staffProfileId, attendanceRecordId: open.id, action: "ignored_stale_event" });
      return { serialNo, action: "ignored_stale_event", staffProfileId };
    }

    const eventLocal = localDateAndMinutes(eventTime);
    const openLocal = localDateAndMinutes(open.clock_in_at);
    if (eventLocal.dateKey !== openLocal.dateKey) {
      // A scan crossing midnight is only a legitimate checkout if the person was actually
      // ROSTERED an overnight shift on the day their open record started (out_time <= in_time,
      // e.g. 19:00 -> 07:00) and this scan lands near that scheduled end time.
      //
      // Most staff here work day shifts, and for them a cross-midnight pair is always bad data:
      // it means the open record is a phantom (usually an orphaned evening checkout that had
      // nothing to close and got logged as a check-in) and this scan is really today's morning
      // check-in. Treating that as a checkout is the long-running "last night's checkout became
      // today's check-in" bug.
      //
      // Deciding from the roster (rather than a blanket no-overnight rule) is what lets genuine
      // night-shift staff work correctly while still protecting everyone else. If no roster row
      // exists for that day we deliberately fail safe and start a fresh shift, leaving the old
      // record open for a manager -- guessing a checkout writes wrong hours into payroll.
      const openScheduled = await getScheduledMinutes(staffProfileId, openLocal.dateKey);
      const rosteredOvernight =
        openScheduled.start !== null &&
        openScheduled.end !== null &&
        openScheduled.end <= openScheduled.start;
      const nearScheduledEnd =
        rosteredOvernight &&
        circularMinuteDiff(eventLocal.minutesOfDay, openScheduled.end) <= ROSTER_MATCH_WINDOW_MINUTES;

      // Between midnight and 04:00 nobody is arriving, so an open shift from the previous day
      // is simply being closed late -- whatever the roster says, and even if none was saved.
      const lateNightCheckout = isAfterMidnightBeforeMorning(eventLocal.minutesOfDay);

      // Evening start + next-morning scan = a night shift ending, no roster required.
      const overnightShiftEnding = looksLikeOvernightShiftEnding(openLocal.minutesOfDay, eventLocal.minutesOfDay);

      if (!nearScheduledEnd && !lateNightCheckout && !overnightShiftEnding) {
        const created = await insertRow("attendance_records", {
          staff_profile_id: staffProfileId,
          clock_in_at: eventTime,
          status: "present"
        });
        await logEvent({ serialNo, employeeNo, eventTime, minor, staffProfileId, attendanceRecordId: created?.id, action: "checkIn" });
        return { serialNo, action: "checkIn_new_day", staffProfileId };
      }
      // Falls through to the normal checkout path below: a real rostered night shift ending.
    }

    await updateRows("attendance_records", {
      eq: { id: open.id },
      patch: { clock_out_at: eventTime, status: "completed" }
    });
    await logEvent({ serialNo, employeeNo, eventTime, minor, staffProfileId, attendanceRecordId: open.id, action: "checkOut" });
    return { serialNo, action: "checkOut", staffProfileId };
  }

  const recentlyClosed = await findRecentlyClosedRecord(staffProfileId, eventTime);
  if (recentlyClosed) {
    await logEvent({ serialNo, employeeNo, eventTime, minor, staffProfileId, attendanceRecordId: recentlyClosed.id, action: "ignored_duplicate_scan" });
    return { serialNo, action: "ignored_duplicate_scan", staffProfileId };
  }

  // No open record. Before assuming this is a check-in, check whether it's actually an ORPHANED
  // CHECKOUT: the person's real check-in earlier in the day was missed (failed verify, device
  // offline), so their end-of-shift scan arrives with nothing to close. Blindly recording it as
  // a check-in creates a phantom "working all night" record that then corrupts the next
  // morning's scan handling too. Signal: the scan lands near the person's scheduled shift END
  // for that date while being nowhere near the scheduled START. Only applies when a roster row
  // exists for the date -- with no roster we keep the old behavior (record a check-in).
  const eventLocalNow = localDateAndMinutes(eventTime);

  // Hard rule first: a scan between midnight and 04:00 is never someone arriving. With no open
  // record to close, their check-in was missed earlier (failed verify, device offline, bridge
  // down). Recording it as a check-in is what used to create the phantom overnight shift that
  // then swallowed the real morning arrival as its "checkout" -- so refuse it outright.
  if (isAfterMidnightBeforeMorning(eventLocalNow.minutesOfDay)) {
    await logEvent({ serialNo, employeeNo, eventTime, minor, staffProfileId, action: "ignored_orphan_checkout" });
    return { serialNo, action: "ignored_orphan_checkout", staffProfileId };
  }

  const scheduled = await getScheduledMinutes(staffProfileId, eventLocalNow.dateKey);
  if (
    scheduled.end !== null &&
    circularMinuteDiff(eventLocalNow.minutesOfDay, scheduled.end) <= ROSTER_MATCH_WINDOW_MINUTES &&
    (scheduled.start === null || circularMinuteDiff(eventLocalNow.minutesOfDay, scheduled.start) > ROSTER_MATCH_WINDOW_MINUTES)
  ) {
    await logEvent({ serialNo, employeeNo, eventTime, minor, staffProfileId, action: "ignored_orphan_checkout" });
    return { serialNo, action: "ignored_orphan_checkout", staffProfileId };
  }

  const created = await insertRow("attendance_records", {
    staff_profile_id: staffProfileId,
    clock_in_at: eventTime,
    status: "present"
  });
  await logEvent({ serialNo, employeeNo, eventTime, minor, staffProfileId, attendanceRecordId: created?.id, action: "checkIn" });
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

