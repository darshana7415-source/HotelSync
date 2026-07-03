// File: /netlify/functions/engenius-sync.js
// HotelDSync EnGenius Auto-Location Sync
// Queries EnGenius controller every 5 minutes, maps phones to locations

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  try {
    console.log("[EnGenius Sync] Started at", new Date().toISOString());

    // Get configuration from environment
    const controllerIP = process.env.ENGENIUS_CONTROLLER_IP;
    const controllerUsername = process.env.ENGENIUS_USERNAME;
    const controllerPassword = process.env.ENGENIUS_PASSWORD;
    const hotelId = process.env.HOTEL_ID;

    // Validate configuration
    if (!controllerIP || !controllerUsername || !controllerPassword || !hotelId) {
      console.error("[EnGenius Sync] Missing environment variables");
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing EnGenius controller credentials",
          missing: {
            ip: !controllerIP,
            username: !controllerUsername,
            password: !controllerPassword,
            hotelId: !hotelId
          }
        })
      };
    }

    // Step 1: Query EnGenius for connected clients
    console.log(`[EnGenius Sync] Querying ${controllerIP} for connected clients...`);
    let connectedClients = {};

    try {
      connectedClients = await getEnGeniusClients(
        controllerIP,
        controllerUsername,
        controllerPassword
      );
      console.log(`[EnGenius Sync] Found ${Object.keys(connectedClients).length} connected clients`);
    } catch (error) {
      console.error("[EnGenius Sync] Failed to query controller:", error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to query EnGenius controller",
          details: error.message,
          troubleshoot: "Check IP, username, password in Netlify environment variables"
        })
      };
    }

    if (Object.keys(connectedClients).length === 0) {
      console.log("[EnGenius Sync] No clients found. Check if devices are connected.");
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: "No clients connected",
          trackedStaff: 0
        })
      };
    }

    // Step 2: Get AP to zone mappings from Supabase
    console.log("[EnGenius Sync] Fetching AP to zone mappings...");
    const { data: apMappings, error: mappingError } = await supabase
      .from("ap_zone_mapping")
      .select("ap_name, floor, zone")
      .eq("hotel_id", hotelId);

    if (mappingError) {
      console.error("[EnGenius Sync] Failed to fetch AP mappings:", mappingError);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to fetch AP mappings",
          details: mappingError.message
        })
      };
    }

    // Create lookup map: AP name → Zone info
    const apToZone = {};
    (apMappings || []).forEach(mapping => {
      apToZone[mapping.ap_name] = {
        floor: mapping.floor,
        zone: mapping.zone
      };
    });

    console.log(`[EnGenius Sync] Loaded ${Object.keys(apToZone).length} AP mappings`);

    // Step 3: Match phones to staff
    console.log("[EnGenius Sync] Matching phones to staff...");
    const staffLocations = [];
    const unmappedPhones = [];

    for (const [phoneMac, clientData] of Object.entries(connectedClients)) {
      const normalizedMac = phoneMac.toUpperCase();

      // Find staff with this phone MAC
      const { data: staff, error: staffError } = await supabase
        .from("staff_profiles")
        .select("id, full_name, employee_code")
        .eq("phone_mac", normalizedMac)
        .maybeSingle();

      if (staffError) {
        console.warn(`[EnGenius Sync] Error looking up phone ${normalizedMac}:`, staffError);
        unmappedPhones.push(normalizedMac);
        continue;
      }

      if (!staff) {
        console.log(`[EnGenius Sync] Phone ${normalizedMac} not registered to any staff`);
        unmappedPhones.push(normalizedMac);
        continue;
      }

      // Get AP name (handle different response formats)
      const apName = clientData.ap_name || clientData.ap || clientData.apName || "Unknown";
      const zoneInfo = apToZone[apName] || {};

      const location = {
        phone_mac: normalizedMac,
        staff_profile_id: staff.id,
        ap_name: apName,
        zone: zoneInfo.zone || "Unknown",
        floor: zoneInfo.floor || "Unknown",
        hotel_id: hotelId,
        last_seen: new Date().toISOString()
      };

      staffLocations.push(location);

      console.log(
        `[EnGenius Sync] ${staff.full_name} (${staff.employee_code}) → ${zoneInfo.zone || "Unknown"} via ${apName}`
      );
    }

    // Step 4: Save locations to Supabase
    if (staffLocations.length > 0) {
      console.log(`[EnGenius Sync] Saving ${staffLocations.length} staff locations...`);

      const { error: upsertError } = await supabase
        .from("engenius_client_map")
        .upsert(staffLocations, {
          onConflict: "phone_mac"
        });

      if (upsertError) {
        console.error("[EnGenius Sync] Failed to save locations:", upsertError);
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: "Failed to save locations to database",
            details: upsertError.message
          })
        };
      }
    }

    // Success response
    console.log(`[EnGenius Sync] Completed successfully. Tracked ${staffLocations.length} staff.`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        connectedClients: Object.keys(connectedClients).length,
        trackedStaff: staffLocations.length,
        unmappedPhones: unmappedPhones.length,
        staffLocations: staffLocations.map(loc => ({
          name: `Staff at ${loc.zone}`,
          phone: loc.phone_mac,
          zone: loc.zone,
          floor: loc.floor,
          ap: loc.ap_name
        }))
      })
    };

  } catch (error) {
    console.error("[EnGenius Sync] Unexpected error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Unexpected error during sync",
        message: error.message
      })
    };
  }
};

/**
 * Query EnGenius controller for connected clients
 * Tries multiple methods: JSON API → SSH → SNMP
 */
async function getEnGeniusClients(ip, user, pass) {
  // Method 1: Try JSON API (most reliable)
  try {
    console.log("[EnGenius] Trying JSON API...");
    return await queryEnGeniusJSON(ip, user, pass);
  } catch (e1) {
    console.warn("[EnGenius] JSON API failed:", e1.message);
  }

  // Method 2: Try SSH
  try {
    console.log("[EnGenius] Trying SSH...");
    return await queryEnGeniusSSH(ip, user, pass);
  } catch (e2) {
    console.warn("[EnGenius] SSH failed:", e2.message);
  }

  // Method 3: Try SNMP
  try {
    console.log("[EnGenius] Trying SNMP...");
    return await queryEnGeniusSNMP(ip, user, pass);
  } catch (e3) {
    console.warn("[EnGenius] SNMP failed:", e3.message);
  }

  throw new Error(
    "Could not connect to EnGenius controller. " +
    "Verify IP, username, password, and network connectivity."
  );
}

/**
 * Method 1: Query via JSON API (HTTPS)
 * Most modern EnGenius controllers support this
 */
async function queryEnGeniusJSON(ip, user, pass) {
  const auth = Buffer.from(`${user}:${pass}`).toString("base64");

  const response = await fetch(`https://${ip}:8443/api/v2/clients`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    timeout: 30000
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return parseEnGeniusClients(data);
}

/**
 * Method 2: Query via SSH command
 * For EnGenius devices with SSH access
 */
async function queryEnGeniusSSH(ip, user, pass) {
  // SSH requires ssh2 package: npm install ssh2
  let Client;
  try {
    Client = require("ssh2").Client;
  } catch (e) {
    throw new Error("ssh2 package not installed. Install with: npm install ssh2");
  }

  const conn = new Client();

  return new Promise((resolve, reject) => {
    conn.on("ready", () => {
      // Try different commands based on EnGenius firmware
      const commands = [
        "show ap clients",
        "show clients",
        "display ap connected-clients"
      ];

      let output = "";
      let commandIndex = 0;

      const tryNextCommand = () => {
        if (commandIndex >= commands.length) {
          conn.end();
          reject(new Error("No valid SSH commands worked"));
          return;
        }

        const cmd = commands[commandIndex];
        console.log(`[EnGenius SSH] Trying command: ${cmd}`);
        commandIndex++;

        conn.exec(cmd, (err, stream) => {
          if (err) {
            tryNextCommand();
            return;
          }

          stream.on("close", () => {
            if (output.trim()) {
              const clients = parseSSHOutput(output);
              if (Object.keys(clients).length > 0) {
                conn.end();
                resolve(clients);
              } else {
                output = "";
                tryNextCommand();
              }
            } else {
              tryNextCommand();
            }
          });

          stream.on("data", (data) => {
            output += data.toString();
          });
        });
      };

      tryNextCommand();
    });

    conn.on("error", reject);

    conn.connect({
      host: ip,
      username: user,
      password: pass,
      readyTimeout: 30000
    });
  });
}

/**
 * Method 3: Query via SNMP
 * Requires snmp package: npm install snmp
 */
async function queryEnGeniusSNMP(ip, user, pass) {
  // SNMP is complex and hardware-specific
  // For now, throw error to fall back to other methods
  throw new Error("SNMP not yet configured. Use JSON API or SSH instead.");
}

/**
 * Parse EnGenius JSON API response
 * Handles various response formats
 */
function parseEnGeniusClients(data) {
  const clients = {};

  if (!data) {
    console.warn("[EnGenius Parse] Empty response");
    return clients;
  }

  // Format 1: data.result is array
  if (Array.isArray(data.result)) {
    data.result.forEach(client => {
      const mac = client.mac || client.MAC;
      if (mac) {
        clients[mac.toUpperCase()] = {
          ap_name: client.ap_name || client.apName || client.ap,
          ap_mac: client.ap_mac || client.apMac,
          signal: client.rssi || client.signal || 0
        };
      }
    });
  }
  // Format 2: data.clients is object
  else if (data.clients && typeof data.clients === "object") {
    Object.entries(data.clients).forEach(([mac, info]) => {
      clients[mac.toUpperCase()] = {
        ap_name: info.ap_name || info.apName || info.ap,
        ap_mac: info.ap_mac || info.apMac,
        signal: info.rssi || info.signal || 0
      };
    });
  }
  // Format 3: data is array of clients
  else if (Array.isArray(data)) {
    data.forEach(client => {
      const mac = client.mac || client.MAC;
      if (mac) {
        clients[mac.toUpperCase()] = {
          ap_name: client.ap_name || client.apName || client.ap,
          ap_mac: client.ap_mac || client.apMac,
          signal: client.rssi || client.signal || 0
        };
      }
    });
  }

  return clients;
}

/**
 * Parse SSH command output
 * Handles various EnGenius firmware output formats
 */
function parseSSHOutput(output) {
  const clients = {};

  if (!output || !output.trim()) {
    return clients;
  }

  const lines = output.split("\n");

  lines.forEach(line => {
    // Format: MAC  AP-Name  Signal
    // Example: 12:56:00:02:52:7F  AP_GROUND_FLOOR_OLD_WING  -45
    const match = line.match(/([0-9A-Fa-f:]{17})\s+(\S+)\s+(-\d+)/);
    if (match) {
      const [, mac, apName, signal] = match;
      clients[mac.toUpperCase()] = {
        ap_name: apName,
        signal: parseInt(signal)
      };
    }
  });

  return clients;
}