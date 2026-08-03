// Verifies an admin/manager caller using their REAL Supabase Auth session (the browser signs in
// via window.staffSyncDb.signIn -> supabase.auth.signInWithPassword, which is genuine Supabase Auth,
// unlike the staff employee-code login which has no Supabase Auth session at all).
//
// The client sends its Supabase access token as "Authorization: Bearer <access_token>"; this module
// asks Supabase's own Auth API who that token belongs to, then checks app_users for an admin/manager
// role. This avoids re-implementing JWT verification -- Supabase already does that for us.

const { selectOne } = require("./supabaseAdmin");
const { getBearerToken } = require("./session");

async function verifyAdminFromSupabaseToken(accessToken) {
  if (!accessToken || !process.env.SUPABASE_URL) return null;

  const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${accessToken}`
    }
  });
  if (!response.ok) return null;

  const user = await response.json().catch(() => null);
  if (!user?.id) return null;

  const appUser = await selectOne("app_users", {
    select: "id,role,status,hotel_id",
    eq: { auth_user_id: user.id }
  });
  if (!appUser || appUser.status !== "active") return null;

  const role = String(appUser.role || "").toLowerCase();
  if (!["admin", "manager"].includes(role)) return null;

  return { appUserId: appUser.id, role, hotelId: appUser.hotel_id, authUserId: user.id };
}

// Reads the bearer token off the request and verifies it as an admin/manager Supabase session.
async function authenticateAdminRequest(event) {
  const token = getBearerToken(event);
  return verifyAdminFromSupabaseToken(token);
}

module.exports = { verifyAdminFromSupabaseToken, authenticateAdminRequest };
