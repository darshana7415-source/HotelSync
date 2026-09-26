// Daily task assignments.
//
// A task is given to a named person for a specific day and stays PENDING until that person
// presses Complete. That is the whole design: a tick that anyone could have made proves
// nothing, so every row carries a name from the moment it is created.
//
// Managers additionally get an Assign panel. The people it offers are drawn from who
// actually reported for work that day -- assigning the pool to someone who was not at the
// hotel is how a checklist stops meaning anything.
//
// Kept out of app.js (~10,700 lines) so a change here cannot break anything else.

(function () {
  "use strict";

  const COLOMBO_OFFSET_MS = 5.5 * 60 * 60 * 1000;

  const panel = document.querySelector("#daily-tasks");
  if (!panel) return;

  const el = (selector) => panel.querySelector(selector);
  const dateInput = el("#dt-date");
  const list = el("#dt-list");
  const message = el("#dt-message");
  const heading = el("#dt-heading");
  const progress = el("#dt-progress");
  const progressFill = el("#dt-progress-fill");
  const progressText = el("#dt-progress-text");
  const assignWrap = el("#dt-assign");

  let busy = false;
  let libraryCache = null;

  function colomboToday() {
    return new Date(Date.now() + COLOMBO_OFFSET_MS).toISOString().slice(0, 10);
  }

  function colomboTomorrow() {
    const d = new Date(Date.now() + COLOMBO_OFFSET_MS);
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  function currentRole() {
    return String(sessionStorage.getItem("staffsync.role") || "staff").toLowerCase();
  }

  function isManager() {
    return ["admin", "manager"].includes(currentRole());
  }

  function signedIn() {
    return Boolean(
      sessionStorage.getItem("staffsync.sessionToken") ||
      document.querySelector("#login-screen")?.hidden
    );
  }

  // Never build HTML from database values -- a task named "Clean <img onerror=...>" would
  // otherwise run. Everything user-supplied goes through textContent.
  function text(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined && value !== null) node.textContent = value;
    return node;
  }

  function show(kind, value) {
    message.hidden = !value;
    message.textContent = value || "";
    message.className = "dt-message" + (kind ? ` is-${kind}` : "");
  }

  function flash(kind, value) {
    show(kind, value);
    if (kind === "ok") setTimeout(() => show("", ""), 4000);
  }

  function formatClock(iso) {
    if (!iso) return "";
    const local = new Date(new Date(iso).getTime() + COLOMBO_OFFSET_MS);
    return `${String(local.getUTCHours()).padStart(2, "0")}:${String(local.getUTCMinutes()).padStart(2, "0")}`;
  }

  function nowMinutes() {
    const now = new Date(Date.now() + COLOMBO_OFFSET_MS);
    return now.getUTCHours() * 60 + now.getUTCMinutes();
  }

  function timeToMinutes(value) {
    const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : null;
  }

  // Overdue is not a separate state from pending -- it is pending that has run out of time.
  // Keeping it visually distinct is what turns the list into something worth checking.
  function stateOf(assignment, dateKey, todayKey) {
    if (assignment.status === "done") return "done";
    if (dateKey < todayKey) return "overdue";
    if (dateKey > todayKey) return "pending";
    const due = timeToMinutes(assignment.dueTime);
    if (due !== null && nowMinutes() > due) return "overdue";
    return "pending";
  }

  const STATE_LABEL = { done: "Completed", pending: "Pending", overdue: "Overdue" };

  // ---- Task list ---------------------------------------------------------------------

  function renderAssignment(assignment, dateKey, todayKey) {
    const state = stateOf(assignment, dateKey, todayKey);
    const row = document.createElement("article");
    row.className = `dt-task is-${state}`;

    const main = text("div", "dt-task-main");
    main.appendChild(text("h4", "dt-task-title", assignment.title));

    const meta = text("p", "dt-task-meta");
    const bits = [];
    if (assignment.staffName) bits.push(assignment.staffName);
    if (assignment.area) bits.push(assignment.area);
    if (assignment.dueTime) bits.push(`by ${assignment.dueTime}`);
    meta.textContent = bits.join(" · ");
    main.appendChild(meta);

    if (assignment.status === "done") {
      const by = text("p", "dt-task-by");
      by.textContent = assignment.completedByManager
        ? `Completed ${formatClock(assignment.completedAt)} · recorded by a manager`
        : `Completed ${formatClock(assignment.completedAt)}`;
      main.appendChild(by);
    }

    row.appendChild(main);

    const side = text("div", "dt-task-side");
    side.appendChild(text("span", `dt-chip dt-${state}`, STATE_LABEL[state]));

    if (assignment.status !== "done" && (assignment.mine || isManager())) {
      const button = text("button", "dt-tick", assignment.mine ? "Complete" : "Mark complete");
      button.type = "button";
      button.addEventListener("click", () => completeAssignment(assignment, button));
      side.appendChild(button);
    }

    if (isManager()) {
      const menu = text("div", "dt-row-admin");
      if (assignment.status === "done") {
        const reopen = text("button", "small-button ghost", "Reopen");
        reopen.type = "button";
        reopen.addEventListener("click", async () => {
          try {
            await window.staffSyncTasks.reopenAssignment(assignment.id);
            load();
          } catch (error) { flash("error", error.message); }
        });
        menu.appendChild(reopen);
      } else {
        const remove = text("button", "small-button ghost", "Remove");
        remove.type = "button";
        remove.addEventListener("click", async () => {
          try {
            await window.staffSyncTasks.deleteAssignment(assignment.id);
            load();
          } catch (error) { flash("error", error.message); }
        });
        menu.appendChild(remove);
      }
      side.appendChild(menu);
    }

    row.appendChild(side);
    return row;
  }

  function render(payload) {
    list.textContent = "";
    const { assignments, date, today } = payload;

    heading.textContent = date === today
      ? "Today's tasks"
      : (date === colomboTomorrow() ? "Tomorrow's tasks" : "Tasks");

    if (!assignments.length) {
      progress.hidden = true;
      list.appendChild(text(
        "p",
        "dt-empty",
        isManager()
          ? "No tasks assigned for this day yet. Use Assign a task below."
          : "No tasks have been assigned to you for this day."
      ));
      return;
    }

    const done = assignments.filter((a) => a.status === "done").length;
    const overdue = assignments.filter((a) => stateOf(a, date, today) === "overdue").length;
    const pct = Math.round((done / assignments.length) * 100);

    progress.hidden = false;
    progressFill.style.width = `${pct}%`;
    progressFill.className = overdue ? "has-misses" : "";
    const parts = [`${done} of ${assignments.length} completed`];
    if (overdue) parts.push(`${overdue} overdue`);
    progressText.textContent = parts.join(" · ");

    // Pending first: the list exists to show what still has to happen.
    const order = { overdue: 0, pending: 1, done: 2 };
    const sorted = assignments.slice().sort((a, b) => {
      const diff = order[stateOf(a, date, today)] - order[stateOf(b, date, today)];
      if (diff) return diff;
      return String(a.dueTime || "").localeCompare(String(b.dueTime || ""));
    });

    for (const assignment of sorted) list.appendChild(renderAssignment(assignment, date, today));
  }

  async function load(dateKey) {
    if (busy) return;

    if (!signedIn()) {
      list.textContent = "";
      list.appendChild(text("p", "dt-empty", "Sign in to see today's tasks."));
      progress.hidden = true;
      assignWrap.hidden = true;
      return;
    }

    busy = true;
    show("", "");
    if (!list.childElementCount) list.appendChild(text("p", "dt-empty", "Loading…"));
    list.setAttribute("aria-busy", "true");

    try {
      const payload = await window.staffSyncTasks.listAssignments(dateKey || dateInput.value || colomboToday());
      dateInput.value = payload.date;
      render(payload);
      assignWrap.hidden = !payload.canAssign;
      if (payload.canAssign) buildAssignForm();
    } catch (error) {
      list.textContent = "";
      show("error", error.message || "Could not load today's tasks.");
    } finally {
      busy = false;
      list.removeAttribute("aria-busy");
    }
  }

  async function completeAssignment(assignment, button) {
    button.disabled = true;
    button.textContent = "Saving…";
    try {
      await window.staffSyncTasks.completeAssignment(assignment.id);
      await load();
      flash("ok", `"${assignment.title}" completed.`);
    } catch (error) {
      button.disabled = false;
      button.textContent = "Complete";
      flash("error", error.message || "Could not save that.");
    }
  }

  // ---- Assign panel (managers) -------------------------------------------------------

  let assignBuilt = false;

  async function buildAssignForm() {
    if (assignBuilt) return;
    assignBuilt = true;

    const taskSelect = el("#dt-assign-task");
    const dateSelect = el("#dt-assign-date");
    const timeInput = el("#dt-assign-time");

    dateSelect.textContent = "";
    const todayOption = text("option", null, "Today");
    todayOption.value = colomboToday();
    const tomorrowOption = text("option", null, "Tomorrow");
    tomorrowOption.value = colomboTomorrow();
    dateSelect.appendChild(todayOption);
    dateSelect.appendChild(tomorrowOption);

    try {
      const payload = await window.staffSyncTasks.listDefinitions();
      libraryCache = payload.definitions.filter((d) => d.active);
      taskSelect.textContent = "";
      const custom = text("option", null, "— Other (type a name) —");
      custom.value = "";
      taskSelect.appendChild(custom);
      for (const definition of libraryCache) {
        const option = text("option", null, definition.title + (definition.area ? ` (${definition.area})` : ""));
        option.value = definition.id;
        taskSelect.appendChild(option);
      }
    } catch (error) {
      flash("error", error.message || "Could not load the task list.");
    }

    // The free-text name only applies when "Other" is chosen; the whole label hides with
    // it so there is no stray empty row in the form.
    function syncTitleField() {
      const definition = (libraryCache || []).find((d) => d.id === taskSelect.value);
      el("#dt-assign-title-wrap").hidden = Boolean(definition);
      el("#dt-assign-title").hidden = Boolean(definition);
      return definition;
    }

    taskSelect.addEventListener("change", () => {
      const definition = syncTitleField();
      if (definition && definition.window_end) {
        timeInput.value = String(definition.window_end).slice(0, 5);
        refreshPeople();
      }
    });

    syncTitleField();

    dateSelect.addEventListener("change", refreshPeople);
    timeInput.addEventListener("change", refreshPeople);
    el("#dt-assign-submit").addEventListener("click", submitAssignment);

    refreshPeople();
  }

  // The staff list is the heart of this: only people who were actually at the hotel that
  // day, split at the task's time so it is obvious who was already on duty and who arrived
  // later. For tomorrow (and for early-morning assigning before anyone has scanned in)
  // there is no attendance yet, so the roster stands in.
  async function refreshPeople() {
    const holder = el("#dt-assign-people");
    holder.textContent = "";
    holder.appendChild(text("p", "dt-empty", "Loading staff…"));

    try {
      const payload = await window.staffSyncTasks.eligibleStaff(
        el("#dt-assign-date").value,
        el("#dt-assign-time").value || "06:00"
      );
      holder.textContent = "";

      const groups = [
        [`On duty before ${payload.cutoff}`, payload.before],
        [`Reported after ${payload.cutoff}`, payload.after],
        ["Rostered, not scanned in yet", payload.rostered]
      ];

      let any = false;
      for (const [label, people] of groups) {
        if (!people.length) continue;
        any = true;
        const group = text("div", "dt-people-group");
        group.appendChild(text("p", "dt-group-title", `${label} (${people.length})`));
        const grid = text("div", "dt-people-grid");
        for (const person of people) {
          const option = text("label", "dt-person");
          const box = document.createElement("input");
          box.type = "checkbox";
          box.value = person.id;
          option.appendChild(box);
          const info = text("span", "dt-person-info");
          info.appendChild(text("span", "dt-person-name", person.name));
          info.appendChild(text("span", "dt-person-meta",
            [person.department, person.inAt ? (person.planned ? `rostered ${person.inAt}` : `in ${person.inAt}`) : null]
              .filter(Boolean).join(" · ")));
          option.appendChild(info);
          grid.appendChild(option);
        }
        group.appendChild(grid);
        holder.appendChild(group);
      }

      if (!any) {
        holder.appendChild(text("p", "dt-empty",
          "Nobody has scanned in for this day yet, and no roster is saved for it. Save the roster first, or assign once people start arriving."));
      }
    } catch (error) {
      holder.textContent = "";
      holder.appendChild(text("p", "dt-empty", error.message || "Could not load staff."));
    }
  }

  async function submitAssignment() {
    const button = el("#dt-assign-submit");
    const taskId = el("#dt-assign-task").value;
    const title = el("#dt-assign-title").value.trim();
    const date = el("#dt-assign-date").value;
    const dueTime = el("#dt-assign-time").value || null;
    const staffProfileIds = Array.from(el("#dt-assign-people").querySelectorAll("input:checked")).map((b) => b.value);

    if (!taskId && !title) return flash("error", "Choose a task or type a name for it.");
    if (!staffProfileIds.length) return flash("error", "Choose at least one person.");

    button.disabled = true;
    button.textContent = "Assigning…";
    try {
      const result = await window.staffSyncTasks.assign({ taskId: taskId || null, title, date, dueTime, staffProfileIds });
      el("#dt-assign-people").querySelectorAll("input:checked").forEach((b) => { b.checked = false; });
      el("#dt-assign-title").value = "";
      dateInput.value = date;
      await load(date);
      const skipped = result.requested - result.created;
      flash("ok", skipped
        ? `Assigned to ${result.created}. ${skipped} already had this task.`
        : `Assigned to ${result.created}.`);
    } catch (error) {
      flash("error", error.message || "Could not assign that.");
    } finally {
      button.disabled = false;
      button.textContent = "Assign task";
    }
  }

  // ---- Boot ---------------------------------------------------------------------------

  dateInput.value = colomboToday();
  dateInput.addEventListener("change", () => load(dateInput.value));
  el("#dt-refresh").addEventListener("click", () => load());

  let loadedForSession = false;

  function onDailyTasksPage() {
    return (window.location.hash || "").replace("#", "") === "daily-tasks";
  }

  function maybeLoad(force) {
    if (!signedIn()) { loadedForSession = false; return; }
    if (force || !loadedForSession) {
      loadedForSession = true;
      load();
    }
  }

  window.addEventListener("hashchange", () => {
    if (onDailyTasksPage()) setTimeout(() => maybeLoad(true), 60);
  });

  document.addEventListener("click", (event) => {
    if (event.target && event.target.closest && event.target.closest('a[href="#daily-tasks"]')) {
      setTimeout(() => maybeLoad(true), 120);
    }
  });

  // Runs for the life of the page: sign-in can happen at any moment and the panel has to
  // fill in when it does. An earlier version gave up after two minutes and left the panel
  // permanently blank for anyone who took their time logging in.
  setInterval(() => maybeLoad(false), 2000);

  setInterval(() => {
    if (signedIn() && dateInput.value === colomboToday() && !busy) load();
  }, 120000);

  maybeLoad(false);

  window.staffSyncDailyTasks = { reload: load };
})();
