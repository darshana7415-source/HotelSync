// POST /.netlify/functions/attendance
// Requires Authorization: Bearer <session token from auth-login>.
//
// Replaces staffsync-data-service.js's direct-to-Supabase clockIn/clockOut/recordLocationPing calls.
//
// The phone clock-in/out UI was removed from the app -- the fingerprint machine (via
// fingerprint-sync.js) is now the sole source of attendance for staff. But this endpoint itself
// was still reachable by any staff session (e.g. a phone running a stale cached build that still
// has the old button), which kept creating "phantom" attendance records with no fingerprint scan
// behind them. Those phantom records then confused the fingerprint sync's open/close toggle logic
// for the same person's real scans. clockIn/clockOut are now admin/manager-only -- staff can no
// longer create attendance records through this endpoint at all.
//
// Body: { action: "clockIn" | "clockOut" | "recordLocationPing", ...fields }

const { selectOne, insertRow, updateRows } = require("./lib/supabaseAdmin");
const { authenticateRequest } = require("./lib/session");

const JSON_HEADERS = { "content-type": "application/json" };
const MANAGER_ROLES = ["admin", "manager"];

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

function canActForStaff(claims, staffProfileId) {
  if (MANAGER_ROLES.includes(claims.role)) return true;
  return claims.staffProfileId === staffProfileId;
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, message: "Method not allowed." });
  }

  const claims = authenticateRequest(event);
  if (!claims) {
    return json(401, { ok: false, message: "Session expired. Please log in again." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, message: "Invalid request body." });
  }

  try {
    if (payload.action === "clockIn") {
      if (!MANAGER_ROLES.includes(claims.role)) {
        return json(403, { ok: false, message: "Attendance is tracked at the fingerprint machine. Manual clock-in is admin/manager only." });
      }
      const staffProfileId = payload.staffProfileId || claims.staffProfileId;
      if (!canActForStaff(claims, staffProfileId)) {
        return json(403, { ok: false, message: "Not authorized to clock in this staff member." });
      }
      const row = await insertRow("attendance_records", {
        staff_profile_id: staffProfileId,
        shift_assignment_id: payload.shiftAssignmentId || null,
        clock_in_at: new Date().toISOString(),
        clock_in_latitude: payload.latitude ?? null,
        clock_in_longitude: payload.longitude ?? null,
        status: "present"
      });
      return json(200, { ok: true, data: row });
    }

    if (payload.action === "clockOut") {
      if (!MANAGER_ROLES.includes(claims.role)) {
        return json(403, { ok: false, message: "Attendance is tracked at the fingerprint machine. Manual clock-out is admin/manager only." });
      }
      const existing = await selectOne("attendance_records", {
        select: "id,staff_profile_id",
        eq: { id: payload.attendanceRecordId }
      });
      if (!existing) {
        return json(404, { ok: false, message: "Attendance record not found." });
      }
      if (!canActForStaff(claims, existing.staff_profile_id)) {
        return json(403, { ok: false, message: "Not authorized to clock out this staff member." });
      }
      const rows = await updateRows("attendance_records", {
        eq: { id: payload.attendanceRecordId },
        patch: {
          clock_out_at: new Date().toISOString(),
          clock_out_latitude: payload.latitude ?? null,
          clock_out_longitude: payload.longitude ?? null,
          status: "completed"
        }
      });
      return json(200, { ok: true, data: rows[0] || null });
    }

    if (payload.action === "recordLocationPing") {
      const staffProfileId = payload.staffProfileId || claims.staffProfileId;
      if (!canActForStaff(claims, staffProfileId)) {
        return json(403, { ok: false, message: "Not authorized to record location for this staff member." });
      }
      const row = await insertRow("location_pings", {
        staff_profile_id: staffProfileId,
        attendance_record_id: payload.attendanceRecordId || null,
        latitude: payload.latitude,
        longitude: payload.longitude,
        accuracy_meters: payload.accuracyMeters ?? null,
        location_status: payload.locationStatus || "unknown",
        floor_label: payload.floorLabel || null,
        zone_label: payload.zoneLabel || null
      });
      return json(200, { ok: true, data: row });
    }

    return json(400, { ok: false, message: "Unknown action." });
  } catch (error) {
    return json(500, { ok: false, message: error.message || "Attendance request failed." });
  }
};
