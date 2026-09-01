// Signed session tokens for StaffSync serverless functions.
//
// This is NOT a JWT library. It's a minimal HMAC-signed token: base64url(payload) + "." + signature.
// Requires STAFFSYNC_SESSION_SECRET to be set as a Netlify environment variable (server-side only,
// never shipped to the browser). Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

const crypto = require("crypto");

function getSecret() {
  const secret = process.env.STAFFSYNC_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "STAFFSYNC_SESSION_SECRET is missing or too short. Set it in Netlify environment variables (32+ random bytes)."
    );
  }
  return secret;
}

function base64urlEncode(input) {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(input) {
  let normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4) normalized += "=";
  return Buffer.from(normalized, "base64").toString("utf8");
}

function sign(encodedBody, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(encodedBody)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Staff sessions last a week. At 12 hours, anyone who kept the app open was silently logged
// out roughly twice a day: the browser still remembered their role, so they appeared signed in
// while every action failed, and the app then bounced them back to the login screen. That
// generated repeated "cannot log in" reports (Ganindu, Shiromi, Kavindu) for accounts that
// were perfectly healthy.
//
// A week is a deliberate trade-off for an internal, single-site staff app: these tokens grant
// only the ability to act on that person's own leave and attendance records -- never admin
// rights, which still require a real Supabase Auth login. An admin can revoke access at any
// time by resetting the person's password, which invalidates their ability to obtain a new
// token, and by deactivating the account in app_users.
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function signToken(claims, { expiresInSeconds = DEFAULT_TTL_SECONDS } = {}) {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  const body = { ...claims, iat: now, exp: now + expiresInSeconds };
  const encodedBody = base64urlEncode(JSON.stringify(body));
  const signature = sign(encodedBody, secret);
  return `${encodedBody}.${signature}`;
}

// Returns the decoded claims if the token is validly signed and unexpired, otherwise null.
function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;

  let secret;
  try {
    secret = getSecret();
  } catch {
    return null;
  }

  const dotIndex = token.lastIndexOf(".");
  const encodedBody = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  if (!encodedBody || !signature) return null;

  const expectedSignature = sign(encodedBody, secret);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(base64urlDecode(encodedBody));
  } catch {
    return null;
  }

  if (!payload || typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

// Pulls "Bearer <token>" out of Netlify's lowercase-normalized event.headers.authorization.
function getBearerToken(event) {
  const header = event?.headers?.authorization || event?.headers?.Authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : "";
}

// Verifies the caller's session from the request, or returns null if missing/invalid/expired.
function authenticateRequest(event) {
  const token = getBearerToken(event);
  if (!token) return null;
  return verifyToken(token);
}

module.exports = { signToken, verifyToken, getBearerToken, authenticateRequest };
