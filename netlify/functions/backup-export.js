// POST /.netlify/functions/backup-export
// Requires header: x-bridge-secret: <FINGERPRINT_BRIDGE_SECRET>
// Body: { "table": "staff_login_passwords" }
//
// Exists so local backups are COMPLETE. Most tables can be read with the public anon key, but
// a few are deliberately locked down by RLS and would otherwise be silently written to the
// backup as empty files -- discovered only when a restore is attempted:
//
//   staff_login_passwords    every staff member's login. Without it nobody can sign in.
//   fingerprint_device_users maps device IDs to people. Without it no scan resolves.
//   fingerprint_events       the scan audit trail.
//   system_heartbeats        monitoring state.
//
// Reading those needs the service-role key, which must never ship to a browser or sit in a
// script on the reception PC -- so it stays here in Netlify and the backup script authenticates
// with the same shared secret the fingerprint bridge already uses.
//
// Read-only: this function can only SELECT from an explicit allow-list of tables.

const { restRequest } = require("./lib/supabaseAdmin");

const JSON_HEADERS = { "content-type": "application/json" };

// Only these tables may be exported. Anything else is refused, so a leaked secret cannot be
// used to dump arbitrary data.
const EXPORTABLE = new Set([
  // hotels and shifts have read policies scoped to logged-in users only, so the public key
  // silently returns zero rows for them -- they must come through here too.
  "hotels",
  "shifts",
  "staff_login_passwords",
  "fingerprint_device_users",
  "fingerprint_events",
  "system_heartbeats",
  "attendance_records_archive_20260831"
]);

const PAGE_SIZE = 1000;

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, message: "Method not allowed." });
  }

  const secret = process.env.FINGERPRINT_BRIDGE_SECRET;
  if (!secret) {
    return json(500, { ok: false, message: "FINGERPRINT_BRIDGE_SECRET is not set." });
  }
  const provided = event.headers["x-bridge-secret"] || event.headers["X-Bridge-Secret"];
  if (provided !== secret) {
    return json(401, { ok: false, message: "Invalid bridge secret." });
  }

  let table = "";
  let offset = 0;
  try {
    const payload = JSON.parse(event.body || "{}");
    table = String(payload.table || "");
    offset = Number(payload.offset) || 0;
  } catch {
    return json(400, { ok: false, message: "Invalid request body." });
  }

  if (!EXPORTABLE.has(table)) {
    return json(400, { ok: false, message: `Table "${table}" is not exportable.` });
  }

  try {
    const rows = await restRequest(table, {
      query: {
        select: "*",
        limit: String(PAGE_SIZE),
        offset: String(offset)
      }
    });
    return json(200, { ok: true, table, offset, rows: rows || [], pageSize: PAGE_SIZE });
  } catch (error) {
    return json(500, { ok: false, message: error.message || "Export failed." });
  }
};
