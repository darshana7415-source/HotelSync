// Server-side password hashing for staff logins.
//
// Legacy format (set by the old client-side code, app.js `hashStaffPassword`):
//   a bare 64-character hex string = sha256("staffsync:v124:{employeeCode}:{password}")
// New format (set by this server going forward):
//   "scrypt:{saltHex}:{hashHex}" with a real per-password random salt.
//
// verifyPassword() accepts both formats so existing staff logins keep working.
// Legacy hashes are transparently upgraded to scrypt after a successful login
// (see auth-login.js), so the weaker format naturally phases out over time.

const crypto = require("crypto");

const LEGACY_HASH_VERSION = "v124";
const LEGACY_HEX_RE = /^[0-9a-f]{64}$/i;

function legacyHash(employeeCode, password) {
  const source = `staffsync:${LEGACY_HASH_VERSION}:${employeeCode}:${password}`;
  return crypto.createHash("sha256").update(source, "utf8").digest("hex");
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyScrypt(password, stored) {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hashHex] = parts;
  let storedBuf;
  try {
    storedBuf = Buffer.from(hashHex, "hex");
  } catch {
    return false;
  }
  const candidate = crypto.scryptSync(password, salt, 64);
  if (candidate.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(candidate, storedBuf);
}

// Returns { ok: boolean, isLegacy: boolean } — isLegacy tells the caller to rehash-and-save.
function verifyPassword({ password, employeeCode, stored }) {
  if (!stored || !password) return { ok: false, isLegacy: false };

  if (LEGACY_HEX_RE.test(stored)) {
    const candidate = legacyHash(employeeCode, password);
    const ok = candidate.length === stored.length &&
      crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(stored.toLowerCase()));
    return { ok, isLegacy: ok };
  }

  if (stored.startsWith("scrypt:")) {
    return { ok: verifyScrypt(password, stored), isLegacy: false };
  }

  return { ok: false, isLegacy: false };
}

// Random human-typeable temp password, e.g. "482913" — replaces the old shared "12345" constant.
function generateTempPassword() {
  return String(crypto.randomInt(100000, 1000000));
}

module.exports = { hashPassword, verifyPassword, generateTempPassword };
