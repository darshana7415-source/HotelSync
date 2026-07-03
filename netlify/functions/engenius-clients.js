exports.handler = async function handler() {
  const apiKey = process.env.ENGENIUS_API_KEY;
  const apiUrl = process.env.ENGENIUS_CLIENTS_URL;

  if (!apiKey || !apiUrl) {
    return {
      statusCode: 501,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: "ENGENIUS_NOT_CONFIGURED",
        message: "Set ENGENIUS_API_KEY and ENGENIUS_CLIENTS_URL in Netlify environment variables."
      })
    };
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "accept": "application/json",
        "x-api-key": apiKey,
        "authorization": `Bearer ${apiKey}`
      }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          error: "ENGENIUS_API_ERROR",
          message: data.message || "EnGenius API returned an error.",
          details: data
        })
      };
    }

    const clients = normalizeEnGeniusClients(data);
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clients })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: "ENGENIUS_BRIDGE_FAILED",
        message: error.message || "Could not reach EnGenius API."
      })
    };
  }
};

function normalizeEnGeniusClients(data) {
  const list = findClientList(data);

  return list.map((item) => ({
    name: pick(item, ["name", "hostname", "host_name", "client_name", "deviceName", "device_name"]),
    mac: pick(item, ["mac", "macAddress", "mac_address", "client_mac", "clientMac", "sta_mac"]),
    apName: pick(item, ["apName", "ap_name", "lastAssociatedAp", "last_asso_ap", "last_associated_ap", "ap", "apNameText", "ap_name_text"]),
    ssid: pick(item, ["ssid", "network", "networkName", "network_name", "wlan", "wlan_name"]),
    rssi: pick(item, ["rssi", "signal", "signalStrength", "signal_strength"]),
    lastSeen: pick(item, ["lastSeen", "last_seen", "lastSeenAt", "last_seen_at", "lastseen"])
  })).filter((item) => item.mac);
}

function findClientList(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const likelyKeys = ["clients", "client_list", "clientList", "items", "list", "rows", "data", "result", "results"];
  for (const key of likelyKeys) {
    const found = findClientList(value[key]);
    if (found.length && looksLikeClient(found[0])) {
      return found;
    }
  }

  for (const item of Object.values(value)) {
    const found = findClientList(item);
    if (found.length && looksLikeClient(found[0])) {
      return found;
    }
  }

  return [];
}

function looksLikeClient(item) {
  if (!item || typeof item !== "object") {
    return false;
  }

  return Boolean(pick(item, ["mac", "macAddress", "mac_address", "client_mac", "clientMac", "sta_mac"]));
}

function pick(item, keys) {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null && item[key] !== "") {
      return item[key];
    }
  }

  return "";
}
