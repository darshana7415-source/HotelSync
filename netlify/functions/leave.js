// POST /.netlify/functions/leave
// Requires Authorization: Bearer <session token from auth-login>.
//
// Replaces staffsync-data-service.js's direct-to-Supabase leave request / leave chat calls.
// Staff can only create/edit their own leave requests and post their own chat messages;
// approving, rejecting, deleting, or clearing requests requires admin/manager.
//
// Body: { action, ...fields }

const { selectOne, insertRow, updateRows, deleteRows } = require("./lib/supabaseAdmin");
const { authenticateRequest } = require("./lib/session");

const JSON_HEADERS = { "content-type": "application/json" };
const MANAGER_ROLES = ["admin", "manager"];

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

function isManager(claims) {
  return MANAGER_ROLES.includes(claims.role);
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
    switch (payload.action) {
      case "createLeaveRequest": {
        const staffProfileId = payload.staffProfileId || claims.staffProfileId;
        if (!isManager(claims) && staffProfileId !== claims.staffProfileId) {
          return json(403, { ok: false, message: "Not authorized to file leave for this staff member." });
        }
        const row = await insertRow("leave_requests", {
          staff_profile_id: staffProfileId,
          leave_type_id: payload.leaveTypeId || null,
          start_date: payload.startDate,
          end_date: payload.endDate,
          reason: payload.reason || null,
          status: "pending"
        });
        return json(200, { ok: true, data: row });
      }

      case "updateLeaveRequest": {
        const existing = await selectOne("leave_requests", {
          select: "id,staff_profile_id,status",
          eq: { id: payload.leaveRequestId }
        });
        if (!existing) return json(404, { ok: false, message: "Leave request not found." });
        const owns = existing.staff_profile_id === claims.staffProfileId;
        if (!isManager(claims) && !(owns && existing.status === "pending")) {
          return json(403, { ok: false, message: "Not authorized to edit this leave request." });
        }
        const rows = await updateRows("leave_requests", {
          eq: { id: payload.leaveRequestId },
          patch: {
            start_date: payload.startDate,
            end_date: payload.endDate,
            reason: payload.reason || null,
            status: payload.status || "pending",
            approved_by: null,
            approved_at: null
          }
        });
        return json(200, { ok: true, data: rows[0] || null });
      }

      case "updateLeaveStatus": {
        if (!isManager(claims)) {
          return json(403, { ok: false, message: "Only admins/managers can approve or reject leave." });
        }
        const rows = await updateRows("leave_requests", {
          eq: { id: payload.leaveRequestId },
          patch: {
            status: payload.status,
            approved_by: claims.appUserId,
            approved_at: new Date().toISOString()
          }
        });
        return json(200, { ok: true, data: rows[0] || null });
      }

      case "deleteAllLeaveRequests": {
        if (!isManager(claims)) {
          return json(403, { ok: false, message: "Only admins/managers can clear leave requests." });
        }
        await deleteRows("leave_requests", { eq: {} });
        return json(200, { ok: true });
      }

      case "addLeaveMessage": {
        const staffProfileId = payload.staffProfileId || claims.staffProfileId;
        if (!isManager(claims) && staffProfileId !== claims.staffProfileId) {
          return json(403, { ok: false, message: "Not authorized to post as this staff member." });
        }
        const row = await insertRow("staffsync_leave_messages", {
          hotel_id: payload.hotelId || claims.hotelId,
          leave_request_id: String(payload.leaveRequestId || ""),
          staff_profile_id: staffProfileId || null,
          sender_role: payload.senderRole || (isManager(claims) ? "admin" : "staff"),
          label: payload.label,
          class_name: payload.className,
          message: payload.message,
          metadata_json: payload.metadata || {}
        });
        return json(200, { ok: true, data: row });
      }

      case "deleteLeaveMessagesByIds": {
        if (!isManager(claims)) {
          return json(403, { ok: false, message: "Only admins/managers can delete leave messages." });
        }
        const ids = Array.from(new Set((payload.ids || []).map(String).filter(Boolean)));
        for (const id of ids) {
          await deleteRows("staffsync_leave_messages", { eq: { id } });
        }
        return json(200, { ok: true });
      }

      default:
        return json(400, { ok: false, message: "Unknown action." });
    }
  } catch (error) {
    return json(500, { ok: false, message: error.message || "Leave request failed." });
  }
};
