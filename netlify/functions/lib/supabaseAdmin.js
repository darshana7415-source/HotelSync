// Minimal service-role client for Supabase's PostgREST API, used only inside Netlify functions.
// This bypasses RLS entirely (that's the point: the browser never gets this key), so every
// function that uses this module MUST enforce its own authorization checks before calling it.
//
// Requires these Netlify environment variables (server-side only, set in the Netlify dashboard,
// never in env.js / the client bundle):
//   SUPABASE_URL                - same project URL as env.js
//   SUPABASE_SERVICE_ROLE_KEY   - Project Settings > API > service_role key in Supabase

function assertConfigured() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set in Netlify environment variables."
    );
  }
}

async function restRequest(table, { method = "GET", body, query = {}, prefer } = {}) {
  assertConfigured();

  const url = new URL(`${process.env.SUPABASE_URL}/rest/v1/${table}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  }

  const headers = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    "content-type": "application/json"
  };
  if (prefer) headers.prefer = prefer;
  else if (method !== "GET") headers.prefer = "return=representation";

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = (data && (data.message || data.error || data.hint)) || `Supabase REST error (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

function eqQuery(eq = {}) {
  const query = {};
  for (const [column, value] of Object.entries(eq)) {
    query[column] = `eq.${value}`;
  }
  return query;
}

async function selectOne(table, { select = "*", eq = {} } = {}) {
  const rows = await restRequest(table, { query: { select, limit: "1", ...eqQuery(eq) } });
  return (rows && rows[0]) || null;
}

async function selectMany(table, { select = "*", eq = {}, order, limit } = {}) {
  const query = { select, ...eqQuery(eq) };
  if (order) query.order = order;
  if (limit) query.limit = String(limit);
  return restRequest(table, { query });
}

async function insertRow(table, row, { select = "*" } = {}) {
  const rows = await restRequest(table, { method: "POST", body: row, query: { select } });
  return (rows && rows[0]) || null;
}

async function updateRows(table, { eq = {}, patch, select = "*" }) {
  return restRequest(table, { method: "PATCH", query: { select, ...eqQuery(eq) }, body: patch });
}

async function upsertRow(table, row, { onConflict, select = "*" } = {}) {
  const query = { select };
  if (onConflict) query.on_conflict = onConflict;
  const rows = await restRequest(table, {
    method: "POST",
    query,
    body: row,
    prefer: "resolution=merge-duplicates,return=representation"
  });
  return (rows && rows[0]) || null;
}

async function deleteRows(table, { eq = {} }) {
  return restRequest(table, { method: "DELETE", query: eqQuery(eq), prefer: "return=minimal" });
}

module.exports = { restRequest, selectOne, selectMany, insertRow, updateRows, upsertRow, deleteRows };
