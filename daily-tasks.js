// Daily task checklist UI (staff view + manager review).
//
// Kept in its own file rather than folded into app.js: app.js is ~10,700 lines and every
// change in there risks something unrelated. This module only touches #daily-tasks and only
// talks to window.staffSyncTasks, so the blast radius is the panel itself.

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
  const review = el("#dt-review");
  const reviewBody = el("#dt-review-body");

  let busy = false;
  let lastPayload = null;

  function colomboToday() {
    return new Date(Date.now() + COLOMBO_OFFSET_MS).toISOString().slice(0, 10);
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

  // Never build HTML by concatenating values that came from the database -- a task called
  // "Clean <img onerror=...>" would otherwise execute. Everything user-supplied goes through
  // textContent instead.
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

  function formatClock(iso) {
    if (!iso) return "";
    const local = new Date(new Date(iso).getTime() + COLOMBO_OFFSET_MS);
    return `${String(local.getUTCHours()).padStart(2, "0")}:${String(local.getUTCMinutes()).padStart(2, "0")}`;
  }

  const STATUS_LABEL = {
    done: "Done",
    late: "Done late",
    missed: "Not done",
    open: "To do"
  };

  function renderTask(task, dateKey, todayKey) {
    const row = document.createElement("article");
    row.className = `dt-task is-${task.status}`;

    const main = text("div", "dt-task-main");
    main.appendChild(text("h4", "dt-task-title", task.title));

    const meta = text("p", "dt-task-meta");
    const bits = [];
    if (task.area) bits.push(task.area);
    if (task.department) bits.push(task.department);
    bits.push(`${task.windowStart}–${task.windowEnd}`);
    if (task.expectedMinutes) bits.push(`~${task.expectedMinutes} min`);
    meta.textContent = bits.join(" · ");
    main.appendChild(meta);

    if (task.completedBy || task.completedAt) {
      const by = text("p", "dt-task-by");
      const who = task.completedBy || "Someone";
      const at = formatClock(task.completedAt);
      by.textContent = task.recordedBy === "manager"
        ? `${who} · ${at} · recorded by a manager`
        : `${who} · ${at}`;
      main.appendChild(by);
    }

    row.appendChild(main);

    const side = text("div", "dt-task-side");
    side.appendChild(text("span", `dt-chip dt-${task.status}`, STATUS_LABEL[task.status]));

    const isDone = task.status === "done" || task.status === "late";
    const canTick = !isDone && (dateKey === todayKey || isManager());
    const canUndo = isDone && isManager();

    if (canTick) {
      const button = text("button", "dt-tick", "Mark done");
      button.type = "button";
      button.addEventListener("click", () => completeTask(task, dateKey, button));
      side.appendChild(button);
    } else if (canUndo) {
      const button = text("button", "dt-undo small-button ghost", "Undo");
      button.type = "button";
      button.addEventListener("click", () => undoTask(task, dateKey, button));
      side.appendChild(button);
    }

    row.appendChild(side);
    return row;
  }

  function render(payload) {
    lastPayload = payload;
    list.textContent = "";

    const { tasks, date, today } = payload;
    heading.textContent = date === today ? "Today's tasks" : "Tasks";

    if (!tasks.length) {
      list.appendChild(text("p", "dt-empty", "No tasks are scheduled for this day."));
      progress.hidden = true;
      return;
    }

    const done = tasks.filter((t) => t.status === "done").length;
    const late = tasks.filter((t) => t.status === "late").length;
    const missed = tasks.filter((t) => t.status === "missed").length;
    const pct = Math.round(((done + late) / tasks.length) * 100);

    progress.hidden = false;
    progressFill.style.width = `${pct}%`;
    progressFill.className = missed ? "has-misses" : "";
    const parts = [`${done + late} of ${tasks.length} done`];
    if (late) parts.push(`${late} late`);
    if (missed) parts.push(`${missed} not done`);
    progressText.textContent = parts.join(" · ");

    // Grouped by area so a person cleaning the pool sees their two pool tasks together
    // rather than hunting through a flat list of thirteen.
    const groups = new Map();
    for (const task of tasks) {
      const key = task.area || "Other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(task);
    }

    for (const [area, items] of groups) {
      const group = text("div", "dt-group");
      group.appendChild(text("p", "dt-group-title", area));
      for (const task of items) group.appendChild(renderTask(task, date, today));
      list.appendChild(group);
    }
  }

  async function load(dateKey) {
    if (busy) return;

    // A blank panel is indistinguishable from a broken one. Always say something.
    if (!signedIn()) {
      list.textContent = "";
      list.appendChild(text("p", "dt-empty", "Sign in to see today's tasks."));
      progress.hidden = true;
      return;
    }

    busy = true;
    show("", "");
    if (!list.childElementCount) {
      list.appendChild(text("p", "dt-empty", "Loading today's tasks\u2026"));
    }
    list.setAttribute("aria-busy", "true");
    try {
      const payload = await window.staffSyncTasks.listDay(dateKey || dateInput.value || colomboToday());
      dateInput.value = payload.date;
      render(payload);
      review.hidden = !isManager();
    } catch (error) {
      list.textContent = "";
      show("error", error.message || "Could not load today's tasks.");
    } finally {
      busy = false;
      list.removeAttribute("aria-busy");
    }
  }

  async function completeTask(task, dateKey, button) {
    button.disabled = true;
    button.textContent = "Saving…";
    try {
      await window.staffSyncTasks.complete(task.taskId, { date: dateKey });
      await load(dateKey);
      show("ok", `"${task.title}" marked done.`);
      setTimeout(() => show("", ""), 4000);
    } catch (error) {
      button.disabled = false;
      button.textContent = "Mark done";
      show("error", error.message || "Could not save that.");
    }
  }

  async function undoTask(task, dateKey, button) {
    button.disabled = true;
    try {
      await window.staffSyncTasks.undo(task.taskId, dateKey);
      await load(dateKey);
    } catch (error) {
      button.disabled = false;
      show("error", error.message || "Could not undo that.");
    }
  }

  async function loadReview() {
    reviewBody.textContent = "";
    reviewBody.appendChild(text("p", "dt-empty", "Loading…"));
    try {
      const payload = await window.staffSyncTasks.board({ days: 14 });
      reviewBody.textContent = "";

      const worst = payload.tasks.filter((t) => t.missed > 0).slice(0, 8);
      if (!worst.length) {
        reviewBody.appendChild(text("p", "dt-empty", "Nothing was missed in the last 14 days."));
      } else {
        reviewBody.appendChild(text("p", "dt-review-lead", "Most often not done:"));
        const table = document.createElement("table");
        table.className = "dt-review-table";
        const head = document.createElement("tr");
        ["Task", "Area", "Not done", "Late", "Done"].forEach((label) => {
          head.appendChild(text("th", null, label));
        });
        table.appendChild(head);
        for (const row of worst) {
          const tr = document.createElement("tr");
          tr.appendChild(text("td", null, row.title));
          tr.appendChild(text("td", null, row.area || "—"));
          tr.appendChild(text("td", "dt-num dt-bad", row.missed));
          tr.appendChild(text("td", "dt-num", row.late));
          tr.appendChild(text("td", "dt-num", row.done));
          table.appendChild(tr);
        }
        reviewBody.appendChild(table);
      }

      const people = payload.people.filter((p) => p.staffProfileId).slice(0, 8);
      if (people.length) {
        reviewBody.appendChild(text("p", "dt-review-lead", "Tasks completed by person:"));
        const table = document.createElement("table");
        table.className = "dt-review-table";
        const head = document.createElement("tr");
        ["Staff", "Done", "Late"].forEach((label) => head.appendChild(text("th", null, label)));
        table.appendChild(head);
        for (const person of people) {
          const tr = document.createElement("tr");
          tr.appendChild(text("td", null, person.name));
          tr.appendChild(text("td", "dt-num", person.done));
          tr.appendChild(text("td", "dt-num", person.late));
          table.appendChild(tr);
        }
        reviewBody.appendChild(table);
      }
    } catch (error) {
      reviewBody.textContent = "";
      reviewBody.appendChild(text("p", "dt-empty", error.message || "Could not load the review."));
    }
  }

  dateInput.value = colomboToday();
  dateInput.addEventListener("change", () => load(dateInput.value));
  el("#dt-refresh").addEventListener("click", () => load());
  el("#dt-review-load").addEventListener("click", loadReview);

  // Loading on a first-run timer was wrong: it gave up after two minutes, so anyone who
  // took their time signing in landed on an empty panel. Load whenever the panel is
  // actually being looked at instead, and once more the moment a session appears.
  let loadedForSession = false;

  function onDailyTasksPage() {
    return (window.location.hash || "").replace("#", "") === "daily-tasks";
  }

  function maybeLoad(force) {
    if (!signedIn()) {
      loadedForSession = false;
      return;
    }
    if (force || !loadedForSession) {
      loadedForSession = true;
      load();
    }
  }

  window.addEventListener("hashchange", () => {
    if (onDailyTasksPage()) setTimeout(() => maybeLoad(true), 60);
  });

  // The nav link does not always change the hash (clicking the page you are already on),
  // so listen for the click as well.
  document.addEventListener("click", (event) => {
    if (event.target && event.target.closest && event.target.closest('a[href="#daily-tasks"]')) {
      setTimeout(() => maybeLoad(true), 120);
    }
  });

  // Keeps running for the life of the page rather than expiring: sign-in can happen at any
  // point, and the panel must fill in when it does.
  setInterval(() => maybeLoad(false), 2000);

  // A phone left open on the dashboard all morning should not show a stale list.
  setInterval(() => {
    if (signedIn() && dateInput.value === colomboToday() && !busy) load();
  }, 120000);

  maybeLoad(false);

  window.staffSyncDailyTasks = { reload: load };
})();
