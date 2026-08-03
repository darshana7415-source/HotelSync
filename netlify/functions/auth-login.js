// POST /.netlify/functions/auth-login
//
// Replaces the old client-side password check (app.js `checkStaffPassword`, which compared
// password hashes fetched via the public anon key). Now the browser never sees password hashes
// at all -- this function verifies the password server-side (using the service-role key) and,
// if correct, issues a signed session token the browser stores and sends back on later requests.
//
// Body shapes:
//   { action: "login", employeeCode, password, newPassword? }
//   { action: "adminResetPassword", employeeCode }  -- requires Authorization: Bearer <admin/manager token>

const { selectOne, selectMany, upsertRow } = require("./lib/supabaseAdmin");
const { signToken } = require("./lib/session");
const { authenticateAdminRequest } = require("./lib/adminAuth");
const { verifyPassword, hashPassword, generateTempPassword } = require("./lib/passwordHash");

const JSON_HEADERS = { "content-type": "application/json" };

function normalizeEmployeeCode(value) {
  const text = String(value || "").trim();
  const numericCode = text.match(/^0*(\d+)(?:\.0+)?$/);
  if (numericCode) return String(Number(numericCode[1]));
  const digits = text.replace(/\D/g, "");
  return digits ? String(Number(digits)) : "";
}

function normalizeRole(role) {
  const clean = String(role || "").trim().toLowerCase();
  return ["admin", "manager", "staff", "department_head"].includes(clean) ? clean : "staff";
}

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

function validateNewPassword(newPassword) {
  if (!newPassword || String(newPassword).length < 4) {
    return "New password must be at least 4 characters.";
  }
  return "";
}

async function findActiveStaffByEmployeeCode(employeeCode) {
  const normalized = normalizeEmployeeCode(employeeCode);
  if (!normalized) return null;

  // employee_code is stored as free text (e.g. "04"), so pull candidates and match numerically,
  // mirroring the matching rule the client used to apply itself.
  const candidates = await selectMany("staff_profiles", {
    select: "id,employee_code,full_name,hotel_id,app_users(id,role,status)"
  });

  const match = (candidates || []).find((profile) => {
    const code = String(profile.employee_code || "");
    if (code.toLowerCase().includes("-removed-")) return false;
    return normalizeEmployeeCode(code) === normalized;
  });

  if (!match) return null;
  if (match.app_users?.status === "inactive") return null;
  return match;
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, message: "Method not allowed." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, message: "Invalid request body." });
  }

  try {
    if (payload.action === "adminResetPassword" || payload.action === "adminSetPassword") {
      const admin = await authenticateAdminRequest(event);
      if (!admin) {
        return json(401, { ok: false, message: "Not authorized." });
      }

      const target = await findActiveStaffByEmployeeCode(payload.employeeCode);
      if (!target) {
        return json(404, { ok: false, message: "Employee code not found." });
      }

      if (payload.action === "adminSetPassword") {
        const validationError = validateNewPassword(payload.newPassword);
        if (validationError) {
          return json(200, { ok: false, message: validationError });
        }
        await upsertRow(
          "staff_login_passwords",
          {
            staff_profile_id: target.id,
            password_hash: hashPassword(payload.newPassword),
            reset_required: false,
            updated_at: new Date().toISOString()
          },
          { onConflict: "staff_profile_id" }
        );
        return json(200, { ok: true, employeeCode: target.employee_code, fullName: target.full_name });
      }

      const tempPassword = generateTempPassword();
      await upsertRow(
        "staff_login_passwords",
        {
          staff_profile_id: target.id,
          password_hash: hashPassword(tempPassword),
          reset_required: true,
          updated_at: new Date().toISOString()
        },
        { onConflict: "staff_profile_id" }
      );

      return json(200, {
        ok: true,
        employeeCode: target.employee_code,
        fullName: target.full_name,
        tempPassword
      });
    }

    if (payload.action !== "login") {
      return json(400, { ok: false, message: "Unknown action." });
    }

    const { employeeCode, password, newPassword } = payload;
    if (!employeeCode || !password) {
      return json(400, { ok: false, message: "Employee code and password are required." });
    }

    const staff = await findActiveStaffByEmployeeCode(employeeCode);
    if (!staff) {
      return json(200, { ok: false, message: "Employee code not found." });
    }

    const normalizedCode = normalizeEmployeeCode(staff.employee_code);
    const passwordRow = await selectOne("staff_login_passwords", {
      select: "staff_profile_id,password_hash,reset_required",
      eq: { staff_profile_id: staff.id }
    });

    if (!passwordRow) {
      return json(200, {
        ok: false,
        message: "This account has no password set up yet. Ask an admin to reset your password."
      });
    }

    const { ok: passwordOk, isLegacy } = verifyPassword({
      password,
      employeeCode: normalizedCode,
      stored: passwordRow.password_hash
    });

    if (!passwordOk) {
      return json(200, { ok: false, message: "Incorrect password." });
    }

    if (passwordRow.reset_required) {
      if (!newPassword) {
        return json(200, {
          ok: false,
          needsNewPassword: true,
          message: "Enter a new private password to finish setting up your account."
        });
      }
      const validationError = validateNewPassword(newPassword);
      if (validationError) {
        return json(200, { ok: false, message: validationError });
      }
      await upsertRow(
        "staff_login_passwords",
        {
          staff_profile_id: staff.id,
          password_hash: hashPassword(newPassword),
          reset_required: false,
          updated_at: new Date().toISOString()
        },
        { onConflict: "staff_profile_id" }
      );
    } else if (newPassword) {
      // Voluntary password change alongside a normal login.
      const validationError = validateNewPassword(newPassword);
      if (validationError) {
        return json(200, { ok: false, message: validationError });
      }
      await upsertRow(
        "staff_login_passwords",
        {
          staff_profile_id: staff.id,
          password_hash: hashPassword(newPassword),
          reset_required: false,
          updated_at: new Date().toISOString()
        },
        { onConflict: "staff_profile_id" }
      );
    } else if (isLegacy) {
      // Passive upgrade: the stored hash was in the old client-side sha256 format. Now that we've
      // verified it server-side, re-save it in the stronger scrypt format without bothering the user.
      await upsertRow(
        "staff_login_passwords",
        {
          staff_profile_id: staff.id,
          password_hash: hashPassword(password),
          reset_required: false,
          updated_at: new Date().toISOString()
        },
        { onConflict: "staff_profile_id" }
      );
    }

    const role = normalizeRole(staff.app_users?.role);
    const token = signToken({
      staffProfileId: staff.id,
      appUserId: staff.app_users?.id || null,
      employeeCode: staff.employee_code,
      hotelId: staff.hotel_id,
      role
    });

    return json(200, {
      ok: true,
      token,
      changedPassword: Boolean(newPassword),
      profile: {
        staffProfileId: staff.id,
        appUserId: staff.app_users?.id || null,
        employeeCode: staff.employee_code,
        fullName: staff.full_name,
        role
      }
    });
  } catch (error) {
    return json(500, { ok: false, message: error.message || "Login request failed." });
  }
};
