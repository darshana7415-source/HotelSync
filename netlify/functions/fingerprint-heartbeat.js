// POST /.netlify/functions/fingerprint-heartbeat
// Called by the fingerprint bridge on the reception PC at the end of EVERY run --
// whether it found new events or not -- so StaffSync always knows how recently the
// bridge last successfully talked to both the device and the server.
//
// The bridge itself can go silent for all sorts of reasons that produce no error
// anywhere visible (Task Scheduler configured to only run while a user is logged
// on, the PC losing network, the machine being off) -- this heartbeat is what lets
// the dashboard notice that and warn someone, instead of it only being discovered
// when a staff member's checkout never shows up.
//
// Requires header: x-bridge-secret: <FINGERPRINT_BRIDGE_SECRET> (same secret as fingerprint-sync)
//
// Body: { eventCount: <number of events processed this run>, note?: string }

const { upsertRow } = require("./lib/supabaseAdmin");

const JSON_HEADERS = { "content-type": "application/json" };

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
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
    payload = {};
  }

  try {
    await upsertRow("system_heartbeats", {
      id: "fingerprint_bridge",
      last_run_at: new Date().toISOString(),
      last_event_count: Number(payload.eventCount) || 0,
      note: payload.note || null
    }, { onConflict: "id" });
    return json(200, { ok: true });
  } catch (error) {
    return json(500, { ok: false, message: error.message || "Heartbeat write failed." });
  }
};
