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
      // Start and Finish are two presses on purpose: the gap between them is the only
      // honest measure of how long the job actually took.
      if (!assignment.startedAt) {
        const startButton = text("button", "dt-tick dt-start", "Start");
        startButton.type = "button";
        startButton.addEventListener("click", () => startAssignment(assignment, startButton));
        side.appendChild(startButton);
      }
      const button = text("button", "dt-tick", assignment.startedAt ? "Finish" : "Mark done");
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
      libraryWrap.hidden = true;
      return;
    }

    // Show the manager tools on role alone. Tying them to a successful fetch meant one
    // failed request hid the only way to assign anything, with no hint it existed.
    if (isManager()) {
      assignWrap.hidden = false;
      libraryWrap.hidden = false;
      buildAssignForm();
      buildLibrary();
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
      libraryWrap.hidden = !payload.canAssign;
      assignButton.hidden = !payload.canAssign;
      if (payload.canAssign) buildAssignForm();
    } catch (error) {
      list.textContent = "";
      show("error", error.message || "Could not load today's tasks.");
    } finally {
      busy = false;
      list.removeAttribute("aria-busy");
    }
  }

  async function startAssignment(assignment, button) {
    button.disabled = true;
    button.textContent = "\u2026";
    try {
      await window.staffSyncTasks.startAssignment(assignment.id);
      await load();
    } catch (error) {
      button.disabled = false;
      button.textContent = "Start";
      flash("error", error.message || "Could not start that.");
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
  // Each status is its own collapsible group with its own colour. Someone handing out the
  // pool clean needs to see at a glance that three of the people they were about to pick
  // are on leave or already went home -- a flat alphabetical list hides exactly that.
  const PEOPLE_GROUPS = [
    { key: "onDutyBefore", tone: "duty",     label: (c) => `On duty \u00b7 in before ${c}`, open: true },
    { key: "onDutyAfter",  tone: "duty-late",label: (c) => `On duty \u00b7 reported after ${c}`, open: true },
    { key: "notArrived",   tone: "waiting",  label: () => "Rostered \u00b7 not scanned in yet", open: true },
    { key: "shortLeave",   tone: "short",    label: () => "Short leave", open: false },
    { key: "halfDay",      tone: "half",     label: () => "Half day", open: false },
    { key: "finished",     tone: "finished", label: () => "Shift finished", open: false },
    { key: "onLeave",      tone: "leave",    label: () => "On leave", open: false }
  ];

  async function refreshPeople() {
    const holder = el("#dt-assign-people");
    holder.textContent = "";
    holder.appendChild(text("p", "dt-empty", "Loading staff\u2026"));

    try {
      const payload = await window.staffSyncTasks.eligibleStaff(
        el("#dt-assign-date").value,
        el("#dt-assign-time").value || "09:00"
      );
      holder.textContent = "";

      let any = false;
      for (const group of PEOPLE_GROUPS) {
        const people = (payload.groups && payload.groups[group.key]) || [];
        if (!people.length) continue;
        any = true;

        const box = document.createElement("details");
        box.className = `dt-people-group tone-${group.tone}`;
        // Available people are open; leave and finished shifts are collapsed, because
        // they are there to inform the choice, not to be the choice.
        box.open = group.open;

        const summary = document.createElement("summary");
        summary.appendChild(text("span", "dt-group-dot"));
        summary.appendChild(text("span", "dt-group-name", group.label(payload.cutoff)));
        summary.appendChild(text("span", "dt-group-count", people.length));
        box.appendChild(summary);

        const grid = text("div", "dt-people-grid");
        for (const person of people) {
          const option = text("label", "dt-person");
          const check = document.createElement("input");
          check.type = "checkbox";
          check.value = person.id;
          option.appendChild(check);
          const info = text("span", "dt-person-info");
          info.appendChild(text("span", "dt-person-name", person.name));
          info.appendChild(text("span", "dt-person-meta",
            [person.department, person.detail].filter(Boolean).join(" \u00b7 ")));
          option.appendChild(info);
          grid.appendChild(option);
        }
        box.appendChild(grid);
        holder.appendChild(box);
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

  // ---- Task library (admin and manager) ----------------------------------------------
  //
  // Editing a library entry changes what is offered when assigning. It deliberately does
  // NOT rewrite tasks already handed out: those are the record of what someone was
  // actually told to do, and rewriting history is how a log stops being evidence.

  const libraryWrap = el("#dt-library");
  let libraryBuilt = false;
  let editingId = null;

  async function buildLibrary() {
    if (libraryBuilt) return;
    libraryBuilt = true;

    el("#dt-library-toggle").addEventListener("click", () => {
      const body = el("#dt-library-body");
      body.hidden = !body.hidden;
      el("#dt-library-toggle").textContent = body.hidden ? "Show" : "Hide";
      if (!body.hidden) renderLibrary();
    });

    el("#dt-lib-save").addEventListener("click", saveLibraryTask);
    el("#dt-lib-cancel").addEventListener("click", () => clearLibraryForm());

    // Departments come from the task list itself, so this works without depending on any
    // other part of the app being loaded first.
    const select = el("#dt-lib-department");
    select.textContent = "";
    const none = text("option", null, "Any department");
    none.value = "";
    select.appendChild(none);
    try {
      const payload = await window.staffSyncTasks.listDefinitions();
      const seen = new Map();
      for (const definition of payload.definitions) {
        if (definition.department_id && definition.departments) {
          seen.set(definition.department_id, definition.departments.name);
        }
      }
      for (const [id, name] of seen) {
        const option = text("option", null, name);
        option.value = id;
        select.appendChild(option);
      }
    } catch {
      // A task with no department still works, so this is not worth failing over.
    }
  }

  async function renderLibrary() {
    const holder = el("#dt-library-list");
    holder.textContent = "";
    holder.appendChild(text("p", "dt-empty", "Loading\u2026"));
    try {
      const payload = await window.staffSyncTasks.listDefinitions();
      libraryCache = payload.definitions;
      holder.textContent = "";

      const active = libraryCache.filter((d) => d.active);
      if (!active.length) {
        holder.appendChild(text("p", "dt-empty", "No tasks yet. Add one below."));
        return;
      }

      for (const definition of active) {
        const row = text("div", "dt-library-row");
        const info = text("div", "dt-library-info");
        info.appendChild(text("span", "dt-library-title", definition.title));
        info.appendChild(text("span", "dt-library-meta", [
          definition.area,
          definition.departments ? definition.departments.name : null,
          String(definition.window_start).slice(0, 5) + "\u2013" + String(definition.window_end).slice(0, 5),
          definition.expected_minutes ? "~" + definition.expected_minutes + " min" : null
        ].filter(Boolean).join(" \u00b7 ")));
        row.appendChild(info);

        const actions = text("div", "dt-library-row-actions");
        const edit = text("button", "small-button ghost", "Edit");
        edit.type = "button";
        edit.addEventListener("click", () => fillLibraryForm(definition));
        actions.appendChild(edit);

        const remove = text("button", "small-button ghost", "Remove");
        remove.type = "button";
        remove.addEventListener("click", async () => {
          try {
            await window.staffSyncTasks.deleteDefinition(definition.id);
            await renderLibrary();
            assignBuilt = false;
            await buildAssignForm();
            flash("ok", definition.title + " removed from the list.");
          } catch (error) { flash("error", error.message); }
        });
        actions.appendChild(remove);
        row.appendChild(actions);
        holder.appendChild(row);
      }
    } catch (error) {
      holder.textContent = "";
      holder.appendChild(text("p", "dt-empty", error.message || "Could not load the task list."));
    }
  }

  function fillLibraryForm(definition) {
    editingId = definition.id;
    el("#dt-library-form-title").textContent = "Edit task";
    el("#dt-lib-title").value = definition.title || "";
    el("#dt-lib-area").value = definition.area || "";
    el("#dt-lib-start").value = String(definition.window_start || "06:00").slice(0, 5);
    el("#dt-lib-end").value = String(definition.window_end || "09:00").slice(0, 5);
    el("#dt-lib-minutes").value = definition.expected_minutes || "";
    el("#dt-lib-department").value = definition.department_id || "";
    el("#dt-lib-cancel").hidden = false;
    el("#dt-lib-save").textContent = "Save changes";
    el("#dt-lib-title").focus();
  }

  function clearLibraryForm() {
    editingId = null;
    el("#dt-library-form-title").textContent = "Add a task";
    el("#dt-lib-title").value = "";
    el("#dt-lib-area").value = "";
    el("#dt-lib-start").value = "06:00";
    el("#dt-lib-end").value = "09:00";
    el("#dt-lib-minutes").value = "";
    el("#dt-lib-department").value = "";
    el("#dt-lib-cancel").hidden = true;
    el("#dt-lib-save").textContent = "Save task";
  }

  async function saveLibraryTask() {
    const button = el("#dt-lib-save");
    const title = el("#dt-lib-title").value.trim();
    if (!title) return flash("error", "Give the task a name.");

    button.disabled = true;
    try {
      await window.staffSyncTasks.saveDefinition({
        id: editingId || undefined,
        title,
        area: el("#dt-lib-area").value.trim(),
        departmentId: el("#dt-lib-department").value || null,
        windowStart: el("#dt-lib-start").value || "06:00",
        windowEnd: el("#dt-lib-end").value || "18:00",
        expectedMinutes: el("#dt-lib-minutes").value || null
      });
      clearLibraryForm();
      await renderLibrary();
      // The assign dropdown is built once, so rebuild it or a new task is not pickable.
      assignBuilt = false;
      await buildAssignForm();
      flash("ok", title + " saved.");
    } catch (error) {
      flash("error", error.message || "Could not save that.");
    } finally {
      button.disabled = false;
    }
  }

  // ---- Boot ---------------------------------------------------------------------------

  dateInput.value = colomboToday();
  dateInput.addEventListener("change", () => load(dateInput.value));
  el("#dt-refresh").addEventListener("click", () => load());

  // A visible entry point beats "scroll to the bottom of the page and hope".
  const assignButton = el("#dt-assign-open");
  assignButton.hidden = !isManager();
  assignButton.addEventListener("click", () => {
    assignWrap.hidden = false;
    buildAssignForm();
    assignWrap.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => el("#dt-assign-task").focus(), 300);
  });

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
