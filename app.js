const realDataResetVersion = "real-data-v84";
resetLocalDataForRealTesting(realDataResetVersion);

const defaultStaff = [];

const defaultLeaveRequests = [];

let staff = loadData("staffsync.staff", defaultStaff);
let leaveRequests = loadData("staffsync.leaveRequests", defaultLeaveRequests);
let policy = loadData("staffsync.policy", {
  radius: "250",
  interval: "5",
  consentNotice: true
});
let activityLog = loadData("staffsync.activityLog", []);
let staffMessages = loadData("staffsync.staffMessages", []);
let deletedStaffMessageIds = loadData("staffsync.deletedStaffMessageIds", []);
let shiftPlans = loadData("staffsync.shiftPlans", []);
let dailyRosters = loadData("staffsync.dailyRosters", {});
let staffDevices = loadData("staffsync.staffDevices", []);
let staffPasswords = loadData("staffsync.staffPasswords", {});
resetStaffPasswordsForFirstLogin("staff-password-reset-v122");
let apLocationMap = loadData("staffsync.apLocationMap", [
  { id: "ap-1st-lobby", apName: "1_St-Floor_Loby", floor: "1F", zone: "New Wing" }
]);
let hiddenLocationPingIds = loadData("staffsync.hiddenLocationPingIds", []);
const monthlyLeaveQuota = 6;
const firstStaffPassword = "12345";
const staffPasswordHashVersion = "v124";
const staffPasswordResetEpoch = "force-reset-v124";
const defaultShiftName = "10 hours";
const defaultShiftStart = "07:00";
const defaultShiftEnd = "17:00";
const demoRolePasswords = {
  admin: "House6684$RDAA",
  manager: "House6684$$$"
};
let adminLeaveDrafts = {};
let installPromptEvent = null;
removeDemoRecordsFromLocalState();
staff = sortStaffByEmployeeCode(staff);
staffMessages = staffMessages.filter((message) => !isSilentShiftUpdate(message));

const tableBody = document.querySelector("#staff-table");
const departmentFilter = document.querySelector("#department-filter");
const map = document.querySelector("#map");
const leaveStaff = document.querySelector("#leave-staff");
const leaveForm = document.querySelector("#leave-form");
const leaveList = document.querySelector("#leave-list");
const coverageDate = document.querySelector("#coverage-date");
const coverageGrid = document.querySelector("#coverage-grid");
const leavePolicyNote = document.querySelector("#leave-policy-note");
const leavePressureDate = document.querySelector("#leave-pressure-date");
const leavePressureThreshold = document.querySelector("#leave-pressure-threshold");
const leavePressureList = document.querySelector("#leave-pressure-list");
const managerBoardDate = document.querySelector("#manager-board-date");
const managerBoard = document.querySelector("#manager-board");
const attendanceReportDate = document.querySelector("#attendance-report-date");
const attendanceReportPeriod = document.querySelector("#attendance-report-period");
const attendanceSummaryGrid = document.querySelector("#attendance-summary-grid");
const attendanceReportList = document.querySelector("#attendance-report-list");
const exportAttendanceReport = document.querySelector("#export-attendance-report");
const exportLeaveReport = document.querySelector("#export-leave-report");
const exportShiftReport = document.querySelector("#export-shift-report");
const hotelMapUpload = document.querySelector("#hotel-map-upload");
const clearHotelMap = document.querySelector("#clear-hotel-map");
const mapFloorSelect = document.querySelector("#map-floor-select");
const liveCheckStaff = document.querySelector("#live-check-staff");
const liveCheckButton = document.querySelector("#live-check-button");
const liveCheckResult = document.querySelector("#live-check-result");
const movementList = document.querySelector("#movement-list");
const locationHistoryDate = document.querySelector("#location-history-date");
const clearLocationHistory = document.querySelector("#clear-location-history");
const wifiLocationForm = document.querySelector("#wifi-location-form");
const wifiStaff = document.querySelector("#wifi-staff");
const wifiMac = document.querySelector("#wifi-mac");
const wifiAp = document.querySelector("#wifi-ap");
const wifiRssi = document.querySelector("#wifi-rssi");
const wifiLastSeen = document.querySelector("#wifi-last-seen");
const engeniusSync = document.querySelector("#engenius-sync");
const engeniusSyncStatus = document.querySelector("#engenius-sync-status");
const staffDeviceForm = document.querySelector("#staff-device-form");
const deviceStaff = document.querySelector("#device-staff");
const deviceName = document.querySelector("#device-name");
const deviceMac = document.querySelector("#device-mac");
const staffDeviceList = document.querySelector("#staff-device-list");
const apMapForm = document.querySelector("#ap-map-form");
const apMapName = document.querySelector("#ap-map-name");
const apMapFloor = document.querySelector("#ap-map-floor");
const apMapZone = document.querySelector("#ap-map-zone");
const apMapList = document.querySelector("#ap-map-list");
const shiftList = document.querySelector("#shift-list");
const leaveCalendar = document.querySelector("#leave-calendar");
const leaveDepartmentChart = document.querySelector("#leave-department-chart");
const shiftDepartmentChart = document.querySelector("#shift-department-chart");
const shiftCalendarStart = document.querySelector("#shift-calendar-start");
const shiftCalendarToday = document.querySelector("#shift-calendar-today");
const shiftCalendar = document.querySelector("#shift-calendar");
const toast = document.querySelector("#toast");
const roleSelect = document.querySelector("#role-select");
const staffSwitcher = document.querySelector("#staff-switcher");
const staffCard = document.querySelector("#staff-card");
const managerAlerts = document.querySelector("#manager-alerts");
const managerApprovals = document.querySelector("#manager-approvals");
const managerShiftChanges = document.querySelector("#manager-shift-changes");
const managerAlertCount = document.querySelector("#manager-alert-count");
const staffForm = document.querySelector("#staff-form");
const policyForm = document.querySelector("#policy-form");
const policySummary = document.querySelector("#policy-summary");
const staffDirectory = document.querySelector("#staff-directory");
const editStaffForm = document.querySelector("#edit-staff-form");
const editStaffSelect = document.querySelector("#edit-staff-select");
const editStaffNote = document.querySelector("#edit-staff-note");
const shiftForm = document.querySelector("#shift-form");
const shiftStaff = document.querySelector("#shift-staff");
const shiftPlanId = document.querySelector("#shift-plan-id");
const shiftValue = document.querySelector("#shift-value");
const shiftEffectiveDate = document.querySelector("#shift-effective-date");
const shiftInTime = document.querySelector("#shift-in-time");
const shiftOutTime = document.querySelector("#shift-out-time");
const shiftClearForm = document.querySelector("#shift-clear-form");
const shiftImportFile = document.querySelector("#shift-import-file");
const shiftImportText = document.querySelector("#shift-import-text");
const importShiftRowsButton = document.querySelector("#import-shift-rows");
const shiftImportResult = document.querySelector("#shift-import-result");
const dailyRosterDate = document.querySelector("#daily-roster-date");
const rosterCopyDays = document.querySelector("#roster-copy-days");
const dailyRosterBody = document.querySelector("#daily-roster-body");
const saveDailyRoster = document.querySelector("#save-daily-roster");
const copyTodayRoster = document.querySelector("#copy-today-roster");
const clearDailyRoster = document.querySelector("#clear-daily-roster");
const loginScreen = document.querySelector("#login-screen");
const loginRoleSelect = document.querySelector("#login-role");
const loginSubmit = document.querySelector("#login-submit");
const staffCredentials = document.querySelector("#staff-credentials");
const adminCredentials = document.querySelector("#admin-credentials");
const staffLoginCode = document.querySelector("#staff-login-code");
const staffLoginPassword = document.querySelector("#staff-login-password");
const staffNewPassword = document.querySelector("#staff-new-password");
const staffLoginStatus = document.querySelector("#staff-login-status");
const cloudEmail = document.querySelector("#cloud-email");
const cloudPassword = document.querySelector("#cloud-password");
const cloudStatus = document.querySelector("#cloud-status");
const sessionLabel = document.querySelector("#session-label");
const activityList = document.querySelector("#activity-list");
const notificationList = document.querySelector("#notification-list");
const pageLinks = Array.from(document.querySelectorAll("[data-page-link]"));

let activeStaffId = sessionStorage.getItem("staffsync.activeStaffId") || localStorage.getItem("staffsync.activeStaffId") || staff[0]?.id || "";
let currentRole = sessionStorage.getItem("staffsync.role") || "";
let currentCloudEmail = sessionStorage.getItem("staffsync.cloudEmail") || "";
let currentAppUserId = sessionStorage.getItem("staffsync.appUserId") || "";
let staffActionNotice = sessionStorage.getItem("staffsync.staffActionNotice") || "";
let adminDashboardDate = localStorage.getItem("staffsync.adminDashboardDate") || new Date().toISOString().slice(0, 10);
let leaveTypes = [];
let locationPingTimer = null;
let locationWatchId = null;
let lastMovementPingAt = 0;
let staffLocationPermissionPrimed = false;
let cloudSyncTimer = null;
let cloudSyncBusy = false;
let leaveLiveTimer = null;
let leaveLiveForceTimer = null;
let leaveLiveBusy = false;
let leaveLiveBusySince = 0;
let leaveLiveStarted = false;
let leaveRealtimeChannel = null;
let attendanceReportRecords = [];
let typingAutoRenderPauseUntil = 0;
let recentClockStates = {};
let latestAttendanceEventLogs = [];
let openShiftChatThreadId = "";
const leaveDepartments = ["Kitchen", "Restaurant", "Front Office", "Housekeeping", "Maintenance", "General"];
const hotelMapStorageKey = "staffsync.hotelMapImage.v2";
const mapFloorStorageKey = "staffsync.mapFloor";
const defaultHotelMapImage = "hotel-property-map-v2.svg";
const targetGpsAccuracyMeters = 5;
const hotelZones = ["New Wing", "Old Wing"];
const pageSections = {
  dashboard: ["role-demo", "dashboard", "attendance"],
  staff: ["admin"],
  shifts: ["schedule", "shift-dashboard"],
  leave: ["leave", "leave-organizer"],
  location: ["location"],
  reports: ["reports"]
};
const pageAliases = {
  "role-demo": "dashboard",
  attendance: "dashboard",
  admin: "staff",
  "edit-staff": "staff",
  schedule: "shifts",
  "shift-dashboard": "shifts",
  "leave-organizer": "leave",
  "leave-pressure": "reports"
};

function init() {
  registerInstallSupport();
  document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric"
  }).format(new Date());

  normalizeWingFloorLocations();
  applyMonthEndLeaveDashboardCleanup();
  populateFilters();
  if (locationHistoryDate && !locationHistoryDate.value) {
    locationHistoryDate.value = new Date().toISOString().slice(0, 10);
  }
  applyHotelMapImage();
  setDefaultShiftPlannerValues();
  renderAll();
  bindEvents();
  const newStaffCode = document.querySelector("#new-staff-code");
  if (newStaffCode && !newStaffCode.value) newStaffCode.value = nextEmployeeCode();
  updateLoginMode();
  syncLeaveDateFields();
  applyPageFromHash();
  updateCloudStatus();
  restoreCloudSession();
  startLeaveLiveRefresh();
  if (currentRole) {
    startCloudAutoRefresh();
    syncCloudDashboard();
  }
}

function registerInstallSupport() {
  const installButton = document.querySelector("#install-app");
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPromptEvent = event;
    if (installButton) installButton.hidden = false;
  });

  installButton?.addEventListener("click", async () => {
    if (!installPromptEvent) {
      showToast("On iPhone use Share, then Add to Home Screen. On Android use browser menu, then Install app.");
      return;
    }

    installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    installPromptEvent = null;
    installButton.hidden = true;
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      // The app still works online if the browser blocks service workers.
    });
  }
}

function normalizeWingFloorLocations() {
  staff.forEach((person) => {
    person.zone = normalizeWing(person.zone || person.wifiZone || "New Wing");
    person.wifiZone = person.wifiZone ? normalizeWing(person.wifiZone) : person.wifiZone;
    person.floor = person.floor || person.wifiFloor || "GF";
    Object.assign(person, wingFloorPinPosition(person.zone, person.floor));
    if (person.location && !["Not active", "Shift ended"].includes(person.location)) {
      person.location = staffLocationLabel(person);
    }
  });
  apLocationMap = apLocationMap.map((record) => ({
    ...record,
    zone: normalizeWing(record.zone),
    floor: record.floor || "GF"
  }));
}

function populateFilters() {
  const departments = ["All", ...new Set(staff.map((person) => person.department))];
  const sortedStaff = sortStaffByEmployeeCode(staff);
  departmentFilter.innerHTML = departments
    .map((department) => `<option value="${department}">${department === "All" ? "All departments" : department}</option>`)
    .join("");

  leaveStaff.innerHTML = sortedStaff
    .map((person) => `<option value="${person.id}">${person.name} - ${person.department}</option>`)
    .join("");

  staffSwitcher.innerHTML = sortedStaff
    .map((person) => `<option value="${person.id}">${person.name} - ${person.department}</option>`)
    .join("");

  shiftStaff.innerHTML = sortedStaff
    .map((person) => `<option value="${person.id}">${person.name} - ${person.department}</option>`)
    .join("");

  editStaffSelect.innerHTML = sortedStaff
    .map((person) => `<option value="${person.id}">${person.employeeCode ? `${person.employeeCode} - ` : ""}${person.name}</option>`)
    .join("");
  editStaffSelect.insertAdjacentHTML("afterbegin", `<option value="">Choose staff member</option>`);

  if (wifiStaff) {
    wifiStaff.innerHTML = sortedStaff
      .map((person) => `<option value="${person.id}">${person.employeeCode ? `${person.employeeCode} - ` : ""}${person.name} - ${person.department}</option>`)
      .join("");
  }

  if (deviceStaff) {
    deviceStaff.innerHTML = sortedStaff
      .map((person) => `<option value="${person.id}">${person.employeeCode ? `${person.employeeCode} - ` : ""}${person.name} - ${person.department}</option>`)
      .join("");
  }

  if (liveCheckStaff) {
    liveCheckStaff.innerHTML = sortedStaff
      .map((person) => `<option value="${person.id}">${person.employeeCode ? `${person.employeeCode} - ` : ""}${person.name} - ${person.department}</option>`)
      .join("");
  }

  const rememberedStaffId = sessionStorage.getItem("staffsync.activeStaffId") || localStorage.getItem("staffsync.activeStaffId") || activeStaffId;
  if (rememberedStaffId && staff.some((person) => sameId(person.id, rememberedStaffId))) {
    activeStaffId = rememberedStaffId;
  }
  if (!staff.some((person) => sameId(person.id, activeStaffId))) {
    activeStaffId = staff[0]?.id || 0;
  }
  rememberActiveStaff();
  staffSwitcher.value = String(activeStaffId);
  editStaffSelect.value = "";
  if (liveCheckStaff) liveCheckStaff.value = String(activeStaffId);
  if (wifiStaff) wifiStaff.value = String(activeStaffId);
  if (deviceStaff) deviceStaff.value = String(activeStaffId);
  clearEditStaffForm();
  updateStaffLoginPasswordHint();
}

function renderAll() {
  renderMetrics();
  renderStaffTable();
  renderMapPins();
  renderLeaveRequests();
  renderShifts();
  renderDailyRoster();
  renderLeaveCalendar();
  renderShiftCalendar();
  renderDepartmentCharts();
  renderRoleDemo();
  renderPolicy();
  renderStaffDirectory();
  renderLeaveCoverage();
  renderLeavePressure();
  renderManagerBoard();
  renderAttendanceReport();
  renderSession();
  renderNotifications();
  renderActivityLog();
  renderStaffDevices();
  renderApLocationMap();
  applyPageFromHash();
}

function applyPageFromHash() {
  const hash = (window.location.hash || "#dashboard").replace("#", "");
  let page = pageSections[hash] ? hash : (pageAliases[hash] || "dashboard");
  if (currentRole === "staff" && !["dashboard", "shifts", "leave"].includes(page)) {
    page = "dashboard";
    if (window.location.hash !== "#dashboard") window.location.hash = "dashboard";
  }
  const visibleIds = new Set(pageSections[page]);

  Object.values(pageSections).flat().forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.classList.toggle("page-hidden", !visibleIds.has(id));
  });

  document.body.dataset.page = page;
  pageLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.pageLink === page);
  });
}

function lockStaffOnlyView() {
  if (currentRole !== "staff") return false;
  roleSelect.value = "staff";
  roleSelect.disabled = true;
  staffSwitcher.disabled = true;
  document.body.dataset.role = "staff";
  return true;
}

function renderMetrics() {
  const today = new Date().toISOString().slice(0, 10);
  document.querySelector("#on-duty-count").textContent = staff.filter((person) => isOnShift(person)).length;
  document.querySelector("#late-count").textContent = staff.filter((person) => person.status === "On break").length;
  document.querySelector("#pending-leave-count").textContent = leaveRequests.filter((request) => request.status === "Pending").length;
  document.querySelector("#outside-count").textContent = leaveRequests.filter((request) =>
    ["Approved", "Pending", "Change the Request", "Adjustment requested"].includes(request.status) &&
    today >= request.from &&
    today <= request.to
  ).length;
}

function renderStaffTable() {
  const department = departmentFilter.value || "All";
  const visibleStaff = sortStaffByEmployeeCode(department === "All" ? staff : staff.filter((person) => person.department === department));

  tableBody.innerHTML = visibleStaff.map((person) => {
    const locationClass = locationClassFor(person.locationStatus);
    const statusClass = statusClassFor(person.status);
    const clock = person.clockIn ? `${person.clockIn}${person.clockOut ? ` - ${person.clockOut}` : " - active"}` : "Not clocked in";

    return `
      <tr>
        <td>
          <div class="staff-name">
            <span class="avatar">${initials(person.name)}</span>
            <div>
              ${person.name}
              <small>${person.role}</small>
            </div>
          </div>
        </td>
        <td>${person.department}</td>
        <td>${person.shift}<br><small>${person.shiftTime}</small></td>
        <td>${clock}</td>
        <td><span class="pill ${statusClass}">${person.status}</span></td>
        <td>
          <span class="pill ${locationClass}">${person.locationStatus}</span><br>
          <small>${person.location} - ${person.ping}</small>
          ${person.wifiAp ? `<br><small>WiFi: ${wifiLocationLabel(person)} via ${person.wifiAp}${person.wifiRssi ? ` (${person.wifiRssi})` : ""}</small>` : ""}
          ${person.lastLatitude && person.lastLongitude ? `<br><a class="map-link" href="${googleMapsUrl(person.lastLatitude, person.lastLongitude)}" target="_blank" rel="noreferrer">Open in Google Maps</a>` : ""}
        </td>
      </tr>
    `;
  }).join("");
}

function renderMapPins() {
  map.querySelectorAll(".pin").forEach((pin) => pin.remove());
  const selectedFloor = mapFloorSelect?.value || localStorage.getItem(mapFloorStorageKey) || "GF";

  staff.filter((person) => isOnShift(person) && (!person.floor || person.floor === selectedFloor)).forEach((person) => {
    const pin = document.createElement("span");
    pin.className = `pin ${locationClassFor(person.locationStatus)}`;
    pin.style.left = `${person.x}%`;
    pin.style.top = `${person.y}%`;
    pin.dataset.name = person.name.split(" ")[0];
    const coordinates = person.lastLatitude && person.lastLongitude
      ? ` (${Number(person.lastLatitude).toFixed(6)}, ${Number(person.lastLongitude).toFixed(6)})`
      : "";
    pin.title = `${person.name}: ${person.locationStatus} at ${person.location}${coordinates}`;
    map.appendChild(pin);
  });
}

function renderLeaveRequests() {
  const activeStaff = staff.find((person) => sameId(person.id, activeStaffId)) ||
    staff.find((person) => sameId(person.cloudId, activeStaffId)) ||
    staff.find((person) => currentAppUserId && sameId(person.appUserId, currentAppUserId));
  if (currentRole === "staff" && activeStaff && !sameId(activeStaff.id, activeStaffId)) {
    activeStaffId = activeStaff.id;
    rememberActiveStaff();
  }
  if (currentRole !== "staff") {
    if (leaveForm) leaveForm.hidden = true;
    leaveList.innerHTML = renderAdminMonthlyLeaveView();
    return;
  }

  if (leaveForm) leaveForm.hidden = false;
  const visibleRequests = currentRole === "staff" && activeStaff
    ? leaveRequests.filter((request) => leaveRequestBelongsToStaff(request, activeStaff))
    : leaveRequests;

  leaveList.innerHTML = visibleRequests.length ? visibleRequests.map((request) => {
    const requestMessages = leaveMessagesForRequest(request);
    const displayMessages = decisionMessagesForRequest(request, requestMessages);
    const units = leaveRequestUnits(request);
    return `
    <article class="request-card">
      <div class="request-top">
        <strong>${request.name}</strong>
        <span class="pill ${leaveStatusClass(request.status)}">${leaveStatusDisplay(request.status)}</span>
      </div>
      <small>${departmentForLeaveRequest(request)} - ${leaveRequestTitle(request)} - ${leaveDateRangeLabel(request)} - ${units} leave day${units === 1 ? "" : "s"}</small>
      <span>${request.reason || "No reason added"}</span>
      ${displayMessages.length ? `
        <div class="leave-thread">
          <div class="box-title-row">
            <strong>Request chat thread</strong>
            <button class="ghost small-button" type="button" data-clear-chat-thread="${request.cloudId || request.id}">Clear thread</button>
          </div>
          ${displayMessages.map((message) => `
            <div class="thread-message">
              <span>${message.message}</span>
              <small>${message.label || "Message"} - ${formatDateTime(message.time)}</small>
              ${isRealChatMessage(message) ? `<button class="ghost small-button" type="button" data-delete-chat-message="${messageIdentity(message)}">Delete</button>` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}
      ${["Pending", "Change the Request", "Adjustment requested"].includes(request.status) && currentRole !== "staff" ? `
        ${leaveChatBoxMarkup(request, "admin")}
        <div class="request-actions">
          <button data-action="approve" data-id="${request.id}">Approve</button>
          <button class="reject" data-action="reject" data-id="${request.id}">Reject</button>
        </div>
      ` : ""}
      ${request.status === "Approved" && currentRole !== "staff" ? `
        <div class="request-actions">
          <button class="ghost" data-action="cancel" data-id="${request.id}">Cancel approved leave</button>
        </div>
      ` : ""}
      ${currentRole === "staff" && ["Pending", "Change the Request", "Adjustment requested"].includes(request.status) ? `
        ${leaveChatBoxMarkup(request, "staff")}
        <div class="request-actions">
          <button class="ghost" type="button" data-staff-cancel-leave="${request.id}">Cancel request</button>
        </div>
      ` : ""}
      ${currentRole === "staff" && ["Pending", "Change the Request", "Adjustment requested"].includes(request.status) ? `
        <form class="change-request-form" data-change-request="${request.id}">
          <strong>${request.status === "Pending" ? "Modify this request" : "Change this request and send again"}</strong>
          <div class="form-row">
            <label>
              From
              <input name="from" type="date" value="${request.from}" required>
            </label>
            <label>
              To
              <input name="to" type="date" value="${request.to}" required>
            </label>
          </div>
          <label>
            Duration
            <select name="duration">
              <option value="full" ${leaveDurationValue(request) === "full" ? "selected" : ""}>Full day</option>
              <option value="half" ${leaveDurationValue(request) === "half" ? "selected" : ""}>Half day</option>
              <option value="short" ${leaveDurationValue(request) === "short" ? "selected" : ""}>Short leave - 2.5 hours</option>
            </select>
          </label>
          <label>
            Reason / reply
            <input name="reason" type="text" value="${escapeAttribute(request.reason || "")}" placeholder="Add reason or reply to admin" required>
          </label>
          <button type="submit">${request.status === "Pending" ? "Save modified request" : "Send changed request"}</button>
        </form>
      ` : ""}
    </article>
  `;
  }).join("") : `<div class="mini-empty">${currentRole === "staff" ? "You have no leave requests yet." : "No leave requests yet."}</div>`;
}

function renderAdminMonthlyLeaveView() {
  const monthKey = monthKeyForDate();
  const monthName = monthLabel(monthKey);
  const rows = sortStaffByEmployeeCode(staff).map((person) => {
    const approved = approvedLeaveUsedInMonth(person, monthKey);
    const available = monthlyLeaveBalance(person, `${monthKey}-01`);
    const rejected = leaveRequests.filter((request) =>
      request.status === "Rejected" &&
      (sameId(request.staffId, person.id) || sameId(request.staffId, person.cloudId)) &&
      leaveUnitsInMonth(request, monthKey) > 0
    ).length;

    return { person, approved, available, rejected };
  });
  const totals = rows.reduce((sum, row) => ({
    quota: sum.quota + monthlyLeaveQuota,
    approved: sum.approved + row.approved,
    available: sum.available + row.available,
    rejected: sum.rejected + row.rejected
  }), { quota: 0, approved: 0, available: 0, rejected: 0 });
  const threads = chatThreadsForAdmin().filter((thread) => !thread.isShiftThread);
  const approvedRequests = leaveRequests.filter((request) =>
    request.status === "Approved" &&
    leaveUnitsInMonth(request, monthKey) > 0
  );

  return `
    <section class="leave-month-view">
      <div class="self-stats compact-self-stats">
        <span><b>${formatLeaveUnits(totals.quota)}</b><small>${monthName} total quota</small></span>
        <span><b>${formatLeaveUnits(totals.approved)}</b><small>approved leave taken</small></span>
        <span><b>${formatLeaveUnits(totals.available)}</b><small>available balance</small></span>
        <span><b>${totals.rejected}</b><small>rejected requests</small></span>
      </div>
      <div class="leave-quota-table">
        ${rows.length ? rows.map((row) => `
          <div class="leave-quota-row">
            <span><strong>${row.person.employeeCode ? `${row.person.employeeCode} - ` : ""}${row.person.name}</strong><small>${row.person.department} - ${row.person.role}</small></span>
            <span><b>${formatLeaveUnits(monthlyLeaveQuota)}</b><small>quota</small></span>
            <span><b>${formatLeaveUnits(row.approved)}</b><small>taken</small></span>
            <span><b>${formatLeaveUnits(row.available)}</b><small>available</small></span>
            <span><b>${row.rejected}</b><small>rejected</small></span>
          </div>
        `).join("") : `<div class="mini-empty">No staff loaded yet.</div>`}
      </div>
      <div class="staff-message-box">
        <strong>Approved leave this month</strong>
        ${approvedRequests.length ? approvedRequests.map((request) => `
          <div class="mini-item">
            <span><strong>${request.name}</strong><small>${departmentForLeaveRequest(request)} - ${leaveRequestTitle(request)} - ${leaveDateRangeLabel(request)}</small></span>
            <span class="quick-actions">
              <span class="pill green">Approved</span>
              <button class="ghost small-button" type="button" data-action="cancel" data-id="${request.id}">Cancel</button>
            </span>
          </div>
        `).join("") : `<div class="mini-empty">No approved leave this month.</div>`}
      </div>
      <div class="staff-message-box leave-history-box">
        <div class="box-title-row">
          <strong>Leave chat history</strong>
          ${threads.length ? `<button class="ghost small-button" data-clear-chat-history="all">Clear all</button>` : ""}
        </div>
        ${threads.length ? threads.map((thread) => `
          <div class="chat-thread-card">
            <div class="box-title-row">
              <strong>${thread.title}</strong>
              <button class="ghost small-button" data-clear-chat-thread="${thread.key}">Clear thread</button>
            </div>
            ${thread.messages.map((message) => `
              <div class="mini-item chat-history-item">
                <span><strong>${message.label || "Message"}</strong>${message.message}<small>${formatDateTime(message.time)}</small></span>
                <button class="ghost small-button" data-delete-chat-message="${messageIdentity(message)}">Delete</button>
              </div>
            `).join("")}
          </div>
        `).join("") : `<div class="mini-empty">No leave chat history yet.</div>`}
      </div>
    </section>
  `;
}

function leaveChatBoxMarkup(request, sender) {
  const isStaffSender = sender === "staff";
  const draft = isStaffSender ? "" : adminLeaveDrafts[leaveDraftKey(request)] || "";
  return `
    <details class="leave-chat-panel ${isStaffSender ? "staff-chat-panel" : "admin-chat-panel"}" open>
      <summary>${isStaffSender ? "Chat with admin about this request" : "Send message to employee"}</summary>
      <form class="leave-chat-form ${isStaffSender ? "staff-chat-form" : "quick-chat-form admin-message-box"}" data-leave-chat="${leaveThreadId(request)}" data-chat-sender="${sender}">
        <label>
          ${isStaffSender ? "Your message" : "Message to employee"}
          <textarea name="message" ${isStaffSender ? "" : `data-admin-leave-message="${leaveThreadId(request)}"`} rows="2" placeholder="${isStaffSender ? "Type your message or question" : "Type reply to staff"}" required>${escapeText(draft)}</textarea>
        </label>
        <button class="chat-send-button" type="submit">${isStaffSender ? "Send chat message" : "Send chat"}</button>
      </form>
    </details>
  `;
}

function leaveThreadMessagesMarkup(request, limit = 4, messages = leaveMessagesForRequest(request)) {
  const recent = [...messages].slice(-limit);
  if (!recent.length) return "";
  return `
    <div class="thread-message compact-thread-message">
      ${recent.map((message) => `
        <span><b>${message.label || "Message"}:</b> ${message.message}</span>
        <small>${formatDateTime(message.time)}</small>
      `).join("")}
    </div>
  `;
}

function leaveThreadId(request) {
  return String(request?.cloudId || request?.id || "");
}

function renderLeaveCalendar() {
  if (!leaveCalendar) return;

  const today = new Date();
  const year = today.getFullYear();
  const monthIndex = today.getMonth();
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const days = Array.from({ length: totalDays }, (_, index) =>
    localDateKey(year, monthIndex, index + 1)
  );

  leaveCalendar.innerHTML = days.map((dateValue) => {
    const requests = leaveRequests.filter((request) =>
      requestCoversDate(request, dateValue) &&
      ["Approved", "Rejected", "Pending", "Change the Request", "Adjustment requested"].includes(request.status)
    );

    return `
      <article class="calendar-day ${requests.length ? "has-items" : ""}">
        <strong>${dateValue.slice(8, 10)}</strong>
        <small>${shortDayName(dateValue)} - ${formatMonthShort(dateValue)}${requests.length ? ` - ${requests.length} leave record${requests.length === 1 ? "" : "s"}` : " - No leave"}</small>
        <div>
          ${requests.length ? requests.map((request) => `
            <span class="calendar-item ${leaveStatusClass(request.status)}">
              ${request.name} - ${leaveRequestTitle(request)} - ${leaveStatusDisplay(request.status)}
            </span>
          `).join("") : `<span class="calendar-empty">Fully available</span>`}
        </div>
      </article>
    `;
  }).join("");
}

function renderLeaveCoverage() {
  if (!coverageDate || !coverageGrid) return;

  if (!coverageDate.value) {
    coverageDate.value = new Date().toISOString().slice(0, 10);
  }

  const selectedDate = coverageDate.value;
  coverageGrid.innerHTML = leaveDepartments.map((department) => {
    const matchingRequests = leaveRequests.filter((request) =>
      requestCoversDate(request, selectedDate) &&
      normalizeDepartment(departmentForLeaveRequest(request)) === normalizeDepartment(department) &&
      request.status !== "Rejected"
    );
    const approved = matchingRequests.filter((request) => request.status === "Approved").length;
    const pending = matchingRequests.filter((request) => ["Pending", "Change the Request", "Adjustment requested"].includes(request.status)).length;

    return `
      <article class="coverage-card">
        <strong>${department}</strong>
        <span><b>${approved}</b><small>approved</small></span>
        <span><b>${pending}</b><small>requested</small></span>
      </article>
    `;
  }).join("");
}

function renderLeavePressure() {
  if (!leavePressureDate || !leavePressureThreshold || !leavePressureList) return;

  if (!leavePressureDate.value) {
    leavePressureDate.value = coverageDate?.value || new Date().toISOString().slice(0, 10);
  }

  const selectedDate = leavePressureDate.value;
  const threshold = Math.max(1, Number(leavePressureThreshold.value || 2));
  const cards = leaveDepartments.map((department) => {
    const matchingRequests = leaveRequests.filter((request) =>
      requestCoversDate(request, selectedDate) &&
      normalizeDepartment(departmentForLeaveRequest(request)) === normalizeDepartment(department) &&
      request.status !== "Rejected"
    );
    const approved = matchingRequests.filter((request) => request.status === "Approved").length;
    const pending = matchingRequests.filter((request) => ["Pending", "Change the Request", "Adjustment requested"].includes(request.status)).length;
    const total = approved + pending;
    const warning = total >= threshold;

    return `
      <article class="pressure-card ${warning ? "warning" : ""}">
        <strong>${department}: ${total} leave ${total === 1 ? "request" : "requests"}</strong>
        <span>${approved} approved, ${pending} requested for ${formatDate(selectedDate)}</span>
        <span>${warning ? "Too many requests. Consult other staff before approving." : "Coverage looks manageable."}</span>
      </article>
    `;
  });

  leavePressureList.innerHTML = cards.join("");
}

function departmentLeavePressureRows(selectedDate) {
  return leaveDepartments.map((department) => {
    const matchingRequests = leaveRequests.filter((request) =>
      requestCoversDate(request, selectedDate) &&
      normalizeDepartment(departmentForLeaveRequest(request)) === normalizeDepartment(department) &&
      request.status !== "Rejected"
    );
    const approved = matchingRequests.filter((request) => request.status === "Approved").length;
    const pending = matchingRequests.filter((request) => ["Pending", "Change the Request", "Adjustment requested"].includes(request.status)).length;
    return {
      department,
      approved,
      pending,
      total: approved + pending
    };
  });
}

function renderManagerBoard() {
  if (!managerBoardDate || !managerBoard) return;

  if (!managerBoardDate.value) {
    managerBoardDate.value = new Date().toISOString().slice(0, 10);
  }

  const selectedDate = managerBoardDate.value;
  const dayName = shortDayName(selectedDate);
  managerBoard.innerHTML = leaveDepartments.map((department) => {
    const departmentStaff = sortStaffByEmployeeCode(staff.filter((person) =>
      normalizeDepartment(person.department) === normalizeDepartment(department)
    ));
    const scheduledStaff = departmentStaff.filter((person) => isScheduledForDate(person, selectedDate, dayName));
    const onDuty = scheduledStaff.filter((person) => isOnShift(person));
    const missing = scheduledStaff.filter((person) =>
      !person.clockIn && person.status !== "Off duty" && !staffHasApprovedLeave(person, selectedDate)
    );
    const leaveToday = leaveRequests.filter((request) =>
      requestCoversDate(request, selectedDate) &&
      normalizeDepartment(departmentForLeaveRequest(request)) === normalizeDepartment(department) &&
      request.status !== "Rejected"
    );
    const approvedLeave = leaveToday.filter((request) => request.status === "Approved").length;
    const pendingLeave = leaveToday.filter((request) => request.status === "Pending" || request.status === "Adjustment requested" || request.status === "Change the Request").length;
    const needsAttention = missing.length || pendingLeave || approvedLeave >= 2;

    return `
      <article class="manager-board-card ${needsAttention ? "warning" : ""}">
        <div class="manager-board-top">
          <strong>${department}</strong>
          <span class="pill ${needsAttention ? "amber" : "green"}">${needsAttention ? "Review" : "OK"}</span>
        </div>
        <div class="manager-board-stats">
          <span><b>${scheduledStaff.length}</b><small>scheduled</small></span>
          <span><b>${onDuty.length}</b><small>on duty</small></span>
          <span><b>${missing.length}</b><small>missing in</small></span>
          <span><b>${approvedLeave}</b><small>approved leave</small></span>
          <span><b>${pendingLeave}</b><small>requested</small></span>
        </div>
        <small>${missing.length ? `Missing clock-in: ${missing.map((person) => person.employeeCode || person.name).join(", ")}` : "No missing clock-ins for scheduled staff."}</small>
      </article>
    `;
  }).join("");
}

function renderAttendanceReport() {
  if (!attendanceReportDate || !attendanceReportPeriod || !attendanceSummaryGrid || !attendanceReportList) return;

  if (!attendanceReportDate.value) {
    attendanceReportDate.value = new Date().toISOString().slice(0, 10);
  }

  const records = attendanceReportRecords.length
    ? attendanceReportRecords
    : staff
      .filter((person) => person.clockIn)
      .map((person) => ({
        staffName: person.name,
        employeeCode: person.employeeCode || "",
        department: person.department,
        clockIn: person.clockIn,
        clockOut: person.clockOut,
        status: person.status,
        hoursWorked: person.clockIn ? hoursBetweenClockTimes(person.clockIn, person.clockOut) : 0
      }));

  const reportRange = attendanceReportRange();
  const totalHours = records.reduce((sum, record) => sum + Number(record.hoursWorked || 0), 0);

  attendanceSummaryGrid.innerHTML = leaveDepartments.map((department) => {
    const departmentRecords = records.filter((record) =>
      normalizeDepartment(record.department) === normalizeDepartment(department)
    );
    const active = departmentRecords.filter((record) => record.clockIn && !record.clockOut).length;
    const completed = departmentRecords.filter((record) => record.clockOut).length;
    const hours = departmentRecords.reduce((sum, record) => sum + Number(record.hoursWorked || 0), 0);

    return `
      <article class="coverage-card">
        <strong>${department}</strong>
        <span><b>${departmentRecords.length}</b><small>clocked</small></span>
        <span><b>${active}</b><small>active</small></span>
        <span><b>${completed}</b><small>completed</small></span>
        <span><b>${formatHours(hours)}</b><small>hours</small></span>
      </article>
    `;
  }).join("");

  attendanceReportList.innerHTML = `
    <article class="attendance-report-total">
      <strong>${titleCase(attendanceReportPeriod.value)} report</strong>
      <span>${formatDate(reportRange.startDate)} to ${formatDate(reportRange.endDate)} - ${formatHours(totalHours)} total hours</span>
    </article>
    ${records.length ? records.map((record) => `
      <article class="attendance-report-row">
        <div>
          <strong>${record.employeeCode ? `${record.employeeCode} - ` : ""}${record.staffName}</strong>
          <small>${record.department || "General"} - ${record.status}</small>
        </div>
        <span>${record.clockIn || "--:--"} to ${record.clockOut || "active"} - ${formatHours(record.hoursWorked || 0)} hrs</span>
      </article>
    `).join("") : `<div class="mini-empty">No clock records for this period yet.</div>`}
  `;
}

function renderShifts() {
  if (!shiftPlans.length) {
    shiftList.innerHTML = `<div class="mini-empty">No manual shift plans yet. Add one above.</div>`;
    return;
  }

  shiftList.innerHTML = shiftPlans.map((plan) => {
    const person = staff.find((item) => sameId(item.id, plan.staffId) || sameId(item.cloudId, plan.staffId));
    return `
    <article class="shift-card">
      <div class="shift-top">
        <strong>${person?.name || "Unknown staff"} - ${plan.shift}</strong>
        <span class="pill">${shiftPlanTimeSummary(plan)}</span>
      </div>
      <small>Dates: ${(plan.repeatDates || []).map((date) => date.slice(8, 10)).join(", ") || (plan.repeatDays || []).join(", ") || "no dates selected"}</small>
      <div class="request-actions">
        <button class="ghost" data-edit-shift-plan="${plan.id}">Edit</button>
        <button class="ghost danger" data-delete-shift-plan="${plan.id}">Remove</button>
      </div>
    </article>
  `;
  }).join("");
}

function shiftPlanTimeSummary(plan) {
  return [
    `${normalizeTime24(plan.inTime)} - ${normalizeTime24(plan.outTime)}`,
    plan.shift2 && plan.inTime2 && plan.outTime2 ? `${normalizeTime24(plan.inTime2)} - ${normalizeTime24(plan.outTime2)}` : "",
    plan.shift3 && plan.inTime3 && plan.outTime3 ? `${normalizeTime24(plan.inTime3)} - ${normalizeTime24(plan.outTime3)}` : ""
  ].filter(Boolean).join(" / ");
}

function renderDailyRoster() {
  if (!dailyRosterDate || !dailyRosterBody) return;

  if (!dailyRosterDate.value) {
    dailyRosterDate.value = new Date().toISOString().slice(0, 10);
  }

  const dateValue = dailyRosterDate.value;
  dailyRosterBody.innerHTML = sortStaffByEmployeeCode(staff).map((person) => {
    const entry = dailyRosterEntryFor(person, dateValue);
    return `
      <tr data-roster-staff="${person.id}">
        <td>
          <strong>${person.employeeCode ? `${person.employeeCode} - ` : ""}${person.name}</strong>
          <small>${person.role || "Staff"}</small>
        </td>
        <td>${person.department || "General"}</td>
        <td>
          <input data-roster-field="shift" type="text" list="shift-options" value="${escapeAttribute(entry.shift)}">
          <input data-roster-field="shift2" type="text" list="shift-options" value="${escapeAttribute(entry.shift2 || "")}" placeholder="Second shift">
        </td>
        <td>
          <input data-roster-field="inTime" type="time" value="${escapeAttribute(entry.inTime)}">
          <input data-roster-field="inTime2" type="time" value="${escapeAttribute(entry.inTime2 || "")}" title="Second shift in">
        </td>
        <td>
          <input data-roster-field="outTime" type="time" value="${escapeAttribute(entry.outTime)}">
          <input data-roster-field="outTime2" type="time" value="${escapeAttribute(entry.outTime2 || "")}" title="Second shift out">
        </td>
        <td>
          <select data-roster-field="status">
            ${["Working", "Weekly off", "Leave", "Extra shift"].map((status) =>
              `<option value="${status}" ${entry.status === status ? "selected" : ""}>${status}</option>`
            ).join("")}
          </select>
          <select data-roster-field="status2">
            ${["", "Working", "Extra shift"].map((status) =>
              `<option value="${status}" ${(entry.status2 || "") === status ? "selected" : ""}>${status || "No second shift"}</option>`
            ).join("")}
          </select>
        </td>
      </tr>
    `;
  }).join("");
}

function renderShiftCalendar() {
  if (!shiftCalendar || !shiftCalendarStart) return;

  if (!shiftCalendarStart.value) {
    shiftCalendarStart.value = todayLocalKey();
  }

  const selectedDate = shiftCalendarStart.value;
  const dates = nextDateKeys(selectedDate, 7);
  const header = `
    <div class="shift-calendar-row shift-calendar-header">
      <span>Department / Staff</span>
      ${dates.map((dateValue) => `<span>${formatDate(dateValue)}<small>${shortDayName(dateValue)}</small></span>`).join("")}
    </div>
  `;

  const activeStaffForCalendar = staff.find((person) => sameId(person.id, activeStaffId));
  const calendarDepartments = currentRole === "staff" && activeStaffForCalendar
    ? [activeStaffForCalendar.department]
    : leaveDepartments;
  const timeline = renderShiftTimeline(selectedDate, calendarDepartments);
  const sections = calendarDepartments.map((department) => {
    const departmentStaff = sortStaffByEmployeeCode(staff.filter((person) => normalizeDepartment(person.department) === normalizeDepartment(department)));
    if (!departmentStaff.length) return "";

    return `
      <section class="shift-calendar-department ${departmentColorClass(department)}">
        <h3>${department}</h3>
        ${departmentStaff.map((person) => `
          <div class="shift-calendar-row">
            <span class="shift-calendar-person">
              <strong>${person.employeeCode ? `${person.employeeCode} - ` : ""}${person.name}</strong>
              <small>${person.role || "Staff"}</small>
            </span>
            ${dates.map((dateValue) => shiftCalendarCell(person, dateValue)).join("")}
          </div>
        `).join("")}
      </section>
    `;
  }).join("");

  shiftCalendar.innerHTML = timeline + header + (sections || `<div class="mini-empty">No staff found for the shift calendar.</div>`);
}

function renderShiftTimeline(dateValue, calendarDepartments) {
  const departments = calendarDepartments
    .map((department) => {
      const departmentStaff = sortStaffByEmployeeCode(staff.filter((person) =>
        normalizeDepartment(person.department) === normalizeDepartment(department)
      ));
      const rows = departmentStaff.map((person) => shiftTimelineRow(person, dateValue)).filter(Boolean);
      if (!rows.length) return "";
      return `
        <section class="shift-timeline-department ${departmentColorClass(department)}">
          <h3>${department}</h3>
          ${rows.join("")}
        </section>
      `;
    })
    .join("");

  return `
    <div class="shift-timeline-card">
      <div class="box-title-row">
        <div>
          <strong>Shift time chart - ${formatDate(dateValue)}</strong>
          <small>Colored bars show who works at what time on the selected date.</small>
        </div>
      </div>
      <div class="shift-time-axis">
        ${["07:00", "10:00", "13:00", "16:00", "19:00", "22:00", "24:00"].map((label) => `<span>${label}</span>`).join("")}
      </div>
      ${departments || `<div class="mini-empty">No shifts found for this date.</div>`}
    </div>
  `;
}

function shiftTimelineRow(person, dateValue) {
  const entry = dailyRosterEntryFor(person, dateValue);
  const segments = shiftSegmentsForEntry(entry);
  const isLeave = entry.status === "Leave";
  if (!segments.length && !isLeave) return "";

  return `
    <div class="shift-timeline-row">
      <div class="shift-timeline-person">
        <strong>${person.employeeCode ? `${person.employeeCode} - ` : ""}${person.name}</strong>
        <small>${person.role || "Staff"}</small>
      </div>
      <div class="shift-timeline-track">
        ${segments.map((segment) => `
          <span class="shift-bar ${segment.className}" style="left:${segment.left}%;width:${segment.width}%;">
            ${segment.label}
          </span>
        `).join("")}
        ${isLeave ? `<span class="shift-bar leave-bar" style="left:0%;width:100%;">Full day leave</span>` : ""}
      </div>
    </div>
  `;
}

function shiftSegmentsForEntry(entry) {
  if (!["Working", "Extra shift"].includes(entry.status)) return [];
  const possible = [
    { label: normalizeShiftLabel(entry.shift) || "Shift", inTime: entry.inTime, outTime: entry.outTime, className: "primary-bar" },
    { label: normalizeShiftLabel(entry.shift2) || "Second", inTime: entry.inTime2, outTime: entry.outTime2, className: "second-bar" },
    { label: normalizeShiftLabel(entry.shift3) || "Third", inTime: entry.inTime3, outTime: entry.outTime3, className: "third-bar" }
  ];

  return possible
    .filter((segment) => segment.inTime && segment.outTime)
    .map((segment) => {
      const start = minutesFromTime(segment.inTime);
      let end = minutesFromTime(segment.outTime);
      if (end <= start) end += 24 * 60;
      const visibleStart = Math.max(shiftChartStartMinute(), Math.min(start, shiftChartEndMinute()));
      const visibleEnd = Math.max(shiftChartStartMinute(), Math.min(end, shiftChartEndMinute()));
      const widthMinutes = Math.max(20, visibleEnd - visibleStart);
      return {
        ...segment,
        left: roundPercent(((visibleStart - shiftChartStartMinute()) / shiftChartVisibleMinutes()) * 100),
        width: roundPercent((widthMinutes / shiftChartVisibleMinutes()) * 100),
        label: `${segment.label} ${normalizeTime24(segment.inTime)}-${normalizeTime24(segment.outTime)}${entry.leaveLabel ? ` (${entry.leaveLabel})` : ""}`
      };
    });
}

function shiftChartStartMinute() {
  return 7 * 60;
}

function shiftChartEndMinute() {
  return 24 * 60;
}

function shiftChartVisibleMinutes() {
  return shiftChartEndMinute() - shiftChartStartMinute();
}

function minutesFromTime(value) {
  const [hour = 0, minute = 0] = normalizeTime24(value).split(":").map(Number);
  return (Number(hour) * 60) + Number(minute);
}

function roundPercent(value) {
  return Math.round(value * 100) / 100;
}

function renderDepartmentCharts() {
  renderLeaveDepartmentChart();
  renderShiftDepartmentChart();
}

function renderLeaveDepartmentChart() {
  if (!leaveDepartmentChart) return;

  const today = new Date().toISOString().slice(0, 10);
  const rows = leaveDepartments.map((department) => {
    const requests = leaveRequests.filter((request) =>
      requestCoversDate(request, today) &&
      request.status !== "Rejected" &&
      normalizeDepartment(departmentForLeaveRequest(request)) === normalizeDepartment(department)
    );
    return {
      department,
      total: requests.length,
      approved: requests.filter((request) => request.status === "Approved").length,
      pending: requests.filter((request) => request.status === "Pending" || request.status === "Adjustment requested" || request.status === "Change the Request").length
    };
  });

  leaveDepartmentChart.innerHTML = departmentChartMarkup({
    title: "Today's leave by department",
    rows,
    emptyText: "No leave requests for today.",
    detailLabel: "approved / pending"
  });
}

function renderShiftDepartmentChart() {
  if (!shiftDepartmentChart) return;

  const plans = shiftPlans.length ? shiftPlans : staff.map((person) => ({
    staffId: person.id,
    shift: person.shift,
    repeatDays: ["Mon", "Tue", "Wed", "Thu", "Fri"]
  }));

  const rows = leaveDepartments.map((department) => {
    const departmentStaff = sortStaffByEmployeeCode(staff.filter((person) => normalizeDepartment(person.department) === normalizeDepartment(department)));
    const departmentPlans = plans.filter((plan) =>
      departmentStaff.some((person) => sameId(person.id, plan.staffId) || sameId(person.cloudId, plan.staffId))
    );
    const activePlans = departmentPlans.filter((plan) => normalizeDepartment(plan.shift) !== "weekly off");
    return {
      department,
      total: activePlans.length,
      approved: activePlans.length,
      pending: Math.max(0, departmentStaff.length - activePlans.length)
    };
  });

  shiftDepartmentChart.innerHTML = departmentChartMarkup({
    title: "Shift coverage by department",
    rows,
    emptyText: "No shift plans saved yet.",
    detailLabel: "planned / unplanned"
  });
}

function departmentChartMarkup({ title, rows, emptyText, detailLabel }) {
  const max = Math.max(1, ...rows.map((row) => row.total));
  const hasAny = rows.some((row) => row.total > 0);

  return `
    <div class="chart-title">
      <strong>${title}</strong>
      <small>${hasAny ? "Department view" : emptyText}</small>
    </div>
    <div class="chart-bars">
      ${rows.map((row) => {
        const width = Math.max(row.total ? 12 : 3, Math.round((row.total / max) * 100));
        return `
          <div class="chart-row">
            <span>${row.department}</span>
            <div class="chart-track">
              <i style="width: ${width}%"></i>
            </div>
            <strong>${row.total}</strong>
            <small>${row.approved} / ${row.pending} ${detailLabel}</small>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderStaffDirectory() {
  staffDirectory.innerHTML = sortStaffByEmployeeCode(staff).map((person) => `
    <article class="directory-card">
      <div>
        <strong>${person.name}</strong>
        <small>${person.employeeCode ? `${person.employeeCode} - ` : ""}${person.role} - ${person.department}</small>
        ${person.wifiMac ? `<small>WiFi MAC: ${person.wifiMac}</small>` : ""}
        <small>Login password: ${hasStaffPassword(person) ? "set" : "not set"}</small>
      </div>
      <div>
        <span class="pill">${person.shift}</span>
        <button class="ghost" data-edit-staff="${person.id}">Edit</button>
        <button class="ghost danger" data-delete-staff="${person.id}">Remove</button>
      </div>
    </article>
  `).join("");
}

function fillEditStaffForm() {
  if (!editStaffSelect || !staff.length) return;

  const person = staff.find((item) => sameId(item.id, editStaffSelect.value));
  if (!person) {
    clearEditStaffForm();
    return;
  }

  ensureSelectOption(document.querySelector("#edit-staff-department"), person.department || "General");
  document.querySelector("#edit-staff-code").value = person.employeeCode || "";
  document.querySelector("#edit-staff-name").value = person.name || "";
  document.querySelector("#edit-staff-department").value = person.department || "";
  document.querySelector("#edit-staff-role").value = person.role || "";
  document.querySelector("#edit-staff-leave").value = Number(person.leaveBalance || 0);
  document.querySelector("#edit-staff-shift").value = displayShiftName(person.shift || defaultShiftName);
  document.querySelector("#edit-staff-phone").value = person.wifiMac || person.phone || "";
  document.querySelector("#edit-staff-password").value = "";
  document.querySelector("#clear-staff-password").checked = false;
  editStaffNote.textContent = person.cloudId
    ? `This staff profile is linked to Supabase. Staff app password: ${hasStaffPassword(person) ? "set" : "not set"}.`
    : `This staff profile is demo-only in this browser. Staff app password: ${hasStaffPassword(person) ? "set" : "not set"}.`;
}

function clearEditStaffForm() {
  if (!editStaffForm) return;
  ["#edit-staff-code", "#edit-staff-name", "#edit-staff-role", "#edit-staff-leave", "#edit-staff-shift", "#edit-staff-phone", "#edit-staff-password"].forEach((selector) => {
    const field = document.querySelector(selector);
    if (field) field.value = "";
  });
  const department = document.querySelector("#edit-staff-department");
  if (department) department.value = "";
  const resetPassword = document.querySelector("#clear-staff-password");
  if (resetPassword) resetPassword.checked = false;
  if (editStaffNote) editStaffNote.textContent = "Choose a staff member to edit department, job title, leave, and shift.";
}

function renderNotifications() {
  const today = new Date().toISOString().slice(0, 10);
  const pendingLeave = leaveRequests.filter((request) => request.status === "Pending");
  const approvedToday = leaveRequests.filter((request) =>
    request.status === "Approved" && request.from <= today && request.to >= today
  );
  const outsideNow = staff.filter((person) => person.locationStatus === "Outside" && isOnShift(person));
  const lateNow = staff.filter((person) => person.status === "Late");
  const leavePressure = departmentLeavePressureRows(today).filter((row) => row.total >= Number(leavePressureThreshold?.value || 2));
  const summaryAlerts = [
    { label: "Leave today", className: approvedToday.length ? "blue" : "green", message: `${approvedToday.length} staff on approved leave today.` },
    { label: "Pending", className: pendingLeave.length ? "amber" : "green", message: `${pendingLeave.length} leave request${pendingLeave.length === 1 ? "" : "s"} waiting for admin.` },
    { label: "Late", className: lateNow.length ? "amber" : "green", message: `${lateNow.length} staff marked late now.` },
    { label: "Location", className: outsideNow.length ? "red" : "green", message: `${outsideNow.length} staff outside location while on shift.` }
  ];
  const alerts = [
    ...summaryAlerts,
    ...leavePressure.map((row) => ({
      label: "Pressure",
      className: "amber",
      message: `${row.department}: ${row.total} approved/pending leave requests on ${formatDate(today)}.`
    })),
    ...staff
      .filter((person) => person.locationStatus === "Outside" && isOnShift(person))
      .map((person) => ({
        label: "Location",
        className: "red",
        message: `${person.name} is outside the approved property area.`
      })),
    ...staff
      .filter((person) => person.status === "Late")
      .map((person) => ({
        label: "Late",
        className: "amber",
        message: `${person.name} arrived after scheduled start.`
      })),
    ...leaveRequests
      .filter((request) => request.status === "Pending")
      .map((request) => ({
        label: "Leave",
        className: "blue",
        message: `${request.name} has a pending ${leaveRequestTitle(request).toLowerCase()} request.`
      }))
  ];

  notificationList.innerHTML = alerts.length ? alerts.map((alert) => `
    <div class="mini-item">
      <span>${alert.message}</span>
      <span class="pill ${alert.className}">${alert.label}</span>
    </div>
  `).join("") : `<div class="mini-empty">No active alerts.</div>`;
}

function renderActivityLog() {
  const visibleItems = visibleActivityLog();
  activityList.innerHTML = visibleItems.length ? visibleItems.slice(0, 10).map((item) => `
    <article class="activity-item">
      <span class="pill">${item.type}</span>
      <div>
        <strong>${item.message}</strong>
        <small>${formatDateTime(item.time)}</small>
      </div>
    </article>
  `).join("") : `<div class="mini-empty">No activity recorded yet.</div>`;
}

function renderRoleDemo() {
  const activeStaff = staff.find((person) => sameId(person.id, activeStaffId)) ||
    staff.find((person) => sameId(person.cloudId, activeStaffId)) ||
    staff.find((person) => currentAppUserId && sameId(person.appUserId, currentAppUserId)) ||
    staff[0];
  if (!activeStaff) {
    staffCard.innerHTML = `
      <div class="mini-empty">No staff profile loaded yet. Staff can sign in with employee code, or admin can add staff.</div>
    `;
    return;
  }
  if (currentRole !== "staff") {
    renderAdminDashboardCard();
    return;
  }
  const locationClass = locationClassFor(activeStaff.locationStatus);
  const shiftState = isOnShift(activeStaff) ? "On shift now" : "Clock in to start shift";
  const personalMessages = [];
  const allChatThreads = chatThreadsForAdmin();
  const todayKey = todayLocalKey();
  const todayRoster = dailyRosterEntryFor(activeStaff, todayKey);
  const workedHours = activeStaff.clockIn ? hoursBetweenClockTimes(activeStaff.clockIn, activeStaff.clockOut) : 0;
  const myLeaveRequests = leaveRequests
    .filter((request) => leaveRequestBelongsToStaff(request, activeStaff))
    .slice(0, 5);
  const myPendingLeaveCount = leaveRequests.filter((request) =>
    leaveRequestBelongsToStaff(request, activeStaff) &&
    ["Pending", "Change the Request", "Adjustment requested"].includes(request.status)
  ).length;
  const leaveQuota = monthlyLeaveQuota;
  const monthlyBalance = monthlyLeaveBalance(activeStaff, todayKey);
  const lowBalance = monthlyBalance <= 2;
  const departmentShiftRows = staff
    .filter((person) => normalizeDepartment(person.department) === normalizeDepartment(activeStaff.department))
    .map((person) => {
      const entry = dailyRosterEntryFor(person, todayKey);
      const shiftLabel = normalizeShiftLabel(entry.shift) || "Shift";
      return `
        <div class="mini-item">
          <span><strong>${person.employeeCode ? `${person.employeeCode} - ` : ""}${person.name}</strong><small>${shiftLabel} - ${rosterTimeLabel(entry)}${extraShiftLabels(entry).length ? ` | ${extraShiftLabels(entry).join(" | ")}` : ""}</small></span>
          <span class="pill ${sameId(person.id, activeStaff.id) ? "green" : "blue"}">${sameId(person.id, activeStaff.id) ? "Me" : person.department}</span>
        </div>
      `;
    })
    .join("");

  staffCard.innerHTML = `
    <div class="self-card">
      <div class="self-top">
        <span class="avatar large">${initials(activeStaff.name)}</span>
        <div>
          <strong>${activeStaff.name}</strong>
          <small>${activeStaff.role} - ${activeStaff.department}</small>
        </div>
      </div>
      <div class="self-stats">
        <span><b>${normalizeShiftLabel(todayRoster.shift) || "Today"}</b><small>${rosterTimeLabel(todayRoster)}</small></span>
        <span><b>${formatLeaveUnits(monthlyBalance)}</b><small>remaining this month from ${leaveQuota} day quota</small></span>
        <span><b>${formatHours(workedHours)}</b><small>worked hours this shift</small></span>
      </div>
      <div class="self-stats compact-self-stats">
        <span><b>${activeStaff.clockIn || "--:--"}</b><small>clock in</small></span>
        <span><b>${activeStaff.clockOut || (activeStaff.clockIn ? "Active" : "--:--")}</b><small>clock out</small></span>
        <span><b>${myPendingLeaveCount}</b><small>leave waiting</small></span>
      </div>
      ${lowBalance ? `<div class="policy-summary warning-summary"><strong>Low leave balance:</strong> Please check with admin before planning more leave.</div>` : ""}
      <div class="tracking-strip">
        <span class="pill ${locationClass}">${activeStaff.locationStatus}</span>
        <span>${shiftState}</span>
      </div>
      ${currentRole !== "staff" ? `
        <label class="floor-picker">
          Current floor
          <select data-staff-floor>
            ${["GF", "1F", "2F", "3F"].map((floor) => `
              <option value="${floor}" ${(activeStaff.floor || "GF") === floor ? "selected" : ""}>${floor}</option>
            `).join("")}
          </select>
        </label>
        <label class="floor-picker">
        Current wing
          <select data-staff-zone>
            ${hotelZones.map((zone) => `
              <option value="${zone}" ${(activeStaff.zone || "New Wing") === zone ? "selected" : ""}>${zone}</option>
            `).join("")}
          </select>
        </label>
      ` : ""}
      <div class="staff-actions">
        <button data-staff-action="clock">${isOnShift(activeStaff) ? "Clock out" : "Clock in"}</button>
        <button class="ghost" data-staff-action="break">${activeStaff.status === "On break" ? "End break" : "Start break"}</button>
      </div>
      <div class="staff-message-box">
        ${currentRole === "staff" ? `
          <div class="box-title-row">
            <strong>My leave requests and chats</strong>
          </div>
          ${myLeaveRequests.length ? myLeaveRequests.map((request) => `
            <div class="mini-item">
              <span>${leaveRequestTitle(request)}<small>${leaveDateRangeLabel(request)}${request.reason ? ` - ${request.reason}` : ""}</small></span>
              <span class="pill ${leaveStatusClass(request.status)}">${request.status}</span>
            </div>
            ${leaveThreadMessagesMarkup(request, 4)}
            ${["Pending", "Change the Request", "Adjustment requested"].includes(request.status) ? `
              <details class="leave-chat-panel staff-chat-panel dashboard-chat-panel" open>
                <summary>Continue chat for this request</summary>
                <form class="leave-chat-form staff-chat-form" data-leave-chat="${leaveThreadId(request)}" data-chat-sender="staff">
                  <label>
                    Your message
                    <textarea name="message" rows="2" placeholder="Type your message to admin" required></textarea>
                  </label>
                  <button class="chat-send-button" type="submit">Send chat message</button>
                </form>
                <div class="request-actions">
                  <button class="ghost small-button" type="button" data-staff-cancel-leave="${request.id}">Cancel request</button>
                  <a class="ghost-link" href="#leave">Open leave page to modify</a>
                </div>
              </details>
            ` : ""}
          `).join("") : ""}
          ${!personalMessages.length && !myLeaveRequests.length ? `<div class="mini-empty">No leave answers yet.</div>` : ""}
        ` : `
          <div class="box-title-row">
            <strong>All chat history</strong>
            ${allChatThreads.length ? `<button class="ghost small-button" data-clear-chat-history="all">Clear all</button>` : ""}
          </div>
          ${allChatThreads.length ? allChatThreads.map((thread) => `
            <div class="chat-thread-card">
              <div class="box-title-row">
                <strong>${thread.title}</strong>
                <button class="ghost small-button" data-clear-chat-thread="${thread.key}">Clear thread</button>
              </div>
              ${thread.messages.map((message) => `
                <div class="mini-item chat-history-item">
                  <span><strong>${message.label || "Message"}</strong>${message.message}<small>${formatDateTime(message.time)}</small></span>
                  <button class="ghost small-button" data-delete-chat-message="${messageIdentity(message)}">Delete</button>
                </div>
              `).join("")}
              ${thread.isShiftThread ? `
                <form class="leave-chat-form quick-chat-form admin-message-box compact-message-box" data-shift-chat="${thread.key}" data-shift-staff="${thread.staffId || ""}" data-shift-date="${thread.shiftDate || ""}" data-chat-sender="admin">
                  <span>Reply about this shift</span>
                  <textarea name="message" rows="2" placeholder="Type shift reply or confirmation" required></textarea>
                  <button class="chat-send-button" type="submit">Send shift reply</button>
                </form>
              ` : ""}
            </div>
          `).join("") : `<div class="mini-empty">No chat messages yet.</div>`}
        `}
      </div>
      <div class="staff-message-box">
        <strong>${activeStaff.department} department shifts today</strong>
        ${departmentShiftRows || `<div class="mini-empty">No department shifts found for today.</div>`}
      </div>
    </div>
  `;

  const alerts = staff.filter((person) => person.status === "Late" || (person.locationStatus === "Outside" && isOnShift(person)));
  managerAlertCount.textContent = `${alerts.length} alert${alerts.length === 1 ? "" : "s"}`;
  managerAlerts.innerHTML = alerts.length ? alerts.map((person) => `
    <div class="mini-item">
      <span><strong>${person.name}</strong><small>${person.status === "Late" ? "Late arrival" : "Outside property"} - ${person.department}</small></span>
      <span class="pill ${person.status === "Late" ? "amber" : "red"}">${person.status === "Late" ? "Late" : "Location"}</span>
    </div>
  `).join("") : `<div class="mini-empty">No alerts right now.</div>`;

  const pending = leaveRequests.filter((request) => request.status === "Pending");
  managerApprovals.innerHTML = pending.length ? pending.map((request) => {
    const requestMessages = leaveMessagesForRequest(request);
    const threadMessages = decisionMessagesForRequest(request, requestMessages);
    const adminDraft = adminLeaveDrafts[leaveDraftKey(request)] || "";
    return `
    <div class="mini-item approval-item">
      <div class="approval-main">
        <span><strong>${request.name}</strong><small>${leaveRequestTitle(request)} - ${leaveDateRangeLabel(request)} - ${leaveStatusDisplay(request.status)}</small></span>
        ${leaveThreadMessagesMarkup(request, 4, threadMessages)}
        <form class="leave-chat-form quick-chat-form admin-message-box compact-message-box" data-leave-chat="${leaveThreadId(request)}" data-chat-sender="admin">
          <span>Message to employee</span>
          <textarea name="message" data-admin-leave-message="${leaveThreadId(request)}" rows="2" placeholder="Type reply to staff" required>${escapeText(adminDraft)}</textarea>
          <button class="chat-send-button" type="submit">Send chat</button>
        </form>
      </div>
      <span class="quick-actions">
        <button data-action="approve" data-id="${request.id}">Approve</button>
        <button class="reject" data-action="reject" data-id="${request.id}">Reject</button>
      </span>
    </div>
  `;
  }).join("") : `<div class="mini-empty">No pending leave requests.</div>`;
  renderManagerShiftChanges();

  document.body.dataset.role = currentRole || roleSelect.value;
}

function renderSession() {
  const signedIn = Boolean(currentRole);
  document.body.dataset.auth = signedIn ? "in" : "out";
  document.body.dataset.role = signedIn ? currentRole : "manager";
  roleSelect.value = signedIn ? currentRole : "manager";
  roleSelect.disabled = currentRole === "staff";
  staffSwitcher.disabled = currentRole === "staff";

  const activeStaff = staff.find((person) => sameId(person.id, activeStaffId)) ||
    staff.find((person) => sameId(person.cloudId, activeStaffId)) ||
    staff.find((person) => currentAppUserId && sameId(person.appUserId, currentAppUserId));
  if (currentRole === "staff" && activeStaff && !sameId(activeStaff.id, activeStaffId)) {
    activeStaffId = activeStaff.id;
    rememberActiveStaff();
  }
  const label = signedIn
    ? `${titleCase(currentRole)} signed in${currentCloudEmail ? ` - ${currentCloudEmail}` : currentRole === "staff" && activeStaff ? ` - ${activeStaff.name}` : ""}`
    : "Not signed in";
  sessionLabel.textContent = label;
}

function renderAdminDashboardCard() {
  const selectedDate = adminDashboardDate || new Date().toISOString().slice(0, 10);
  const onDuty = sortStaffByEmployeeCode(staff.filter((person) => isOnShift(person)));
  const onBreak = sortStaffByEmployeeCode(staff.filter((person) => person.status === "On break"));
  const clockedOut = sortStaffByEmployeeCode(staff.filter((person) => person.clockOut && !isOnShift(person)));
  const pendingLeave = leaveRequests.filter((request) => request.status === "Pending");
  const pendingShiftChanges = pendingShiftChangeThreads();
  const leaveForDate = leaveRequests.filter((request) =>
    ["Approved", "Pending", "Change the Request", "Adjustment requested"].includes(request.status) &&
    selectedDate >= request.from &&
    selectedDate <= request.to
  );
  const liveMessages = visibleActivityLog()
    .filter((item) => ["Clock", "Break", "Attendance"].includes(item.type) || item.isAttendanceEvent)
    .slice(0, 8);

  staffCard.innerHTML = `
    <div class="self-card admin-ops-card">
      <div class="box-title-row">
        <div>
          <strong>Admin live dashboard</strong>
          <small>Duty status, breaks, and leave for selected date</small>
        </div>
        <label class="compact-date-picker">
          Date
          <input type="date" data-admin-dashboard-date value="${selectedDate}">
        </label>
      </div>
      <div class="self-stats compact-self-stats">
        <span><b>${onDuty.length}</b><small>on duty now</small></span>
        <span><b>${onBreak.length}</b><small>on break</small></span>
        <span><b>${clockedOut.length}</b><small>clocked out</small></span>
        <span><b>${leaveForDate.length}</b><small>leave on date</small></span>
        <span><b>${pendingLeave.length}</b><small>pending leave</small></span>
        <span><b>${pendingShiftChanges.length}</b><small>shift changes</small></span>
      </div>
      <div class="staff-message-box">
        <strong>Staff on duty now</strong>
        ${onDuty.length ? onDuty.map((person) => `
          <div class="mini-item">
            <span><strong>${person.employeeCode ? `${person.employeeCode} - ` : ""}${person.name}</strong><small>${person.department} - In ${person.clockIn || "--:--"}${person.clockOut ? ` / Out ${person.clockOut}` : ""}${person.status === "On break" ? " - On break" : ""}</small></span>
            <span class="pill ${statusClassFor(person.status) || "green"}">${person.status}</span>
          </div>
        `).join("") : `<div class="mini-empty">No one is clocked in now.</div>`}
      </div>
      <div class="staff-message-box">
        <strong>On break now</strong>
        ${onBreak.length ? onBreak.map((person) => `
          <div class="mini-item">
            <span><strong>${person.employeeCode ? `${person.employeeCode} - ` : ""}${person.name}</strong><small>${person.department} - Break after ${person.clockIn || "--:--"}</small></span>
            <span class="pill blue">Break</span>
          </div>
        `).join("") : `<div class="mini-empty">No one is on break now.</div>`}
      </div>
      <div class="staff-message-box">
        <strong>Leave on ${formatDate(selectedDate)}</strong>
        ${leaveForDate.length ? leaveForDate.map((request) => `
          <div class="mini-item">
            <span><strong>${request.name}</strong><small>${departmentForLeaveRequest(request)} - ${leaveRequestTitle(request)} - ${leaveStatusDisplay(request.status)}</small></span>
            <span class="quick-actions">
              <span class="pill ${leaveStatusClass(request.status)}">${request.status}</span>
              ${request.status === "Approved" ? `<button class="ghost small-button" type="button" data-action="cancel" data-id="${request.id}">Cancel</button>` : ""}
            </span>
          </div>
        `).join("") : `<div class="mini-empty">No leave found for this date.</div>`}
      </div>
      <div class="staff-message-box">
        <strong>Live clock and break messages</strong>
        ${liveMessages.length ? liveMessages.map((item) => `
          <div class="mini-item">
            <span>${item.message}<small>${formatDateTime(item.time)}</small></span>
            <span class="quick-actions">
              <span class="pill ${item.type === "Break" ? "blue" : "green"}">${item.type}</span>
              <button class="ghost small-button" type="button" data-delete-activity-message="${activityIdentity(item)}">Delete</button>
            </span>
          </div>
        `).join("") : `<div class="mini-empty">No clock or break messages yet.</div>`}
      </div>
    </div>
  `;

  managerAlertCount.textContent = `${onDuty.length} on duty`;
  managerAlerts.innerHTML = clockedOut.length ? clockedOut.map((person) => `
    <div class="mini-item">
      <span><strong>${person.employeeCode ? `${person.employeeCode} - ` : ""}${person.name}</strong><small>${person.department} - ${person.clockIn || "--:--"} to ${person.clockOut}</small></span>
      <span class="pill green">Done</span>
    </div>
  `).join("") : `<div class="mini-empty">No one has clocked out today yet.</div>`;

  managerApprovals.innerHTML = pendingLeave.length ? pendingLeave.map((request) => {
    const requestMessages = leaveMessagesForRequest(request);
    const threadMessages = decisionMessagesForRequest(request, requestMessages);
    const adminDraft = adminLeaveDrafts[leaveDraftKey(request)] || "";
    return `
    <div class="mini-item approval-item">
      <div class="approval-main">
        <span><strong>${request.name}</strong><small>${leaveRequestTitle(request)} - ${leaveDateRangeLabel(request)} - ${leaveStatusDisplay(request.status)}</small></span>
        ${leaveThreadMessagesMarkup(request, 4, threadMessages)}
        <form class="leave-chat-form quick-chat-form admin-message-box compact-message-box" data-leave-chat="${leaveThreadId(request)}" data-chat-sender="admin">
          <span>Message to employee</span>
          <textarea name="message" data-admin-leave-message="${leaveThreadId(request)}" rows="2" placeholder="Type reply to staff" required>${escapeText(adminDraft)}</textarea>
          <button class="chat-send-button" type="submit">Send chat</button>
        </form>
      </div>
      <span class="quick-actions">
        <button data-action="approve" data-id="${request.id}">Approve</button>
        <button class="reject" data-action="reject" data-id="${request.id}">Reject</button>
      </span>
    </div>
  `;
  }).join("") : `<div class="mini-empty">No pending leave requests.</div>`;
  renderManagerShiftChanges(pendingShiftChanges);

  document.body.dataset.role = currentRole || roleSelect.value;
}

function renderManagerShiftChanges(preparedThreads) {
  if (!managerShiftChanges) return;

  const shiftThreads = preparedThreads || pendingShiftChangeThreads();
  managerShiftChanges.innerHTML = shiftThreads.length
    ? shiftThreads.map(shiftChangeThreadMarkup).join("")
    : `<div class="mini-empty">No shift change requests.</div>`;
}

function pendingShiftChangeThreads() {
  return chatThreadsForAdmin()
    .filter((thread) => thread.isShiftThread)
    .map((thread) => ({
      ...thread,
      messages: thread.messages.filter((message) => !isSilentShiftUpdate(message))
    }))
    .filter((thread) => thread.messages.length && !isShiftThreadConfirmed(thread));
}

function isShiftThreadConfirmed(thread) {
  const latest = thread.messages.at(-1);
  const latestText = `${latest?.label || ""} ${latest?.message || ""}`.toLowerCase();
  return latestText.includes("shift confirmed") || latestText.includes("shift change confirmed");
}

function shiftChangeThreadMarkup(thread) {
  const latest = thread.messages.at(-1);
  const recentMessages = thread.messages.slice(-3);
  return `
    <div class="mini-item approval-item shift-change-item">
      <div class="approval-main">
        <span><strong>${thread.title}</strong><small>${thread.shiftDate ? formatDate(thread.shiftDate) : "Shift discussion"}${latest ? ` - latest ${formatDateTime(latest.time)}` : ""}</small></span>
        ${recentMessages.length ? `
          <div class="thread-message compact-thread-message shift-thread-summary">
            ${recentMessages.map((message) => `
              <span><b>${message.label || "Message"}:</b> ${message.message}</span>
              <small>${formatDateTime(message.time)}</small>
            `).join("")}
          </div>
        ` : ""}
        <form class="leave-chat-form quick-chat-form admin-message-box compact-message-box" data-shift-chat="${thread.key}" data-shift-staff="${thread.staffId || ""}" data-shift-date="${thread.shiftDate || ""}" data-chat-sender="admin">
          <span>Reply to employee</span>
          <textarea name="message" rows="2" placeholder="Type reply about shift change" required></textarea>
          <button class="chat-send-button" type="submit">Send shift reply</button>
        </form>
      </div>
      <span class="quick-actions">
        <button type="button" data-shift-confirm="${thread.key}" data-shift-staff="${thread.staffId || ""}" data-shift-date="${thread.shiftDate || ""}">Confirm</button>
      </span>
    </div>
  `;
}

function updateStaffLoginPasswordHint() {
  if (!staffLoginPassword || !staffLoginCode) return;
  const person = findStaffByLoginCode(staffLoginCode.value);
  if (!staffLoginCode.value.trim()) {
    staffLoginPassword.placeholder = "Enter password";
    if (staffNewPassword) staffNewPassword.placeholder = "First login: choose new password";
    setStaffLoginStatus("Enter employee code. First login uses the temporary password, then choose a new password.", "");
    return;
  }
  if (!person) {
    staffLoginPassword.placeholder = "Enter password";
    if (staffNewPassword) staffNewPassword.placeholder = "New password";
    setStaffLoginStatus("No employee found for this code.", "red");
    return;
  }
  const passwordIsSet = person && hasStaffPassword(person);
  staffLoginPassword.placeholder = passwordIsSet
    ? "Enter saved staff password"
    : "Enter temporary password";
  if (staffNewPassword) {
    staffNewPassword.placeholder = passwordIsSet
      ? "Optional: enter new password to change"
      : "Required: choose new password";
  }
  setStaffLoginStatus(
    passwordIsSet
      ? `${person.name}: enter saved password. To change it, also enter a new password.`
      : `${person.name}: first login uses the temporary password. Enter a new password too.`,
    passwordIsSet ? "blue" : "green"
  );
}

function applyHotelMapImage() {
  if (!map) return;

  const image = localStorage.getItem(hotelMapStorageKey);
  if (image) {
    map.style.backgroundImage = `url("${image}")`;
    map.classList.add("has-image");
  } else {
    map.style.backgroundImage = `url("${defaultHotelMapImage}")`;
    map.classList.add("has-image");
  }

  if (mapFloorSelect) {
    mapFloorSelect.value = localStorage.getItem(mapFloorStorageKey) || "GF";
  }
}

function handleHotelMapUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Please upload an image file for the hotel map.");
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    localStorage.setItem(hotelMapStorageKey, reader.result);
    applyHotelMapImage();
    showToast("Hotel map uploaded for this browser.");
  });
  reader.readAsDataURL(file);
}

async function performLiveCheck() {
  if (!liveCheckStaff || !liveCheckResult) return;

  const person = staff.find((item) => sameId(item.id, liveCheckStaff.value));
  if (!person) {
    liveCheckResult.textContent = "Please select a staff member first.";
    return;
  }

  if (!person.cloudId || !isCloudReady()) {
    liveCheckResult.innerHTML = `<strong>${person.name}</strong><br>Cloud location is not ready for this staff profile yet.`;
    return;
  }

  liveCheckResult.innerHTML = `<strong>${person.name}</strong><br>Checking latest saved GPS ping...`;

  try {
    const ping = await window.staffSyncDb.getLatestLocationPingForStaff(person.cloudId);
    if (!ping) {
      liveCheckResult.innerHTML = `<strong>${person.name}</strong><br>No live GPS ping yet. Once staff has allowed location, the app sends the first ping automatically after clock-in and stops at clock-out.`;
      return;
    }

    person.locationStatus = statusFromLocationPing(ping.location_status);
    person.location = "Latest GPS ping";
    person.ping = `${Math.round(Number(ping.accuracy_meters || 0))}m accuracy`;
    person.lastLatitude = Number(ping.latitude);
    person.lastLongitude = Number(ping.longitude);
    person.gpsAccuracy = Number(ping.accuracy_meters || 0);
    person.floor = ping.floor_label || person.floor || "GF";
    person.zone = ping.zone_label || person.zone || "New Wing";
    saveState();
    renderAll();

    liveCheckResult.innerHTML = `
      <strong>${person.name}</strong><br>
      Latest ping: ${Number(ping.latitude).toFixed(6)}, ${Number(ping.longitude).toFixed(6)}<br>
      Wing / floor: ${staffLocationLabel(person)}<br>
      WiFi AP: ${person.wifiAp ? `${wifiLocationLabel(person)} via ${person.wifiAp}${person.wifiRssi ? ` (${person.wifiRssi})` : ""}` : "Not linked yet"}<br>
      Accuracy: ${Math.round(Number(ping.accuracy_meters || 0))} meters<br>
      Captured: ${formatDateTime(ping.captured_at)}<br>
      <a class="map-link" href="${googleMapsUrl(ping.latitude, ping.longitude)}" target="_blank" rel="noreferrer">Open latest coordinate in Google Maps</a><br>
      Use the uploaded map as a visual guide; exact floor-map plotting needs map calibration.
    `;
    await renderMovementHistory(person);
  } catch (error) {
    liveCheckResult.innerHTML = `<strong>${person.name}</strong><br>${error.message || "Live check could not read the latest GPS ping."}`;
  }
}

async function renderMovementHistory(person) {
  if (!movementList || !person?.cloudId || !isCloudReady()) return;

  const selectedDate = locationHistoryDate?.value || new Date().toISOString().slice(0, 10);
  const since = new Date(`${selectedDate}T00:00:00`);
  const until = new Date(`${selectedDate}T23:59:59`);
  try {
    const pings = await window.staffSyncDb.getRecentLocationPings({
      sinceIso: since.toISOString(),
      untilIso: until.toISOString(),
      limit: 300
    });
    const staffPings = pings
      .filter((ping) => sameId(ping.staff_profile_id, person.cloudId))
      .filter((ping) => !isLocationPingHidden(ping))
      .slice(0, 40);

    movementList.innerHTML = `
      <strong>Saved movement moments for ${formatDate(selectedDate)}</strong>
      ${staffPings.length ? staffPings.map((ping) => `
        <a class="movement-item" href="${googleMapsUrl(ping.latitude, ping.longitude)}" target="_blank" rel="noreferrer">
          <span>${formatDateTime(ping.captured_at)} - ${ping.zone_label || person.zone || "New Wing"} / ${ping.floor_label || person.floor || "GF"}</span>
          <small>${Number(ping.latitude).toFixed(6)}, ${Number(ping.longitude).toFixed(6)} - ${Math.round(Number(ping.accuracy_meters || 0))}m</small>
        </a>
      `).join("") : `<div class="mini-empty">No saved movement pings for this date.</div>`}
    `;
  } catch {
    movementList.innerHTML = `<div class="mini-empty">Movement history is not available right now.</div>`;
  }
}

async function deleteSelectedLocationHistory() {
  if (!liveCheckStaff || !locationHistoryDate) return;
  const person = staff.find((item) => sameId(item.id, liveCheckStaff.value));
  const selectedDate = locationHistoryDate.value || new Date().toISOString().slice(0, 10);
  if (!person?.cloudId || !isCloudReady()) {
    showToast("Cloud location history is not ready for this staff member.");
    return;
  }

  const since = new Date(`${selectedDate}T00:00:00`);
  const until = new Date(`${selectedDate}T23:59:59`);
  let deletedInCloud = false;
  try {
    await window.staffSyncDb.deleteLocationPingsForStaffDate({
      staffProfileId: person.cloudId,
      sinceIso: since.toISOString(),
      untilIso: until.toISOString()
    });
    deletedInCloud = true;
  } catch {
    try {
      const pings = await window.staffSyncDb.getRecentLocationPings({
        sinceIso: since.toISOString(),
        untilIso: until.toISOString(),
        limit: 500
      });
      hideLocationPings(pings.filter((ping) => sameId(ping.staff_profile_id, person.cloudId)));
    } catch {
      // Keep the UI clear even if the cloud history cannot be read right now.
    }
  }

  movementList.innerHTML = `<div class="mini-empty">Location history cleared for ${person.name} on ${formatDate(selectedDate)}.</div>`;
  liveCheckResult.innerHTML = `<strong>${person.name}</strong><br>Location history cleared for ${formatDate(selectedDate)}.`;
  showToast(deletedInCloud ? "Location history deleted from cloud." : "Location history hidden here. Run the SQL upgrade if cloud delete is blocked.");
}

function handleWifiLocationSave(event) {
  event.preventDefault();
  const matchedDevice = findRegisteredDevice(wifiMac.value);
  const selectedStaffId = matchedDevice?.staffId || wifiStaff.value;
  const person = staff.find((item) => sameId(item.id, selectedStaffId));
  if (!person) {
    showToast("Choose a staff member first.");
    return;
  }

  const mapped = inferLocationFromApName(wifiAp.value.trim());
  person.wifiMac = wifiMac.value.trim();
  person.wifiDeviceName = matchedDevice?.deviceName || person.wifiDeviceName || "";
  person.wifiAp = wifiAp.value.trim();
  person.wifiRssi = wifiRssi.value.trim();
  person.wifiLastSeen = wifiLastSeen.value.trim();
  person.wifiFloor = mapped.floor;
  person.wifiZone = mapped.zone;
  person.floor = mapped.floor || person.floor || "GF";
  person.zone = mapped.zone || person.zone || "New Wing";
  Object.assign(person, wingFloorPinPosition(person.zone, person.floor));
  person.location = wifiLocationLabel(person);
  person.locationStatus = "Inside";

  addActivity("WiFi", `${person.name} linked to ${person.wifiAp || "EnGenius AP"} (${wifiLocationLabel(person)})`);
  saveState();
  renderAll();
  showToast(`${person.name} WiFi location saved as ${wifiLocationLabel(person)}.`);
}

async function syncEnGeniusClients() {
  if (!engeniusSyncStatus) return;
  engeniusSync.disabled = true;
  engeniusSyncStatus.textContent = "Checking EnGenius private bridge...";

  try {
    const response = await fetch("/.netlify/functions/engenius-clients", {
      headers: { "accept": "application/json" }
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || payload.error || "EnGenius sync is not configured yet.");
    }

    const clients = Array.isArray(payload.clients) ? payload.clients : [];
    const matched = applyEnGeniusClients(clients);
    saveState();
    renderAll();
    engeniusSyncStatus.textContent = `${matched} staff device${matched === 1 ? "" : "s"} matched from ${clients.length} EnGenius client${clients.length === 1 ? "" : "s"}.`;
    showToast("EnGenius clients synced.");
  } catch (error) {
    engeniusSyncStatus.textContent = error.message || "EnGenius sync could not run.";
    showToast("EnGenius sync needs private bridge setup.");
  } finally {
    engeniusSync.disabled = false;
  }
}

function applyEnGeniusClients(clients) {
  let matched = 0;
  clients.forEach((client) => {
    const mac = normalizeMac(client.mac || client.macAddress || client.clientMac);
    const device = findRegisteredDevice(mac);
    if (!device) return;

    const person = staff.find((item) => sameId(item.id, device.staffId));
    if (!person) return;

    const apName = client.apName || client.lastAssociatedAp || client.last_asso_ap || client.ap || "";
    const mapped = inferLocationFromApName(apName);
    person.wifiMac = mac;
    person.wifiDeviceName = device.deviceName || client.name || client.hostname || "";
    person.wifiAp = apName;
    person.wifiRssi = client.rssi ? `${client.rssi} dBm` : client.rssiText || "";
    person.wifiLastSeen = client.lastSeen || client.last_seen || "now";
    person.wifiFloor = mapped.floor;
    person.wifiZone = mapped.zone;
    person.floor = mapped.floor || person.floor || "GF";
    person.zone = mapped.zone || person.zone || "New Wing";
    Object.assign(person, wingFloorPinPosition(person.zone, person.floor));
    person.location = wifiLocationLabel(person);
    person.locationStatus = "Inside";
    matched += 1;
  });
  return matched;
}

function fillWifiLocationForm() {
  if (!wifiStaff) return;
  const person = staff.find((item) => sameId(item.id, wifiStaff.value));
  if (!person) return;

  const registered = staffDevices.find((device) => sameId(device.staffId, person.id));
  wifiMac.value = person.wifiMac || registered?.mac || "";
  wifiAp.value = person.wifiAp || "";
  wifiRssi.value = person.wifiRssi || "";
  wifiLastSeen.value = person.wifiLastSeen || "";
}

function handleStaffDeviceSave(event) {
  event.preventDefault();
  const staffId = deviceStaff.value;
  const mac = normalizeMac(deviceMac.value);
  if (!staffId || !mac) {
    showToast("Choose staff and enter device MAC.");
    return;
  }

  const existingIndex = staffDevices.findIndex((device) => normalizeMac(device.mac) === mac || sameId(device.staffId, staffId));
  const record = {
    id: existingIndex >= 0 ? staffDevices[existingIndex].id : `device-${Date.now()}`,
    staffId,
    deviceName: deviceName.value.trim(),
    mac,
    createdAt: new Date().toISOString()
  };

  if (existingIndex >= 0) staffDevices[existingIndex] = record;
  else staffDevices = [record, ...staffDevices];

  const person = staff.find((item) => sameId(item.id, staffId));
  if (person) {
    person.wifiMac = mac;
    person.wifiDeviceName = record.deviceName;
  }

  staffDeviceForm.reset();
  deviceStaff.value = String(activeStaffId);
  saveState();
  renderAll();
  showToast("Staff device saved.");
}

function handleApMapSave(event) {
  event.preventDefault();
  const apName = apMapName.value.trim();
  const zone = normalizeWing(apMapZone.value);
  if (!apName || !zone) {
    showToast("Enter AP name and wing.");
    return;
  }

  const existingIndex = apLocationMap.findIndex((item) => normalizeApName(item.apName) === normalizeApName(apName));
  const record = {
    id: existingIndex >= 0 ? apLocationMap[existingIndex].id : `ap-${Date.now()}`,
    apName,
    floor: apMapFloor.value,
    zone
  };

  if (existingIndex >= 0) apLocationMap[existingIndex] = record;
  else apLocationMap = [record, ...apLocationMap];

  apMapForm.reset();
  apMapFloor.value = "GF";
  apMapZone.value = "New Wing";
  saveState();
  renderAll();
  showToast("AP location map saved.");
}

function handleStaffDeviceListClick(event) {
  const button = event.target.closest("button[data-delete-device]");
  if (!button) return;

  staffDevices = staffDevices.filter((device) => !sameId(device.id, button.dataset.deleteDevice));
  saveState();
  renderAll();
  showToast("Staff device removed.");
}

function handleApMapListClick(event) {
  const button = event.target.closest("button[data-delete-ap-map]");
  if (!button) return;

  apLocationMap = apLocationMap.filter((record) => !sameId(record.id, button.dataset.deleteApMap));
  saveState();
  renderAll();
  showToast("AP map removed.");
}

function renderStaffDevices() {
  if (!staffDeviceList) return;

  staffDeviceList.innerHTML = staffDevices.length ? staffDevices.map((device) => {
    const person = staff.find((item) => sameId(item.id, device.staffId));
    return `
      <div class="mini-item">
        <span><strong>${person?.name || "Unknown staff"}</strong><small>${device.deviceName || "Device"} - ${device.mac}</small></span>
        <button class="ghost danger" data-delete-device="${device.id}" type="button">Remove</button>
      </div>
    `;
  }).join("") : `<div class="mini-empty">No staff devices registered yet.</div>`;
}

function renderApLocationMap() {
  if (!apMapList) return;

  apMapList.innerHTML = apLocationMap.length ? apLocationMap.map((record) => `
    <div class="mini-item">
      <span><strong>${record.apName}</strong><small>${record.floor} - ${record.zone}</small></span>
      <button class="ghost danger" data-delete-ap-map="${record.id}" type="button">Remove</button>
    </div>
  `).join("") : `<div class="mini-empty">No AP locations mapped yet.</div>`;
}

function inferLocationFromApName(apName) {
  const mappedAp = apLocationMap.find((record) => normalizeApName(record.apName) === normalizeApName(apName));
  if (mappedAp) {
    return { floor: mappedAp.floor, zone: mappedAp.zone };
  }

  const value = apName.toLowerCase();
  let floor = "GF";
  let zone = "";

  if (value.includes("3") && (value.includes("floor") || value.includes("3f") || value.includes("3rd"))) floor = "3F";
  else if (value.includes("2") && (value.includes("floor") || value.includes("2f") || value.includes("2nd"))) floor = "2F";
  else if (value.includes("1") && (value.includes("floor") || value.includes("1f") || value.includes("1st") || value.includes("st-floor"))) floor = "1F";
  else if (value.includes("gf") || value.includes("ground")) floor = "GF";

  if (value.includes("old")) zone = "Old Wing";
  else zone = "New Wing";

  return { floor, zone };
}

function wifiLocationLabel(person) {
  return `${person.wifiZone || person.zone || "New Wing"} - ${person.wifiFloor || person.floor || "GF"}`;
}

function normalizeMac(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeApName(value) {
  return String(value || "").trim().toLowerCase().replaceAll(" ", "_");
}

function findRegisteredDevice(mac) {
  const cleanMac = normalizeMac(mac);
  if (!cleanMac) return null;
  return staffDevices.find((device) => normalizeMac(device.mac) === cleanMac);
}

function upsertStaffWifiDevice(person, mac) {
  const cleanMac = normalizeMac(mac);
  if (!person || !cleanMac) return;
  const existingIndex = staffDevices.findIndex((device) =>
    normalizeMac(device.mac) === cleanMac || sameId(device.staffId, person.id)
  );
  const record = {
    id: existingIndex >= 0 ? staffDevices[existingIndex].id : `device-${Date.now()}`,
    staffId: person.id,
    deviceName: person.wifiDeviceName || `${person.name} phone`,
    mac: cleanMac,
    createdAt: existingIndex >= 0 ? staffDevices[existingIndex].createdAt : new Date().toISOString()
  };

  if (existingIndex >= 0) staffDevices[existingIndex] = record;
  else staffDevices = [record, ...staffDevices];
}

function bindEvents() {
  window.addEventListener("hashchange", applyPageFromHash);
  pageLinks.forEach((link) => {
    link.addEventListener("click", () => {
      window.setTimeout(applyPageFromHash, 0);
    });
  });

  departmentFilter.addEventListener("change", renderStaffTable);
  roleSelect.addEventListener("change", () => {
    if (currentRole === "staff") {
      lockStaffOnlyView();
      showToast("Staff login cannot open admin or manager view.");
      renderAll();
      return;
    }
    currentRole = roleSelect.value;
    sessionStorage.setItem("staffsync.role", currentRole);
    addActivity("Role", `${titleCase(currentRole)} view selected`);
    saveState();
    renderAll();
  });

  loginScreen.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-login-role]");
    if (!button) return;

    openDemoRole(button.dataset.loginRole);
  });

  loginRoleSelect?.addEventListener("change", updateLoginMode);
  loginSubmit?.addEventListener("click", handleUnifiedLogin);
  staffLoginCode?.addEventListener("input", updateStaffLoginPasswordHint);
  staffLoginCode?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      staffLoginPassword?.focus();
    }
  });
  staffLoginPassword?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleUnifiedLogin();
    }
  });
  cloudEmail?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      cloudPassword?.focus();
    }
  });
  cloudPassword?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleUnifiedLogin();
    }
  });

  document.querySelector("#logout-demo").addEventListener("click", async () => {
    addActivity("Login", `${titleCase(currentRole)} logged out`);
    saveState();
    if (isCloudReady()) {
      try {
        await window.staffSyncDb.signOut();
      } catch {
        // Keep logout local if the browser is offline.
      }
    }
    currentRole = "";
    currentCloudEmail = "";
    currentAppUserId = "";
    sessionStorage.removeItem("staffsync.role");
    sessionStorage.removeItem("staffsync.cloudEmail");
    sessionStorage.removeItem("staffsync.appUserId");
    stopLocationMonitoring();
    stopCloudAutoRefresh();
    stopLeaveLiveRefresh();
    renderSession();
    showToast("Logged out of the demo.");
  });

  staffSwitcher.addEventListener("change", () => {
    if (currentRole === "staff") {
      staffSwitcher.value = String(activeStaffId);
      showToast("Staff login is locked to the signed-in employee.");
      return;
    }
    activeStaffId = staffSwitcher.value;
    rememberActiveStaff();
    editStaffSelect.value = "";
    if (liveCheckStaff) liveCheckStaff.value = staffSwitcher.value;
    clearEditStaffForm();
    renderRoleDemo();
  });

  editStaffSelect.addEventListener("change", () => {
    if (!editStaffSelect.value) {
      clearEditStaffForm();
      return;
    }
    activeStaffId = editStaffSelect.value;
    rememberActiveStaff();
    staffSwitcher.value = editStaffSelect.value;
    if (liveCheckStaff) liveCheckStaff.value = editStaffSelect.value;
    fillEditStaffForm();
    renderRoleDemo();
  });

  if (hotelMapUpload) {
    hotelMapUpload.addEventListener("change", handleHotelMapUpload);
  }

  if (clearHotelMap) {
    clearHotelMap.addEventListener("click", () => {
      localStorage.removeItem(hotelMapStorageKey);
      applyHotelMapImage();
      showToast("Custom map cleared. Default hotel sketch is showing.");
    });
  }

  if (mapFloorSelect) {
    mapFloorSelect.addEventListener("change", () => {
      localStorage.setItem(mapFloorStorageKey, mapFloorSelect.value);
      renderMapPins();
      showToast(`${mapFloorSelect.value} floor view selected.`);
    });
  }

  if (liveCheckButton) {
    liveCheckButton.addEventListener("click", performLiveCheck);
  }

  if (locationHistoryDate) {
    locationHistoryDate.addEventListener("change", () => {
      const person = staff.find((item) => sameId(item.id, liveCheckStaff?.value));
      if (person) renderMovementHistory(person);
    });
  }

  if (clearLocationHistory) {
    clearLocationHistory.addEventListener("click", deleteSelectedLocationHistory);
  }

  if (wifiLocationForm) {
    wifiLocationForm.addEventListener("submit", handleWifiLocationSave);
    wifiStaff.addEventListener("change", fillWifiLocationForm);
  }

  if (engeniusSync) {
    engeniusSync.addEventListener("click", syncEnGeniusClients);
  }

  if (staffDeviceForm) {
    staffDeviceForm.addEventListener("submit", handleStaffDeviceSave);
  }

  if (apMapForm) {
    apMapForm.addEventListener("submit", handleApMapSave);
  }

  if (staffDeviceList) {
    staffDeviceList.addEventListener("click", handleStaffDeviceListClick);
  }

  if (apMapList) {
    apMapList.addEventListener("click", handleApMapListClick);
  }

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest(".request-actions button, .quick-actions button");
    if (actionButton) actionButton.classList.add("action-success");
  });

  staffCard.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-staff-action]");
    if (!button) return;

    const activeStaff = staff.find((person) => sameId(person.id, activeStaffId));
    if (button.dataset.staffAction === "clock") {
      try {
        await toggleClock(activeStaff);
      } catch (error) {
        showToast(error.message || "Clock action could not be saved.");
      }
    }

    if (button.dataset.staffAction === "break") {
      await toggleBreak(activeStaff);
    }

    if (button.dataset.staffAction === "leave") {
      roleSelect.value = "staff";
      leaveStaff.value = String(activeStaff.id);
      window.location.hash = "leave";
      applyPageFromHash();
      document.querySelector("#leave").scrollIntoView({ behavior: "smooth", block: "start" });
      document.querySelector("#leave-reason").focus({ preventScroll: true });
      showToast("Leave form is ready for the selected staff member.");
    }

    if (button.dataset.staffAction === "clear-chat") {
      await clearStaffChatHistory(activeStaff);
      showToast("Your chat history was deleted.");
    }

    renderAll();
  });

  staffCard.addEventListener("click", handleChatHistoryClick);
  staffCard.addEventListener("click", handleStaffLeaveCancelClick);
  staffCard.addEventListener("change", (event) => {
    const adminDate = event.target.closest("input[data-admin-dashboard-date]");
    if (adminDate) {
      adminDashboardDate = adminDate.value || new Date().toISOString().slice(0, 10);
      localStorage.setItem("staffsync.adminDashboardDate", adminDashboardDate);
      renderRoleDemo();
      return;
    }

    const floorSelect = event.target.closest("select[data-staff-floor]");
    const zoneSelect = event.target.closest("select[data-staff-zone]");
    if (!floorSelect && !zoneSelect) return;

    const activeStaff = staff.find((person) => sameId(person.id, activeStaffId));
    if (!activeStaff) return;
    if (floorSelect) activeStaff.floor = floorSelect.value;
    if (zoneSelect) activeStaff.zone = zoneSelect.value;
    Object.assign(activeStaff, wingFloorPinPosition(activeStaff.zone, activeStaff.floor));
    activeStaff.location = staffLocationLabel(activeStaff);
    saveState();
    renderAll();
    showToast(`${activeStaff.name} location set to ${staffLocationLabel(activeStaff)}.`);
  });

  leaveForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = event.submitter;
    submitButton?.classList.add("action-success");
    const selectedStaff = currentRole === "staff"
      ? staff.find((person) => sameId(person.id, activeStaffId))
      : staff.find((person) => sameId(person.id, leaveStaff.value));
    const leaveTypeName = document.querySelector("#leave-type").value;
    syncLeaveDateFields();
    const duration = document.querySelector("#leave-duration").value;
    const startDate = document.querySelector("#leave-from").value;
    const endDate = ["half", "short"].includes(duration)
      ? startDate
      : document.querySelector("#leave-to").value;
    const reason = document.querySelector("#leave-reason").value.trim();

    if (!selectedStaff) {
      showToast("Please choose a staff member first.");
      return;
    }

    const requestedDays = leaveRequestUnits({ from: startDate, to: endDate, duration });
    if (!requestedDays) {
      leavePolicyNote.textContent = "Check the dates. The end date must be the same day or after the start date.";
      showToast("Please check the leave dates.");
      return;
    }

    const balanceCheck = monthlyLeaveRequestAvailability(selectedStaff, { from: startDate, to: endDate, duration });
    if (!balanceCheck.ok) {
      leavePolicyNote.textContent = `This request needs ${formatLeaveUnits(balanceCheck.required)} leave day${balanceCheck.required === 1 ? "" : "s"} in ${balanceCheck.monthLabel}, but ${selectedStaff.name} has ${formatLeaveUnits(balanceCheck.available)} left for that month.`;
      showToast("Leave request is more than the remaining balance.");
      return;
    }

    if (leaveNeedsReason(startDate) && !reason) {
      leavePolicyNote.textContent = "Reason is required because this leave starts within 2 days.";
      showToast("Please add a reason for short-notice leave.");
      return;
    }

    const request = {
      id: Date.now(),
      staffId: selectedStaff.id,
      staffProfileId: selectedStaff.cloudId || selectedStaff.id,
      name: selectedStaff.name,
      department: selectedStaff.department,
      type: leaveTypeName,
      duration,
      from: startDate,
      to: endDate,
      reason,
      status: "Pending"
    };

    try {
      if (selectedStaff.cloudId && isCloudReady()) {
        if (!leaveTypes.length) {
          leaveTypes = await window.staffSyncDb.getLeaveTypes((window.STAFFSYNC_ENV || {}).HOTEL_ID);
        }
        const leaveType = findLeaveType(leaveTypeName);
        const cloudRequest = await window.staffSyncDb.createLeaveRequest({
          staffProfileId: selectedStaff.cloudId,
          leaveTypeId: leaveType?.id || null,
          startDate,
          endDate,
          reason: encodeLeaveReason(reason, duration)
        });
        request.id = cloudRequest.id;
        request.cloudId = cloudRequest.id;
      }

      leaveRequests = [request, ...leaveRequests];
      addActivity("Leave", `${request.name} requested ${leaveRequestTitle(request)}`);
      saveState();
      leaveForm.reset();
      document.querySelector("#leave-duration").value = "full";
      document.querySelector("#leave-to").disabled = false;
      syncLeaveDateFields();
      setStaffActionNotice(`${leaveRequestTitle(request)} request sent for ${leaveDateRangeLabel(request)}. Waiting for admin answer.`);
      renderAll();
      showToast(selectedStaff.cloudId && isCloudReady()
        ? "Leave request sent to admin."
        : "Leave request saved on this phone. Cloud login is needed for admin to receive it.");
      if (isCloudReady()) {
        await refreshLiveLeaveOnly(true);
        syncCloudDashboard();
      }
    } catch (error) {
      showToast(error.message || "Leave request could not be saved.");
    }
  });

  leaveList.addEventListener("click", handleApprovalClick);
  leaveList.addEventListener("click", handleStaffLeaveCancelClick);
  leaveList.addEventListener("click", handleChatHistoryClick);
  leaveList.addEventListener("submit", handleLeaveChangeSubmit);
  leaveList.addEventListener("submit", handleLeaveChatSubmit);
  staffCard.addEventListener("submit", handleLeaveChatSubmit);
  shiftCalendar?.addEventListener("submit", handleShiftChatSubmit);
  shiftCalendar?.addEventListener("toggle", handleShiftChatToggle, true);
  managerApprovals.addEventListener("click", handleApprovalClick);
  managerApprovals.addEventListener("click", handleChatHistoryClick);
  managerApprovals.addEventListener("submit", handleLeaveChatSubmit);
  managerApprovals.addEventListener("submit", handleShiftChatSubmit);
  managerApprovals.addEventListener("input", handleAdminLeaveDraftInput);
  managerShiftChanges?.addEventListener("click", handleShiftChangeClick);
  managerShiftChanges?.addEventListener("submit", handleShiftChatSubmit);
  document.addEventListener("focusin", protectTypingFromAutoRender, true);
  document.addEventListener("pointerdown", protectTypingFromAutoRender, true);
  document.addEventListener("touchstart", protectTypingFromAutoRender, true);
  document.addEventListener("input", protectTypingFromAutoRender, true);
  document.addEventListener("keydown", protectTypingFromAutoRender, true);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      if (!shouldPauseAutoRender()) {
        syncCloudDashboard();
        refreshLiveLeaveOnly();
      }
    }
  });
  window.addEventListener("focus", () => {
    if (!shouldPauseAutoRender()) {
      syncCloudDashboard();
      refreshLiveLeaveOnly();
    }
  });
  window.addEventListener("online", () => {
    syncCloudDashboard();
    refreshLiveLeaveOnly();
  });

  document.querySelector("#leave-from").addEventListener("change", () => {
    syncLeaveDateFields();
    updateLeavePolicyNote();
  });
  document.querySelector("#leave-to").addEventListener("change", updateLeavePolicyNote);
  document.querySelector("#leave-duration").addEventListener("change", () => {
    syncLeaveDateFields();
    updateLeavePolicyNote();
  });
  leaveStaff.addEventListener("change", updateLeavePolicyNote);
  coverageDate.addEventListener("change", renderLeaveCoverage);
  if (leavePressureDate) leavePressureDate.addEventListener("change", renderLeavePressure);
  if (leavePressureThreshold) leavePressureThreshold.addEventListener("change", renderLeavePressure);
  if (managerBoardDate) managerBoardDate.addEventListener("change", renderManagerBoard);
  attendanceReportDate.addEventListener("change", loadAttendanceReportForSelectedDate);
  attendanceReportPeriod.addEventListener("change", loadAttendanceReportForSelectedDate);

  staffForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const employeeCode = cleanEmployeeCode(document.querySelector("#new-staff-code").value);
    const name = document.querySelector("#new-staff-name").value.trim();
    const department = document.querySelector("#new-staff-department").value;
    const role = document.querySelector("#new-staff-role").value.trim();
    const shift = document.querySelector("#new-staff-shift").value;
    const leaveBalance = Number(document.querySelector("#new-staff-leave").value);
    const phoneWifiMac = normalizeMac(document.querySelector("#new-staff-phone").value);

    if (!employeeCode) {
      showToast("Enter the employee code first.");
      return;
    }

    if (employeeCodeExists(employeeCode)) {
      showToast(`Employee code ${employeeCode} is already used.`);
      return;
    }

    let cloudId = "";
    if (isCloudReady() && currentCloudEmail) {
      try {
        const cloudProfile = await window.staffSyncDb.createStaffProfile({
          hotelId: (window.STAFFSYNC_ENV || {}).HOTEL_ID,
          employeeCode,
          fullName: name,
          department,
          jobTitle: role,
          leaveBalance,
          shift,
          phone: phoneWifiMac
        });
        cloudId = cloudProfile.id;
      } catch (error) {
        showToast(error.message || "Staff could not be saved to cloud.");
        return;
      }
    }

    const newStaff = {
      id: cloudId || Date.now(),
      cloudId,
      employeeCode,
      name,
      department,
      role,
      wifiMac: phoneWifiMac,
      shift,
      shiftTime: shiftTimeFor(shift),
      clockIn: "",
      clockOut: "",
      status: "Scheduled",
      location: "Not active",
      locationStatus: "Inactive",
      floor: "GF",
      zone: "New Wing",
      ping: "-",
      x: 50,
      y: 50,
      leaveBalance
    };

    staff = sortStaffByEmployeeCode([...staff, newStaff]);
    upsertStaffWifiDevice(newStaff, phoneWifiMac);
    activeStaffId = newStaff.id;
    rememberActiveStaff();
    addActivity("Staff", `${newStaff.name} added to ${newStaff.department}`);
    staffForm.reset();
    document.querySelector("#new-staff-leave").value = "6";
    document.querySelector("#new-staff-phone").value = "";
    document.querySelector("#new-staff-code").value = nextEmployeeCode();
    populateFilters();
    saveState();
    renderAll();
    showToast(cloudId
      ? `${newStaff.name} was added and saved to cloud.`
      : `${newStaff.name} was added in this browser. Sign in as admin to save to cloud.`);
  });

  staffDirectory.addEventListener("click", async (event) => {
    const editButton = event.target.closest("button[data-edit-staff]");
    if (editButton) {
      activeStaffId = editButton.dataset.editStaff;
      rememberActiveStaff();
      editStaffSelect.value = activeStaffId;
      staffSwitcher.value = activeStaffId;
      fillEditStaffForm();
      window.location.hash = "staff";
      applyPageFromHash();
      document.querySelector("#edit-staff").scrollIntoView({ behavior: "smooth", block: "start" });
      showToast("Staff edit form is ready.");
      return;
    }

    const button = event.target.closest("button[data-delete-staff]");
    if (!button) return;

    const staffId = button.dataset.deleteStaff;
    const person = staff.find((item) => sameId(item.id, staffId));
    if (staff.length === 1) {
      showToast("Keep at least one staff member in the demo.");
      return;
    }

    try {
      if (person.cloudId && isCloudReady()) {
        await window.staffSyncDb.deactivateStaffProfile({
          staffProfileId: person.cloudId,
          employeeCode: person.employeeCode
        });
      }
      clearStaffPassword(person);
      staff = sortStaffByEmployeeCode(staff.filter((item) => !sameId(item.id, staffId)));
      leaveRequests = leaveRequests.filter((request) => !sameId(request.staffId, staffId));
      activeStaffId = staff[0]?.id || "";
      rememberActiveStaff();
      addActivity("Staff", `${person.name} removed from directory`);
      populateFilters();
      saveState();
      renderAll();
      showToast(person.cloudId && isCloudReady()
        ? `${person.name} was removed from cloud and this dashboard.`
        : `${person.name} was removed from this dashboard.`);
    } catch (error) {
      showToast(error.message || "Staff could not be removed from cloud.");
    }
  });

  editStaffForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const person = staff.find((item) => sameId(item.id, editStaffSelect.value));
    if (!person) {
      showToast("Choose a staff member first.");
      return;
    }

    const updates = {
      employeeCode: cleanEmployeeCode(document.querySelector("#edit-staff-code").value),
      fullName: document.querySelector("#edit-staff-name").value.trim(),
      department: document.querySelector("#edit-staff-department").value.trim(),
      jobTitle: document.querySelector("#edit-staff-role").value.trim(),
      leaveBalance: Number(document.querySelector("#edit-staff-leave").value),
      shift: document.querySelector("#edit-staff-shift").value.trim(),
      phoneWifiMac: normalizeMac(document.querySelector("#edit-staff-phone").value)
    };

    if (!updates.employeeCode) {
      showToast("Employee code is required.");
      return;
    }

    if (employeeCodeExists(updates.employeeCode, person.id)) {
      showToast(`Employee code ${updates.employeeCode} is already used.`);
      return;
    }

    try {
      const oldPasswordKey = staffPasswordKey(person);
      const oldPasswordValue = staffPasswords[oldPasswordKey];

      if (person.cloudId && isCloudReady()) {
        await window.staffSyncDb.updateStaffProfile({
          staffProfileId: person.cloudId,
          hotelId: (window.STAFFSYNC_ENV || {}).HOTEL_ID,
          ...updates,
          phone: updates.phoneWifiMac
        });
      }

      person.employeeCode = updates.employeeCode;
      person.name = updates.fullName;
      person.department = updates.department;
      person.role = updates.jobTitle;
      person.wifiMac = updates.phoneWifiMac;
      upsertStaffWifiDevice(person, updates.phoneWifiMac);
      person.leaveBalance = updates.leaveBalance;
      person.shift = updates.shift;
      person.shiftTime = shiftTimeFor(updates.shift);
      const newPasswordKey = staffPasswordKey(person);
      if (oldPasswordValue && oldPasswordKey !== newPasswordKey) {
        staffPasswords[newPasswordKey] = oldPasswordValue;
        delete staffPasswords[oldPasswordKey];
      }
      const newPassword = document.querySelector("#edit-staff-password").value;
      if (document.querySelector("#clear-staff-password").checked) {
        clearStaffPassword(person);
        if (person.cloudId && isCloudReady()) {
          await window.staffSyncDb.clearStaffLoginPassword(person.cloudId);
        }
      } else if (newPassword) {
        saveStaffPassword(person, newPassword);
        if (person.cloudId && isCloudReady()) {
          await saveCloudStaffPassword(person, newPassword);
        }
      }

      addActivity("Staff", `${person.name} details updated`);
      staff = sortStaffByEmployeeCode(staff);
      saveState();
      populateFilters();
      renderAll();
      editStaffNote.textContent = person.cloudId && isCloudReady()
        ? "Saved to Supabase and refreshed locally."
        : "Saved in this browser demo.";
      showToast(`${person.name} was updated.`);
    } catch (error) {
      editStaffNote.textContent = error.message || "Could not save staff changes.";
      showToast("Staff edit could not be saved.");
    }
  });

  shiftForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const person = staff.find((item) => sameId(item.id, shiftStaff.value));
    const repeatDates = selectedShiftRepeatDates();
    if (!repeatDates.length) {
      showToast("Choose at least one date.");
      return;
    }

    const shift = shiftValue.value.trim();
    const secondShift = optionalShiftPart("2");
    const thirdShift = optionalShiftPart("3");
    const plan = {
      id: shiftPlanId.value || `shift-${Date.now()}`,
      staffId: person.id,
      shift,
      inTime: shiftInTime.value,
      outTime: shiftOutTime.value,
      effectiveDate: shiftEffectiveDate.value,
      repeatDates,
      repeatDays: repeatDates,
      shift2: secondShift.shift,
      inTime2: secondShift.inTime,
      outTime2: secondShift.outTime,
      shift3: thirdShift.shift,
      inTime3: thirdShift.inTime,
      outTime3: thirdShift.outTime
    };

    const existingIndex = shiftPlans.findIndex((item) => sameId(item.id, plan.id));
    if (existingIndex >= 0) {
      shiftPlans[existingIndex] = plan;
    } else {
      shiftPlans = [plan, ...shiftPlans];
    }

    person.shift = shift;
    person.shiftTime = `${plan.inTime} - ${plan.outTime}`;

    if (shift === "Weekly off") {
      person.clockIn = "";
      person.clockOut = "";
      person.status = "Off duty";
      person.location = "Not active";
      person.locationStatus = "Inactive";
      person.ping = "-";
    }

    applyShiftPlanToDailyRosters(person, plan);
    addActivity("Shift", `${person.name} shift plan saved: ${shift} ${plan.inTime}-${plan.outTime} on ${repeatDates.map((date) => date.slice(8, 10)).join(", ")}`);
    saveState();
    try {
      if (isCloudReady()) {
        for (const dateValue of repeatDates) {
          await saveDailyRosterToCloud(dateValue);
        }
        await syncCloudDashboard();
      }
      clearShiftPlannerForm();
      renderAll();
      showToast(`${person.name}'s shift plan saved and sent to staff dashboard.`);
    } catch (error) {
      clearShiftPlannerForm();
      renderAll();
      showToast(error.message || `${person.name}'s shift was saved here, but cloud push failed.`);
    }
  });
  shiftEffectiveDate?.addEventListener("change", () => {
    renderShiftRepeatDateChoices();
    setShiftRepeatDays([shiftEffectiveDate.value]);
  });

  dailyRosterDate?.addEventListener("change", renderDailyRoster);
  shiftCalendarStart?.addEventListener("change", renderShiftCalendar);
  shiftCalendarToday?.addEventListener("click", () => {
    shiftCalendarStart.value = todayLocalKey();
    renderShiftCalendar();
  });

  shiftImportFile?.addEventListener("change", async () => {
    const file = shiftImportFile.files?.[0];
    if (!file) return;
    shiftImportText.value = await file.text();
    if (shiftImportResult) shiftImportResult.textContent = `${file.name} loaded. Click Import shift rows to update the roster.`;
  });

  importShiftRowsButton?.addEventListener("click", async () => {
    const text = shiftImportText?.value || "";
    if (!text.trim()) {
      showToast("Paste shift rows or upload a file first.");
      return;
    }

    importShiftRowsButton.classList.add("action-success");
    importShiftRowsButton.disabled = true;
    try {
      const result = await importShiftRows(text);
      saveState();
      renderAll();
      const message = `${result.updated} shift row${result.updated === 1 ? "" : "s"} imported. ${result.skipped} skipped.`;
      if (shiftImportResult) shiftImportResult.textContent = message;
      showToast(message);
    } catch (error) {
      showToast(error.message || "Shift rows could not be imported.");
    } finally {
      importShiftRowsButton.classList.remove("action-success");
      importShiftRowsButton.disabled = false;
    }
  });

  saveDailyRoster?.addEventListener("click", async () => {
    const saved = saveDailyRosterFromTable(dailyRosterDate.value);
    try {
      await saveDailyRosterToCloud(dailyRosterDate.value);
      await notifyDailyRosterSaved(dailyRosterDate.value);
      saveState();
      renderAll();
      addActivity("Roster", `Daily roster saved for ${formatDate(dailyRosterDate.value)}`);
      showToast(`${saved} roster row${saved === 1 ? "" : "s"} saved${isCloudReady() ? " to cloud" : ""} for ${formatDate(dailyRosterDate.value)}.`);
    } catch (error) {
      saveState();
      showToast(error.message || "Roster saved locally, but cloud save failed.");
    }
  });

  copyTodayRoster?.addEventListener("click", async () => {
    const days = Math.max(1, Number(rosterCopyDays?.value || 1));
    saveDailyRosterFromTable(new Date().toISOString().slice(0, 10));
    const copied = copyTodayRosterForward(days);
    try {
      await saveDailyRosterRangeToCloud(days);
      await notifyDailyRosterRangeSaved(days);
      saveState();
      renderAll();
      addActivity("Roster", `Today's roster extended for ${copied} day${copied === 1 ? "" : "s"}`);
      showToast(`Today's roster extended for ${copied} day${copied === 1 ? "" : "s"}${isCloudReady() ? " and saved to cloud" : ""}.`);
    } catch (error) {
      saveState();
      showToast(error.message || "Roster copied locally, but cloud save failed.");
    }
  });

  clearDailyRoster?.addEventListener("click", async () => {
    if (!dailyRosterDate?.value) return;
    delete dailyRosters[dailyRosterDate.value];
    try {
      await deleteDailyRosterFromCloud(dailyRosterDate.value);
      saveState();
      renderAll();
      addActivity("Roster", `Daily roster cleared for ${formatDate(dailyRosterDate.value)}`);
      showToast(`Roster changes cleared for ${formatDate(dailyRosterDate.value)}.`);
    } catch (error) {
      saveState();
      renderAll();
      showToast(error.message || "Roster cleared locally, but cloud clear failed.");
    }
  });

  shiftList.addEventListener("click", (event) => {
    const editButton = event.target.closest("button[data-edit-shift-plan]");
    if (editButton) {
      fillShiftPlannerForm(editButton.dataset.editShiftPlan);
      return;
    }

    const deleteButton = event.target.closest("button[data-delete-shift-plan]");
    if (!deleteButton) return;

    const plan = shiftPlans.find((item) => sameId(item.id, deleteButton.dataset.deleteShiftPlan));
    shiftPlans = shiftPlans.filter((item) => !sameId(item.id, deleteButton.dataset.deleteShiftPlan));
    addActivity("Shift", `Shift plan removed${plan ? ` for ${plan.shift}` : ""}`);
    saveState();
    renderAll();
    showToast("Shift plan removed.");
  });

  if (shiftClearForm) {
    shiftClearForm.addEventListener("click", clearShiftPlannerForm);
  }

  policyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    policy = {
      radius: document.querySelector("#policy-radius").value,
      interval: document.querySelector("#policy-interval").value,
      consentNotice: document.querySelector("#policy-consent").checked
    };
    addActivity("Policy", `Location policy set to ${policy.radius}m and ${policy.interval} min pings`);
    saveState();
    startLocationMonitoring();
    renderAll();
    showToast("Location policy saved for this browser.");
  });

  document.querySelector("#open-leave").addEventListener("click", () => {
    window.location.hash = "leave";
    applyPageFromHash();
    document.querySelector("#leave").scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelector("#leave-reason").focus({ preventScroll: true });
  });

  document.querySelector("#export-report").addEventListener("click", () => {
    const today = new Date().toISOString().slice(0, 10);
    const backup = buildStaffSyncBackup();
    downloadTextFile(`staffsync-backup-${today}.json`, JSON.stringify(backup, null, 2), "application/json");
    showToast("StaffSync backup downloaded.");
  });

  exportAttendanceReport?.addEventListener("click", () => {
    const range = attendanceReportRange();
    const filename = `staffsync-hours-${attendanceReportPeriod.value}-${range.startDate}.csv`;
    downloadTextFile(filename, buildAttendanceCsvReport());
    showToast("Hours report downloaded.");
  });

  exportLeaveReport?.addEventListener("click", () => {
    const date = coverageDate?.value || new Date().toISOString().slice(0, 10);
    downloadTextFile(`staffsync-leave-${date}.csv`, buildLeaveCsvReport());
    showToast("Leave report downloaded.");
  });

  exportShiftReport?.addEventListener("click", () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(`staffsync-shifts-${date}.csv`, buildShiftCsvReport());
    showToast("Shift report downloaded.");
  });

  document.querySelector("#reset-demo").addEventListener("click", () => {
    staff = structuredClone(defaultStaff);
    leaveRequests = structuredClone(defaultLeaveRequests);
    policy = { radius: "250", interval: "5", consentNotice: true };
    activeStaffId = "";
    rememberActiveStaff();
    activityLog = [];
    staffMessages = [];
    deletedStaffMessageIds = [];
    shiftPlans = [];
    staffDevices = [];
    staffPasswords = {};
    hiddenLocationPingIds = [];
    apLocationMap = [
      { id: "ap-1st-lobby", apName: "1_St-Floor_Loby", floor: "1F", zone: "New Wing" }
    ];
    addActivity("System", "Demo data reset");
    saveState();
    populateFilters();
    renderAll();
    showToast("Demo data reset.");
  });

  document.querySelector("#clear-log").addEventListener("click", async () => {
    const visibleItems = visibleActivityLog();
    const visibleMessages = visibleStaffMessages();
    hideActivityLogItems(visibleItems);
    if (currentRole !== "staff") hideChatMessages(visibleMessages);
    await deleteCloudActivityLogsForItems(visibleItems);
    if (currentRole !== "staff") await deleteCloudActivityLogsForMessages(visibleMessages);
    activityLog = [];
    if (currentRole !== "staff") staffMessages = [];
    addActivity("System", "Activity log cleared");
    saveState();
    renderAll();
    showToast("Activity log cleared.");
  });
}

async function handleApprovalClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const request = leaveRequests.find((item) => sameId(item.id, button.dataset.id));
  if (!request) return;

  const action = button.dataset.action;
  const nextStatus = leaveStatusForAction(action);
  if (!nextStatus) return;
  const card = button.closest(".request-card, .mini-item");
  const messageInput = card?.querySelector(`[data-admin-leave-message="${button.dataset.id}"]`);
  const draftKey = leaveDraftKey(request);
  const adminMessage = (messageInput?.value || adminLeaveDrafts[draftKey] || "").trim();
  const previousStatus = request.status;
  button.classList.add("action-success");
  button.disabled = true;

  try {
    if (request.cloudId && isCloudReady()) {
      await window.staffSyncDb.updateLeaveStatus({
        leaveRequestId: request.cloudId,
        status: leaveStatusToCloud(nextStatus),
        approvedBy: currentAppUserId || null
      });
    }

    request.status = nextStatus;
    if (card?.classList.contains("approval-item") && managerApprovals) {
      card.remove();
      if (!managerApprovals.querySelector(".approval-item")) {
        managerApprovals.innerHTML = `<div class="mini-empty">No pending leave requests.</div>`;
      }
    }
    await applyLeaveBalanceDecision(request, previousStatus, nextStatus);
    await addLeaveDecisionMessage(request, action, adminMessage.trim());
    delete adminLeaveDrafts[draftKey];
    addActivity("Leave", `${request.name}'s leave request: ${request.status}`);
    saveState();
    if (isCloudReady()) {
      await refreshLiveLeaveOnly(true);
      syncCloudDashboard();
    }
    renderAll();
    showToast(request.cloudId && isCloudReady()
      ? `${request.name}'s leave request was saved to Supabase.`
      : `${request.name}'s leave request is now ${request.status}.`);
  } catch (error) {
    button.classList.remove("action-success");
    button.disabled = false;
    showToast(error.message || "Leave decision could not be saved.");
  }
}

async function handleStaffLeaveCancelClick(event) {
  const button = event.target.closest("button[data-staff-cancel-leave]");
  if (!button) return;
  if (currentRole !== "staff") return;

  const request = leaveRequests.find((item) => sameId(item.id, button.dataset.staffCancelLeave));
  const activeStaff = staff.find((person) => sameId(person.id, activeStaffId)) ||
    staff.find((person) => sameId(person.cloudId, activeStaffId)) ||
    staff.find((person) => currentAppUserId && sameId(person.appUserId, currentAppUserId));
  if (!request || !activeStaff || !leaveRequestBelongsToStaff(request, activeStaff)) {
    showToast("This request cannot be cancelled from this login.");
    return;
  }

  if (!["Pending", "Change the Request", "Adjustment requested"].includes(request.status)) {
    showToast("Only pending leave requests can be cancelled by staff.");
    return;
  }

  const previousStatus = request.status;
  button.classList.add("action-success");
  button.disabled = true;

  try {
    if (request.cloudId && isCloudReady()) {
      await window.staffSyncDb.updateLeaveStatus({
        leaveRequestId: request.cloudId,
        status: "cancelled",
        approvedBy: null
      });
    }

    request.status = "Cancelled";
    await applyLeaveBalanceDecision(request, previousStatus, request.status);
    await addLeaveThreadMessage(request, `Request cancelled by staff: ${leaveRequestTitle(request)} for ${leaveDateRangeLabel(request)}.`, "Cancelled", "blue", activeStaff);
    addActivity("Leave", `${request.name} cancelled a leave request`);
    saveState();
    setStaffActionNotice(`${leaveRequestTitle(request)} request cancelled.`);
    if (isCloudReady()) {
      await refreshLiveLeaveOnly(true);
      syncCloudDashboard();
    }
    renderAll();
    showToast("Leave request cancelled.");
  } catch (error) {
    button.classList.remove("action-success");
    button.disabled = false;
    showToast(error.message || "Leave request could not be cancelled.");
  }
}

async function handleLeaveChatSubmit(event) {
  const form = event.target.closest("form[data-leave-chat]");
  if (!form) return;
  event.preventDefault();

  const request = findLeaveRequestByThread(form.dataset.leaveChat);
  if (!request) return;

  const messageInput = form.elements.message;
  const message = messageInput?.value.trim() || "";
  const submitButton = event.submitter;

  if (!message) {
    showToast("Please type a message first.");
    return;
  }

  submitButton?.classList.add("action-success");
  if (submitButton) submitButton.disabled = true;

  try {
    const isStaffSender = form.dataset.chatSender === "staff";
    const label = isStaffSender ? "Staff reply" : "Admin reply";
    const className = isStaffSender ? "amber" : "blue";
    await addLeaveThreadMessage(request, message, label, className);
    if (!isStaffSender) delete adminLeaveDrafts[leaveDraftKey(request)];
    addActivity("Leave", `${isStaffSender ? request.name : "Admin"} sent a leave request message`);
    messageInput.value = "";
    saveState();
    renderAll();
    showToast("Message sent.");
    if (isCloudReady()) {
      refreshLiveLeaveOnly(true);
      syncCloudDashboard();
    }
  } catch (error) {
    submitButton?.classList.remove("action-success");
    if (submitButton) submitButton.disabled = false;
    showToast(error.message || "Message could not be sent.");
  }
}

async function handleShiftChatSubmit(event) {
  const form = event.target.closest("form[data-shift-chat]");
  if (!form) return;
  event.preventDefault();

  const messageInput = form.elements.message;
  const message = messageInput?.value.trim() || "";
  const submitButton = event.submitter;
  if (!message) {
    showToast("Please type a shift message first.");
    return;
  }

  const person = staff.find((item) =>
    sameId(item.id, form.dataset.shiftStaff) ||
    sameId(item.cloudId, form.dataset.shiftStaff)
  ) || staff.find((item) => sameId(item.id, activeStaffId));
  if (!person) return;

  submitButton?.classList.add("action-success");
  if (submitButton) submitButton.disabled = true;

  try {
    const isStaffSender = form.dataset.chatSender === "staff";
    await addThreadMessage({
      threadId: form.dataset.shiftChat,
      person,
      message,
      label: isStaffSender ? "Shift request" : "Admin shift reply",
      className: isStaffSender ? "amber" : "blue",
      metadata: {
        shift_thread: true,
        shift_date: form.dataset.shiftDate || "",
        message_topic: "Shift"
      }
    });
    addActivity("Shift", `${isStaffSender ? person.name : "Admin"} sent a shift message`);
    messageInput.value = "";
    saveState();
    renderAll();
    showToast("Shift message sent.");
    if (isCloudReady()) {
      refreshLiveLeaveOnly(true);
      syncCloudDashboard();
    }
  } catch (error) {
    submitButton?.classList.remove("action-success");
    if (submitButton) submitButton.disabled = false;
    showToast(error.message || "Shift message could not be sent.");
  }
}

async function handleShiftChangeClick(event) {
  const button = event.target.closest("[data-shift-confirm]");
  if (!button) return;

  const person = staff.find((item) =>
    sameId(item.id, button.dataset.shiftStaff) ||
    sameId(item.cloudId, button.dataset.shiftStaff)
  );
  if (!person) {
    showToast("Could not find the employee for this shift thread.");
    return;
  }

  button.classList.add("action-success");
  button.disabled = true;

  try {
    await addThreadMessage({
      threadId: button.dataset.shiftConfirm,
      person,
      message: "Shift change confirmed by admin.",
      label: "Shift confirmed",
      className: "green",
      metadata: {
        shift_thread: true,
        shift_date: button.dataset.shiftDate || "",
        message_topic: "Shift"
      }
    });
    addActivity("Shift", `${person.name}'s shift change was confirmed`);
    saveState();
    if (isCloudReady()) await syncCloudDashboard();
    renderAll();
    showToast("Shift confirmation sent.");
  } catch (error) {
    button.classList.remove("action-success");
    button.disabled = false;
    showToast(error.message || "Shift confirmation could not be sent.");
  }
}

async function handleLeaveChangeSubmit(event) {
  const form = event.target.closest("form[data-change-request]");
  if (!form) return;
  event.preventDefault();

  const request = leaveRequests.find((item) => sameId(item.id, form.dataset.changeRequest));
  if (!request) return;
  const submitButton = event.submitter;
  submitButton?.classList.add("action-success");

  const startDate = form.elements.from.value;
  const duration = form.elements.duration?.value || leaveDurationValue(request);
  const endDate = ["half", "short"].includes(duration) ? startDate : form.elements.to.value;
  const reason = form.elements.reason.value.trim();
  const person = staff.find((item) => sameId(item.id, request.staffId) || sameId(item.cloudId, request.staffId));
  const requestedDays = leaveRequestUnits({ from: startDate, to: endDate, duration });

  if (!reason) {
    showToast("Please add a reason or reply before sending again.");
    return;
  }
  if (!requestedDays) {
    showToast("Please check the changed leave dates.");
    return;
  }
  const balanceCheck = person ? monthlyLeaveRequestAvailability(person, { from: startDate, to: endDate, duration }, request.id) : { ok: true };
  if (!balanceCheck.ok) {
    showToast(`Changed request is more than ${balanceCheck.monthLabel}'s remaining leave balance.`);
    return;
  }

  try {
    if (request.cloudId && isCloudReady()) {
      await window.staffSyncDb.updateLeaveRequest({
        leaveRequestId: request.cloudId,
        startDate,
        endDate,
        reason: encodeLeaveReason(reason, duration),
        status: "pending"
      });
    }

    request.from = startDate;
    request.to = endDate;
    request.duration = duration;
    request.reason = reason;
    request.status = "Pending";
    await addLeaveThreadMessage(request, `Changed request sent again: ${leaveRequestTitle(request)} for ${leaveDateRangeLabel(request)}. ${reason}`, "Resubmitted", "amber");
    addActivity("Leave", `${request.name} changed and resent a leave request`);
    saveState();
    setStaffActionNotice(`Changed ${leaveRequestTitle(request)} request sent again for ${leaveDateRangeLabel(request)}. Waiting for admin answer.`);
    if (isCloudReady()) {
      await syncCloudDashboard();
    }
    renderAll();
    showToast("Changed leave request sent again.");
  } catch (error) {
    submitButton?.classList.remove("action-success");
    showToast(error.message || "Changed leave request could not be saved.");
  }
}

async function applyLeaveBalanceDecision(request, previousStatus, nextStatus) {
  const person = staff.find((item) => sameId(item.id, request.staffId) || sameId(item.cloudId, request.staffId));
  if (!person || previousStatus === nextStatus) return;
  person.leaveBalance = monthlyLeaveBalance(person);
}

async function addLeaveDecisionMessage(request, action, customMessage = "") {
  const person = staffPersonForLeaveRequest(request);
  const label = action === "approve" ? "Approved" : action === "reject" ? "Rejected" : action === "cancel" ? "Cancelled" : "Change the Request";
  const className = action === "approve" ? "green" : action === "reject" ? "red" : "blue";
  const requestTitle = leaveRequestTitle(request).toLowerCase();
  const dateLabel = leaveDateRangeLabel(request);
  const defaultMessage = action === "approve"
    ? `Your ${requestTitle} request for ${dateLabel} was approved.`
    : action === "reject"
      ? `Your ${requestTitle} request for ${dateLabel} was rejected.`
      : action === "cancel"
        ? `Your approved ${requestTitle} for ${dateLabel} was cancelled.`
        : `Please change your ${requestTitle} request for ${dateLabel} and send it again.`;
  const message = customMessage || defaultMessage;

  await addLeaveThreadMessage(request, message, label, className, person);
}

async function addLeaveThreadMessage(request, message, label, className, matchedPerson) {
  const person = matchedPerson || staffPersonForLeaveRequest(request);
  await addThreadMessage({
    threadId: leaveThreadId(request),
    person,
    message,
    label,
    className,
    metadata: {
      leave_message_thread: true,
      decision: leaveStatusToCloud(request.status)
    }
  });
}

function findLeaveRequestByThread(threadId) {
  return leaveRequests.find((item) =>
    sameId(item.id, threadId) ||
    sameId(item.cloudId, threadId) ||
    sameId(leaveThreadId(item), threadId)
  );
}

function staffPersonForLeaveRequest(request) {
  const person = staff.find((item) =>
    sameId(item.id, request.staffId) ||
    sameId(item.cloudId, request.staffId) ||
    sameId(item.id, request.staffProfileId) ||
    sameId(item.cloudId, request.staffProfileId) ||
    (request.email && item.email && sameId(item.email, request.email)) ||
    (request.name && item.name && request.name.trim().toLowerCase() === item.name.trim().toLowerCase())
  );

  if (person) return person;

  const fallbackId = String(request.staffId || request.staffProfileId || request.cloudId || request.id || "");
  return {
    id: fallbackId,
    cloudId: fallbackId,
    appUserId: request.appUserId || "",
    name: request.name || "Staff member"
  };
}

function leaveRequestBelongsToStaff(request, person) {
  if (!request || !person) return false;
  return sameId(request.staffId, person.id) ||
    sameId(request.staffId, person.cloudId) ||
    sameId(request.staffProfileId, person.id) ||
    sameId(request.staffProfileId, person.cloudId) ||
    (request.name && person.name && request.name.trim().toLowerCase() === person.name.trim().toLowerCase());
}

async function addThreadMessage({ threadId, person, message, label, className, metadata = {} }) {
  const staffMessage = {
    id: `${threadId}-${label}-${Date.now()}`,
    staffId: person?.id || person?.cloudId || "",
    staffProfileId: person?.cloudId || person?.id || "",
    targetUserId: person?.appUserId || "",
    leaveRequestId: threadId,
    shiftDate: metadata.shift_date || "",
    messageTopic: metadata.message_topic || "",
    label,
    className,
    message,
    time: new Date().toISOString(),
    pendingSync: true
  };

  staffMessages = [staffMessage, ...staffMessages].slice(0, 500);
  saveState();

  if (isCloudReady()) {
    try {
      const hotelId = (window.STAFFSYNC_ENV || {}).HOTEL_ID;
      const isShiftMessage = metadata.message_topic === "Shift" || metadata.shift_thread;
      let cloudLog = null;
      if (!isShiftMessage && window.staffSyncDb.addLeaveMessage) {
        try {
          cloudLog = await window.staffSyncDb.addLeaveMessage({
            hotelId,
            leaveRequestId: threadId,
            staffProfileId: person?.cloudId || person?.id || null,
            senderRole: currentRole || "staff",
            label,
            className,
            message,
            metadata: {
              staff_profile_id: person?.cloudId || person?.id || "",
              target_user_id: person?.appUserId || "",
              ...metadata
            }
          });
        } catch {
          cloudLog = null;
        }
      }
      if (!cloudLog) {
        cloudLog = await window.staffSyncDb.addActivityLog({
          hotelId,
          actorUserId: currentAppUserId || null,
          targetUserId: person?.appUserId || null,
          eventType: "Leave",
          message,
          metadata: {
            leave_request_id: threadId,
            staff_profile_id: person?.cloudId || person?.id || "",
            message_label: label,
            message_class: className,
            ...metadata
          }
        });
      }

      staffMessage.cloudId = cloudLog.id;
      staffMessage.pendingSync = false;
      saveState();
    } catch (error) {
      staffMessages = staffMessages.filter((messageItem) => messageItem.id !== staffMessage.id);
      saveState();
      throw new Error(error.message || "Cloud could not save this leave message.");
    }
  }

  return staffMessage;
}

function messagesForStaff(person) {
  return visibleStaffMessages().filter((message) =>
    sameId(message.staffId, person.id) ||
    sameId(message.staffProfileId, person.cloudId) ||
    sameId(message.staffProfileId, person.id) ||
    sameId(message.staffId, person.cloudId) ||
    shiftMessageBelongsToStaff(message, person) ||
    (person.appUserId && sameId(message.targetUserId, person.appUserId))
  );
}

function leaveMessagesForRequest(request) {
  return visibleStaffMessages().filter((message) =>
    sameId(message.leaveRequestId, request.id) ||
    sameId(message.leaveRequestId, request.cloudId) ||
    sameId(message.leaveRequestId, leaveThreadId(request)) ||
    (message.message || "").includes(`${formatDate(request.from)} to ${formatDate(request.to)}`)
  ).sort((left, right) => new Date(left.time || 0) - new Date(right.time || 0));
}

function messagesForThread(threadId) {
  return visibleStaffMessages()
    .filter((message) => sameId(message.leaveRequestId, threadId) && !isSilentShiftUpdate(message))
    .sort((left, right) => new Date(right.time || 0) - new Date(left.time || 0));
}

function shiftMessageBelongsToStaff(message, person) {
  if (message.messageTopic !== "Shift") return false;
  const threadId = String(message.leaveRequestId || "");
  return threadId.includes(`-${person.cloudId || ""}-`) || threadId.includes(`-${person.id || ""}-`);
}

function visibleStaffMessages() {
  return staffMessages.filter((message) => !isChatMessageHidden(message) && !isSilentShiftUpdate(message));
}

function visibleActivityLog() {
  return activityLog.filter((item) => !isActivityLogHidden(item));
}

function locationPingIdentity(ping) {
  return [
    ping.id,
    ping.staff_profile_id,
    ping.attendance_record_id,
    ping.captured_at,
    ping.latitude,
    ping.longitude
  ].map((value) => String(value || "")).filter(Boolean).join("|");
}

function isLocationPingHidden(ping) {
  const identity = locationPingIdentity(ping);
  return hiddenLocationPingIds.some((hiddenId) => hiddenId === identity);
}

function hideLocationPings(pings) {
  const nextHidden = new Set(hiddenLocationPingIds);
  pings.forEach((ping) => {
    const identity = locationPingIdentity(ping);
    if (identity) nextHidden.add(identity);
  });
  hiddenLocationPingIds = Array.from(nextHidden).slice(-1000);
  saveState();
}

function isRealChatMessage(message) {
  const identity = messageIdentity(message);
  return visibleStaffMessages().some((item) => messageIdentity(item) === identity);
}

function messageIdentity(message) {
  return String(message.cloudId || message.id || `${message.leaveRequestId || ""}-${message.time || ""}-${message.message || ""}`);
}

function messageHiddenIds(message) {
  return [
    message.id,
    message.cloudId,
    messageIdentity(message),
    `${message.leaveRequestId || ""}-${message.time || ""}-${message.message || ""}`,
    `${message.staffProfileId || message.staffId || ""}-${message.time || ""}-${message.message || ""}`
  ].map((value) => String(value || "")).filter(Boolean);
}

function activityIdentity(item) {
  return String(item.cloudId || item.id || `activity-${item.type || ""}-${item.time || ""}-${item.message || ""}`);
}

function activityHiddenIds(item) {
  return [
    item.id,
    item.cloudId,
    activityIdentity(item),
    `activity-${item.type || ""}-${item.time || ""}-${item.message || ""}`
  ].map((value) => String(value || "")).filter(Boolean);
}

function isActivityLogHidden(item) {
  const ids = new Set(activityHiddenIds(item));
  return deletedStaffMessageIds.some((hiddenId) => ids.has(String(hiddenId)));
}

async function deleteCloudActivityLogsForItems(items) {
  if (!isCloudReady()) return false;
  const ids = items
    .flatMap((item) => [item.id, item.cloudId])
    .filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id)));
  if (!ids.length) return false;

  try {
    await window.staffSyncDb.deleteActivityLogsByIds({ ids: Array.from(new Set(ids.map(String))) });
    return true;
  } catch {
    return false;
  }
}

async function deleteCloudActivityLogsForMessages(messages) {
  return deleteCloudActivityLogsForItems(messages);
}

function hideActivityLogItems(items) {
  const nextHidden = new Set(deletedStaffMessageIds.map(String));
  items.forEach((item) => activityHiddenIds(item).forEach((id) => nextHidden.add(id)));
  deletedStaffMessageIds = Array.from(nextHidden).slice(-2000);
  activityLog = activityLog.filter((item) => !isActivityLogHidden(item));
  saveState();
}

function isChatMessageHidden(message) {
  const ids = new Set(messageHiddenIds(message));
  return deletedStaffMessageIds.some((hiddenId) => ids.has(String(hiddenId)));
}

function hideChatMessages(messages) {
  const nextHidden = new Set(deletedStaffMessageIds.map(String));
  messages.forEach((message) => messageHiddenIds(message).forEach((id) => nextHidden.add(id)));
  deletedStaffMessageIds = Array.from(nextHidden).slice(-2000);
  staffMessages = staffMessages.filter((message) => !isChatMessageHidden(message));
  saveState();
}

async function clearStaffChatHistory(person) {
  const messages = messagesForStaff(person);
  hideChatMessages(messages);
  await deleteCloudActivityLogsForMessages(messages);
}

function chatThreadsForAdmin() {
  const grouped = new Map();
  visibleStaffMessages().forEach((message) => {
    const key = String(message.leaveRequestId || `staff-${message.staffProfileId || message.staffId || "unknown"}`);
    if (!grouped.has(key)) {
      const request = findLeaveRequestByThread(key);
      const isShiftThread = key.startsWith("shift-") || message.messageTopic === "Shift" || Boolean(message.shiftDate);
      const person = staff.find((item) =>
        sameId(item.id, message.staffId) ||
        sameId(item.cloudId, message.staffProfileId) ||
        (item.appUserId && sameId(item.appUserId, message.targetUserId)) ||
        (request && leaveRequestBelongsToStaff(request, item))
      );
      const title = request
        ? `${request.name} - ${leaveRequestTitle(request)} - ${leaveDateRangeLabel(request)}`
        : isShiftThread
          ? `${person?.name || "Staff member"} - shift change${message.shiftDate ? ` - ${formatDate(message.shiftDate)}` : ""}`
          : `${person?.name || "Staff member"} - chat`;
      grouped.set(key, {
        key,
        title,
        isShiftThread,
        shiftDate: message.shiftDate || shiftDateFromThreadKey(key),
        staffId: person?.cloudId || person?.id || message.staffProfileId || message.staffId || "",
        messages: []
      });
    }
    grouped.get(key).messages.push(message);
  });

  return Array.from(grouped.values())
    .map((thread) => ({
      ...thread,
      messages: thread.messages.sort((left, right) => new Date(left.time || 0) - new Date(right.time || 0))
    }))
    .sort((left, right) => {
      const leftTime = left.messages.at(-1)?.time || 0;
      const rightTime = right.messages.at(-1)?.time || 0;
      return new Date(rightTime) - new Date(leftTime);
    })
    .slice(0, 100);
}

async function handleChatHistoryClick(event) {
  const deleteButton = event.target.closest("[data-delete-chat-message]");
  const deleteActivityButton = event.target.closest("[data-delete-activity-message]");
  const clearButton = event.target.closest("[data-clear-chat-history]");
  const clearThreadButton = event.target.closest("[data-clear-chat-thread]");
  if (!deleteButton && !deleteActivityButton && !clearButton && !clearThreadButton) return;

  if (deleteButton) {
    const message = visibleStaffMessages().find((item) => messageIdentity(item) === deleteButton.dataset.deleteChatMessage);
    if (message) {
      hideChatMessages([message]);
      await deleteCloudActivityLogsForMessages([message]);
    }
    renderLeaveRequests();
    renderRoleDemo();
    showToast("Selected chat message was deleted.");
    return;
  }

  if (deleteActivityButton) {
    const item = visibleActivityLog().find((activity) => activityIdentity(activity) === deleteActivityButton.dataset.deleteActivityMessage);
    if (item) {
      hideActivityLogItems([item]);
      await deleteCloudActivityLogsForItems([item]);
    }
    renderRoleDemo();
    renderActivityLog();
    showToast("Selected clock/break message was deleted.");
    return;
  }

  if (clearThreadButton) {
    const messages = visibleStaffMessages().filter((message) => {
      const key = String(message.leaveRequestId || `staff-${message.staffProfileId || message.staffId || "unknown"}`);
      return key === clearThreadButton.dataset.clearChatThread;
    });
    hideChatMessages(messages);
    await deleteCloudActivityLogsForMessages(messages);
    renderLeaveRequests();
    renderRoleDemo();
    showToast("Selected chat thread was deleted.");
    return;
  }

  const messages = visibleStaffMessages();
  hideChatMessages(messages);
  await deleteCloudActivityLogsForMessages(messages);
  renderLeaveRequests();
  renderRoleDemo();
  showToast("All chat history was deleted.");
}

function decisionMessagesForRequest(request, requestMessages = leaveMessagesForRequest(request)) {
  return requestMessages;
}

function isSilentShiftUpdate(message) {
  return message?.messageTopic === "Shift" && String(message.label || "").toLowerCase() === "shift updated";
}

function mergeStaffMessages(localMessages, cloudMessages) {
  const merged = cloudMessages.filter((message) => !isChatMessageHidden(message));
  localMessages.forEach((localMessage) => {
    if (isChatMessageHidden(localMessage)) return;
    const duplicate = merged.some((cloudMessage) =>
      sameId(cloudMessage.id, localMessage.id) ||
      sameId(cloudMessage.cloudId, localMessage.cloudId) ||
      (
        sameId(cloudMessage.leaveRequestId, localMessage.leaveRequestId) &&
        cloudMessage.message === localMessage.message &&
        cloudMessage.label === localMessage.label
      )
    );
    if (!duplicate) merged.push(localMessage);
  });

  return merged
    .sort((left, right) => new Date(right.time || 0) - new Date(left.time || 0))
    .slice(0, 500);
}

function shouldPauseAutoRender() {
  const active = document.activeElement;
  const typingNow = isTypingField(active);
  return typingNow && (Date.now() < typingAutoRenderPauseUntil || typingNow);
}

function isTypingProtectedElement(element) {
  return Boolean(element?.closest?.(".leave-chat-panel, .leave-chat-form, .change-request-form, .admin-message-box, [data-leave-chat]"));
}

function isTypingField(element) {
  if (!element?.matches?.("textarea, input")) return false;
  if (element.disabled || element.hidden || element.type === "hidden") return false;
  return Boolean(element.offsetParent || element === document.activeElement);
}

function protectTypingFromAutoRender(event) {
  if (isTypingField(event.target)) {
    typingAutoRenderPauseUntil = Date.now() + 30000;
  } else if (isTypingProtectedElement(event.target)) {
    typingAutoRenderPauseUntil = Date.now() + 1200;
  }
}

function isOnShift(person) {
  return Boolean(person.clockIn && !person.clockOut);
}

function rememberRecentClockState(person) {
  if (!person) return;
  const key = String(person.cloudId || person.id || "");
  if (!key) return;
  if (isOnShift(person)) {
    recentClockStates[key] = {
      clockIn: person.clockIn,
      attendanceRecordId: person.attendanceRecordId || "",
      status: person.status,
      locationStatus: person.locationStatus,
      location: person.location,
      ping: person.ping,
      expiresAt: Date.now() + 15 * 60000
    };
  } else {
    delete recentClockStates[key];
  }
}

function restoreRecentClockState(person) {
  const key = String(person?.cloudId || person?.id || "");
  const snapshot = key ? recentClockStates[key] : null;
  if (!person || !snapshot) return false;
  if (snapshot.expiresAt < Date.now()) {
    delete recentClockStates[key];
    return false;
  }
  if (person.clockIn && !person.clockOut) return false;
  Object.assign(person, {
    attendanceRecordId: snapshot.attendanceRecordId,
    clockIn: snapshot.clockIn,
    clockOut: "",
    status: snapshot.status || "On duty",
    locationStatus: snapshot.locationStatus || "Inside",
    location: snapshot.location || person.department,
    ping: snapshot.ping || "just now"
  });
  return true;
}

async function toggleClock(person) {
  const now = currentTime();
  if (isOnShift(person)) {
    const position = await getCurrentPositionSafe();
    if (person.attendanceRecordId && isCloudReady()) {
      await window.staffSyncDb.clockOut({
        attendanceRecordId: person.attendanceRecordId,
        latitude: position?.latitude || null,
        longitude: position?.longitude || null
      });
    }

    person.clockOut = now;
    person.status = "Completed";
    person.locationStatus = "Inactive";
    person.location = "Shift ended";
    person.ping = "-";
    person.lastLatitude = position?.latitude || person.lastLatitude || null;
    person.lastLongitude = position?.longitude || person.lastLongitude || null;
    person.gpsAccuracy = position?.accuracy || person.gpsAccuracy || null;
    person.attendanceRecordId = "";
    rememberRecentClockState(person);
    addActivity("Clock", `${person.name} clocked out at ${now}`);
    await recordAttendanceNotice(person, `${person.name} clocked out at ${now}`, "Clock");
    saveState();
    stopLocationMonitoring();
    setStaffActionNotice(`Clock out successful at ${now}.`);
    showToast(person.cloudId && isCloudReady()
      ? `${person.name} clocked out and saved to Supabase.`
      : `${person.name} clocked out. Location monitoring stopped.`);
    return;
  }

  person.clockIn = now;
  person.clockOut = "";
  person.status = "On duty";
  person.locationStatus = "Inside";
  person.location = staffLocationLabel(person);
  person.ping = "just now";
  person.floor = person.floor || "GF";
  person.zone = person.zone || "New Wing";
  rememberRecentClockState(person);
  saveState();
  renderRoleDemo();

  const position = await getCurrentPositionSafe();
  const locationStatus = "inside_property";
  if (person.cloudId && isCloudReady()) {
    const attendance = await window.staffSyncDb.clockIn({
      staffProfileId: person.cloudId,
      shiftAssignmentId: null,
      latitude: position?.latitude || null,
      longitude: position?.longitude || null
    });
    person.attendanceRecordId = attendance.id;

    if (position) {
      await window.staffSyncDb.recordLocationPing({
        staffProfileId: person.cloudId,
        attendanceRecordId: attendance.id,
        latitude: position.latitude,
        longitude: position.longitude,
        accuracyMeters: position.accuracy || null,
        locationStatus,
        floorLabel: person.floor || "GF",
        zoneLabel: person.zone || "New Wing"
      });
    }
  }

  person.location = position
    ? `${staffLocationLabel(person)} - ${Number(position.accuracy || 0) <= targetGpsAccuracyMeters ? "GPS captured" : "GPS captured low accuracy"}`
    : staffLocationLabel(person);
  person.ping = position
    ? `${Math.round(position.accuracy || 0)}m accuracy${Number(position.accuracy || 0) > targetGpsAccuracyMeters ? " - above 5m target" : ""}`
    : "just now";
  person.lastLatitude = position?.latitude || null;
  person.lastLongitude = position?.longitude || null;
  person.gpsAccuracy = position?.accuracy || null;
  rememberRecentClockState(person);
  addActivity("Clock", `${person.name} clocked in at ${now}`);
  await recordAttendanceNotice(person, `${person.name} clocked in at ${now}`, "Clock");
  saveState();
  renderRoleDemo();
  startLocationMonitoring();
  if (!position) {
    await recordActiveStaffLocationPing();
  }
  setStaffActionNotice(`Clock in successful at ${now}. ${position ? `Location captured with ${Math.round(position.accuracy || 0)}m accuracy.` : "Location was not captured."}`);
  if (isCloudReady()) {
    await syncCloudDashboard();
  }
  showToast(person.cloudId && isCloudReady()
    ? `${person.name} clocked in. GPS ${position ? `${Math.round(position.accuracy || 0)}m` : "not captured"} saved to Supabase.`
    : `${person.name} clocked in. Location monitoring is active.`);
}

async function toggleBreak(person) {
  if (!isOnShift(person)) {
    showToast("Staff must clock in before starting a break.");
    return;
  }

  if (person.status === "On break") {
    person.status = "On duty";
    person.locationStatus = "Inside";
    person.ping = "just now";
    addActivity("Break", `${person.name} ended break`);
    await recordAttendanceNotice(person, `${person.name} ended break`, "Break");
    saveState();
    renderRoleDemo();
    if (isCloudReady()) {
      refreshLiveLeaveOnly(true);
      syncCloudDashboard();
    }
    showToast(`${person.name} ended break.`);
    return;
  }

  person.status = "On break";
  person.locationStatus = "Break";
  person.location = "Staff canteen";
  person.ping = "just now";
  addActivity("Break", `${person.name} started break`);
  await recordAttendanceNotice(person, `${person.name} started break`, "Break");
  saveState();
  renderRoleDemo();
  if (isCloudReady()) {
    refreshLiveLeaveOnly(true);
    syncCloudDashboard();
  }
  showToast(`${person.name} is now marked on break.`);
}

async function recordAttendanceNotice(person, message, kind) {
  if (!isCloudReady()) return;
  const hotelId = (window.STAFFSYNC_ENV || {}).HOTEL_ID;
  try {
    await window.staffSyncDb.addActivityLog({
      hotelId,
      actorUserId: currentAppUserId || person.appUserId || null,
      targetUserId: person.appUserId || null,
      eventType: "Attendance",
      message,
      metadata: {
        attendance_event: true,
        attendance_kind: kind,
        staff_profile_id: person.cloudId || person.id
      }
    });
  } catch {
    try {
      await window.staffSyncDb.addActivityLog({
        hotelId,
        actorUserId: currentAppUserId || person.appUserId || null,
        targetUserId: person.appUserId || null,
        eventType: "Leave",
        message,
        metadata: {
          attendance_event: true,
          attendance_kind: kind,
          staff_profile_id: person.cloudId || person.id,
          message_label: kind,
          message_class: kind === "Break" ? "blue" : "green"
        }
      });
    } catch {
      // Local dashboard still updates from attendance records if notice logging is blocked.
    }
  }
}

function renderPolicy() {
  document.querySelector("#policy-radius").value = policy.radius;
  document.querySelector("#policy-interval").value = policy.interval;
  document.querySelector("#policy-consent").checked = policy.consentNotice;
  policySummary.innerHTML = `
    <strong>Current rule:</strong>
    Track only during active shifts, alert outside ${policy.radius}m, ping every ${policy.interval} minutes.
    Leave needs 2 days prior approval; short-notice leave must include a reason.
  `;
}

function buildCsvReport() {
  const rows = [
    ["Name", "Department", "Role", "Shift", "Clock In", "Clock Out", "Status", "Location Status", "Location", "Leave Balance"],
    ...staff.map((person) => [
      person.name,
      person.department,
      person.role,
      person.shift,
      person.clockIn || "",
      person.clockOut || "",
      person.status,
      person.locationStatus,
      person.location,
      person.leaveBalance
    ])
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function buildStaffSyncBackup() {
  const generatedAt = new Date().toISOString();
  const monthKey = monthKeyForDate();
  return {
    app: "StaffSync Beach & Bliss Mirissa",
    build: "v126",
    generatedAt,
    month: monthKey,
    hotelId: (window.STAFFSYNC_ENV || {}).HOTEL_ID || "",
    staff: sortStaffByEmployeeCode(staff).map((person) => ({
      id: person.id || "",
      cloudId: person.cloudId || "",
      appUserId: person.appUserId || "",
      employeeCode: person.employeeCode || "",
      name: person.name || "",
      department: person.department || "",
      jobTitle: person.role || "",
      email: person.email || "",
      wifiMac: person.wifiMac || person.phone || "",
      shift: person.shift || "",
      shiftTime: person.shiftTime || "",
      leaveBalance: person.leaveBalance || 0,
      status: person.status || "",
      clockIn: person.clockIn || "",
      clockOut: person.clockOut || "",
      locationStatus: person.locationStatus || "",
      location: person.location || ""
    })),
    leaveRequests: leaveRequests.map((request) => ({ ...request })),
    shiftPlans: shiftPlans.map((plan) => ({ ...plan })),
    dailyRosters: structuredClone(dailyRosters || {}),
    attendance: {
      loadedReportRecords: attendanceReportRecords.map((record) => ({ ...record })),
      currentStaffClockState: staff.map((person) => ({
        employeeCode: person.employeeCode || "",
        name: person.name || "",
        department: person.department || "",
        status: person.status || "",
        clockIn: person.clockIn || "",
        clockOut: person.clockOut || "",
        hoursWorked: person.hoursWorked || 0
      }))
    },
    communications: {
      leaveAndShiftMessages: staffMessages.map((message) => ({ ...message })),
      activityLog: activityLog.map((log) => ({ ...log }))
    },
    settings: {
      policy: structuredClone(policy || {}),
      apLocationMap: structuredClone(apLocationMap || []),
      hiddenLocationPingIds: structuredClone(hiddenLocationPingIds || [])
    },
    reports: {
      dailyStaffCsv: buildCsvReport(),
      attendanceCsv: buildAttendanceCsvReport(),
      leaveCsv: buildLeaveCsvReport(),
      shiftCsv: buildShiftCsvReport()
    }
  };
}

function buildAttendanceCsvReport() {
  const records = attendanceReportRecords.length
    ? attendanceReportRecords
    : staff
      .filter((person) => person.clockIn)
      .map((person) => ({
        staffName: person.name,
        employeeCode: person.employeeCode || "",
        department: person.department,
        clockIn: person.clockIn,
        clockOut: person.clockOut,
        status: person.status,
        hoursWorked: hoursBetweenClockTimes(person.clockIn, person.clockOut)
      }));

  const rows = [
    ["Employee Code", "Name", "Department", "Clock In", "Clock Out", "Status", "Hours Worked"],
    ...records.map((record) => [
      record.employeeCode || "",
      record.staffName,
      record.department || "General",
      record.clockIn || "",
      record.clockOut || "active",
      record.status || "",
      formatHours(record.hoursWorked || 0)
    ])
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function buildLeaveCsvReport() {
  const rows = [
    ["Employee Code", "Name", "Department", "Leave Type", "From", "To", "Status", "Reason"],
    ...leaveRequests.map((request) => {
      const person = staff.find((item) => sameId(item.id, request.staffId));
      return [
        person?.employeeCode || "",
        request.name,
        departmentForLeaveRequest(request),
        request.type,
        request.from,
        request.to,
        request.status,
        request.reason || ""
      ];
    })
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function buildShiftCsvReport() {
  const rows = [
    ["Employee Code", "Name", "Department", "Shift", "In Time", "Out Time", "Repeat Days", "Effective From"],
    ...staff.map((person) => {
      const plan = activeShiftPlanFor(person);
      return [
        person.employeeCode || "",
        person.name,
        person.department,
        plan?.shift || person.shift,
        plan?.inTime || shiftStartFromTimeRange(person.shiftTime),
        plan?.outTime || shiftEndFromTimeRange(person.shiftTime),
        (plan?.repeatDays || []).join(" "),
        plan?.effectiveDate || ""
      ];
    })
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function activeShiftPlanFor(person, dateValue = "") {
  return shiftPlans.find((plan) => {
    if (!(sameId(plan.staffId, person.id) || sameId(plan.staffId, person.cloudId))) return false;
    if (!dateValue) return true;
    if (plan.effectiveDate && plan.effectiveDate > dateValue) return false;
    if (Array.isArray(plan.repeatDates) && plan.repeatDates.length) return plan.repeatDates.includes(dateValue);
    return !plan.repeatDays?.length || plan.repeatDays.includes(shortDayName(dateValue));
  });
}

function dailyRosterEntryFor(person, dateValue) {
  const saved = dailyRosters[dateValue]?.[person.id];
  const approvedLeave = approvedLeaveForStaffDate(person, dateValue);
  if (saved) return applyLeaveToRosterEntry(saved, approvedLeave);

  const plan = activeShiftPlanFor(person, dateValue);
  const leaveDuration = leaveDurationValue(approvedLeave);
  const hasFullLeave = approvedLeave && leaveDuration === "full";
  const baseInTime = plan?.inTime || shiftStartFromTimeRange(person.shiftTime);
  const baseOutTime = plan?.outTime || shiftEndFromTimeRange(person.shiftTime);
  const adjustedOutTime = approvedLeave && !hasFullLeave
    ? adjustedShiftOutTime(baseInTime, baseOutTime, leaveDuration)
    : baseOutTime;
  return {
    shift: hasFullLeave ? "Leave" : displayShiftName(plan?.shift || person.shift || defaultShiftName),
    inTime: hasFullLeave ? "00:00" : baseInTime,
    outTime: hasFullLeave ? "00:00" : adjustedOutTime,
    status: hasFullLeave ? "Leave" : ((plan?.shift || person.shift) === "Weekly off" ? "Weekly off" : "Working"),
    leaveDuration: approvedLeave ? leaveDuration : "",
    leaveLabel: approvedLeave ? leaveDurationLabel(leaveDuration) : "",
    shift2: plan?.shift2 || "",
    inTime2: plan?.inTime2 || "",
    outTime2: plan?.outTime2 || "",
    status2: plan?.shift2 ? "Working" : "",
    shift3: plan?.shift3 || "",
    inTime3: plan?.inTime3 || "",
    outTime3: plan?.outTime3 || "",
    status3: plan?.shift3 ? "Working" : ""
  };
}

function applyLeaveToRosterEntry(entry, approvedLeave) {
  if (!approvedLeave) return entry;
  const leaveDuration = leaveDurationValue(approvedLeave);
  if (leaveDuration === "full") {
    return {
      ...entry,
      shift: "Leave",
      inTime: "00:00",
      outTime: "00:00",
      status: "Leave",
      leaveDuration,
      leaveLabel: leaveDurationLabel(leaveDuration)
    };
  }

  return {
    ...entry,
    outTime: adjustedShiftOutTime(entry.inTime || "00:00", entry.outTime || "00:00", leaveDuration),
    leaveDuration,
    leaveLabel: leaveDurationLabel(leaveDuration)
  };
}

function dailyRosterEntryFromMessages(person, dateValue) {
  const message = messagesForStaff(person)
    .find((item) =>
      item.messageTopic === "Shift" &&
      item.shiftDate === dateValue &&
      item.rosterEntry
    );

  if (!message) return null;
  return {
    shift: displayShiftName(message.rosterEntry.shift || defaultShiftName),
    inTime: message.rosterEntry.inTime || "00:00",
    outTime: message.rosterEntry.outTime || "00:00",
    status: message.rosterEntry.status || "Working",
    shift2: message.rosterEntry.shift2 || "",
    inTime2: message.rosterEntry.inTime2 || "",
    outTime2: message.rosterEntry.outTime2 || "",
    status2: message.rosterEntry.status2 || "",
    shift3: message.rosterEntry.shift3 || "",
    inTime3: message.rosterEntry.inTime3 || "",
    outTime3: message.rosterEntry.outTime3 || "",
    status3: message.rosterEntry.status3 || ""
  };
}

function saveDailyRosterFromTable(dateValue) {
  if (!dateValue || !dailyRosterBody) return 0;

  const entries = {};
  dailyRosterBody.querySelectorAll("tr[data-roster-staff]").forEach((row) => {
    const staffId = row.dataset.rosterStaff;
    entries[staffId] = {
      shift: displayShiftName(row.querySelector("[data-roster-field='shift']")?.value.trim() || defaultShiftName),
      inTime: row.querySelector("[data-roster-field='inTime']")?.value || "00:00",
      outTime: row.querySelector("[data-roster-field='outTime']")?.value || "00:00",
      status: row.querySelector("[data-roster-field='status']")?.value || "Working",
      shift2: row.querySelector("[data-roster-field='shift2']")?.value.trim() || "",
      inTime2: row.querySelector("[data-roster-field='inTime2']")?.value || "",
      outTime2: row.querySelector("[data-roster-field='outTime2']")?.value || "",
      status2: row.querySelector("[data-roster-field='status2']")?.value || ""
    };
  });

  dailyRosters[dateValue] = entries;
  return Object.keys(entries).length;
}

async function importShiftRows(text) {
  const rows = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const touchedDates = new Set();
  let updated = 0;
  let skipped = 0;

  for (const line of rows) {
    const columns = parseImportColumns(line);
    if (isShiftImportHeader(columns)) {
      skipped += 1;
      continue;
    }

    const employeeCode = normalizeEmployeeCode(columns[0]);
    const dateValue = parseShiftImportDate(columns[1] || dailyRosterDate?.value || todayLocalKey());
    const person = staff.find((item) => normalizeEmployeeCode(item.employeeCode) === employeeCode);
    if (!person || !dateValue) {
      skipped += 1;
      continue;
    }

    const shift = displayShiftName(columns[2] || defaultShiftName);
    const inTime = normalizeImportTime(columns[3] || defaultShiftStart);
    const outTime = normalizeImportTime(columns[4] || defaultShiftEnd);
    const status = columns[5] || (shift === "Weekly off" ? "Weekly off" : "Working");
    dailyRosters[dateValue] = dailyRosters[dateValue] || buildRosterEntriesForDate(dateValue);
    dailyRosters[dateValue][person.id] = {
      ...(dailyRosters[dateValue][person.id] || {}),
      shift,
      inTime,
      outTime,
      status
    };
    touchedDates.add(dateValue);
    updated += 1;
  }

  if (isCloudReady()) {
    for (const dateValue of touchedDates) {
      await saveDailyRosterToCloud(dateValue);
      await notifyDailyRosterSaved(dateValue);
    }
    await syncCloudDashboard();
  }

  return { updated, skipped, dates: Array.from(touchedDates) };
}

function isShiftImportHeader(columns) {
  const first = String(columns[0] || "").toLowerCase();
  const second = String(columns[1] || "").toLowerCase();
  return first.includes("employee") || first === "code" || second.includes("date");
}

function parseShiftImportDate(value) {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const slash = text.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (slash) {
    return `${slash[3]}-${slash[2].padStart(2, "0")}-${slash[1].padStart(2, "0")}`;
  }
  return "";
}

function normalizeImportTime(value) {
  const text = String(value || "").trim();
  const compact = text.match(/^(\d{1,2})(\d{2})$/);
  if (compact) return `${compact[1].padStart(2, "0")}:${compact[2]}`;
  return normalizeTime24(text);
}

function copyTodayRosterForward(days) {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const source = dailyRosters[todayKey] || buildRosterEntriesForDate(todayKey);
  let copied = 0;

  for (let day = 1; day <= days; day += 1) {
    const target = new Date(today);
    target.setDate(today.getDate() + day);
    dailyRosters[target.toISOString().slice(0, 10)] = structuredClone(source);
    copied += 1;
  }

  return copied;
}

function buildRosterEntriesForDate(dateValue) {
  return staff.reduce((entries, person) => {
    entries[person.id] = dailyRosterEntryFor(person, dateValue);
    return entries;
  }, {});
}

function applyShiftPlanToDailyRosters(person, plan) {
  (plan.repeatDates || []).forEach((dateValue) => {
    dailyRosters[dateValue] = dailyRosters[dateValue] || buildRosterEntriesForDate(dateValue);
    dailyRosters[dateValue][person.id] = {
      shift: displayShiftName(plan.shift || defaultShiftName),
      inTime: plan.inTime || defaultShiftStart,
      outTime: plan.outTime || defaultShiftEnd,
      status: plan.shift === "Weekly off" ? "Weekly off" : "Working",
      shift2: plan.shift2 || "",
      inTime2: plan.inTime2 || "",
      outTime2: plan.outTime2 || "",
      status2: plan.shift2 ? "Working" : "",
      shift3: plan.shift3 || "",
      inTime3: plan.inTime3 || "",
      outTime3: plan.outTime3 || "",
      status3: plan.shift3 ? "Working" : ""
    };
  });
}

function shiftCalendarCell(person, dateValue) {
  const entry = dailyRosterEntryFor(person, dateValue);
  const statusClass = entry.status === "Working" || entry.status === "Extra shift"
    ? "working"
    : entry.status === "Leave"
      ? "leave"
      : "off";
  const shiftLabel = normalizeShiftLabel(entry.shift);
  const isOwnStaffCell = currentRole === "staff" && (sameId(person.id, activeStaffId) || sameId(person.cloudId, activeStaffId));
  const threadKey = shiftThreadKey(person, dateValue);
  const shiftMessages = messagesForThread(threadKey).slice(0, 4);

  return `
    <div class="shift-calendar-cell ${statusClass}">
      ${shiftLabel ? `<b>${shiftLabel}</b>` : ""}
      <small>${rosterTimeLabel(entry)}</small>
      ${extraShiftLabels(entry).map((label) => `<small>${label}</small>`).join("")}
      ${shiftMessages.length ? `
        <div class="shift-thread-mini">
          ${shiftMessages.map((message) => `<small>${message.label}: ${message.message}</small>`).join("")}
        </div>
      ` : ""}
      ${isOwnStaffCell ? `
        <details class="leave-chat-panel shift-chat-panel" data-shift-chat-panel="${threadKey}" ${sameId(openShiftChatThreadId, threadKey) ? "open" : ""}>
          <summary>Request shift change</summary>
          <form class="leave-chat-form staff-chat-form" data-shift-chat="${threadKey}" data-shift-staff="${person.cloudId || person.id}" data-shift-date="${dateValue}" data-chat-sender="staff">
            <textarea name="message" rows="2" placeholder="Type requested shift change" required></textarea>
            <button class="chat-send-button" type="submit">Send request</button>
          </form>
        </details>
      ` : ""}
    </div>
  `;
}

function handleShiftChatToggle(event) {
  const panel = event.target.closest?.("[data-shift-chat-panel]");
  if (!panel) return;
  openShiftChatThreadId = panel.open ? panel.dataset.shiftChatPanel : "";
  typingAutoRenderPauseUntil = Date.now() + 45000;
}

function rosterTimeLabel(entry) {
  return entry.status === "Working" || entry.status === "Extra shift"
    ? `${normalizeTime24(entry.inTime)} - ${normalizeTime24(entry.outTime)}`
    : entry.status;
}

function extraShiftLabels(entry) {
  const labels = [];
  if (entry.shift2 || entry.inTime2 || entry.outTime2) {
    const label = normalizeShiftLabel(entry.shift2 || "Second shift") || "Second shift";
    const time = entry.inTime2 && entry.outTime2 ? `${normalizeTime24(entry.inTime2)} - ${normalizeTime24(entry.outTime2)}` : "time not set";
    labels.push(`${label}: ${time}`);
  }
  if (entry.shift3 || entry.inTime3 || entry.outTime3) {
    const thirdLabel = normalizeShiftLabel(entry.shift3 || "Third shift") || "Third shift";
    const thirdTime = entry.inTime3 && entry.outTime3 ? `${normalizeTime24(entry.inTime3)} - ${normalizeTime24(entry.outTime3)}` : "time not set";
    labels.push(`${thirdLabel}: ${thirdTime}`);
  }
  return labels;
}

function normalizeTime24(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return text || "00:00";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function shiftThreadKey(person, dateValue) {
  return `shift-${person.cloudId || person.id}-${dateValue}`;
}

function shiftDateFromThreadKey(key) {
  const match = String(key || "").match(/(\d{4}-\d{2}-\d{2})$/);
  return match ? match[1] : "";
}

function encodeRosterShift(entry) {
  if (!entry.shift2 && !entry.inTime2 && !entry.outTime2 && !entry.status2 && !entry.shift3 && !entry.inTime3 && !entry.outTime3 && !entry.status3) {
    return displayShiftName(entry.shift || defaultShiftName);
  }

  return `json:${JSON.stringify({
    shift: displayShiftName(entry.shift || defaultShiftName),
    shift2: entry.shift2 || "",
    inTime2: entry.inTime2 || "",
    outTime2: entry.outTime2 || "",
    status2: entry.status2 || "",
    shift3: entry.shift3 || "",
    inTime3: entry.inTime3 || "",
    outTime3: entry.outTime3 || "",
    status3: entry.status3 || ""
  })}`;
}

function decodeRosterShift(value) {
  const text = String(value || "");
  if (!text.startsWith("json:")) return { shift: displayShiftName(text || defaultShiftName) };

  try {
    return JSON.parse(text.slice(5));
  } catch (error) {
    return { shift: displayShiftName(text || defaultShiftName) };
  }
}

function normalizeShiftLabel(shift) {
  const value = String(shift || "").trim();
  return displayShiftName(value);
}

function displayShiftName(shift) {
  const value = String(shift || "").trim();
  const lowered = value.toLowerCase();
  if (!value || lowered === "varied 10h" || lowered === "varied" || lowered === "10h") return defaultShiftName;
  return value;
}

function departmentColorClass(department) {
  const value = normalizeDepartment(department).replace(/\s+/g, "-").replace(/&/g, "and");
  return `dept-${value}`;
}

function nextDateKeys(startDate, count) {
  const start = new Date(`${startDate}T00:00:00`);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    return localDateKey(date.getFullYear(), date.getMonth(), date.getDate());
  });
}

async function saveDailyRosterToCloud(dateValue) {
  const hotelId = (window.STAFFSYNC_ENV || {}).HOTEL_ID;
  if (!isCloudReady() || !hotelId || !dailyRosters[dateValue]) return;

  const entries = Object.entries(dailyRosters[dateValue])
    .map(([staffId, entry]) => {
      const person = staff.find((item) => sameId(item.id, staffId));
      return person?.cloudId ? { staffProfileId: person.cloudId, ...entry, shift: encodeRosterShift(entry) } : null;
    })
    .filter(Boolean);

  await window.staffSyncDb.saveDailyRoster({ hotelId, rosterDate: dateValue, entries });
}

async function notifyDailyRosterSaved(dateValue) {
  if (!dateValue || !dailyRosters[dateValue] || !isCloudReady()) return;

  const notices = Object.entries(dailyRosters[dateValue])
    .map(([staffId, entry]) => {
      const person = staff.find((item) => sameId(item.id, staffId));
      if (!person?.cloudId) return null;
      const shiftText = `${normalizeShiftLabel(entry.shift) || "Shift"} ${rosterTimeLabel(entry)}${extraShiftLabels(entry).length ? ` | ${extraShiftLabels(entry).join(" | ")}` : ""}`;
      return { person, entry, message: `Your shift for ${formatDate(dateValue)} was updated: ${shiftText}.` };
    })
    .filter(Boolean);

  for (const notice of notices) {
    await addThreadMessage({
      threadId: shiftThreadKey(notice.person, dateValue),
      person: notice.person,
      message: notice.message,
      label: "Shift updated",
      className: "blue",
      metadata: {
        shift_thread: true,
        shift_date: dateValue,
        message_topic: "Shift",
        roster_entry: {
          shift: displayShiftName(notice.entry.shift || defaultShiftName),
          inTime: notice.entry.inTime || "00:00",
          outTime: notice.entry.outTime || "00:00",
          status: notice.entry.status || "Working",
          shift2: notice.entry.shift2 || "",
          inTime2: notice.entry.inTime2 || "",
          outTime2: notice.entry.outTime2 || "",
          status2: notice.entry.status2 || "",
          shift3: notice.entry.shift3 || "",
          inTime3: notice.entry.inTime3 || "",
          outTime3: notice.entry.outTime3 || "",
          status3: notice.entry.status3 || ""
        }
      }
    });
  }
}

async function notifyShiftPlanSaved(person, dateValue, entry) {
  if (!person?.cloudId || !dateValue || !entry || !isCloudReady()) return;
  const shiftText = `${normalizeShiftLabel(entry.shift) || "Shift"} ${rosterTimeLabel(entry)}${extraShiftLabels(entry).length ? ` | ${extraShiftLabels(entry).join(" | ")}` : ""}`;
  await addThreadMessage({
    threadId: shiftThreadKey(person, dateValue),
    person,
    message: `Your shift for ${formatDate(dateValue)} was updated: ${shiftText}.`,
    label: "Shift updated",
    className: "blue",
    metadata: {
      shift_thread: true,
      shift_date: dateValue,
      message_topic: "Shift",
      roster_entry: {
        shift: displayShiftName(entry.shift || defaultShiftName),
        inTime: entry.inTime || defaultShiftStart,
        outTime: entry.outTime || defaultShiftEnd,
        status: entry.status || "Working",
        shift2: entry.shift2 || "",
        inTime2: entry.inTime2 || "",
        outTime2: entry.outTime2 || "",
        status2: entry.status2 || "",
        shift3: entry.shift3 || "",
        inTime3: entry.inTime3 || "",
        outTime3: entry.outTime3 || "",
        status3: entry.status3 || ""
      }
    }
  });
}

async function notifyDailyRosterRangeSaved(days) {
  const today = new Date();
  const dates = [today.toISOString().slice(0, 10)];
  for (let day = 1; day <= days; day += 1) {
    const target = new Date(today);
    target.setDate(today.getDate() + day);
    dates.push(target.toISOString().slice(0, 10));
  }

  for (const dateValue of dates) {
    await notifyDailyRosterSaved(dateValue);
  }
}

async function saveDailyRosterRangeToCloud(days) {
  const today = new Date();
  const dates = [today.toISOString().slice(0, 10)];
  for (let day = 1; day <= days; day += 1) {
    const target = new Date(today);
    target.setDate(today.getDate() + day);
    dates.push(target.toISOString().slice(0, 10));
  }

  for (const dateValue of dates) {
    await saveDailyRosterToCloud(dateValue);
  }
}

async function deleteDailyRosterFromCloud(dateValue) {
  const hotelId = (window.STAFFSYNC_ENV || {}).HOTEL_ID;
  if (!isCloudReady() || !hotelId) return;
  await window.staffSyncDb.deleteDailyRosterDate({ hotelId, rosterDate: dateValue });
}

function escapeAttribute(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function escapeText(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function leaveDraftKey(request) {
  return String(request?.cloudId || request?.id || "");
}

function handleAdminLeaveDraftInput(event) {
  const input = event.target.closest("[data-admin-leave-message]");
  if (!input) return;
  const request = findLeaveRequestByThread(input.dataset.adminLeaveMessage);
  if (!request) return;
  const key = leaveDraftKey(request);
  if (input.value) {
    adminLeaveDrafts[key] = input.value;
  } else {
    delete adminLeaveDrafts[key];
  }
}

async function importStaffRows(text) {
  const rows = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  let added = 0;
  let cloudAdded = 0;
  let skipped = 0;
  const hotelId = (window.STAFFSYNC_ENV || {}).HOTEL_ID;
  const syncCloud = isCloudReady() && hotelId;

  for (const [index, line] of rows.entries()) {
    const columns = parseImportColumns(line);
    const employeeCode = columns[0] || nextEmployeeCode();
    const name = columns[1] || "";
    const department = columns[2] || "General";
    const role = columns[3] || "Staff";
    const leaveBalance = Number(columns[4] || 6);
    const shift = displayShiftName(columns[5] || defaultShiftName);

    if (!name || employeeCodeExists(employeeCode)) {
      skipped += 1;
      continue;
    }

    let cloudId = "";
    if (syncCloud) {
      try {
        const cloudProfile = await window.staffSyncDb.createStaffProfile({
          hotelId,
          employeeCode,
          fullName: name,
          department,
          jobTitle: role,
          leaveBalance: Number.isFinite(leaveBalance) ? leaveBalance : 6,
          shift
        });
        cloudId = cloudProfile.id;
        cloudAdded += 1;
      } catch {
        skipped += 1;
        continue;
      }
    }

    staff = [...staff, {
      id: `import-${Date.now()}-${index}`,
      cloudId,
      employeeCode,
      name,
      department,
      role,
      shift,
      shiftTime: shiftTimeFor(shift),
      clockIn: "",
      clockOut: "",
      status: "Scheduled",
      location: "Not active",
      locationStatus: "Inactive",
      floor: "GF",
      zone: "New Wing",
      ping: "-",
      x: 26 + ((staff.length * 13) % 55),
      y: 24 + ((staff.length * 17) % 55),
      leaveBalance: Number.isFinite(leaveBalance) ? leaveBalance : 6
    }];
    added += 1;
  }

  return { added, cloudAdded, skipped };
}

function parseImportColumns(line) {
  return line
    .split(line.includes("\t") ? "\t" : ",")
    .map((value) => value.trim())
    .filter((value) => value.length);
}

function nextEmployeeCode() {
  const maxCode = staff.reduce((max, person) => {
    const code = Number(String(person.employeeCode || person.id || "").replace(/\D/g, ""));
    return Number.isFinite(code) ? Math.max(max, code) : max;
  }, 0);
  return String(maxCode + 1).padStart(2, "0");
}

function sortStaffByEmployeeCode(list) {
  return [...(list || [])].sort((left, right) => {
    const leftCode = employeeCodeSortValue(left.employeeCode || left.id);
    const rightCode = employeeCodeSortValue(right.employeeCode || right.id);
    if (leftCode !== rightCode) return leftCode - rightCode;
    return String(left.employeeCode || left.id || "").localeCompare(String(right.employeeCode || right.id || ""), undefined, { numeric: true });
  });
}

function employeeCodeSortValue(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function downloadTextFile(filename, text, type = "text/csv") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function shiftTimeFor(shift) {
  const shiftName = displayShiftName(shift);
  if (shiftName === defaultShiftName) return `${defaultShiftStart} - ${defaultShiftEnd}`;
  if (shiftName === "Morning") return "07:00 - 15:00";
  if (shiftName === "Evening") return "15:00 - 23:00";
  if (shiftName === "Night") return "23:00 - 07:00";
  if (shiftName === "Weekly off") return "00:00 - 00:00";
  return "10:00 - 14:00 / 18:00 - 22:00";
}

function shiftStartFromTimeRange(value) {
  return String(value || `${defaultShiftStart} - ${defaultShiftEnd}`).split(" - ")[0] || defaultShiftStart;
}

function shiftEndFromTimeRange(value) {
  return String(value || `${defaultShiftStart} - ${defaultShiftEnd}`).split(" - ")[1] || defaultShiftEnd;
}

function setDefaultShiftPlannerValues() {
  if (!shiftEffectiveDate) return;
  shiftEffectiveDate.value = todayLocalKey();
  shiftValue.value = defaultShiftName;
  shiftInTime.value = defaultShiftStart;
  shiftOutTime.value = defaultShiftEnd;
  setOptionalShiftField("shift-value-2", "Evening");
  setOptionalShiftField("shift-in-time-2", "");
  setOptionalShiftField("shift-out-time-2", "");
  setOptionalShiftField("shift-value-3", "Night");
  setOptionalShiftField("shift-in-time-3", "");
  setOptionalShiftField("shift-out-time-3", "");
  renderShiftRepeatDateChoices();
}

function selectedShiftRepeatDays() {
  return Array.from(document.querySelectorAll("input[name='shift-repeat-day']:checked")).map((input) => input.value);
}

function selectedShiftRepeatDates() {
  return selectedShiftRepeatDays();
}

function setOptionalShiftField(id, value) {
  const field = document.querySelector(`#${id}`);
  if (field) field.value = value;
}

function optionalShiftField(id) {
  return document.querySelector(`#${id}`)?.value.trim() || "";
}

function optionalShiftPart(number) {
  const shift = optionalShiftField(`shift-value-${number}`);
  const inTime = optionalShiftField(`shift-in-time-${number}`);
  const outTime = optionalShiftField(`shift-out-time-${number}`);
  if (!inTime && !outTime) return { shift: "", inTime: "", outTime: "" };
  return {
    shift: shift || (number === "2" ? "Second shift" : "Third shift"),
    inTime,
    outTime
  };
}

function renderShiftRepeatDateChoices() {
  const fieldset = document.querySelector(".repeat-days");
  if (!fieldset) return;
  const today = todayLocalKey();
  if (!shiftEffectiveDate?.value || shiftEffectiveDate.value < today) {
    shiftEffectiveDate.value = today;
  }
  const startValue = shiftEffectiveDate?.value || today;
  const dates = nextDateKeys(startValue, 7);
  fieldset.innerHTML = `
    <legend>Repeat on dates</legend>
    ${dates.map((dateValue, index) => `
      <label><input type="checkbox" name="shift-repeat-day" value="${dateValue}" ${index === 0 ? "checked" : ""}> ${dateValue.slice(8, 10)} <small>${shortDayName(dateValue)}</small></label>
    `).join("")}
  `;
}

function ensureSelectOption(select, value) {
  if (!select || !value || Array.from(select.options).some((option) => option.value === value)) return;
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  select.appendChild(option);
}

function setShiftRepeatDays(days) {
  document.querySelectorAll("input[name='shift-repeat-day']").forEach((input) => {
    input.checked = days.includes(input.value);
  });
}

function clearShiftPlannerForm() {
  if (!shiftForm) return;
  shiftPlanId.value = "";
  setDefaultShiftPlannerValues();
  setShiftRepeatDays([shiftEffectiveDate.value]);
}

function fillShiftPlannerForm(planId) {
  const plan = shiftPlans.find((item) => sameId(item.id, planId));
  if (!plan) return;

  shiftPlanId.value = plan.id;
  shiftStaff.value = String(plan.staffId);
  ensureSelectOption(shiftValue, plan.shift);
  shiftValue.value = plan.shift;
  shiftEffectiveDate.value = plan.effectiveDate;
  renderShiftRepeatDateChoices();
  shiftInTime.value = plan.inTime;
  shiftOutTime.value = plan.outTime;
  setOptionalShiftField("shift-value-2", plan.shift2 || "Evening");
  setOptionalShiftField("shift-in-time-2", plan.inTime2 || "");
  setOptionalShiftField("shift-out-time-2", plan.outTime2 || "");
  setOptionalShiftField("shift-value-3", plan.shift3 || "Night");
  setOptionalShiftField("shift-in-time-3", plan.inTime3 || "");
  setOptionalShiftField("shift-out-time-3", plan.outTime3 || "");
  setShiftRepeatDays(plan.repeatDates || plan.repeatDays || []);
  document.querySelector("#schedule").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("Shift plan loaded for editing.");
}

function titleCase(value) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : "";
}

function updateLeavePolicyNote() {
  syncLeaveDateFields();
  const startDate = document.querySelector("#leave-from").value;
  const duration = document.querySelector("#leave-duration")?.value || "full";
  const endDate = ["half", "short"].includes(duration)
    ? startDate
    : document.querySelector("#leave-to").value;
  const selectedStaff = currentRole === "staff"
    ? staff.find((person) => sameId(person.id, activeStaffId))
    : staff.find((person) => sameId(person.id, leaveStaff.value));
  if (!startDate) {
    leavePolicyNote.textContent = "Reason is only required for leave starting within 2 days.";
    return;
  }

  const requestedDays = leaveRequestUnits({ from: startDate, to: endDate || startDate, duration });
  const balanceText = selectedStaff ? ` ${selectedStaff.name} has ${formatLeaveUnits(monthlyLeaveBalance(selectedStaff, startDate))} leave days left in ${monthLabel(monthKeyForDate(startDate))}.` : "";
  const daysText = requestedDays ? ` This is ${leaveDurationLabel(duration)} and uses ${requestedDays} leave day${requestedDays === 1 ? "" : "s"}.` : "";
  leavePolicyNote.textContent = (leaveNeedsReason(startDate)
    ? "Reason is required because this leave starts within 2 days."
    : "Reason is optional because this request is at least 2 days ahead.") + daysText + balanceText;
}

function leaveNeedsReason(startDate) {
  const today = startOfLocalDay(new Date());
  const start = startOfLocalDay(new Date(`${startDate}T00:00:00`));
  const dayDifference = Math.ceil((start - today) / 86400000);
  return dayDifference < 2;
}

function requestCoversDate(request, dateValue) {
  return request.from <= dateValue && request.to >= dateValue;
}

function leaveRequestDays(request) {
  if (!request.from || !request.to) return 0;
  const start = new Date(`${request.from}T00:00:00`);
  const end = new Date(`${request.to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
  return Math.floor((end - start) / 86400000) + 1;
}

function leaveDurationValue(requestOrValue) {
  const value = typeof requestOrValue === "string" ? requestOrValue : requestOrValue?.duration;
  return ["full", "half", "short"].includes(value) ? value : "full";
}

function leaveDurationLabel(requestOrValue) {
  const value = leaveDurationValue(requestOrValue);
  if (value === "half") return "Half day";
  if (value === "short") return "Short leave - 2.5 hours";
  return "Full day";
}

function leaveRequestTitle(request) {
  return `${leaveDurationLabel(request.duration)} ${request.type || "Leave"}`;
}

function leaveDateRangeLabel(request) {
  return request.from === request.to
    ? formatDate(request.from)
    : `${formatDate(request.from)} to ${formatDate(request.to)}`;
}

function syncLeaveDateFields() {
  const duration = document.querySelector("#leave-duration")?.value || "full";
  const fromField = document.querySelector("#leave-from");
  const toField = document.querySelector("#leave-to");
  if (!fromField || !toField) return;

  const toLabel = toField.closest("label");
  if (["half", "short"].includes(duration)) {
    toField.value = fromField.value;
    toField.disabled = true;
    toField.required = false;
    if (toLabel) toLabel.hidden = true;
  } else {
    toField.disabled = false;
    toField.required = true;
    if (toLabel) toLabel.hidden = false;
    if (!toField.value && fromField.value) toField.value = fromField.value;
  }
}

function leaveRequestUnits(request) {
  const days = leaveRequestDays(request);
  if (!days) return 0;
  const duration = leaveDurationValue(request);
  if (duration === "half") return 0.5;
  if (duration === "short") return 0.25;
  return days;
}

function formatLeaveUnits(value) {
  const number = Number(value || 0);
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function monthKeyForDate(dateValue = new Date().toISOString().slice(0, 10)) {
  return String(dateValue || new Date().toISOString().slice(0, 10)).slice(0, 7);
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function localDateKey(year, monthIndex, day) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function localDateKeyForDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return localDateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

function monthLabel(monthKey) {
  const [year, month] = String(monthKey || monthKeyForDate()).split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(year, (month || 1) - 1, 1));
}

function monthBounds(monthKey) {
  const [year, month] = String(monthKey || monthKeyForDate()).split("-").map(Number);
  const endDay = new Date(year, month || 1, 0).getDate();
  return {
    start: `${year}-${pad2(month || 1)}-01`,
    end: `${year}-${pad2(month || 1)}-${pad2(endDay)}`
  };
}

function monthsBetweenDates(from, to) {
  if (!from || !to) return [];
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return [];

  const keys = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor <= last) {
    keys.push(`${cursor.getFullYear()}-${pad2(cursor.getMonth() + 1)}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return keys;
}

function leaveUnitsInMonth(request, monthKey) {
  if (!request?.from || !request?.to) return 0;
  const bounds = monthBounds(monthKey);
  const from = request.from > bounds.start ? request.from : bounds.start;
  const to = request.to < bounds.end ? request.to : bounds.end;
  if (to < from) return 0;
  return leaveRequestUnits({ ...request, from, to });
}

function approvedLeaveUsedInMonth(person, monthKey, excludeRequestId = "") {
  return leaveRequests
    .filter((request) =>
      request.status === "Approved" &&
      !sameId(request.id, excludeRequestId) &&
      !sameId(request.cloudId, excludeRequestId) &&
      (sameId(request.staffId, person.id) || sameId(request.staffId, person.cloudId))
    )
    .reduce((sum, request) => sum + leaveUnitsInMonth(request, monthKey), 0);
}

function monthlyLeaveBalance(person, dateValue = new Date().toISOString().slice(0, 10), excludeRequestId = "") {
  const used = approvedLeaveUsedInMonth(person, monthKeyForDate(dateValue), excludeRequestId);
  return Number(Math.max(0, monthlyLeaveQuota - used).toFixed(2));
}

function monthlyLeaveRequestAvailability(person, request, excludeRequestId = "") {
  const monthKeys = monthsBetweenDates(request.from, request.to);
  for (const key of monthKeys) {
    const required = leaveUnitsInMonth(request, key);
    const available = monthlyLeaveBalance(person, `${key}-01`, excludeRequestId);
    if (required > available) {
      return { ok: false, monthKey: key, monthLabel: monthLabel(key), required, available };
    }
  }
  return { ok: true };
}

function encodeLeaveReason(reason, duration) {
  return `[${leaveDurationLabel(duration)}] ${reason || ""}`.trim();
}

function decodeLeaveReason(reason) {
  const value = String(reason || "");
  const match = value.match(/^\[(Full day|Half day|Short leave - 2\.5 hours)\]\s*(.*)$/i);
  if (!match) return { duration: "full", reason: value };
  const label = match[1].toLowerCase();
  return {
    duration: label.startsWith("half") ? "half" : label.startsWith("short") ? "short" : "full",
    reason: match[2] || ""
  };
}

function staffHasApprovedLeave(person, dateValue) {
  return leaveRequests.some((request) =>
    (sameId(request.staffId, person.id) || sameId(request.staffId, person.cloudId)) &&
    request.status === "Approved" &&
    requestCoversDate(request, dateValue)
  );
}

function approvedLeaveForStaffDate(person, dateValue) {
  return leaveRequests.find((request) =>
    (sameId(request.staffId, person.id) || sameId(request.staffId, person.cloudId)) &&
    request.status === "Approved" &&
    requestCoversDate(request, dateValue)
  ) || null;
}

function adjustedShiftOutTime(inTime, outTime, leaveDuration) {
  const start = minutesFromTime(inTime);
  let end = minutesFromTime(outTime);
  if (end <= start) end += 24 * 60;
  const shiftMinutes = Math.max(0, end - start);
  const reduction = leaveDuration === "half"
    ? Math.round(shiftMinutes / 2)
    : leaveDuration === "short"
      ? 150
      : 0;
  return timeFromMinutes(Math.max(start, end - reduction));
}

function timeFromMinutes(value) {
  const minutes = ((value % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function isScheduledForDate(person, dateValue, dayName = shortDayName(dateValue)) {
  const dailyEntry = dailyRosters[dateValue]?.[person.id];
  if (dailyEntry) {
    return dailyEntry.status === "Working" || dailyEntry.status === "Extra shift";
  }

  if (person.status === "Off duty" || person.shift === "Weekly off") return false;

  const plan = activeShiftPlanFor(person);
  if (!plan) return true;
  if (plan.effectiveDate && plan.effectiveDate > dateValue) return false;
  if (plan.shift === "Weekly off") return false;

  const repeatDays = plan.repeatDays || [];
  return !repeatDays.length || repeatDays.includes(dayName);
}

function shortDayName(dateValue) {
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(`${dateValue}T00:00:00`));
}

function formatMonthShort(dateValue) {
  return new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(`${dateValue}T00:00:00`));
}

function normalizeDepartment(department) {
  const value = (department || "General").trim().toLowerCase();
  if (value === "restaurant" || value === "restutrant") return "restaurant";
  if (value === "house keeping" || value === "housekeeping" || value === "house keepking") return "housekeeping";
  if (value === "frontoffice" || value === "front office") return "front office";
  return value || "general";
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function resetLocalDataForRealTesting(version) {
  try {
    if (localStorage.getItem("staffsync.realDataResetVersion") === version) return;

    [
      "staffsync.staff",
      "staffsync.leaveRequests",
      "staffsync.activityLog",
      "staffsync.staffMessages",
      "staffsync.deletedStaffMessageIds",
      "staffsync.shiftPlans",
      "staffsync.dailyRosters",
      "staffsync.staffDevices",
      "staffsync.staffPasswords",
      "staffsync.hiddenLocationPingIds",
      "staffsync.activeStaffId",
      "staffsync.adminDashboardDate",
      "staffsync.monthEndLeaveCleanupNotice",
      "staffsync.cloudMonthEndLeaveCleanup"
    ].forEach((key) => localStorage.removeItem(key));

    [
      "staffsync.activeStaffId",
      "staffsync.role",
      "staffsync.cloudEmail",
      "staffsync.appUserId",
      "staffsync.staffActionNotice",
      "staffsync.latestLeaveAnswer"
    ].forEach((key) => sessionStorage.removeItem(key));

    localStorage.setItem("staffsync.realDataResetVersion", version);
  } catch {
    // If storage is unavailable, the cloud data still loads after sign-in.
  }
}

function resetStaffPasswordsForFirstLogin(version) {
  try {
    if (localStorage.getItem("staffsync.staffPasswordResetVersion") === version) return;
    staffPasswords = {};
    localStorage.removeItem("staffsync.staffPasswords");
    localStorage.setItem("staffsync.staffPasswordResetVersion", version);
  } catch {
    // If storage is unavailable, first-login password rules still apply to cloud records.
  }
}

function saveState() {
  localStorage.setItem("staffsync.staff", JSON.stringify(staff));
  localStorage.setItem("staffsync.leaveRequests", JSON.stringify(leaveRequests));
  localStorage.setItem("staffsync.policy", JSON.stringify(policy));
  localStorage.setItem("staffsync.activityLog", JSON.stringify(activityLog));
  localStorage.setItem("staffsync.staffMessages", JSON.stringify(staffMessages));
  localStorage.setItem("staffsync.deletedStaffMessageIds", JSON.stringify(deletedStaffMessageIds));
  localStorage.setItem("staffsync.shiftPlans", JSON.stringify(shiftPlans));
  localStorage.setItem("staffsync.dailyRosters", JSON.stringify(dailyRosters));
  localStorage.setItem("staffsync.staffDevices", JSON.stringify(staffDevices));
  localStorage.setItem("staffsync.staffPasswords", JSON.stringify(staffPasswords));
  localStorage.setItem("staffsync.apLocationMap", JSON.stringify(apLocationMap));
  localStorage.setItem("staffsync.hiddenLocationPingIds", JSON.stringify(hiddenLocationPingIds));
  rememberActiveStaff();
}

function rememberActiveStaff() {
  if (!activeStaffId) {
    sessionStorage.removeItem("staffsync.activeStaffId");
    localStorage.removeItem("staffsync.activeStaffId");
    return;
  }
  sessionStorage.setItem("staffsync.activeStaffId", String(activeStaffId));
  localStorage.setItem("staffsync.activeStaffId", String(activeStaffId));
}

function removeDemoRecordsFromLocalState() {
  const demoNames = new Set([
    "asha perera",
    "dinesh silva",
    "maya fernando",
    "nalin kumara",
    "ravi jayasuriya",
    "sahana wijesinghe"
  ]);
  const demoIds = new Set(staff.filter((person) => demoNames.has(String(person.name || "").toLowerCase())).map((person) => String(person.id)));
  if (!demoIds.size) return;

  staff = staff.filter((person) => !demoIds.has(String(person.id)));
  leaveRequests = leaveRequests.filter((request) =>
    !demoIds.has(String(request.staffId)) &&
    !demoNames.has(String(request.name || "").toLowerCase())
  );
  activityLog = activityLog.filter((item) => !String(item.message || "").toLowerCase().includes("demo workspace"));
  staffMessages = staffMessages.filter((message) => !demoIds.has(String(message.staffId)));
}

function setStaffActionNotice(message) {
  staffActionNotice = message;
  sessionStorage.setItem("staffsync.staffActionNotice", message);
  const notice = document.querySelector("#staff-action-notice");
  if (notice) notice.textContent = message;
}

function isLastDayOfMonth(date = new Date()) {
  return date.getDate() === new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function monthEndCleanupKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function applyMonthEndLeaveDashboardCleanup() {
  const currentMonthStart = monthBounds(monthKeyForDate()).start;
  const cleanupKey = monthEndCleanupKey();
  const beforeCount = leaveRequests.length + staffMessages.length;
  leaveRequests = leaveRequests.filter((request) => !request.to || request.to >= currentMonthStart);
  staffMessages = staffMessages.filter((message) => {
    const request = leaveRequests.find((item) =>
      sameId(message.leaveRequestId, item.id) ||
      sameId(message.leaveRequestId, item.cloudId)
    );
    return request || !message.leaveRequestId;
  });
  activityLog = activityLog.filter((item) => item.type !== "Leave" || !item.time || item.time.slice(0, 10) >= currentMonthStart);
  localStorage.setItem("staffsync.monthEndLeaveCleanupNotice", cleanupKey);
  saveState();

  if (beforeCount !== leaveRequests.length + staffMessages.length) {
    activityLog = [{
      id: Date.now(),
      type: "System",
      message: "New month cleanup hid previous month leave requests and answers",
      time: new Date().toISOString()
    }, ...activityLog].slice(0, 50);
    saveState();
  }

  return true;
}

async function cleanupCloudLeaveDashboardData() {
  // Keep cloud leave decisions as the source of record. The dashboard hides previous
  // month items locally so approvals/rejections/cancellations remain visible through
  // the full last day of each month.
}

async function openDemoRole(role) {
  if (currentRole === "staff" && role !== "staff") {
    roleSelect.value = "staff";
    if (loginRoleSelect) loginRoleSelect.value = "staff";
    lockStaffOnlyView();
    showToast("Staff login cannot open admin or manager view.");
    return;
  }

  const previousRole = currentRole;
  currentRole = role;
  currentCloudEmail = "";
  currentAppUserId = "";

  if (role === "staff" && !(await prepareStaffDemoLogin())) {
    currentRole = previousRole || "";
    return;
  }

  sessionStorage.setItem("staffsync.role", currentRole);
  sessionStorage.removeItem("staffsync.cloudEmail");
  if (currentRole === "staff" && currentAppUserId) {
    sessionStorage.setItem("staffsync.appUserId", currentAppUserId);
  } else {
    sessionStorage.removeItem("staffsync.appUserId");
  }
  addActivity("Login", `${titleCase(currentRole)} opened the demo`);
  saveState();
  renderAll();
  if (currentRole === "staff") {
    primeStaffLocationPermission();
  }
  startLocationMonitoring();
  startLeaveLiveRefresh();
  startCloudAutoRefresh();
  if (isCloudReady()) {
    syncCloudDashboard();
  }
  showToast(`${titleCase(currentRole)} view opened.`);
}

function updateLoginMode() {
  const role = loginRoleSelect?.value || "staff";
  const isStaff = role === "staff";
  if (staffCredentials) staffCredentials.hidden = !isStaff;
  if (adminCredentials) adminCredentials.hidden = isStaff;
  if (loginSubmit) loginSubmit.textContent = isStaff ? "Sign in as staff" : `Sign in as ${titleCase(role)}`;
  if (isStaff) {
    updateStaffLoginPasswordHint();
  } else {
    updateCloudStatus(role === "admin"
      ? "Enter admin password. Enter email only for Supabase cloud login."
      : "Enter manager password. Enter email only for Supabase cloud login.");
  }
}

async function handleUnifiedLogin() {
  const role = loginRoleSelect?.value || "staff";
  if (currentRole === "staff" && role !== "staff") {
    if (loginRoleSelect) loginRoleSelect.value = "staff";
    lockStaffOnlyView();
    showToast("Staff login cannot open admin or manager view.");
    return;
  }

  if (role === "staff") {
    await openDemoRole("staff");
    return;
  }

  const email = cloudEmail?.value.trim() || "";
  const password = cloudPassword?.value || "";
  if (email) {
    await signInWithSupabase();
    return;
  }

  if (password !== demoRolePasswords[role]) {
    updateCloudStatus(`${titleCase(role)} password is incorrect.`);
    showToast(`${titleCase(role)} password is incorrect.`);
    return;
  }

  await openDemoRole(role);
}

function normalizeEmployeeCode(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? String(Number(digits)) : "";
}

function cleanEmployeeCode(value) {
  return String(value || "").trim();
}

function employeeCodeExists(code, exceptStaffId = "") {
  const normalized = normalizeEmployeeCode(code);
  if (!normalized) return false;
  return staff.some((person) => (
    normalizeEmployeeCode(person.employeeCode || person.id) === normalized &&
    !sameId(person.id, exceptStaffId)
  ));
}

function findStaffByLoginCode(value) {
  const normalized = normalizeEmployeeCode(value);
  if (!normalized) return null;
  return staff.find((person) => normalizeEmployeeCode(person.employeeCode || person.id) === normalized) || null;
}

async function findOrLoadStaffByLoginCode(value) {
  const localStaff = findStaffByLoginCode(value);
  if (localStaff || !isCloudReady()) return localStaff;

  try {
    const profile = await window.staffSyncDb.getStaffProfileByCode(value);
    if (!profile) return null;
    const mapped = mapCloudStaffProfile(profile);
    const existingIndex = staff.findIndex((person) => sameId(person.cloudId, mapped.cloudId) || normalizeEmployeeCode(person.employeeCode) === normalizeEmployeeCode(mapped.employeeCode));
    if (existingIndex >= 0) {
      staff[existingIndex] = { ...staff[existingIndex], ...mapped };
    } else {
      staff = [...staff, mapped];
    }
    upsertStaffWifiDevice(mapped, mapped.wifiMac);
    populateFilters();
    saveState();
    return staff.find((person) => sameId(person.cloudId, mapped.cloudId)) || mapped;
  } catch {
    return null;
  }
}

async function prepareStaffDemoLogin() {
  let selectedStaff = findStaffByLoginCode(staffLoginCode?.value || "");
  if (!selectedStaff) {
    setStaffLoginStatus("Checking cloud for this employee code...", "blue");
    selectedStaff = await findOrLoadStaffByLoginCode(staffLoginCode?.value || "");
  }
  const password = staffLoginPassword?.value.trim() || "";
  const newPassword = staffNewPassword?.value.trim() || "";

  if (!selectedStaff) {
    setStaffLoginStatus("No employee found for this code. Try 01, 02, or full code like 000001.", "red");
    showToast("Employee code not found.");
    return false;
  }
  activeStaffId = selectedStaff.id;
  currentAppUserId = selectedStaff.appUserId || "";
  rememberActiveStaff();
  sessionStorage.setItem("staffsync.appUserId", currentAppUserId);

  if (!password) {
    const message = hasStaffPassword(selectedStaff)
      ? "Enter the saved staff password for this employee."
      : "First login: enter any password to save for this employee.";
    setStaffLoginStatus(message, "amber");
    showToast(message);
    return false;
  }

  const hadPassword = hasStaffPassword(selectedStaff);
  const passwordResult = await checkStaffPassword(selectedStaff, password, newPassword);
  if (!passwordResult.ok) {
    setStaffLoginStatus(passwordResult.message || "Wrong staff password. Admin can clear it from Staff > Edit staff.", "red");
    showToast(passwordResult.message || "Wrong staff password.");
    return false;
  }

  if (staffLoginPassword) staffLoginPassword.value = "";
  if (staffNewPassword) staffNewPassword.value = "";
  setStaffLoginStatus(passwordResult.changedPassword
    ? "New password saved. Opening staff view."
    : hadPassword || passwordResult.hadCloudPassword
      ? "Password accepted. Opening staff view."
      : "New staff password saved. Opening staff view.", "green");
  return true;
}

function staffPasswordKey(person) {
  return normalizeEmployeeCode(person?.employeeCode) || person?.employeeCode || person?.cloudId || person?.id || "";
}

function staffPasswordKeys(person) {
  return [
    normalizeEmployeeCode(person?.employeeCode),
    person?.employeeCode,
    person?.cloudId,
    person?.id
  ].filter((key, index, keys) => key && keys.indexOf(key) === index);
}

function hasStaffPassword(person) {
  return staffPasswordKeys(person).some((key) => Boolean(staffPasswords[key]));
}

function staffPasswordResetDoneKey(person) {
  return `${staffPasswordResetEpoch}:${staffPasswordKey(person)}`;
}

function hasCompletedCurrentStaffPasswordReset(person) {
  return Boolean(staffPasswords[staffPasswordResetDoneKey(person)]);
}

function saveStaffPassword(person, password) {
  const key = staffPasswordKey(person);
  if (!key || !password) return;
  staffPasswords[key] = localStaffPasswordValue(password);
  staffPasswords[staffPasswordResetDoneKey(person)] = "done";
}

async function checkStaffPassword(person, password, newPassword = "") {
  const localSavedKey = staffPasswordKeys(person).find((candidate) => staffPasswords[candidate]);
  const localSaved = localSavedKey ? staffPasswords[localSavedKey] : "";
  if (localSaved && localSaved === localStaffPasswordValue(password)) {
    if (newPassword) {
      const change = validateNewStaffPassword(newPassword);
      if (!change.ok) return change;
      await trySaveCloudStaffPassword(person, newPassword);
      saveStaffPassword(person, newPassword);
      return { ok: true, hadCloudPassword: false, changedPassword: true };
    }
    return { ok: true, hadCloudPassword: false };
  }

  if (password === firstStaffPassword && newPassword) {
    const setup = validateFirstStaffPasswordSetup(password, newPassword);
    if (!setup.ok) return setup;
    await trySaveCloudStaffPassword(person, newPassword);
    saveStaffPassword(person, newPassword);
    return { ok: true, hadCloudPassword: false, changedPassword: true };
  }

  if (person?.cloudId && isCloudReady()) {
    try {
      const record = await window.staffSyncDb.getStaffLoginPassword(person.cloudId);
      const passwordHash = await hashStaffPassword(person, password);
      if (!record?.password_hash || record.reset_required) {
        const setup = validateFirstStaffPasswordSetup(password, newPassword);
        if (!setup.ok) return setup;
        await trySaveCloudStaffPassword(person, newPassword);
        saveStaffPassword(person, newPassword);
        return { ok: true, hadCloudPassword: false, changedPassword: true };
      }
      const ok = record.password_hash === passwordHash;
      if (ok) {
        if (newPassword) {
          const change = validateNewStaffPassword(newPassword);
          if (!change.ok) return change;
          await trySaveCloudStaffPassword(person, newPassword);
          saveStaffPassword(person, newPassword);
          return { ok: true, hadCloudPassword: true, changedPassword: true };
        }
        saveStaffPassword(person, password);
      }
      return { ok, hadCloudPassword: true };
    } catch (error) {
      return {
        ok: false,
        hadCloudPassword: false,
        message: error.message || "Cloud password check failed. Ask admin to run the staff password SQL."
      };
    }
  }

  const key = staffPasswordKey(person);
  if (!key) return { ok: false, hadCloudPassword: false };
  if (!localSaved) {
    const setup = validateFirstStaffPasswordSetup(password, newPassword);
    if (!setup.ok) return setup;
    saveStaffPassword(person, newPassword);
    return { ok: true, hadCloudPassword: false, changedPassword: true };
  }
  const isMatch = localSaved === localStaffPasswordValue(password);
  if (isMatch && localSavedKey !== key) {
    staffPasswords[key] = localSaved;
    delete staffPasswords[localSavedKey];
  }
  if (isMatch && newPassword) {
    const change = validateNewStaffPassword(newPassword);
    if (!change.ok) return change;
    saveStaffPassword(person, newPassword);
    return { ok: true, hadCloudPassword: false, changedPassword: true };
  }
  return { ok: isMatch, hadCloudPassword: false };
}

function validateFirstStaffPasswordSetup(password, newPassword) {
  if (password !== firstStaffPassword) {
    return { ok: false, message: "First login password is incorrect." };
  }
  return validateNewStaffPassword(newPassword);
}

function localStaffPasswordValue(password) {
  return `${staffPasswordHashVersion}:${btoa(unescape(encodeURIComponent(password)))}`;
}

function validateNewStaffPassword(newPassword) {
  if (!newPassword) {
    return { ok: false, message: "Enter a new password for this staff login." };
  }
  if (newPassword === firstStaffPassword) {
    return { ok: false, message: "New password cannot be the temporary password. Choose a private password." };
  }
  if (newPassword.length < 4) {
    return { ok: false, message: "New password must be at least 4 characters." };
  }
  return { ok: true };
}

function clearStaffPassword(person) {
  staffPasswordKeys(person).forEach((key) => delete staffPasswords[key]);
}

async function saveCloudStaffPassword(person, password) {
  if (!person?.cloudId || !isCloudReady() || !password) return;
  await window.staffSyncDb.setStaffLoginPassword({
    staffProfileId: person.cloudId,
    passwordHash: await hashStaffPassword(person, password),
    resetRequired: false
  });
}

async function trySaveCloudStaffPassword(person, password) {
  try {
    await saveCloudStaffPassword(person, password);
    return true;
  } catch {
    return false;
  }
}

async function hashStaffPassword(person, password) {
  const code = normalizeEmployeeCode(person?.employeeCode) || String(person?.cloudId || person?.id || "");
  const source = `staffsync:${staffPasswordHashVersion}:${code}:${password}`;
  if (window.crypto?.subtle) {
    const bytes = new TextEncoder().encode(source);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return btoa(unescape(encodeURIComponent(source)));
}

function setStaffLoginStatus(message, tone = "") {
  if (!staffLoginStatus) return;
  staffLoginStatus.textContent = message;
  staffLoginStatus.dataset.tone = tone;
}

function currentTime() {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
}

function todayLocalKey() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function timeFromIso(value) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(value));
}

function attendanceReportRange() {
  const selected = new Date(`${attendanceReportDate.value || new Date().toISOString().slice(0, 10)}T00:00:00`);
  const period = attendanceReportPeriod?.value || "daily";

  if (period === "weekly") {
    const start = startOfLocalDay(selected);
    const mondayOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - mondayOffset);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      startDate: isoDate(start),
      endDate: isoDate(end)
    };
  }

  if (period === "monthly") {
    const start = new Date(selected.getFullYear(), selected.getMonth(), 1);
    const end = new Date(selected.getFullYear(), selected.getMonth() + 1, 0);
    return {
      startDate: isoDate(start),
      endDate: isoDate(end)
    };
  }

  return {
    startDate: isoDate(selected),
    endDate: isoDate(selected)
  };
}

function hoursBetweenClockTimes(clockIn, clockOut) {
  if (!clockIn) return 0;
  const [inHour, inMinute] = clockIn.split(":").map(Number);
  const start = new Date();
  start.setHours(inHour || 0, inMinute || 0, 0, 0);

  const end = new Date();
  if (clockOut) {
    const [outHour, outMinute] = clockOut.split(":").map(Number);
    end.setHours(outHour || 0, outMinute || 0, 0, 0);
    if (end < start) end.setDate(end.getDate() + 1);
  }

  return Math.max(0, (end - start) / 3600000);
}

function hoursBetweenIso(startValue, endValue) {
  if (!startValue) return 0;
  const start = new Date(startValue);
  const end = endValue ? new Date(endValue) : new Date();
  return Math.max(0, (end - start) / 3600000);
}

function formatHours(value) {
  return Number(value || 0).toFixed(1);
}

function isoDate(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function statusFromAttendance(status) {
  if (status === "late") return "Late";
  if (status === "completed") return "Completed";
  if (status === "absent") return "Absent";
  return "On duty";
}

function getCurrentPositionSafe() {
  if (!navigator.geolocation) {
    return Promise.resolve(null);
  }

  const readOnce = () => new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      }),
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  });

  return new Promise(async (resolve) => {
    let bestPosition = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const position = await readOnce();
      if (position && (!bestPosition || Number(position.accuracy || Infinity) < Number(bestPosition.accuracy || Infinity))) {
        bestPosition = position;
      }
      if (bestPosition && Number(bestPosition.accuracy || Infinity) <= targetGpsAccuracyMeters) {
        break;
      }
    }
    resolve(bestPosition);
  });
}

async function primeStaffLocationPermission() {
  if (staffLocationPermissionPrimed || currentRole !== "staff" || !navigator.geolocation) return;
  staffLocationPermissionPrimed = true;

  const position = await getCurrentPositionSafe();
  if (position) {
    setStaffActionNotice("Location permission is ready. Clock in when your shift starts.");
    saveState();
    if (!shouldPauseAutoRender()) renderRoleDemo();
  } else {
    setStaffActionNotice("Please allow location once so clock in can save your shift location.");
    if (!shouldPauseAutoRender()) renderRoleDemo();
  }
}

function watchCurrentPosition(onPosition) {
  if (!navigator.geolocation) return null;

  return navigator.geolocation.watchPosition(
    (position) => onPosition({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    }),
    () => {},
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    }
  );
}

function googleMapsUrl(latitude, longitude) {
  return `https://www.google.com/maps?q=${Number(latitude).toFixed(7)},${Number(longitude).toFixed(7)}`;
}

function initials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2);
}

function locationClassFor(status) {
  if (status === "Inside") return "green";
  if (status === "Outside") return "red";
  if (status === "Break") return "blue";
  return "amber";
}

function statusClassFor(status) {
  if (status === "On duty") return "green";
  if (status === "Late") return "amber";
  if (status === "On break") return "blue";
  return "";
}

function statusFromLocationPing(status) {
  if (status === "outside_property") return "Outside";
  if (status === "break") return "Break";
  if (status === "inside_property") return "Inside";
  return "Inside";
}

function staffLocationLabel(person) {
  return `${person.zone || "New Wing"} - ${person.floor || "GF"}`;
}

function normalizeWing(value) {
  return String(value || "").toLowerCase().includes("old") ? "Old Wing" : "New Wing";
}

function wingFloorPinPosition(zone = "New Wing", floor = "GF") {
  const x = zone === "Old Wing" ? 74 : 26;
  const floorY = {
    "3F": 32,
    "2F": 46,
    "1F": 60,
    GF: 74
  };
  return { x, y: floorY[floor] || 74 };
}

function leaveStatusForAction(action) {
  if (action === "approve") return "Approved";
  if (action === "reject") return "Rejected";
  if (action === "adjust") return "Change the Request";
  if (action === "cancel") return "Cancelled";
  return "";
}

function leaveStatusToCloud(status) {
  if (status === "Adjustment requested" || status === "Change the Request") return "adjustment_requested";
  if (status === "Cancelled") return "cancelled";
  return status.toLowerCase();
}

function leaveStatusLabel(status) {
  if (status === "adjustment_requested") return "Change the Request";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  if (status === "cancelled") return "Cancelled";
  return "Pending";
}

function leaveStatusClass(status) {
  if (status === "Approved") return "green";
  if (status === "Rejected") return "red";
  if (status === "Cancelled") return "blue";
  if (status === "Adjustment requested" || status === "Change the Request") return "blue";
  return "amber";
}

function leaveStatusDisplay(status) {
  return status === "Adjustment requested" ? "Change the Request" : status;
}

function calendarLeaveStatusText(status) {
  if (status === "Approved") return "ON leave";
  if (status === "Adjustment requested" || status === "Change the Request") return "Change the Request";
  return "Requested";
}

function formatDate(value) {
  if (!value) return "not set";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return `${monthShortName(Number(match[2]))} ${Number(match[3])}`;
  }
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

function monthShortName(monthNumber) {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Math.max(0, Math.min(11, monthNumber - 1))];
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function isCloudReady() {
  return Boolean(window.staffSyncCloudReady && window.staffSyncDb && window.staffSyncSupabase);
}

function sameId(left, right) {
  return String(left) === String(right);
}

function updateCloudStatus(message) {
  if (!cloudStatus) return;

  if (message) {
    cloudStatus.textContent = message;
    return;
  }

  cloudStatus.textContent = isCloudReady()
    ? "Cloud login connected. Use your Supabase email and password."
    : "Cloud login is waiting for env.js with your Supabase Project URL and anon key.";
}

async function restoreCloudSession() {
  if (!isCloudReady()) return;

  try {
    const user = await window.staffSyncDb.getCurrentUser();
    if (user) {
      await applyCloudUser(user, false);
    }
  } catch {
    updateCloudStatus("Cloud is connected, but no active login session was found.");
  }
}

async function signInWithSupabase() {
  if (!isCloudReady()) {
    updateCloudStatus("First fill env.js with your Supabase Project URL and anon key.");
    showToast("Cloud settings are not ready yet.");
    return;
  }

  const email = cloudEmail.value.trim();
  const password = cloudPassword.value;

  if (!email || !password) {
    updateCloudStatus("Enter the Supabase user email and password.");
    return;
  }

  if (loginSubmit) loginSubmit.disabled = true;
  updateCloudStatus("Checking Supabase login...");

  try {
    const result = await window.staffSyncDb.signIn(email, password);
    await applyCloudUser(result.user, true);
    cloudPassword.value = "";
    showToast(`${titleCase(currentRole)} cloud login opened.`);
  } catch (error) {
    updateCloudStatus(error.message || "Supabase login failed. Check email and password.");
    showToast("Cloud login failed.");
  } finally {
    if (loginSubmit) loginSubmit.disabled = false;
  }
}

async function applyCloudUser(user, showMessage) {
  const { data, error } = await window.staffSyncSupabase
    .from("app_users")
    .select("id, email, role, status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error("Login worked, but this Supabase user is not linked to StaffSync Beach & Bliss Mirissa. Run the link-auth SQL again with this user's UID.");
  }
  const role = String(data.role || "").toLowerCase();
  const isAdminLogin = ["admin", "manager"].includes(role);
  if (data.status !== "active" && !isAdminLogin) {
    throw new Error("This login is not active in StaffSync Beach & Bliss Mirissa.");
  }

  currentRole = data.role;
  currentCloudEmail = data.email || user.email || "";
  currentAppUserId = data.id;
  sessionStorage.setItem("staffsync.role", currentRole);
  sessionStorage.setItem("staffsync.cloudEmail", currentCloudEmail);
  sessionStorage.setItem("staffsync.appUserId", currentAppUserId);

  await cleanupCloudLeaveDashboardData();
  await loadCloudStaffProfiles();
  await loadCloudAttendanceData();
  await loadAttendanceReportForSelectedDate();
  await loadCloudLeaveData();
  await loadCloudDailyRosterData();

  if (currentRole === "staff") {
    await matchCloudStaffProfile(data.id);
    rememberActiveStaff();
    primeStaffLocationPermission();
  }
  await loadCloudActivityData();

  addActivity("Login", `${titleCase(currentRole)} signed in with Supabase`);
  saveState();
  renderAll();
  startLocationMonitoring();
  startLeaveLiveRefresh();
  startCloudAutoRefresh();
  updateCloudStatus(data.status !== "active" && isAdminLogin
    ? `Signed in as ${currentCloudEmail}. Admin access opened; please run the re-activate SQL once.`
    : `Signed in as ${currentCloudEmail}.`);

  if (showMessage) {
    showToast("Cloud login successful.");
  }
}

async function loadCloudStaffProfiles() {
  const profiles = await window.staffSyncDb.getStaffProfiles();
  if (!profiles?.length) {
    updateCloudStatus("Cloud login worked, but no staff profiles were found yet.");
    return;
  }

  staff = profiles
    .filter((profile) => profile.app_users?.status !== "inactive" && !isRemovedStaffProfile(profile))
    .map(mapCloudStaffProfile);
  staff = sortStaffByEmployeeCode(staff);
  staff.forEach((person) => upsertStaffWifiDevice(person, person.wifiMac));
  leaveRequests = [];
  populateFilters();
}

async function loadCloudLeaveData() {
  await cleanupCloudLeaveDashboardData();
  const hotelId = (window.STAFFSYNC_ENV || {}).HOTEL_ID;
  try {
    leaveTypes = await window.staffSyncDb.getLeaveTypes(hotelId);
  } catch {
    leaveTypes = leaveTypes || [];
  }
  const cloudRequests = await window.staffSyncDb.getLeaveRequests();
  leaveRequests = cloudRequests.map(mapCloudLeaveRequest);
  applyMonthEndLeaveDashboardCleanup();
}

async function loadCloudDailyRosterData() {
  const hotelId = (window.STAFFSYNC_ENV || {}).HOTEL_ID;
  if (!hotelId || !isCloudReady()) return;

  const today = startOfLocalDay(new Date());
  const start = new Date(today);
  start.setDate(today.getDate() - 7);
  const end = new Date(today);
  end.setDate(today.getDate() + 45);

  try {
    const rows = await window.staffSyncDb.getDailyRosters({
      hotelId,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10)
    });
    dailyRosters = mapCloudDailyRosters(rows);
  } catch {
    // The daily_rosters table is optional until the upgrade SQL is run.
  }
}

async function loadCloudActivityData() {
  const hotelId = (window.STAFFSYNC_ENV || {}).HOTEL_ID;
  if (!hotelId || !isCloudReady()) return;

  const activeStaff = staff.find((person) => sameId(person.id, activeStaffId)) ||
    staff.find((person) => sameId(person.cloudId, activeStaffId)) ||
    staff.find((person) => currentAppUserId && sameId(person.appUserId, currentAppUserId));
  if (currentRole === "staff" && activeStaff && !sameId(activeStaff.id, activeStaffId)) {
    activeStaffId = activeStaff.id;
    rememberActiveStaff();
  }
  const targetUserId = currentRole === "staff" ? (currentAppUserId || activeStaff?.appUserId || "") : "";
  if (currentRole === "staff" && targetUserId && !currentAppUserId) {
    currentAppUserId = targetUserId;
    sessionStorage.setItem("staffsync.appUserId", currentAppUserId);
  }
  const logs = currentRole === "staff"
    ? await loadStaffTargetedActivityLogs({ hotelId, targetUserId })
    : await window.staffSyncDb.getActivityLogs({
      hotelId,
      targetUserId: targetUserId || undefined,
      limit: 500
    });

  let mappedLogs = logs.map(mapCloudActivityLog);
  try {
    const leaveMessageRows = window.staffSyncDb.getLeaveMessages
      ? await window.staffSyncDb.getLeaveMessages({ hotelId, limit: 1000 })
      : [];
    mappedLogs = mergeStaffMessages(mappedLogs, leaveMessageRows.map(mapCloudLeaveMessage));
  } catch {
    // Dedicated leave chat table is available after the v110 SQL is run.
  }
  applyAttendanceEventsToStaff(mappedLogs);
  if (currentRole === "staff") {
    const staffProfileId = activeStaff?.cloudId || activeStaff?.id || "";
    const ownLeaveThreadIds = new Set(leaveRequests
      .filter((request) => leaveRequestBelongsToStaff(request, activeStaff))
      .flatMap((request) => [request.id, request.cloudId, leaveThreadId(request)])
      .filter(Boolean)
      .map(String));
    const cloudMessages = mappedLogs.filter((item) =>
      !item.isAttendanceEvent && (
        sameId(item.staffProfileId, staffProfileId) ||
        sameId(item.staffId, staffProfileId) ||
        ownLeaveThreadIds.has(String(item.leaveRequestId || "")) ||
        (activeStaff && shiftMessageBelongsToStaff(item, activeStaff)) ||
        (targetUserId && sameId(item.targetUserId, targetUserId))
      )
    );
    staffMessages = mergeStaffMessages(staffMessages, cloudMessages);
    return;
  }

  activityLog = mappedLogs
    .filter((item) => item.type !== "Leave" || item.isAttendanceEvent)
    .filter((item) => !isActivityLogHidden(item));
  const cloudMessages = mappedLogs.filter((item) => !item.isAttendanceEvent && (
    item.type === "Leave" ||
    item.targetUserId ||
    item.staffProfileId
  ));
  staffMessages = mergeStaffMessages(staffMessages, cloudMessages);
}

function applyAttendanceEventsToStaff(logs) {
  latestAttendanceEventLogs = (logs || []).filter((log) => log.isAttendanceEvent);
  const todayKey = todayLocalKey();
  const latestByStaff = new Map();
  (logs || [])
    .filter((log) => log.isAttendanceEvent && (log.staffProfileId || log.staffId))
    .filter((log) => localDateKeyForDate(new Date(log.time || 0)) === todayKey)
    .forEach((log) => {
      const key = String(log.staffProfileId || log.staffId || "");
      const current = latestByStaff.get(key);
      if (!current || new Date(log.time || 0) > new Date(current.time || 0)) {
        latestByStaff.set(key, log);
      }
    });

  latestByStaff.forEach((log, key) => {
    const person = staff.find((item) => sameId(item.cloudId, key) || sameId(item.id, key));
    if (!person) return;

    const message = String(log.message || "").toLowerCase();
    if (message.includes("clocked in")) {
      person.clockIn = timeFromIso(log.time);
      person.clockOut = "";
      person.status = "On duty";
      person.locationStatus = "Inside";
      person.location = person.location && person.location !== "Not active" ? person.location : staffLocationLabel(person);
      person.ping = person.ping && person.ping !== "-" ? person.ping : "live";
    } else if (message.includes("clocked out")) {
      person.clockOut = timeFromIso(log.time);
      person.status = "Completed";
      person.locationStatus = "Inactive";
      person.location = "Shift ended";
      person.ping = "-";
    } else if (message.includes("started break")) {
      person.clockOut = "";
      person.status = "On break";
      person.locationStatus = "Break";
      person.location = "Staff canteen";
      person.ping = "live";
    } else if (message.includes("ended break")) {
      person.clockOut = "";
      person.status = "On duty";
      person.locationStatus = "Inside";
      person.location = staffLocationLabel(person);
      person.ping = "live";
    }
  });
}

async function loadStaffTargetedActivityLogs({ hotelId, targetUserId }) {
  const batches = [];
  if (targetUserId) {
    batches.push(window.staffSyncDb.getActivityLogs({ hotelId, targetUserId, limit: 500 }).catch(() => []));
  }
  batches.push(window.staffSyncDb.getActivityLogs({ hotelId, limit: 500 }).catch(() => []));

  const results = await Promise.all(batches);
  const unique = new Map();
  results.flat().forEach((log) => unique.set(String(log.id), log));
  return Array.from(unique.values())
    .sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0))
    .slice(0, 500);
}

async function loadCloudAttendanceData() {
  const today = new Date().toISOString().slice(0, 10);
  const activeSnapshots = new Map(staff
    .filter((person) => person.clockIn && !person.clockOut)
    .map((person) => [String(person.cloudId || person.id), {
      attendanceRecordId: person.attendanceRecordId,
      clockIn: person.clockIn,
      clockOut: person.clockOut,
      status: person.status,
      locationStatus: person.locationStatus,
      location: person.location,
      ping: person.ping,
      floor: person.floor,
      zone: person.zone,
      lastLatitude: person.lastLatitude,
      lastLongitude: person.lastLongitude,
      gpsAccuracy: person.gpsAccuracy
    }]));
  const appliedStaffIds = new Set();
  const records = await window.staffSyncDb.getAttendanceRecords({ date: today });

  staff.forEach((person) => {
    person.attendanceRecordId = "";
    person.clockIn = "";
    person.clockOut = "";
    person.status = person.status === "Off duty" ? "Off duty" : "Scheduled";
    person.locationStatus = "Inactive";
    person.location = "Not active";
    person.ping = "-";
  });

  latestAttendanceByStaff(records).forEach((record) => {
    const person = staff.find((item) => sameId(item.cloudId, record.staff_profile_id));
    if (!person) return;

    appliedStaffIds.add(String(person.cloudId || person.id));
    person.attendanceRecordId = record.id;
    person.clockIn = record.clock_in_at ? timeFromIso(record.clock_in_at) : "";
    person.clockOut = record.clock_out_at ? timeFromIso(record.clock_out_at) : "";
    person.status = record.clock_out_at ? "Completed" : statusFromAttendance(record.status);
    person.locationStatus = record.clock_out_at ? "Inactive" : "Inside";
    person.location = record.clock_out_at ? "Shift ended" : person.department;
    person.ping = record.clock_out_at ? "-" : "cloud";
  });

  if (currentRole === "staff") {
    staff.forEach((person) => {
      const key = String(person.cloudId || person.id);
      const snapshot = activeSnapshots.get(key);
      if (snapshot && !appliedStaffIds.has(key)) {
        Object.assign(person, snapshot);
      } else {
        restoreRecentClockState(person);
      }
    });
  }

  await applyRecentLocationPings();
  applyAttendanceEventsToStaff(latestAttendanceEventLogs);
}

function latestAttendanceByStaff(records) {
  const latest = new Map();
  (records || []).forEach((record) => {
    const key = String(record.staff_profile_id || "");
    const current = latest.get(key);
    const recordTime = new Date(record.clock_out_at || record.clock_in_at || 0).getTime();
    const currentTimeValue = current ? new Date(current.clock_out_at || current.clock_in_at || 0).getTime() : 0;
    if (!current || recordTime > currentTimeValue) {
      latest.set(key, record);
    }
  });
  return Array.from(latest.values());
}

async function loadAttendanceReportForSelectedDate() {
  if (!attendanceReportDate) return;

  if (!attendanceReportDate.value) {
    attendanceReportDate.value = new Date().toISOString().slice(0, 10);
  }
  const range = attendanceReportRange();

  if (!isCloudReady()) {
    renderAttendanceReport();
    return;
  }

  try {
    const records = await window.staffSyncDb.getAttendanceRecords({
      startDate: range.startDate,
      endDate: range.endDate
    });
    attendanceReportRecords = records.map(mapCloudAttendanceRecord);
    renderAttendanceReport();
  } catch (error) {
    showToast(error.message || "Could not load attendance report.");
  }
}

function startLocationMonitoring() {
  stopLocationMonitoring();
  if (!policy.consentNotice || currentRole !== "staff" || !isCloudReady()) return;
  const person = staff.find((item) => sameId(item.id, activeStaffId));
  if (!person?.cloudId || !person.attendanceRecordId || !isOnShift(person)) return;

  const minutes = Math.max(1, Number(policy.interval || 5));
  locationPingTimer = window.setInterval(recordActiveStaffLocationPing, minutes * 60000);
  lastMovementPingAt = 0;
  window.setTimeout(recordActiveStaffLocationPing, 300);
  locationWatchId = watchCurrentPosition((position) => {
    const now = Date.now();
    if (now - lastMovementPingAt < 15000) return;
    lastMovementPingAt = now;
    recordActiveStaffLocationPing(position);
  });
}

function stopLocationMonitoring() {
  if (locationPingTimer) {
    window.clearInterval(locationPingTimer);
    locationPingTimer = null;
  }
  if (locationWatchId !== null) {
    navigator.geolocation?.clearWatch(locationWatchId);
    locationWatchId = null;
  }
}

function startCloudAutoRefresh() {
  stopCloudAutoRefresh();
  if (!isCloudReady() || !currentRole) return;

  syncCloudDashboard();
  window.setTimeout(syncCloudDashboard, 1200);
  cloudSyncTimer = window.setInterval(syncCloudDashboard, currentRole === "staff" ? 2000 : 3000);
}

function startLeaveLiveRefresh() {
  if (!leaveLiveStarted) {
    leaveLiveStarted = true;
    setupLeaveRealtime();
    refreshLiveLeaveOnly(true);
  }
  if (!leaveLiveForceTimer) {
    leaveLiveForceTimer = window.setInterval(() => refreshLiveLeaveOnly(true), currentRole === "staff" ? 2200 : 3000);
  }
}

function stopLeaveLiveRefresh() {
  leaveLiveStarted = false;
  if (leaveLiveTimer) {
    window.clearTimeout(leaveLiveTimer);
    leaveLiveTimer = null;
  }
  if (leaveLiveForceTimer) {
    window.clearInterval(leaveLiveForceTimer);
    leaveLiveForceTimer = null;
  }
  leaveLiveBusy = false;
  leaveLiveBusySince = 0;
  if (leaveRealtimeChannel && window.staffSyncSupabase?.removeChannel) {
    window.staffSyncSupabase.removeChannel(leaveRealtimeChannel);
    leaveRealtimeChannel = null;
  }
}

function stopCloudAutoRefresh() {
  if (cloudSyncTimer) {
    window.clearInterval(cloudSyncTimer);
    cloudSyncTimer = null;
  }
}

async function refreshLiveLeaveOnly(force = false) {
  if (!isCloudReady() || !currentRole) {
    scheduleNextLeaveRefresh();
    return;
  }
  if (leaveLiveBusy) {
    if (force && leaveLiveBusySince && Date.now() - leaveLiveBusySince > 6000) {
      leaveLiveBusy = false;
      leaveLiveBusySince = 0;
    } else {
      scheduleNextLeaveRefresh();
      return;
    }
  }
  leaveLiveBusy = true;
  leaveLiveBusySince = Date.now();

  try {
    await withLiveTimeout(loadCloudLeaveData(), 5000);
  } catch {
    // Keep current leave list if the network misses one beat.
  }

  try {
    await withLiveTimeout(loadCloudActivityData(), 5000);
  } catch {
    // Chat/activity can miss one beat without stopping leave status.
  }

  try {
    await withLiveTimeout(loadCloudAttendanceData(), 5000);
  } catch {
    // Attendance can miss one beat without stopping leave/chat updates.
  }

  try {
    await withLiveTimeout(loadCloudDailyRosterData(), 5000);
  } catch {
    // Shift updates can miss one beat without stopping leave status.
  }

  try {
    if (!shouldPauseAutoRender()) {
      renderLeaveRequests();
      renderRoleDemo();
      renderShiftCalendar();
    }
    renderNotifications();
    renderLeaveCoverage();
    renderLeavePressure();
    if (!shouldPauseAutoRender()) {
      renderSession();
    }
  } finally {
    leaveLiveBusy = false;
    leaveLiveBusySince = 0;
    scheduleNextLeaveRefresh();
  }
}

function withLiveTimeout(promise, milliseconds) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error("Live refresh timed out.")), milliseconds);
    })
  ]);
}

function scheduleNextLeaveRefresh() {
  if (!leaveLiveStarted) return;
  if (leaveLiveTimer) window.clearTimeout(leaveLiveTimer);
  leaveLiveTimer = window.setTimeout(() => refreshLiveLeaveOnly(), currentRole === "staff" ? 1200 : 1800);
}

function setupLeaveRealtime() {
  if (!isCloudReady() || leaveRealtimeChannel || !window.staffSyncSupabase?.channel) return;

  try {
    leaveRealtimeChannel = window.staffSyncSupabase
      .channel(`staffsync-leave-live-${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "leave_requests" }, () => {
        refreshLiveLeaveOnly();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, (payload) => {
        if (!payload?.new || ["Leave", "Attendance"].includes(payload.new.event_type)) refreshLiveLeaveOnly(true);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_rosters" }, () => {
        refreshLiveLeaveOnly(true);
      })
      .subscribe();
  } catch {
    leaveRealtimeChannel = null;
  }
}

async function syncCloudDashboard() {
  if (!isCloudReady() || !currentRole || cloudSyncBusy) return;
  cloudSyncBusy = true;
  let shouldRender = false;

  try {
    try {
      await cleanupCloudLeaveDashboardData();
    } catch {
      // Leave cleanup is helpful, but must not block live status refresh.
    }

    try {
      await loadCloudLeaveData();
      shouldRender = true;
    } catch {
      // Keep existing leave data if one refresh misses.
    }

    try {
      await loadCloudActivityData();
      shouldRender = true;
    } catch {
      // Chat/activity should not block leave status.
    }

    try {
      await loadCloudAttendanceData();
      shouldRender = true;
    } catch {
      // Attendance can fail without blocking leave decisions.
    }

    try {
      await loadCloudDailyRosterData();
      shouldRender = true;
    } catch {
      // Daily roster is optional.
    }

    try {
      await loadAttendanceReportForSelectedDate();
      shouldRender = true;
    } catch {
      // Reports are secondary to live leave status.
    }

    if (shouldRender && !shouldPauseAutoRender()) renderAll();
  } finally {
    cloudSyncBusy = false;
  }
}

async function applyRecentLocationPings() {
  if (!isCloudReady()) return;

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  let pings = [];
  try {
    pings = await window.staffSyncDb.getRecentLocationPings({ sinceIso: since.toISOString() });
  } catch {
    return;
  }
  const latestByStaff = new Map();

  pings.forEach((ping) => {
    if (isLocationPingHidden(ping)) return;
    if (!latestByStaff.has(ping.staff_profile_id)) {
      latestByStaff.set(ping.staff_profile_id, ping);
    }
  });

  latestByStaff.forEach((ping, staffProfileId) => {
    const person = staff.find((item) => sameId(item.cloudId, staffProfileId));
    if (!person || !isOnShift(person)) return;

    const accuracy = Number(ping.accuracy_meters || 0);
    person.locationStatus = statusFromLocationPing(ping.location_status);
    person.floor = ping.floor_label || person.floor || "GF";
    person.zone = ping.zone_label || person.zone || "New Wing";
    person.location = `${staffLocationLabel(person)} - ${accuracy && accuracy > targetGpsAccuracyMeters ? "GPS captured low accuracy" : "GPS captured"}`;
    person.ping = accuracy
      ? `${Math.round(accuracy)}m accuracy${accuracy > targetGpsAccuracyMeters ? " - above 5m target" : ""}`
      : "GPS captured";
    person.lastLatitude = Number(ping.latitude);
    person.lastLongitude = Number(ping.longitude);
    person.gpsAccuracy = accuracy || null;
  });
}

async function recordActiveStaffLocationPing(watchedPosition) {
  const person = staff.find((item) => sameId(item.id, activeStaffId));
  if (!person?.cloudId || !person.attendanceRecordId || !isOnShift(person)) return;

  const position = watchedPosition || await getCurrentPositionSafe();
  if (!position) return;

  await saveStaffLocationPing(person, position);
}

async function saveStaffLocationPing(person, position) {
  try {
    const locationStatus = "inside_property";
    await window.staffSyncDb.recordLocationPing({
      staffProfileId: person.cloudId,
      attendanceRecordId: person.attendanceRecordId,
      latitude: position.latitude,
      longitude: position.longitude,
      accuracyMeters: position.accuracy || null,
      locationStatus,
      floorLabel: person.floor || "GF",
      zoneLabel: person.zone || "New Wing"
    });

    person.locationStatus = "Inside";
    const lowAccuracy = Number(position.accuracy || 0) > targetGpsAccuracyMeters;
    person.location = `${staffLocationLabel(person)} - ${lowAccuracy ? "GPS captured low accuracy" : "GPS captured"}`;
    person.ping = `${Math.round(position.accuracy || 0)}m accuracy${lowAccuracy ? " - above 5m target" : ""}`;
    person.lastLatitude = position.latitude;
    person.lastLongitude = position.longitude;
    person.gpsAccuracy = position.accuracy || null;
    saveState();
    renderAll();
  } catch {
    // Keep the staff screen usable if one background ping fails.
  }
}

function mapCloudStaffProfile(profile, index) {
  const departmentName = profile.departments?.name || "Unassigned";
  const role = profile.job_title || titleCase(profile.app_users?.role || "staff");
  const shift = displayShiftName(profile.default_shift_type || defaultShiftName);
  const isActive = profile.app_users?.status === "active";

  return {
    id: profile.id,
    cloudId: profile.id,
    appUserId: profile.app_users?.id || "",
    employeeCode: profile.employee_code,
    email: profile.app_users?.email || "",
    wifiMac: normalizeMac(profile.app_users?.phone || ""),
    name: profile.full_name,
    department: departmentName,
    role,
    shift,
    shiftTime: shiftTimeFor(shift),
    clockIn: "",
    clockOut: "",
    status: isActive ? "Scheduled" : "Off duty",
    location: "Not active",
    locationStatus: "Inactive",
    floor: "GF",
    zone: "New Wing",
    ping: "-",
    x: 22 + ((index * 23) % 66),
    y: 24 + ((index * 19) % 54),
    leaveBalance: Number(profile.leave_balance || 0)
  };
}

function isRemovedStaffProfile(profile) {
  return String(profile?.employee_code || "").toLowerCase().includes("-removed-");
}

function mapCloudAttendanceRecord(record) {
  return {
    id: record.id,
    staffId: record.staff_profile_id,
    staffName: record.staff_profiles?.full_name || "Unknown staff",
    employeeCode: record.staff_profiles?.employee_code || "",
    department: record.staff_profiles?.departments?.name || "General",
    clockIn: record.clock_in_at ? timeFromIso(record.clock_in_at) : "",
    clockOut: record.clock_out_at ? timeFromIso(record.clock_out_at) : "",
    status: record.clock_out_at ? "Completed" : statusFromAttendance(record.status),
    hoursWorked: hoursBetweenIso(record.clock_in_at, record.clock_out_at)
  };
}

function mapCloudDailyRosters(rows) {
  return (rows || []).reduce((groups, row) => {
    const person = staff.find((item) => sameId(item.cloudId, row.staff_profile_id));
    if (!person) return groups;

    groups[row.roster_date] = groups[row.roster_date] || {};
    const decodedShift = decodeRosterShift(row.shift_name);
    groups[row.roster_date][person.id] = {
      shift: displayShiftName(decodedShift.shift || row.shift_name || defaultShiftName),
      inTime: String(row.in_time || "00:00").slice(0, 5),
      outTime: String(row.out_time || "00:00").slice(0, 5),
      status: row.day_status || "Working",
      shift2: decodedShift.shift2 || "",
      inTime2: decodedShift.inTime2 || "",
      outTime2: decodedShift.outTime2 || "",
      status2: decodedShift.status2 || "",
      shift3: decodedShift.shift3 || "",
      inTime3: decodedShift.inTime3 || "",
      outTime3: decodedShift.outTime3 || "",
      status3: decodedShift.status3 || ""
    };
    return groups;
  }, {});
}

function mapCloudLeaveRequest(request) {
  const decodedReason = decodeLeaveReason(request.reason || "");
  return {
    id: request.id,
    cloudId: request.id,
    staffId: request.staff_profiles?.id || "",
    staffProfileId: request.staff_profiles?.id || "",
    name: request.staff_profiles?.full_name || "Unknown staff",
    department: request.staff_profiles?.departments?.name || "General",
    type: request.leave_types?.name || "Leave",
    duration: decodedReason.duration,
    from: request.start_date,
    to: request.end_date,
    reason: decodedReason.reason,
    status: leaveStatusLabel(request.status || "pending"),
    updatedAt: request.approved_at || request.created_at
  };
}

function mapCloudLeaveMessage(row) {
  const metadata = row.metadata_json || {};
  return {
    id: row.id,
    cloudId: row.id,
    type: "Leave",
    label: row.label || "Message",
    className: row.class_name || "",
    message: row.message,
    isAttendanceEvent: false,
    targetUserId: metadata.target_user_id || "",
    leaveRequestId: row.leave_request_id || "",
    staffProfileId: row.staff_profile_id || metadata.staff_profile_id || "",
    staffId: row.staff_profile_id || metadata.staff_profile_id || "",
    shiftDate: "",
    rosterEntry: null,
    messageTopic: "",
    time: row.created_at
  };
}

function mapCloudActivityLog(log) {
  const decision = log.metadata_json?.decision || "";
  const isAttendanceEvent = Boolean(log.metadata_json?.attendance_event);
  const attendanceKind = log.metadata_json?.attendance_kind || "Attendance";
  const label = decision === "approved"
    ? "Approved"
    : decision === "rejected"
      ? "Rejected"
      : decision === "adjustment_requested"
        ? "Change the Request"
        : isAttendanceEvent
          ? attendanceKind
          : log.metadata_json?.message_label || log.event_type || "Log";
  const className = decision === "approved"
    ? "green"
    : decision === "rejected"
      ? "red"
      : decision === "adjustment_requested"
        ? "blue"
        : isAttendanceEvent
          ? attendanceKind === "Break" ? "blue" : "green"
          : log.metadata_json?.message_class || "";

  return {
    id: log.id,
    type: isAttendanceEvent ? attendanceKind : log.event_type,
    label,
    className,
    message: log.message,
    isAttendanceEvent,
    targetUserId: log.target_user_id || "",
    leaveRequestId: log.metadata_json?.leave_request_id || "",
    staffProfileId: log.metadata_json?.staff_profile_id || "",
    staffId: log.metadata_json?.staff_profile_id || "",
    shiftDate: log.metadata_json?.shift_date || "",
    rosterEntry: log.metadata_json?.roster_entry || null,
    messageTopic: log.metadata_json?.message_topic || (log.metadata_json?.shift_thread ? "Shift" : ""),
    time: log.created_at
  };
}

function findLeaveType(name) {
  return leaveTypes.find((leaveType) => leaveType.name.toLowerCase() === name.toLowerCase());
}

function departmentForLeaveRequest(request) {
  if (request.department) return request.department;
  const person = staff.find((item) => sameId(item.id, request.staffId));
  return person?.department || "General";
}

async function matchCloudStaffProfile(appUserId) {
  const { data } = await window.staffSyncSupabase
    .from("staff_profiles")
    .select("full_name")
    .eq("user_id", appUserId)
    .maybeSingle();

  if (!data?.full_name) return;

  const matched = staff.find((person) => person.name.toLowerCase() === data.full_name.toLowerCase());
  if (matched) {
    activeStaffId = matched.id;
    rememberActiveStaff();
  }
}

function addActivity(type, message) {
  activityLog = [
    {
      id: Date.now(),
      type,
      message,
      time: new Date().toISOString()
    },
    ...activityLog
  ].slice(0, 50);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

init();
