// POST /.netlify/functions/tasks
// Requires Authorization: Bearer <session token from auth-login>.
//
// Daily cleaning / housekeeping checklist. Attendance already proves a person was on the
// property; this proves the work actually happened, and who did it.
//
// Completions are written here rather than straight from the browser on purpose. The anon
// key is public (it ships in env.js to every phone), so a completion written client-side
// could be forged by anyone who opened dev tools. Routing through this function means the
// name stamped on a completed task comes from the signed session token, not from whatever
// the page claimed.
//
// Body: { action, ...fields }

const { restRequest, selectOne, insertRow, updateRows, deleteRows } = require("./lib/supabaseAdmin");
const { authenticateRequest } = require("./lib/session");
const { authenticateAdminRequest } = require("./lib/adminAuth");

const JSON_HEADERS = { "content-type": "application/json" };
const MANAGER_ROLES = ["admin", "manager"];

// The hotel runs on Asia/Colombo, which is +05:30 all year (Sri Lanka has no DST). Using
// the server's UTC date would roll the checklist over at 05:30 local, so the morning pool
// clean would land on the previous day's board.
const COLOMBO_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

function isManager(claims) {
  return MANAGER_ROLES.includes(claims.role);
}

function colomboNow() {
  return new Date(Date.now() + COLOMBO_OFFSET_MS);
}

function colomboDateKey(date = colomboNow()) {
  return date.toISOString().slice(0, 10);
}

// Minutes since midnight, hotel local time.
function colomboMinutesOfDay() {
  const now = colomboNow();
  return now.getUTCHours() * 60 + now.getUTCMinutes();
}

function timeToMinutes(value) {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function isValidDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

// Postgres day-of-week: 0 = Sunday. Derived from the date string so it is the hotel's
// weekday, not the server's.
function weekdayOf(dateKey) {
  return new Date(`${dateKey}T00:00:00Z`).getUTCDay();
}

async function loadDefinitions() {
  return restRequest("task_definitions", {
    query: {
      select: "id,title,area,department_id,weekdays,window_start,window_end,expected_minutes,sort_order,active,departments(name)",
      active: "eq.true",
      order: "sort_order.asc"
    }
  });
}

async function loadCompletions(fromDateKey, toDateKey) {
  return restRequest("task_completions", {
    query: {
      select: "id,task_id,task_date,staff_profile_id,staff_name,completed_at,note,recorded_by",
      and: `(task_date.gte.${fromDateKey},task_date.lte.${toDateKey})`,
      order: "completed_at.asc"
    }
  });
}

// done   -- finished inside its window
// late   -- finished, but after the window closed
// open   -- window still running (or not started), nothing recorded yet
// missed -- window has closed with nothing recorded
function statusFor(definition, completion, dateKey, todayKey, nowMinutes) {
  const windowEnd = timeToMinutes(definition.window_end);

  if (completion) {
    const doneAt = new Date(completion.completed_at).getTime() + COLOMBO_OFFSET_MS;
    const doneDate = new Date(doneAt);
    const doneMinutes = doneDate.getUTCHours() * 60 + doneDate.getUTCMinutes();
    const doneOnAnotherDay = doneDate.toISOString().slice(0, 10) !== dateKey;
    if (windowEnd !== null && (doneOnAnotherDay || doneMinutes > windowEnd)) return "late";
    return "done";
  }

  if (dateKey > todayKey) return "open";
  if (dateKey < todayKey) return "missed";
  if (windowEnd !== null && nowMinutes > windowEnd) return "missed";
  return "open";
}

function buildDay(definitions, completions, dateKey, todayKey, nowMinutes) {
  const weekday = weekdayOf(dateKey);
  const byTask = new Map(completions.map((row) => [row.task_id, row]));

  return definitions
    .filter((definition) => (definition.weekdays || []).includes(weekday))
    .map((definition) => {
      const completion = byTask.get(definition.id) || null;
      return {
        taskId: definition.id,
        title: definition.title,
        area: definition.area,
        department: definition.departments ? definition.departments.name : null,
        departmentId: definition.department_id,
        windowStart: String(definition.window_start || "").slice(0, 5),
        windowEnd: String(definition.window_end || "").slice(0, 5),
        expectedMinutes: definition.expected_minutes,
        status: statusFor(definition, completion, dateKey, todayKey, nowMinutes),
        completedBy: completion ? completion.staff_name : null,
        completedByProfileId: completion ? completion.staff_profile_id : null,
        completedAt: completion ? completion.completed_at : null,
        note: completion ? completion.note : null,
        recordedBy: completion ? completion.recorded_by : null
      };
    });
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, message: "Method not allowed." });
  }

  // Two kinds of caller reach this endpoint. Staff sign in with an employee code and carry
  // the HMAC session token from auth-login; admins sign in with an email through real
  // Supabase Auth and carry a Supabase access token. Accept either, and normalise both into
  // the same claims shape so nothing below has to care which one it got.
  let claims = authenticateRequest(event);
  if (!claims) {
    const admin = await authenticateAdminRequest(event);
    if (admin) {
      claims = {
        staffProfileId: null,
        appUserId: admin.appUserId,
        hotelId: admin.hotelId,
        role: admin.role
      };
    }
  }
  if (!claims) {
    return json(401, { ok: false, message: "Session expired. Please log in again." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, message: "Invalid request body." });
  }

  const todayKey = colomboDateKey();
  const nowMinutes = colomboMinutesOfDay();

  try {
    switch (payload.action) {
      // ---- Everyone signed in ------------------------------------------------------
      case "listDay": {
        const dateKey = isValidDateKey(payload.date) ? payload.date : todayKey;
        const [definitions, completions] = await Promise.all([
          loadDefinitions(),
          loadCompletions(dateKey, dateKey)
        ]);
        return json(200, {
          ok: true,
          date: dateKey,
          today: todayKey,
          tasks: buildDay(definitions, completions, dateKey, todayKey, nowMinutes)
        });
      }

      case "complete": {
        if (!payload.taskId) return json(400, { ok: false, message: "Which task?" });

        const dateKey = isValidDateKey(payload.date) ? payload.date : todayKey;
        // Staff can only tick off today. Back-filling a week of pool cleaning on Friday
        // would make the whole record worthless, so that stays a manager action.
        if (dateKey !== todayKey && !isManager(claims)) {
          return json(403, { ok: false, message: "You can only tick off today's tasks." });
        }

        const definition = await selectOne("task_definitions", { eq: { id: payload.taskId } });
        if (!definition || !definition.active) {
          return json(404, { ok: false, message: "That task no longer exists." });
        }

        const existing = await selectOne("task_completions", {
          eq: { task_id: payload.taskId, task_date: dateKey }
        });
        if (existing) {
          return json(200, { ok: true, alreadyDone: true, data: existing });
        }

        // A manager recording work on someone else's behalf must say whose work it was,
        // otherwise the record credits the manager for cleaning the pool.
        let staffProfileId = claims.staffProfileId || null;
        let recordedBy = "staff";
        if (isManager(claims) && payload.staffProfileId) {
          staffProfileId = payload.staffProfileId;
          recordedBy = "manager";
        } else if (isManager(claims)) {
          recordedBy = "manager";
        }

        let staffName = null;
        if (staffProfileId) {
          const profile = await selectOne("staff_profiles", {
            select: "full_name",
            eq: { id: staffProfileId }
          });
          staffName = profile ? profile.full_name : null;
        }

        const row = await insertRow("task_completions", {
          task_id: payload.taskId,
          task_date: dateKey,
          staff_profile_id: staffProfileId,
          staff_name: staffName,
          completed_at: new Date().toISOString(),
          note: payload.note ? String(payload.note).slice(0, 400) : null,
          recorded_by: recordedBy
        });

        return json(200, { ok: true, data: row });
      }

      case "undo": {
        if (!payload.taskId) return json(400, { ok: false, message: "Which task?" });
        const dateKey = isValidDateKey(payload.date) ? payload.date : todayKey;

        const existing = await selectOne("task_completions", {
          eq: { task_id: payload.taskId, task_date: dateKey }
        });
        if (!existing) return json(200, { ok: true });

        // Staff can correct their own mistake on the same day. They cannot quietly erase
        // someone else's record, and they cannot rewrite history once the day has passed.
        const mine = existing.staff_profile_id && existing.staff_profile_id === claims.staffProfileId;
        if (!isManager(claims) && (!mine || dateKey !== todayKey)) {
          return json(403, { ok: false, message: "Only a manager can remove this record." });
        }

        await deleteRows("task_completions", { eq: { id: existing.id } });
        return json(200, { ok: true });
      }

      // ---- Admin / manager ---------------------------------------------------------
      case "board": {
        if (!isManager(claims)) {
          return json(403, { ok: false, message: "Managers only." });
        }

        const days = Math.min(Math.max(Number(payload.days) || 14, 1), 90);
        const to = isValidDateKey(payload.to) ? payload.to : todayKey;
        const fromDate = new Date(`${to}T00:00:00Z`);
        fromDate.setUTCDate(fromDate.getUTCDate() - (days - 1));
        const from = fromDate.toISOString().slice(0, 10);

        const [definitions, completions] = await Promise.all([
          loadDefinitions(),
          loadCompletions(from, to)
        ]);

        const byDate = new Map();
        for (const row of completions) {
          if (!byDate.has(row.task_date)) byDate.set(row.task_date, []);
          byDate.get(row.task_date).push(row);
        }

        // Per-task tally across the range, plus a per-person tally so a repeated miss can
        // be traced to whoever was responsible rather than to "housekeeping" in general.
        const taskTally = new Map();
        const personTally = new Map();
        const dayTotals = [];

        for (let i = 0; i < days; i += 1) {
          const cursor = new Date(`${from}T00:00:00Z`);
          cursor.setUTCDate(cursor.getUTCDate() + i);
          const dateKey = cursor.toISOString().slice(0, 10);
          if (dateKey > todayKey) break;

          const rows = buildDay(definitions, byDate.get(dateKey) || [], dateKey, todayKey, nowMinutes);
          let done = 0;
          let late = 0;
          let missed = 0;

          for (const row of rows) {
            if (!taskTally.has(row.taskId)) {
              taskTally.set(row.taskId, {
                taskId: row.taskId, title: row.title, area: row.area,
                department: row.department, done: 0, late: 0, missed: 0, open: 0
              });
            }
            taskTally.get(row.taskId)[row.status] += 1;

            if (row.status === "done" || row.status === "late") {
              done += row.status === "done" ? 1 : 0;
              late += row.status === "late" ? 1 : 0;
              const key = row.completedByProfileId || "unknown";
              if (!personTally.has(key)) {
                personTally.set(key, { staffProfileId: row.completedByProfileId, name: row.completedBy || "Not recorded", done: 0, late: 0 });
              }
              const person = personTally.get(key);
              person.done += row.status === "done" ? 1 : 0;
              person.late += row.status === "late" ? 1 : 0;
            } else if (row.status === "missed") {
              missed += 1;
            }
          }

          dayTotals.push({ date: dateKey, done, late, missed, total: rows.length });
        }

        return json(200, {
          ok: true,
          from,
          to,
          today: todayKey,
          days: dayTotals,
          tasks: Array.from(taskTally.values()).sort((a, b) => b.missed - a.missed || a.title.localeCompare(b.title)),
          people: Array.from(personTally.values()).sort((a, b) => (b.done + b.late) - (a.done + a.late))
        });
      }

      case "listDefinitions": {
        if (!isManager(claims)) return json(403, { ok: false, message: "Managers only." });
        const rows = await restRequest("task_definitions", {
          query: {
            select: "id,title,area,department_id,weekdays,window_start,window_end,expected_minutes,sort_order,active,departments(name)",
            order: "sort_order.asc"
          }
        });
        return json(200, { ok: true, definitions: rows });
      }

      case "saveDefinition": {
        if (!isManager(claims)) return json(403, { ok: false, message: "Managers only." });
        const title = String(payload.title || "").trim();
        if (!title) return json(400, { ok: false, message: "A task needs a name." });

        const patch = {
          title,
          area: payload.area ? String(payload.area).trim() : null,
          department_id: payload.departmentId || null,
          window_start: payload.windowStart || "06:00",
          window_end: payload.windowEnd || "18:00",
          expected_minutes: payload.expectedMinutes ? Number(payload.expectedMinutes) : null,
          sort_order: payload.sortOrder !== undefined ? Number(payload.sortOrder) : 100,
          active: payload.active !== false
        };
        if (Array.isArray(payload.weekdays) && payload.weekdays.length) {
          patch.weekdays = payload.weekdays.map(Number).filter((n) => n >= 0 && n <= 6);
        }

        if (payload.id) {
          const rows = await updateRows("task_definitions", { eq: { id: payload.id }, patch });
          return json(200, { ok: true, data: (rows && rows[0]) || null });
        }

        if (!claims.hotelId) {
          return json(400, { ok: false, message: "No hotel on this session." });
        }
        const row = await insertRow("task_definitions", { hotel_id: claims.hotelId, ...patch });
        return json(200, { ok: true, data: row });
      }

      case "deleteDefinition": {
        if (!isManager(claims)) return json(403, { ok: false, message: "Managers only." });
        if (!payload.id) return json(400, { ok: false, message: "Which task?" });
        // Deactivated rather than deleted: deleting would take the completion history with
        // it, and the history is the whole point of this feature.
        await updateRows("task_definitions", { eq: { id: payload.id }, patch: { active: false } });
        return json(200, { ok: true });
      }

      // ---- Assignments: a task given to a named person for a specific day ----------
      case "listAssignments": {
        const dateKey = isValidDateKey(payload.date) ? payload.date : todayKey;
        const rows = await restRequest("task_assignments", {
          query: {
            select: "id,task_id,title,area,task_date,due_time,staff_profile_id,staff_name,status,note,assigned_by_name,assigned_at,completed_at,completed_by_manager",
            task_date: `eq.${dateKey}`,
            order: "due_time.asc,title.asc"
          }
        });

        // Staff see only what was given to them. A cleaner does not need a list of
        // everyone else's jobs, and showing it invites "that was not mine".
        const visible = isManager(claims)
          ? rows
          : rows.filter((row) => row.staff_profile_id === claims.staffProfileId);

        return json(200, {
          ok: true,
          date: dateKey,
          today: todayKey,
          nowMinutes,
          canAssign: isManager(claims),
          assignments: visible.map((row) => ({
            id: row.id,
            title: row.title,
            area: row.area,
            date: row.task_date,
            dueTime: row.due_time ? String(row.due_time).slice(0, 5) : null,
            staffProfileId: row.staff_profile_id,
            staffName: row.staff_name,
            status: row.status,
            note: row.note,
            assignedBy: row.assigned_by_name,
            completedAt: row.completed_at,
            completedByManager: row.completed_by_manager,
            mine: row.staff_profile_id === claims.staffProfileId
          }))
        });
      }

      case "completeAssignment": {
        if (!payload.id) return json(400, { ok: false, message: "Which task?" });

        const existing = await selectOne("task_assignments", { eq: { id: payload.id } });
        if (!existing) return json(404, { ok: false, message: "That task no longer exists." });
        if (existing.status === "done") return json(200, { ok: true, alreadyDone: true });

        // The point of the pending state is that the person who was given the job is the
        // one who closes it. A manager can still close it, but the record says so.
        const mine = existing.staff_profile_id && existing.staff_profile_id === claims.staffProfileId;
        if (!mine && !isManager(claims)) {
          return json(403, { ok: false, message: "That task was given to someone else." });
        }

        const rows = await updateRows("task_assignments", {
          eq: { id: payload.id },
          patch: {
            status: "done",
            completed_at: new Date().toISOString(),
            completed_by_manager: !mine,
            note: payload.note ? String(payload.note).slice(0, 400) : existing.note
          }
        });
        return json(200, { ok: true, data: (rows && rows[0]) || null });
      }

      case "reopenAssignment": {
        if (!isManager(claims)) return json(403, { ok: false, message: "Managers only." });
        if (!payload.id) return json(400, { ok: false, message: "Which task?" });
        await updateRows("task_assignments", {
          eq: { id: payload.id },
          patch: { status: "pending", completed_at: null, completed_by_manager: false }
        });
        return json(200, { ok: true });
      }

      case "deleteAssignment": {
        if (!isManager(claims)) return json(403, { ok: false, message: "Managers only." });
        if (!payload.id) return json(400, { ok: false, message: "Which task?" });
        await deleteRows("task_assignments", { eq: { id: payload.id } });
        return json(200, { ok: true });
      }

      case "assign": {
        if (!isManager(claims)) return json(403, { ok: false, message: "Managers only." });

        const dateKey = isValidDateKey(payload.date) ? payload.date : todayKey;
        // Today and tomorrow only. Assigning a week ahead produces a backlog nobody reads,
        // and the staff list is built from who actually turned up, which is unknowable
        // further out than tomorrow's roster.
        const tomorrow = new Date(`${todayKey}T00:00:00Z`);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        const tomorrowKey = tomorrow.toISOString().slice(0, 10);
        if (dateKey !== todayKey && dateKey !== tomorrowKey) {
          return json(400, { ok: false, message: "Tasks can only be scheduled for today or tomorrow." });
        }

        const staffIds = Array.isArray(payload.staffProfileIds) ? payload.staffProfileIds.filter(Boolean) : [];
        if (!staffIds.length) return json(400, { ok: false, message: "Choose at least one person." });

        let title = String(payload.title || "").trim();
        let area = payload.area ? String(payload.area).trim() : null;
        let dueTime = payload.dueTime || null;

        // Picking from the library fills in the name, area and time so a manager only has
        // to choose the people.
        if (payload.taskId) {
          const definition = await selectOne("task_definitions", { eq: { id: payload.taskId } });
          if (definition) {
            title = title || definition.title;
            area = area || definition.area;
            dueTime = dueTime || (definition.window_end ? String(definition.window_end).slice(0, 5) : null);
          }
        }
        if (!title) return json(400, { ok: false, message: "A task needs a name." });

        const profiles = await restRequest("staff_profiles", {
          query: { select: "id,full_name", id: `in.(${staffIds.join(",")})` }
        });
        const nameById = new Map(profiles.map((row) => [row.id, row.full_name]));

        const rows = staffIds.map((id) => ({
          hotel_id: claims.hotelId,
          task_id: payload.taskId || null,
          title,
          area,
          task_date: dateKey,
          due_time: dueTime,
          staff_profile_id: id,
          staff_name: nameById.get(id) || null,
          status: "pending",
          assigned_by_name: payload.assignedByName || (isManager(claims) ? claims.role : null)
        }));

        // Re-assigning the same job to the same person on the same day is a no-op rather
        // than an error -- a manager tapping Assign twice should not see a failure.
        const saved = await restRequest("task_assignments", {
          method: "POST",
          query: { select: "*", on_conflict: "task_date,staff_profile_id,title" },
          body: rows,
          prefer: "resolution=ignore-duplicates,return=representation"
        });

        return json(200, { ok: true, created: (saved || []).length, requested: rows.length });
      }

      // Who can actually be given a job on this date. Assigning the pool to someone who
      // was not at the hotel is how a checklist stops meaning anything.
      case "eligibleStaff": {
        if (!isManager(claims)) return json(403, { ok: false, message: "Managers only." });

        const dateKey = isValidDateKey(payload.date) ? payload.date : todayKey;
        const cutoff = timeToMinutes(payload.dueTime || "06:00");
        const dayStart = new Date(`${dateKey}T00:00:00Z`).getTime() - COLOMBO_OFFSET_MS;
        const dayEnd = dayStart + 24 * 60 * 60 * 1000;

        const [profiles, attendance, roster] = await Promise.all([
          restRequest("staff_profiles", {
            query: { select: "id,full_name,employee_code,departments(name)", order: "employee_code.asc" }
          }),
          restRequest("attendance_records", {
            query: {
              select: "staff_profile_id,clock_in_at",
              and: `(clock_in_at.gte.${new Date(dayStart).toISOString()},clock_in_at.lt.${new Date(dayEnd).toISOString()})`,
              order: "clock_in_at.asc"
            }
          }),
          restRequest("daily_rosters", {
            query: { select: "staff_profile_id,in_time,day_status", roster_date: `eq.${dateKey}` }
          })
        ]);

        const firstScan = new Map();
        for (const row of attendance) {
          if (!row.staff_profile_id) continue;
          if (!firstScan.has(row.staff_profile_id)) firstScan.set(row.staff_profile_id, row.clock_in_at);
        }

        const rosterByStaff = new Map();
        for (const row of roster) {
          if (row.staff_profile_id) rosterByStaff.set(row.staff_profile_id, row);
        }

        const before = [];
        const after = [];
        const rostered = [];

        for (const profile of profiles) {
          const entry = {
            id: profile.id,
            name: profile.full_name,
            code: profile.employee_code,
            department: profile.departments ? profile.departments.name : null,
            inAt: null
          };

          const scan = firstScan.get(profile.id);
          if (scan) {
            const local = new Date(new Date(scan).getTime() + COLOMBO_OFFSET_MS);
            const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
            entry.inAt = `${String(local.getUTCHours()).padStart(2, "0")}:${String(local.getUTCMinutes()).padStart(2, "0")}`;
            if (cutoff === null || minutes <= cutoff) before.push(entry);
            else after.push(entry);
            continue;
          }

          // Tomorrow has no attendance yet, and someone rostered for today may not have
          // scanned in when the manager is assigning at 05:30. The roster covers both.
          const planned = rosterByStaff.get(profile.id);
          if (planned && String(planned.day_status || "").toLowerCase() !== "leave") {
            entry.inAt = planned.in_time ? String(planned.in_time).slice(0, 5) : null;
            entry.planned = true;
            rostered.push(entry);
          }
        }

        return json(200, {
          ok: true,
          date: dateKey,
          cutoff: payload.dueTime || "06:00",
          before,
          after,
          rostered,
          hasAttendance: firstScan.size > 0
        });
      }

      default:
        return json(400, { ok: false, message: `Unknown action: ${payload.action}` });
    }
  } catch (error) {
    return json(500, { ok: false, message: error.message || "Task request failed." });
  }
};
