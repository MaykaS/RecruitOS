const STATUS_ORDER = ["Researching", "Applied", "Phone Screen", "Interview", "Final Round", "Offer", "Rejected"];
const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const APPLICATION_TYPES = ["Internship", "MBA Internship", "Full-time", "Part-time", "Fellowship", "Other"];
const RELATIONSHIP_OPTIONS = ["Alumni", "Recruiter", "Mentor", "New", "Professional", "Peer", "Friend"];
const CASE_TYPES = ["Market Sizing", "Profitability", "Growth Strategy", "Operations", "Product Strategy", "Pricing"];
const FIRM_STYLES = ["Consulting", "Tech PM", "General Business", "Behavioral Prep", "Mixed"];
const CASE_METHODS = ["Solo", "Partner", "Mock Interview", "Platform"];
const INTERACTION_TYPES = ["Coffee Chat", "LinkedIn Message", "Email", "Call", "Meeting", "Referral Ask"];
const DEFAULT_CADENCES = [
  {
    id: "cadence-case",
    title: "Log a case session",
    cadenceType: "Case practice",
    intervalUnit: "days",
    intervalValue: 2,
    active: true,
    lastCompletedDate: "",
    nextDueDate: todayISO(),
    createdAt: isoNow(),
    updatedAt: isoNow()
  },
  {
    id: "cadence-followup",
    title: "Review networking follow-ups",
    cadenceType: "Networking",
    intervalUnit: "days",
    intervalValue: 3,
    active: true,
    lastCompletedDate: "",
    nextDueDate: todayISO(),
    createdAt: isoNow(),
    updatedAt: isoNow()
  }
];
const FOCUS_TIPS = [
  "Protect follow-ups already on the board before chasing brand-new leads.",
  "Move one open application to a sharper next step before the day ends.",
  "Convert one loose networking thought into a dated follow-up.",
  "Review one recent case and write down the single pattern to fix next.",
  "Keep notes specific enough that future-you can act in 30 seconds.",
  "A calm pipeline beats a crowded spreadsheet. Clean the oldest loose end."
];

let activeTab = "dashboard";
let state = createInitialState();
let expandedContactId = "";
let openContactMenuId = "";

const appContent = document.getElementById("appContent");
const modalRoot = document.getElementById("modalRoot");
const topbarLeft = document.getElementById("topbarLeft");

document.querySelector(".side-nav").addEventListener("click", (event) => {
  const button = event.target.closest(".nav-tab");
  if (!button) return;
  activeTab = button.dataset.tab;
  syncTabState();
  render();
});

document.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  if (!action) return;
  if (action === "close-modal") closeModal();
  if (action === "toggle-contact-expand") {
    expandedContactId = expandedContactId === event.target.dataset.id ? "" : event.target.dataset.id;
    openContactMenuId = "";
    render();
  }
  if (action === "toggle-contact-menu") {
    openContactMenuId = openContactMenuId === event.target.dataset.id ? "" : event.target.dataset.id;
    render();
  }
  if (action === "open-app") openApplicationModal(event.target.dataset.id);
  if (action === "delete-app") void deleteEntity("applications", event.target.dataset.id, "application");
  if (action === "open-contact") openContactModal(event.target.dataset.id);
  if (action === "delete-contact") void deleteEntity("contacts", event.target.dataset.id, "contact");
  if (action === "log-interaction") openInteractionModal(event.target.dataset.contactId);
  if (action === "edit-interaction") openInteractionModal(event.target.dataset.contactId, event.target.dataset.id);
  if (action === "delete-interaction") void deleteInteraction(event.target.dataset.id);
  if (action === "open-case") openCaseModal(event.target.dataset.id);
  if (action === "delete-case") void deleteEntity("caseSessions", event.target.dataset.id, "case session");
  if (action === "open-tip") openTipModal(event.target.dataset.id);
  if (action === "delete-tip") void deleteEntity("tips", event.target.dataset.id, "tip");
  if (action === "open-cadence") openCadenceModal(event.target.dataset.id);
  if (action === "delete-cadence") void deleteEntity("cadenceRules", event.target.dataset.id, "cadence rule");
  if (action === "complete-cadence") void completeCadence(event.target.dataset.id);
  if (action === "switch-tab") {
    activeTab = event.target.dataset.tab;
    syncTabState();
    render();
  }
  if (action === "open-settings") {
    activeTab = "settings";
    syncTabState();
    render();
  }
  if (action === "new-application") openApplicationModal();
  if (action === "new-contact") openContactModal();
  if (action === "new-case") openCaseModal();
  if (action === "new-tip") openTipModal();
  if (action === "export-workspace") void exportWorkspace();
  if (action === "open-import-workspace") document.getElementById("importWorkspaceFile")?.click();
  if (action === "set-sort-order") {
    const field = event.target.dataset.field;
    const value = event.target.dataset.value;
    const input = document.querySelector(`[data-filter="${field}"]`);
    if (input) input.value = value;
    render();
  }
  if (action === "add-token-option") {
    const field = event.target.closest(".token-picker");
    if (field) addTokenPickerValue(field, event.target.dataset.value, event.target.dataset.label);
  }
  if (action === "remove-token-option") {
    const field = event.target.closest(".token-picker");
    if (field) removeTokenPickerValue(field, event.target.dataset.value);
  }
});

document.addEventListener("click", (event) => {
  if (!openContactMenuId) return;
  if (event.target.closest(".contact-menu-wrap")) return;
  openContactMenuId = "";
  render();
});

document.addEventListener("click", (event) => {
  document.querySelectorAll(".multi-select-field[open]").forEach((field) => {
    if (!field.contains(event.target)) field.removeAttribute("open");
  });
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (form.matches("#applicationForm")) handleApplicationSubmit(event);
  if (form.matches("#contactForm")) handleContactSubmit(event);
  if (form.matches("#interactionForm")) handleInteractionSubmit(event);
  if (form.matches("#caseForm")) handleCaseSubmit(event);
  if (form.matches("#tipForm")) handleTipSubmit(event);
  if (form.matches("#settingsForm")) handleSettingsSubmit(event);
  if (form.matches("#cadenceForm")) handleCadenceSubmit(event);
});

document.addEventListener("input", (event) => {
  if (event.target.matches("#applicationStatus")) toggleApplicationNextStepState(event.target.value);
  if (event.target.matches("#interactionFollowUpNeeded")) toggleInteractionFollowUpState(event.target.checked);
  if (event.target.matches("[data-filter]")) render();
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-filter]")) render();
  if (event.target.matches("#importWorkspaceFile")) void handleImportFile(event.target);
});

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("modal-backdrop")) closeModal();
});

renderFocusToday();
syncTabState();
render();
void loadState();

async function loadState() {
  try {
    state = await apiFetch("/api/bootstrap");
    render();
  } catch (error) {
    console.error("Unable to load RecruitOS state.", error);
  }
}

function createInitialState() {
  return {
    applications: [],
    contacts: [],
    caseSessions: [],
    tips: [],
    cadenceRules: [],
    activityEvents: [],
    settings: { recentActivityLimit: 6 }
  };
}

function render() {
  topbarLeft.innerHTML = "";
  if (activeTab === "dashboard") appContent.innerHTML = renderDashboard();
  if (activeTab === "applications") appContent.innerHTML = renderApplications();
  if (activeTab === "networking") appContent.innerHTML = renderNetworking();
  if (activeTab === "casing") appContent.innerHTML = renderCasing();
  if (activeTab === "tips") appContent.innerHTML = renderTips();
  if (activeTab === "settings") appContent.innerHTML = renderSettings();
}

function renderFocusToday() {
  const list = document.getElementById("focusTodayList");
  const dayIndex = new Date().getDate() % FOCUS_TIPS.length;
  const tips = [
    FOCUS_TIPS[dayIndex],
    FOCUS_TIPS[(dayIndex + 2) % FOCUS_TIPS.length],
    FOCUS_TIPS[(dayIndex + 4) % FOCUS_TIPS.length]
  ];
  list.innerHTML = tips.map((tip, index) => `
    <div class="focus-item">
      <div class="focus-index">${index + 1}</div>
      <div>${escapeHtml(tip)}</div>
    </div>
  `).join("");
}

function renderDashboard() {
  const openApplications = state.applications.filter((item) => item.status !== "Rejected");
  const interviewCount = state.applications.filter((item) => ["Phone Screen", "Interview", "Final Round"].includes(item.status)).length;
  const offersCount = state.applications.filter((item) => item.status === "Offer").length;
  const attentionItems = getAttentionItems();
  const recentApps = [...state.applications].sort(sortByUpdatedDesc).slice(0, 3);
  const activity = [...state.activityEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, state.settings.recentActivityLimit);
  const stageCounts = STATUS_ORDER.map((status) => ({
    status,
    count: state.applications.filter((item) => item.status === status).length
  }));
  const maxStageCount = Math.max(1, ...stageCounts.map((entry) => entry.count));

  return `
    ${renderHero("Here's your internship search overview")}
    <section class="stats-grid">
      ${renderStatCard("Active Applications", openApplications.length)}
      ${renderStatCard("Interviews", interviewCount)}
      ${renderStatCard("Contacts", state.contacts.length)}
      ${renderStatCard("Offers", offersCount)}
    </section>
    <section class="dashboard-grid">
      <section class="card">
        <div class="card-header">
          <div>
            <h2>What needs attention now</h2>
            <p class="card-subtitle">Overdue or upcoming actions across cadences, applications, and deadlines.</p>
          </div>
        </div>
        <div class="attention-list">
          ${attentionItems.length ? attentionItems.map(renderAttentionItem).join("") : renderInlineEmpty("Nothing urgent right now. Keep the board clean and your next steps dated.")}
        </div>
      </section>
      <section class="card">
        <div class="card-header">
          <div>
            <h2>Snapshot</h2>
            <p class="card-subtitle">Current application pipeline by stage.</p>
          </div>
        </div>
        <div class="pipeline-list">
          ${stageCounts.map((entry) => `
            <div class="pipeline-row">
              <strong>${entry.status}</strong>
              <div class="progress-bar">
                <div class="progress-fill" style="width:${(entry.count / maxStageCount) * 100}%"></div>
              </div>
              <span>${entry.count}</span>
            </div>
          `).join("")}
        </div>
      </section>
    </section>
    <section class="dashboard-grid">
      <section class="card">
        <div class="card-header">
          <div>
            <h2>Recent applications</h2>
            <p class="card-subtitle">The latest changes on your board.</p>
          </div>
          <button class="link-button" data-action="switch-tab" data-tab="applications">View all</button>
        </div>
        <div class="record-list">
          ${recentApps.length ? recentApps.map(renderRecentApplication).join("") : renderInlineEmpty("Add your first application to start tracking the pipeline.")}
        </div>
      </section>
      <section class="card">
        <div class="card-header">
          <div>
            <h2>Recent activity</h2>
            <p class="card-subtitle">Showing the latest ${state.settings.recentActivityLimit} actions.</p>
          </div>
          <button class="link-button" data-action="open-settings">Adjust feed length</button>
        </div>
        <div class="activity-list">
          ${activity.length ? activity.map(renderActivityEntry).join("") : renderInlineEmpty("Actions you take in RecruitOS will show up here.")}
        </div>
      </section>
    </section>
  `;
}

function renderApplications() {
  const query = getControlValue("applications-search").toLowerCase();
  const statusFilter = getControlValue("applications-status");
  const typeFilter = getControlValue("applications-type");
  const priorityFilter = getControlValue("applications-priority");
  const tagFilter = getControlValue("applications-tag");
  const sortBy = getControlValue("applications-sort") || "updated";
  const sortOrder = getControlValue("applications-order") || "desc";
  const tagOptions = getUniqueTags(state.applications);

  const filtered = sortItems(
    state.applications.filter((item) => {
      const haystack = `${item.company} ${item.role} ${item.location} ${item.tags || ""}`.toLowerCase();
      const matchesQuery = haystack.includes(query);
      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesType = !typeFilter || item.type === typeFilter;
      const matchesPriority = !priorityFilter || item.priority === priorityFilter;
      const matchesTag = !tagFilter || parseTags(item.tags).includes(tagFilter.toLowerCase());
      return matchesQuery && matchesStatus && matchesType && matchesPriority && matchesTag;
    }),
    getApplicationsSortValue,
    sortBy,
    sortOrder
  );

  return `
    ${renderModuleHeader("Applications", "Track the full story of each role, including the next step that drives the dashboard.", `
      <button class="btn btn-secondary" data-action="new-application">Add application</button>
    `)}
    <section class="list-card">
      <div class="filter-toolbar">
        <input class="search toolbar-search" data-filter="applications-search" placeholder="Search companies or roles..." value="${escapeHtml(query)}">
        ${renderToolbarSelect("applications-status", "All Status", ["", ...STATUS_ORDER], statusFilter)}
        ${renderToolbarSelect("applications-priority", "All Priorities", ["", ...PRIORITY_OPTIONS], priorityFilter)}
        ${renderToolbarSelect("applications-tag", "All Tags", ["", ...tagOptions], tagFilter)}
        ${renderToolbarSelect("applications-sort", "Sort by", [
          { value: "updated", label: "Updated" },
          { value: "company", label: "Company" },
          { value: "status", label: "Status" },
          { value: "priority", label: "Priority" },
          { value: "deadline", label: "Deadline" },
          { value: "nextStepDate", label: "Next step date" },
          { value: "applicationDate", label: "Application date" }
        ], sortBy)}
        ${renderSortOrderToggle("applications-order", sortOrder)}
      </div>
      <div class="record-list" style="margin-top: 18px;">
        ${filtered.length ? filtered.map(renderApplicationRow).join("") : renderEmptyState("No applications yet", "Add your first application and give it a dated next step so RecruitOS can coach the work.", "Add application", "new-application")}
      </div>
    </section>
  `;
}

function renderNetworking() {
  const query = getControlValue("networking-search").toLowerCase();
  const sortBy = getControlValue("networking-sort") || "updated";
  const sortOrder = getControlValue("networking-order") || "desc";
  const filtered = sortItems(
    state.contacts.filter((item) => {
      const haystack = `${item.name} ${item.company} ${item.role} ${item.tags || ""}`.toLowerCase();
      return haystack.includes(query);
    }),
    getContactsSortValue,
    sortBy,
    sortOrder
  );

  return `
    ${renderModuleHeader("Networking", "A lightweight relationship tracker for follow-ups, notes, and warm paths into opportunities.", `
      <button class="btn btn-secondary" data-action="new-contact">New contact</button>
    `)}
    <section class="list-card">
      <div class="filter-toolbar">
        <input class="search toolbar-search" data-filter="networking-search" placeholder="Search names or companies..." value="${escapeHtml(query)}">
        ${renderToolbarSelect("networking-sort", "Sort by", [
          { value: "updated", label: "Updated" },
          { value: "name", label: "Name" },
          { value: "company", label: "Company" },
          { value: "relationship", label: "Relationship" },
          { value: "lastContactDate", label: "Last contact" },
          { value: "nextFollowUpDate", label: "Next follow-up" }
        ], sortBy)}
        ${renderSortOrderToggle("networking-order", sortOrder)}
      </div>
      <div class="cards-grid" style="margin-top: 18px;">
        ${filtered.length ? filtered.map(renderContactCard).join("") : renderEmptyState("No contacts yet", "Add people you want to keep warm so follow-ups stop living only in your head.", "Add contact", "new-contact")}
      </div>
    </section>
  `;
}

function renderCasing() {
  const query = getControlValue("casing-search").toLowerCase();
  const sortBy = getControlValue("casing-sort") || "date";
  const sortOrder = getControlValue("casing-order") || "desc";
  const filtered = sortItems(
    state.caseSessions.filter((item) => {
      const haystack = `${item.title} ${item.caseType} ${item.firmStyle} ${item.partnerLabel || ""} ${item.tags || ""}`.toLowerCase();
      return haystack.includes(query);
    }),
    getCaseSessionsSortValue,
    sortBy,
    sortOrder
  );
  const totalSessions = state.caseSessions.length;
  const totalMinutes = state.caseSessions.reduce((sum, item) => sum + (Number(item.durationMinutes) || 0), 0);
  const ratedSessions = state.caseSessions.filter((item) => item.rating !== "" && item.rating !== null && item.rating !== undefined);
  const avgRating = ratedSessions.length
    ? (ratedSessions.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) / ratedSessions.length).toFixed(1)
    : "";

  return `
    ${renderModuleHeader("Casing", "Log PM-style case practice, reflect quickly, and keep your prep rhythm visible.", `
      <button class="btn btn-secondary" data-action="new-case">Log case session</button>
    `)}
    <section class="casing-stats-grid">
      ${renderCasingStatCard("", totalSessions, "Total Sessions")}
      ${renderCasingStatCard("◷", formatPracticeDuration(totalMinutes), "Total Practice")}
      ${renderCasingStatCard("☆", avgRating ? `${avgRating}/5` : "—", "Avg Rating")}
    </section>
    <section class="list-card">
      <div class="filter-toolbar">
        <input class="search toolbar-search" data-filter="casing-search" placeholder="Search titles or case types..." value="${escapeHtml(query)}">
        ${renderToolbarSelect("casing-sort", "Sort by", [
          { value: "date", label: "Date" },
          { value: "updated", label: "Updated" },
          { value: "rating", label: "Rating" },
          { value: "durationMinutes", label: "Duration" },
          { value: "caseType", label: "Case type" }
        ], sortBy)}
        ${renderSortOrderToggle("casing-order", sortOrder)}
      </div>
      <div class="cards-grid" style="margin-top: 18px;">
        ${filtered.length ? filtered.map(renderCaseCard).join("") : renderEmptyState("No case sessions yet", "Log your sessions consistently so patterns show up instead of getting lost.", "Log case session", "new-case")}
      </div>
    </section>
  `;
}

function renderTips() {
  const query = getControlValue("tips-search").toLowerCase();
  const sortBy = getControlValue("tips-sort") || "category";
  const sortOrder = getControlValue("tips-order") || "asc";
  const filtered = sortItems(
    state.tips.filter((item) => {
      const haystack = `${item.title} ${item.category} ${item.body || ""} ${item.tags || ""}`.toLowerCase();
      return haystack.includes(query);
    }),
    getTipsSortValue,
    sortBy,
    sortOrder
  );

  const grouped = groupBy(filtered, (item) => item.category || "Uncategorized");

  return `
    ${renderModuleHeader("Tips", "Build a reusable personal knowledge base and link advice to the work it supports.", `
      <button class="btn btn-secondary" data-action="new-tip">Add tip</button>
    `)}
    <section class="list-card">
      <div class="filter-toolbar">
        <input class="search toolbar-search" data-filter="tips-search" placeholder="Search titles or categories..." value="${escapeHtml(query)}">
        ${renderToolbarSelect("tips-sort", "Sort by", [
          { value: "category", label: "Category" },
          { value: "title", label: "Title" },
          { value: "updated", label: "Updated" }
        ], sortBy)}
        ${renderSortOrderToggle("tips-order", sortOrder)}
      </div>
      <div class="record-list" style="margin-top: 18px;">
        ${filtered.length ? Object.entries(grouped).map(([category, items]) => `
          <section class="card">
            <div class="card-header">
              <h3>${escapeHtml(category)}</h3>
              <span class="pill">${items.length} tip${items.length === 1 ? "" : "s"}</span>
            </div>
            <div class="cards-grid" style="margin-top: 16px;">
              ${items.map(renderTipCard).join("")}
            </div>
          </section>
        `).join("") : renderEmptyState("No tips yet", "Capture advice you want to reuse, from coffee chat scripts to casing heuristics.", "Add tip", "new-tip")}
      </div>
    </section>
  `;
}

function renderSettings() {
  return `
    ${renderModuleHeader("Settings", "Control the cadence engine and the dashboard feed without adding product clutter.")}
    <section class="settings-layout">
      <form id="settingsForm" class="settings-card">
        <div class="card-header">
          <div>
            <h2>Workspace preferences</h2>
            <p class="card-subtitle">Core v1 settings only, kept intentionally lightweight.</p>
          </div>
        </div>
        <label>
          Recent activity item count
          <input type="number" min="1" max="30" name="recentActivityLimit" value="${state.settings.recentActivityLimit}">
        </label>
        <div class="form-actions">
          <button class="btn btn-primary" type="submit">Save settings</button>
        </div>
      </form>

      <section class="settings-card">
        <div class="card-header">
          <div>
            <h2>Cadence rules</h2>
            <p class="card-subtitle">Recurring habits that surface inside “What needs attention now”.</p>
          </div>
          <button class="btn btn-secondary small" data-action="open-cadence">Add cadence rule</button>
        </div>
        <div class="record-list">
          ${state.cadenceRules.length ? state.cadenceRules.map(renderCadenceRow).join("") : renderInlineEmpty("No cadence rules yet. Add one to define the rhythm you want RecruitOS to protect.")}
        </div>
      </section>

      <section class="settings-card">
        <div class="card-header">
          <div>
            <h2>Backup & restore</h2>
            <p class="card-subtitle">Export a full RecruitOS workspace snapshot or replace this workspace from a previous export.</p>
          </div>
        </div>
        <input id="importWorkspaceFile" type="file" accept="application/json,.json" class="visually-hidden">
        <div class="record-list">
          <div class="meta-item">
            <div class="meta-label">Export workspace</div>
            <div class="entity-meta">Download one JSON file containing applications, contacts, interactions, case sessions, tips, cadence rules, settings, and activity history.</div>
            <div class="form-actions" style="margin-top: 10px;">
              <button class="btn btn-secondary" type="button" data-action="export-workspace">Export workspace</button>
            </div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Import workspace</div>
            <div class="entity-meta">Replace the current local workspace from a RecruitOS JSON export. A local backup is created automatically before import.</div>
            <div class="form-actions" style="margin-top: 10px;">
              <button class="btn btn-danger" type="button" data-action="open-import-workspace">Import workspace</button>
            </div>
          </div>
        </div>
      </section>
    </section>
  `;
}

function renderHero(subtitle) {
  const greeting = getGreeting();
  const greetingIcon = getGreetingIcon();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  return `
    <section class="hero-card">
      <div class="eyebrow">${today}</div>
      <div class="greeting-row">
        <div class="greeting-title-wrap">
          <span class="greeting-icon" aria-hidden="true">${greetingIcon}</span>
          <div class="hero-title">${greeting}</div>
        </div>
        <div class="topbar-actions">
          <button class="btn btn-secondary" data-action="new-contact">+ Contact</button>
          <button class="btn btn-secondary" data-action="new-application">+ Application</button>
        </div>
      </div>
      <div class="hero-meta">${escapeHtml(subtitle)}</div>
    </section>
  `;
}

function renderModuleHeader(title, subtitle, actions = "") {
  return `
    <section class="page-header hero-card">
      <div>
        <div class="eyebrow">RecruitOS module</div>
        <h2 class="hero-title" style="font-size:2.1rem;">${title}</h2>
        <p class="hero-meta">${subtitle}</p>
      </div>
      <div class="row-actions">${actions}</div>
    </section>
  `;
}

function renderStatCard(label, value) {
  return `
    <section class="stat-card">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
    </section>
  `;
}

function renderCasingStatCard(icon, value, label) {
  return `
    <section class="stat-card casing-stat-card">
      <div class="casing-stat-value"><span class="casing-stat-icon" aria-hidden="true">${icon}</span>${escapeHtml(String(value))}</div>
      <div class="stat-label casing-stat-label">${label}</div>
    </section>
  `;
}

function renderToolbarSelect(filterName, emptyLabel, options, selectedValue) {
  const normalizedOptions = options.map((option) => typeof option === "string"
    ? { value: option, label: option || emptyLabel }
    : option);
  return `
    <select class="toolbar-select" data-filter="${filterName}">
      ${normalizedOptions.map((option) => `
        <option value="${escapeHtml(option.value)}" ${option.value === selectedValue ? "selected" : ""}>${escapeHtml(option.label)}</option>
      `).join("")}
    </select>
  `;
}

function renderSortOrderToggle(filterName, selectedValue) {
  const currentValue = selectedValue || "desc";
  return `
    <div class="sort-order-toggle" role="group" aria-label="Sort order">
      <input type="hidden" data-filter="${filterName}" value="${escapeHtml(currentValue)}">
      <button
        class="sort-order-button ${currentValue === "asc" ? "active" : ""}"
        type="button"
        data-action="set-sort-order"
        data-field="${filterName}"
        data-value="asc"
        aria-label="Sort ascending"
      >↑</button>
      <button
        class="sort-order-button ${currentValue === "desc" ? "active" : ""}"
        type="button"
        data-action="set-sort-order"
        data-field="${filterName}"
        data-value="desc"
        aria-label="Sort descending"
      >↓</button>
    </div>
  `;
}

function renderAttentionItem(item) {
  return `
    <div class="attention-item ${item.isOverdue ? "overdue" : ""}">
      <div class="attention-main">
        <div class="tag-row">
          <span class="status-badge" data-tone="${item.isOverdue ? "danger" : "warm"}">${item.isOverdue ? "Overdue" : "Upcoming"}</span>
          <span class="pill">${item.kind}</span>
        </div>
        <h4>${escapeHtml(item.title)}</h4>
        <div class="attention-meta">${escapeHtml(item.detail)}</div>
      </div>
      <div class="row-actions attention-actions">${item.actionHtml}</div>
    </div>
  `;
}

function renderRecentApplication(item) {
  return `
    <div class="record-card">
      <div class="table-row-header">
        <div>
          <h3>${escapeHtml(item.company)}</h3>
          <div class="entity-meta">${escapeHtml(item.role)}</div>
        </div>
        ${statusBadge(item.status)}
      </div>
      <div class="entity-meta">Next step: ${item.nextStep ? `${escapeHtml(item.nextStep)} by ${formatDate(item.nextStepDate)}` : "No next step set"}</div>
      <div class="row-actions">
        <button class="btn btn-ghost small" data-action="open-app" data-id="${item.id}">Open</button>
      </div>
    </div>
  `;
}

function renderActivityEntry(item) {
  return `
    <div class="activity-entry">
      <strong>${escapeHtml(item.title)}</strong>
      <div class="entity-meta">${escapeHtml(item.detail)}</div>
      <div class="tiny">${formatTimestamp(item.timestamp)}</div>
    </div>
  `;
}

function renderApplicationRow(item) {
  const linkedContacts = item.linkedContactIds.map(getContactName).filter(Boolean).join(", ") || "None linked";
  return `
    <article class="table-row">
      <div class="table-row-header">
        <div>
          <h3>${escapeHtml(item.company)}</h3>
          <div class="entity-meta">${escapeHtml(item.role)}${item.location ? ` • ${escapeHtml(item.location)}` : ""}</div>
        </div>
        <div class="tag-row">
          ${statusBadge(item.status)}
          ${priorityBadge(item.priority)}
        </div>
      </div>
      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-label">Next step</div>
          <div class="meta-value">${item.nextStep ? `${escapeHtml(item.nextStep)} • ${formatDate(item.nextStepDate)}` : "No next step"}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Application date</div>
          <div class="meta-value">${formatDate(item.applicationDate)}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Deadline</div>
          <div class="meta-value">${formatDate(item.deadline)}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Linked contacts</div>
          <div class="meta-value">${escapeHtml(linkedContacts)}</div>
        </div>
      </div>
      <div class="entity-meta">${escapeHtml(item.notes || "No notes yet.")}</div>
      <div class="row-actions">
        <button class="btn btn-ghost small" data-action="open-app" data-id="${item.id}">Edit</button>
        <button class="btn btn-danger small" data-action="delete-app" data-id="${item.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderContactCard(item) {
  const isExpanded = expandedContactId === item.id;
  const menuOpen = openContactMenuId === item.id;
  const lastContactMessage = getLastContactMessage(item.lastContactDate);
  return `
    <article class="record-card contact-card ${isExpanded ? "contact-card-expanded" : ""}">
      <div class="table-row-header">
        <button class="contact-summary" data-action="toggle-contact-expand" data-id="${item.id}">
          <div class="contact-title-row">
            <h3>${escapeHtml(item.name)}</h3>
            <span class="status-badge" data-tone="neutral">${escapeHtml(item.relationship)}</span>
          </div>
          <div class="entity-meta contact-role-line">${escapeHtml(formatContactRole(item))}</div>
          <div class="contact-links">
            ${item.email ? `<a class="contact-link-icon" href="mailto:${escapeHtml(item.email)}" title="Email">✉</a>` : `<span class="contact-link-icon muted-icon">✉</span>`}
            ${item.linkedInUrl ? `<a class="contact-link-icon" href="${escapeHtml(item.linkedInUrl)}" target="_blank" rel="noreferrer" title="LinkedIn">in</a>` : `<span class="contact-link-icon muted-icon">in</span>`}
          </div>
          <div class="contact-last-line ${lastContactMessage.isStale ? "contact-last-line-stale" : ""}">${escapeHtml(lastContactMessage.text)}</div>
        </button>
        <div class="contact-menu-wrap">
          <button class="contact-menu-button" data-action="toggle-contact-menu" data-id="${item.id}" aria-label="Open contact menu">⋮</button>
          ${menuOpen ? `
            <div class="contact-menu">
              <button class="contact-menu-item" data-action="log-interaction" data-contact-id="${item.id}">Log Interaction</button>
              <button class="contact-menu-item" data-action="open-contact" data-id="${item.id}">Edit</button>
              <button class="contact-menu-item contact-menu-item-danger" data-action="delete-contact" data-id="${item.id}">Delete</button>
            </div>
          ` : ""}
        </div>
      </div>
      ${isExpanded ? renderExpandedContact(item) : ""}
    </article>
  `;
}

function renderInteractionRow(contactId, interaction) {
  const followUpText = interaction.followUpNeeded
    ? `Follow-up ${interaction.followUpDate ? formatDate(interaction.followUpDate) : "needed"}`
    : "No follow-up";
  return `
    <div class="meta-item">
      <div class="table-row-header">
        <div>
          <div class="meta-label">${escapeHtml(interaction.type)} - ${formatDate(interaction.date)}</div>
          <div class="entity-meta">${escapeHtml(truncate(interaction.summary || "No summary", 90))}</div>
        </div>
        <span class="pill">${escapeHtml(followUpText)}</span>
      </div>
      <div class="row-actions" style="margin-top: 8px;">
        <button class="btn btn-ghost small" data-action="edit-interaction" data-contact-id="${contactId}" data-id="${interaction.id}">Edit</button>
        <button class="btn btn-danger small" data-action="delete-interaction" data-id="${interaction.id}">Delete</button>
      </div>
    </div>
  `;
}

function renderExpandedContact(item) {
  const interactions = item.interactions || [];
  return `
    <div class="contact-expanded">
      <div class="entity-meta">Next follow-up: ${item.nextFollowUpDate ? formatDate(item.nextFollowUpDate) : "No date"}</div>
      <div class="entity-meta">${escapeHtml(item.notes || "No notes yet.")}</div>
      <div class="inline-header">
        <h3 style="font-size:0.95rem;">Interactions</h3>
        <button class="btn btn-secondary small" data-action="log-interaction" data-contact-id="${item.id}">Log interaction</button>
      </div>
      <div class="record-list">
        ${interactions.length ? interactions.map((interaction) => renderInteractionRow(item.id, interaction)).join("") : `<div class="entity-meta">No interactions logged yet.</div>`}
      </div>
    </div>
  `;
}

function formatContactRole(item) {
  if (item.role && item.company) return `${item.role} at ${item.company}`;
  return item.role || item.company || "No company or role yet";
}

function getLastContactMessage(lastContactDate) {
  if (!lastContactDate) {
    return {
      text: "Last contact: No date yet",
      isStale: false
    };
  }
  const daysSince = differenceInDays(todayISO(), lastContactDate);
  const isStale = daysSince >= 14;
  return {
    text: isStale
      ? `Last contact: ${formatDate(lastContactDate)} - Consider following up!`
      : `Last contact: ${formatDate(lastContactDate)}`,
    isStale
  };
}

function renderCaseCard(item) {
  const partner = item.linkedContactId ? getContactName(item.linkedContactId) : item.partnerLabel;
  return `
    <article class="record-card">
      <div class="table-row-header">
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <div class="entity-meta">${escapeHtml(item.caseType)} • ${escapeHtml(item.firmStyle)}</div>
        </div>
        <span class="status-badge" data-tone="success">${escapeHtml(`${item.rating || 0}/5`)}</span>
      </div>
      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-label">Date</div>
          <div class="meta-value">${formatDate(item.date)}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Duration</div>
          <div class="meta-value">${item.durationMinutes ? `${item.durationMinutes} min` : "Not set"}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Partner</div>
          <div class="meta-value">${escapeHtml(partner || "Solo / not listed")}</div>
        </div>
      </div>
      <div class="entity-meta"><strong>What went well:</strong> ${escapeHtml(item.whatWentWell || "Not captured yet.")}</div>
      <div class="entity-meta"><strong>What to improve:</strong> ${escapeHtml(item.whatToImprove || "Not captured yet.")}</div>
      <div class="row-actions">
        <button class="btn btn-ghost small" data-action="open-case" data-id="${item.id}">Edit</button>
        <button class="btn btn-danger small" data-action="delete-case" data-id="${item.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderTipCard(item) {
  const linkedCount = (item.linkedApplicationIds?.length || 0) + (item.linkedContactIds?.length || 0) + (item.linkedCaseSessionIds?.length || 0);
  return `
    <article class="record-card">
      <div class="table-row-header">
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <div class="entity-meta">${escapeHtml(item.category)}</div>
        </div>
        <span class="pill">${linkedCount} linked</span>
      </div>
      <div class="entity-meta">${escapeHtml(truncate(item.body || "", 180) || "No tip body yet.")}</div>
      <div class="row-actions">
        <button class="btn btn-ghost small" data-action="open-tip" data-id="${item.id}">Edit</button>
        <button class="btn btn-danger small" data-action="delete-tip" data-id="${item.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderCadenceRow(item) {
  return `
    <div class="cadence-row">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <div class="entity-meta">${escapeHtml(item.cadenceType)} • Every ${item.intervalValue} ${item.intervalUnit}</div>
        <div class="tiny">Next due: ${formatDate(item.nextDueDate)} • ${item.active ? "Active" : "Paused"}</div>
      </div>
      <div class="row-actions">
        <button class="btn btn-secondary small" data-action="complete-cadence" data-id="${item.id}">Mark complete</button>
        <button class="btn btn-ghost small" data-action="open-cadence" data-id="${item.id}">Edit</button>
        <button class="btn btn-danger small" data-action="delete-cadence" data-id="${item.id}">Delete</button>
      </div>
    </div>
  `;
}

function renderEmptyState(title, body, ctaLabel, ctaAction) {
  return `
    <section class="empty-state">
      <h3>${title}</h3>
      <p class="muted">${body}</p>
      <button class="btn btn-primary" data-action="${ctaAction}">${ctaLabel}</button>
    </section>
  `;
}

function renderInlineEmpty(body) {
  return `<div class="empty-state"><p class="muted">${body}</p></div>`;
}

function openApplicationModal(id = "") {
  const item = state.applications.find((entry) => entry.id === id) || createApplicationRecord();
  modalRoot.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-panel">
        <div class="card-header">
          <div>
            <h2>${id ? "Edit application" : "Add application"}</h2>
            <p class="card-subtitle">The next step pairing is what powers the dashboard.</p>
          </div>
          <button class="btn btn-ghost small" data-action="close-modal">Close</button>
        </div>
        <form id="applicationForm" class="form-grid">
          <input type="hidden" name="id" value="${item.id}">
          ${textField("Company name", "company", item.company, true)}
          ${textField("Role title", "role", item.role, true)}
          ${textField("Location", "location", item.location)}
          ${selectField("Type", "type", APPLICATION_TYPES, item.type || "MBA Internship")}
          ${selectField("Priority", "priority", PRIORITY_OPTIONS, item.priority || "Medium")}
          ${selectField("Status", "status", STATUS_ORDER, item.status || "Researching", "", "applicationStatus")}
          ${textField("Salary / compensation", "salary", item.salary)}
          ${dateField("Application date", "applicationDate", item.applicationDate)}
          ${dateField("Deadline", "deadline", item.deadline)}
          ${textField("Job URL", "jobUrl", item.jobUrl)}
          ${textField("Next step", "nextStep", item.nextStep, false, "full", "applicationNextStep")}
          ${dateField("Next step date", "nextStepDate", item.nextStepDate, false, "", "applicationNextStepDate")}
          <label class="full">
            Linked contacts
            ${checkboxList("linkedContactIds", state.contacts, item.linkedContactIds, (contact) => `${contact.name} ${contact.company ? `(${contact.company})` : ""}`)}
          </label>
          ${textField("Tags", "tags", item.tags, false, "full")}
          ${textareaField("Notes", "notes", item.notes, "full")}
          <div class="full form-actions">
            <button class="btn btn-primary" type="submit">${id ? "Save changes" : "Create application"}</button>
          </div>
        </form>
      </div>
    </div>
  `;
  toggleApplicationNextStepState(item.status);
}

function openContactModal(id = "") {
  const item = state.contacts.find((entry) => entry.id === id) || createContactRecord();
  modalRoot.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-panel">
        <div class="card-header">
          <div>
            <h2>${id ? "Edit contact" : "Add contact"}</h2>
            <p class="card-subtitle">Keep relationship context and your next follow-up in one place.</p>
          </div>
          <button class="btn btn-ghost small" data-action="close-modal">Close</button>
        </div>
        <form id="contactForm" class="form-grid">
          <input type="hidden" name="id" value="${item.id}">
          ${textField("Name", "name", item.name, true)}
          ${selectField("Relationship", "relationship", RELATIONSHIP_OPTIONS, item.relationship || "New")}
          ${textField("Company", "company", item.company)}
          ${textField("Role", "role", item.role)}
          ${textField("Email", "email", item.email)}
          ${textField("Phone", "phone", item.phone)}
          ${textField("LinkedIn URL", "linkedInUrl", item.linkedInUrl)}
          ${textField("How we met", "howWeMet", item.howWeMet)}
          ${dateField("Last contact date", "lastContactDate", item.lastContactDate)}
          ${dateField("Next follow-up date", "nextFollowUpDate", item.nextFollowUpDate)}
          ${textField("Tags", "tags", item.tags, false, "full")}
          ${textareaField("Notes", "notes", item.notes, "full")}
          <div class="full form-actions">
            <button class="btn btn-primary" type="submit">${id ? "Save changes" : "Create contact"}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function openInteractionModal(contactId, interactionId = "") {
  const contact = state.contacts.find((entry) => entry.id === contactId);
  if (!contact) return;
  const interaction = contact.interactions?.find((entry) => entry.id === interactionId) || createInteractionRecord(contactId);
  modalRoot.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-panel">
        <div class="card-header">
          <div>
            <h2>Log interaction with ${escapeHtml(contact.name)}</h2>
            <p class="card-subtitle">Capture context now, then let follow-up dates drive the dashboard.</p>
          </div>
          <button class="btn btn-ghost small" data-action="close-modal">Close</button>
        </div>
        <form id="interactionForm" class="form-grid">
          <input type="hidden" name="id" value="${interaction.id}">
          <input type="hidden" name="contactId" value="${contactId}">
          ${selectField("Type", "type", INTERACTION_TYPES, interaction.type || INTERACTION_TYPES[0])}
          ${dateField("Date", "date", interaction.date || todayISO(), true)}
          ${textareaField("Summary", "summary", interaction.summary, "full")}
          <label class="full">
            <span>Follow-up needed</span>
            <div class="checkbox-item">
              <input type="checkbox" id="interactionFollowUpNeeded" name="followUpNeeded" value="true" ${interaction.followUpNeeded ? "checked" : ""}>
              <span>Yes, I want this to become a follow-up reminder.</span>
            </div>
          </label>
          ${dateField("Follow-up date", "followUpDate", interaction.followUpDate, false, "full", "interactionFollowUpDate")}
          <div class="full form-actions">
            <button class="btn btn-primary" type="submit">${interactionId ? "Save interaction" : "Log interaction"}</button>
          </div>
        </form>
      </div>
    </div>
  `;
  toggleInteractionFollowUpState(interaction.followUpNeeded);
}

function openCaseModal(id = "") {
  const item = state.caseSessions.find((entry) => entry.id === id) || createCaseRecord();
  modalRoot.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-panel">
        <div class="card-header">
          <div>
            <h2>${id ? "Edit case session" : "Log case session"}</h2>
            <p class="card-subtitle">Capture what happened while the learning is still fresh.</p>
          </div>
          <button class="btn btn-ghost small" data-action="close-modal">Close</button>
        </div>
        <form id="caseForm" class="form-grid">
          <input type="hidden" name="id" value="${item.id}">
          ${textField("Title", "title", item.title, true)}
          ${selectField("Case type", "caseType", CASE_TYPES, item.caseType || CASE_TYPES[0])}
          ${selectField("Firm style", "firmStyle", FIRM_STYLES, item.firmStyle || FIRM_STYLES[0])}
          ${selectField("Method", "method", CASE_METHODS, item.method || CASE_METHODS[0])}
          ${dateField("Date", "date", item.date)}
          ${numberField("Duration (minutes)", "durationMinutes", item.durationMinutes)}
          ${textField("Source / case book", "source", item.source)}
          ${numberField("Rating (0-5)", "rating", item.rating, 0, 5, 1)}
          ${selectField("Linked contact partner", "linkedContactId", [{ value: "", label: "None" }, ...state.contacts.map((contact) => ({ value: contact.id, label: `${contact.name}${contact.company ? ` (${contact.company})` : ""}` }))], item.linkedContactId, "value-label", "linkedContactId")}
          ${textField("Partner label fallback", "partnerLabel", item.partnerLabel)}
          ${textareaField("What went well", "whatWentWell", item.whatWentWell)}
          ${textareaField("What to improve", "whatToImprove", item.whatToImprove)}
          ${textareaField("Notes", "notes", item.notes, "full")}
          ${textField("Tags", "tags", item.tags, false, "full")}
          <div class="full form-actions">
            <button class="btn btn-primary" type="submit">${id ? "Save changes" : "Log session"}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function openTipModal(id = "") {
  const item = state.tips.find((entry) => entry.id === id) || createTipRecord();
  modalRoot.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-panel">
        <div class="card-header">
          <div>
            <h2>${id ? "Edit tip" : "Add tip"}</h2>
            <p class="card-subtitle">Use free-text categories so new groups appear naturally.</p>
          </div>
          <button class="btn btn-ghost small" data-action="close-modal">Close</button>
        </div>
        <form id="tipForm" class="form-grid">
          <input type="hidden" name="id" value="${item.id}">
          ${textField("Title", "title", item.title, true)}
          ${textField("Category", "category", item.category, true)}
          ${checkboxFieldGroup("Linked applications", "linkedApplicationIds", state.applications, item.linkedApplicationIds, (app) => `${app.company} — ${app.role}`)}
          ${multiSelectDropdownFieldGroup("Linked contacts", "linkedContactIds", state.contacts, item.linkedContactIds, (contact) => `${contact.name} ${contact.company ? `(${contact.company})` : ""}`, "Select contacts")}
          ${multiSelectDropdownFieldGroup("Linked case sessions", "linkedCaseSessionIds", state.caseSessions, item.linkedCaseSessionIds, (session) => session.title, "Select case sessions")}
          ${textField("Tags", "tags", item.tags, false, "full")}
          ${textareaField("Body", "body", item.body, "full")}
          <div class="full form-actions">
            <button class="btn btn-primary" type="submit">${id ? "Save changes" : "Create tip"}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function openCadenceModal(id = "") {
  const item = state.cadenceRules.find((entry) => entry.id === id) || createCadenceRecord();
  modalRoot.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-panel">
        <div class="card-header">
          <div>
            <h2>${id ? "Edit cadence rule" : "Add cadence rule"}</h2>
            <p class="card-subtitle">Define recurring habits and let the dashboard pull them forward when due.</p>
          </div>
          <button class="btn btn-ghost small" data-action="close-modal">Close</button>
        </div>
        <form id="cadenceForm" class="form-grid">
          <input type="hidden" name="id" value="${item.id}">
          ${textField("Title", "title", item.title, true)}
          ${textField("Cadence type", "cadenceType", item.cadenceType, true)}
          ${numberField("Interval value", "intervalValue", item.intervalValue || 1, 1, 365, 1)}
          ${selectField("Interval unit", "intervalUnit", ["days", "weeks"], item.intervalUnit || "days")}
          ${dateField("Last completed date", "lastCompletedDate", item.lastCompletedDate)}
          ${dateField("Next due date", "nextDueDate", item.nextDueDate || todayISO())}
          <label>
            Active
            <select name="active">
              <option value="true" ${item.active ? "selected" : ""}>Yes</option>
              <option value="false" ${!item.active ? "selected" : ""}>No</option>
            </select>
          </label>
          <div class="full form-actions">
            <button class="btn btn-primary" type="submit">${id ? "Save changes" : "Create cadence rule"}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function closeModal() {
  modalRoot.innerHTML = "";
}

async function handleApplicationSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const id = formData.get("id");
  const existing = state.applications.find((item) => item.id === id);
  const status = formData.get("status");
  const payload = {
    id,
    company: formData.get("company").trim(),
    role: formData.get("role").trim(),
    location: formData.get("location").trim(),
    type: formData.get("type"),
    priority: formData.get("priority"),
    status,
    salary: formData.get("salary").trim(),
    applicationDate: formData.get("applicationDate"),
    deadline: formData.get("deadline"),
    jobUrl: formData.get("jobUrl").trim(),
    nextStep: status === "Rejected" ? "" : formData.get("nextStep").trim(),
    nextStepDate: status === "Rejected" ? "" : formData.get("nextStepDate"),
    linkedContactIds: formData.getAll("linkedContactIds"),
    notes: formData.get("notes").trim(),
    tags: formData.get("tags").trim(),
    createdAt: existing?.createdAt || isoNow(),
    updatedAt: isoNow()
  };
  await upsertEntity("applications", payload);
  closeModal();
}

async function handleContactSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const id = formData.get("id");
  const existing = state.contacts.find((item) => item.id === id);
  const payload = {
    id,
    name: formData.get("name").trim(),
    relationship: formData.get("relationship"),
    company: formData.get("company").trim(),
    role: formData.get("role").trim(),
    email: formData.get("email").trim(),
    phone: formData.get("phone").trim(),
    linkedInUrl: formData.get("linkedInUrl").trim(),
    howWeMet: formData.get("howWeMet").trim(),
    lastContactDate: formData.get("lastContactDate"),
    nextFollowUpDate: formData.get("nextFollowUpDate"),
    notes: formData.get("notes").trim(),
    tags: formData.get("tags").trim(),
    createdAt: existing?.createdAt || isoNow(),
    updatedAt: isoNow()
  };
  await upsertEntity("contacts", payload);
  closeModal();
}

async function handleInteractionSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const id = formData.get("id");
  const contactId = formData.get("contactId");
  const existing = findInteraction(id);
  const payload = {
    id,
    contactId,
    type: formData.get("type"),
    date: formData.get("date"),
    summary: formData.get("summary").trim(),
    followUpNeeded: formData.get("followUpNeeded") === "true",
    followUpDate: formData.get("followUpDate"),
    createdAt: existing?.createdAt || isoNow(),
    updatedAt: isoNow()
  };
  state = await apiFetch(existing ? `/api/interactions/${id}` : `/api/contacts/${contactId}/interactions`, {
    method: existing ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
  closeModal();
  render();
}

async function handleCaseSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const id = formData.get("id");
  const existing = state.caseSessions.find((item) => item.id === id);
  const linkedContactId = formData.get("linkedContactId");
  const payload = {
    id,
    title: formData.get("title").trim(),
    caseType: formData.get("caseType"),
    firmStyle: formData.get("firmStyle"),
    method: formData.get("method"),
    date: formData.get("date"),
    durationMinutes: formData.get("durationMinutes"),
    source: formData.get("source").trim(),
    rating: formData.get("rating"),
    whatWentWell: formData.get("whatWentWell").trim(),
    whatToImprove: formData.get("whatToImprove").trim(),
    notes: formData.get("notes").trim(),
    linkedContactId,
    partnerLabel: linkedContactId ? "" : formData.get("partnerLabel").trim(),
    tags: formData.get("tags").trim(),
    createdAt: existing?.createdAt || isoNow(),
    updatedAt: isoNow()
  };
  await upsertEntity("caseSessions", payload);
  closeModal();
}

async function handleTipSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const id = formData.get("id");
  const existing = state.tips.find((item) => item.id === id);
  const payload = {
    id,
    title: formData.get("title").trim(),
    category: formData.get("category").trim(),
    body: formData.get("body").trim(),
    tags: formData.get("tags").trim(),
    linkedApplicationIds: formData.getAll("linkedApplicationIds"),
    linkedContactIds: formData.getAll("linkedContactIds"),
    linkedCaseSessionIds: formData.getAll("linkedCaseSessionIds"),
    createdAt: existing?.createdAt || isoNow(),
    updatedAt: isoNow()
  };
  await upsertEntity("tips", payload);
  closeModal();
}

async function handleCadenceSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const id = formData.get("id");
  const existing = state.cadenceRules.find((item) => item.id === id);
  const intervalValue = Number(formData.get("intervalValue")) || 1;
  const intervalUnit = formData.get("intervalUnit");
  const lastCompletedDate = formData.get("lastCompletedDate");
  const payload = {
    id,
    title: formData.get("title").trim(),
    cadenceType: formData.get("cadenceType").trim(),
    intervalValue,
    intervalUnit,
    lastCompletedDate,
    nextDueDate: formData.get("nextDueDate") || computeNextDueDate(lastCompletedDate || todayISO(), intervalValue, intervalUnit),
    active: formData.get("active") === "true",
    createdAt: existing?.createdAt || isoNow(),
    updatedAt: isoNow()
  };
  await upsertEntity("cadenceRules", payload);
  closeModal();
}

async function handleSettingsSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = {
    recentActivityLimit: Math.max(1, Math.min(30, Number(formData.get("recentActivityLimit")) || 6))
  };
  state = await apiFetch("/api/settings", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
  render();
}

async function exportWorkspace() {
  const payload = await apiFetch("/api/workspace-export");
  const exportedAt = payload.exportedAt ? payload.exportedAt.slice(0, 19).replaceAll(":", "-") : todayISO();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `recruitos-workspace-${exportedAt}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function handleImportFile(input) {
  const file = input.files?.[0];
  if (!file) return;

  try {
    const raw = await file.text();
    const payload = JSON.parse(raw);
    const confirmed = window.confirm("Importing will replace your current RecruitOS workspace. A local backup will be created first. Continue?");
    if (!confirmed) return;
    state = await apiFetch("/api/workspace-import", {
      method: "POST",
      body: JSON.stringify({
        confirmReplace: true,
        payload
      })
    });
    render();
    window.alert("Workspace imported successfully.");
  } catch (error) {
    console.error("Unable to import workspace.", error);
  } finally {
    input.value = "";
  }
}

async function upsertEntity(collectionName, payload) {
  const existing = state[collectionName].find((item) => item.id === payload.id);
  state = await apiFetch(`${collectionPath(collectionName)}${existing ? `/${payload.id}` : ""}`, {
    method: existing ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
  render();
}

async function deleteEntity(collectionName, id) {
  if (!id) return;
  state = await apiFetch(`${collectionPath(collectionName)}/${id}`, {
    method: "DELETE"
  });
  render();
}

async function completeCadence(id) {
  if (!id) return;
  state = await apiFetch(`/api/cadence-rules/${id}/complete`, {
    method: "POST"
  });
  render();
}

async function deleteInteraction(id) {
  if (!id) return;
  state = await apiFetch(`/api/interactions/${id}`, { method: "DELETE" });
  render();
}

function getAttentionItems() {
  const today = todayISO();
  const items = [];

  state.contacts.forEach((contact) => {
    if (!contact.nextFollowUpDate) return;
    const isOverdue = contact.nextFollowUpDate < today;
    const isUpcoming = contact.nextFollowUpDate <= addDays(today, 3);
    if (!isOverdue && !isUpcoming) return;
    items.push({
      kind: "Networking follow-up",
      title: `Follow up with ${contact.name}`,
      detail: `${contact.company ? `${contact.company} - ` : ""}${formatDate(contact.nextFollowUpDate)}`,
      isOverdue,
      actionHtml: `<button class="btn btn-ghost small" data-action="log-interaction" data-contact-id="${contact.id}">Log interaction</button><button class="btn btn-ghost small" data-action="open-contact" data-id="${contact.id}">Open contact</button>`
    });
  });

  state.cadenceRules
    .filter((rule) => rule.active)
    .forEach((rule) => {
      const isOverdue = !!rule.nextDueDate && rule.nextDueDate < today;
      const isUpcoming = !!rule.nextDueDate && rule.nextDueDate <= addDays(today, 2);
      if (!isOverdue && !isUpcoming) return;
      items.push({
        kind: "Cadence",
        title: rule.title,
        detail: `Next due ${formatDate(rule.nextDueDate)} • every ${rule.intervalValue} ${rule.intervalUnit}`,
        isOverdue,
        actionHtml: `<button class="btn btn-secondary small" data-action="complete-cadence" data-id="${rule.id}">Mark complete</button><button class="btn btn-ghost small" data-action="open-cadence" data-id="${rule.id}">Edit</button><button class="btn btn-danger small" data-action="delete-cadence" data-id="${rule.id}">Delete</button>`
      });
    });

  state.applications
    .filter((item) => item.status !== "Rejected" && item.status !== "Offer")
    .forEach((item) => {
      if (item.nextStepDate) {
        const isOverdue = item.nextStepDate < today;
        const isUpcoming = item.nextStepDate <= addDays(today, 3);
        if (isOverdue || isUpcoming) {
          items.push({
            kind: "Application next step",
            title: `${item.company}: ${item.nextStep || "Next step missing"}`,
            detail: `${item.role} • due ${formatDate(item.nextStepDate)}`,
            isOverdue,
            actionHtml: `<button class="btn btn-ghost small" data-action="open-app" data-id="${item.id}">Open application</button>`
          });
        }
      }
      if (item.deadline) {
        const isOverdue = item.deadline < today;
        const isUpcoming = item.deadline <= addDays(today, 5);
        if (isOverdue || isUpcoming) {
          items.push({
            kind: "Deadline",
            title: `${item.company} application deadline`,
            detail: `${item.role} • ${formatDate(item.deadline)}`,
            isOverdue,
            actionHtml: `<button class="btn btn-ghost small" data-action="open-app" data-id="${item.id}">Review deadline</button>`
          });
        }
      }
    });

  return items.sort((a, b) => Number(b.isOverdue) - Number(a.isOverdue) || a.title.localeCompare(b.title));
}

function toggleApplicationNextStepState(status) {
  const nextStep = document.getElementById("applicationNextStep");
  const nextStepDate = document.getElementById("applicationNextStepDate");
  if (!nextStep || !nextStepDate) return;
  const disabled = status === "Rejected";
  nextStep.disabled = disabled;
  nextStepDate.disabled = disabled;
  if (disabled) {
    nextStep.value = "";
    nextStepDate.value = "";
  }
}

function toggleInteractionFollowUpState(enabled) {
  const followUpDate = document.getElementById("interactionFollowUpDate");
  if (!followUpDate) return;
  followUpDate.disabled = !enabled;
  followUpDate.required = enabled;
  if (!enabled) {
    followUpDate.value = "";
  }
}

function getContactName(id) {
  return state.contacts.find((contact) => contact.id === id)?.name || "";
}

function findInteraction(id) {
  for (const contact of state.contacts) {
    const match = contact.interactions?.find((interaction) => interaction.id === id);
    if (match) return match;
  }
  return null;
}

function createApplicationRecord() {
  return {
    id: makeId(),
    company: "",
    role: "",
    location: "",
    type: "MBA Internship",
    priority: "Medium",
    status: "Researching",
    salary: "",
    applicationDate: "",
    deadline: "",
    jobUrl: "",
    nextStep: "",
    nextStepDate: "",
    linkedContactIds: [],
    notes: "",
    tags: "",
    createdAt: isoNow(),
    updatedAt: isoNow()
  };
}

function createContactRecord() {
  return {
    id: makeId(),
    name: "",
    relationship: "New",
    company: "",
    role: "",
    email: "",
    phone: "",
    linkedInUrl: "",
    howWeMet: "",
    lastContactDate: "",
    nextFollowUpDate: "",
    notes: "",
    tags: "",
    createdAt: isoNow(),
    updatedAt: isoNow()
  };
}

function createInteractionRecord(contactId) {
  return {
    id: makeId(),
    contactId,
    type: INTERACTION_TYPES[0],
    date: todayISO(),
    summary: "",
    followUpNeeded: false,
    followUpDate: "",
    createdAt: isoNow(),
    updatedAt: isoNow()
  };
}

function createCaseRecord() {
  return {
    id: makeId(),
    title: "",
    caseType: CASE_TYPES[0],
    firmStyle: FIRM_STYLES[0],
    method: CASE_METHODS[0],
    date: "",
    durationMinutes: "",
    source: "",
    rating: 0,
    whatWentWell: "",
    whatToImprove: "",
    notes: "",
    linkedContactId: "",
    partnerLabel: "",
    tags: "",
    createdAt: isoNow(),
    updatedAt: isoNow()
  };
}

function createTipRecord() {
  return {
    id: makeId(),
    title: "",
    category: "",
    body: "",
    tags: "",
    linkedApplicationIds: [],
    linkedContactIds: [],
    linkedCaseSessionIds: [],
    createdAt: isoNow(),
    updatedAt: isoNow()
  };
}

function createCadenceRecord() {
  return {
    id: makeId(),
    title: "",
    cadenceType: "",
    intervalUnit: "days",
    intervalValue: 1,
    active: true,
    lastCompletedDate: "",
    nextDueDate: todayISO(),
    createdAt: isoNow(),
    updatedAt: isoNow()
  };
}

function syncTabState() {
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === activeTab);
  });
}

function checkboxList(name, options, selectedIds = [], formatter) {
  if (!options.length) {
    return `<div class="checkbox-grid"><div class="muted">No options yet. Add records first, then link them here.</div></div>`;
  }
  return `
    <div class="checkbox-grid">
      ${options.map((option) => `
        <label class="checkbox-item">
          <input type="checkbox" name="${name}" value="${option.id}" ${selectedIds.includes(option.id) ? "checked" : ""}>
          <span>${escapeHtml(formatter(option))}</span>
        </label>
      `).join("")}
    </div>
  `;
}

function checkboxFieldGroup(label, name, options, selectedIds, formatter) {
  return `
    <label class="full">
      ${label}
      ${checkboxList(name, options, selectedIds, formatter)}
    </label>
  `;
}

function multiSelectDropdownFieldGroup(label, name, options, selectedIds, formatter, placeholder) {
  if (!options.length) {
    return `
      <label class="full">
        ${label}
        <div class="checkbox-grid"><div class="muted">No options yet. Add records first, then link them here.</div></div>
      </label>
    `;
  }

  return `
    <label class="full">
      ${label}
      <details class="multi-select-field token-picker" data-name="${escapeHtml(name)}" data-placeholder="${escapeHtml(placeholder)}">
        <summary class="multi-select-summary">
          <div class="token-picker-selected">
            ${renderTokenPickerSelected(name, options, selectedIds, formatter, placeholder)}
          </div>
          <span class="multi-select-chevron" aria-hidden="true">▾</span>
        </summary>
        <div class="token-picker-hidden-inputs">
          ${selectedIds.map((id) => `<input type="hidden" name="${name}" value="${escapeHtml(id)}">`).join("")}
        </div>
        <div class="multi-select-panel token-picker-options">
          ${options.map((option) => `
            <button
              class="token-picker-option ${selectedIds.includes(option.id) ? "is-selected" : ""}"
              type="button"
              data-action="add-token-option"
              data-value="${escapeHtml(option.id)}"
              data-label="${escapeHtml(formatter(option))}"
              ${selectedIds.includes(option.id) ? "disabled" : ""}
            >${escapeHtml(formatter(option))}</button>
          `).join("")}
        </div>
      </details>
    </label>
  `;
}

function renderTokenPickerSelected(name, options, selectedIds, formatter, placeholder) {
  const selectedItems = selectedIds
    .map((id) => options.find((option) => option.id === id))
    .filter(Boolean);

  if (!selectedItems.length) {
    return `<span class="multi-select-summary-text" data-placeholder="${escapeHtml(placeholder)}">${escapeHtml(placeholder)}</span>`;
  }

  return selectedItems.map((item) => `
    <span class="token-chip">
      <span>${escapeHtml(formatter(item))}</span>
      <button
        class="token-chip-remove"
        type="button"
        data-action="remove-token-option"
        data-value="${escapeHtml(item.id)}"
        aria-label="Remove ${escapeHtml(formatter(item))}"
      >×</button>
    </span>
  `).join("");
}

function addTokenPickerValue(field, value, label) {
  if (!value) return;
  const hiddenInputs = field.querySelector(".token-picker-hidden-inputs");
  const existing = hiddenInputs.querySelector(`input[value="${cssEscape(value)}"]`);
  if (existing) return;

  hiddenInputs.insertAdjacentHTML("beforeend", `<input type="hidden" name="${escapeHtml(field.dataset.name)}" value="${escapeHtml(value)}">`);
  const selected = field.querySelector(".token-picker-selected");
  const placeholderNode = selected.querySelector(".multi-select-summary-text");
  if (placeholderNode) placeholderNode.remove();
  selected.insertAdjacentHTML("beforeend", `
    <span class="token-chip">
      <span>${escapeHtml(label)}</span>
      <button class="token-chip-remove" type="button" data-action="remove-token-option" data-value="${escapeHtml(value)}" aria-label="Remove ${escapeHtml(label)}">×</button>
    </span>
  `);

  const optionButton = field.querySelector(`.token-picker-option[data-value="${cssEscape(value)}"]`);
  if (optionButton) {
    optionButton.disabled = true;
    optionButton.classList.add("is-selected");
  }
}

function removeTokenPickerValue(field, value) {
  const hiddenInput = field.querySelector(`.token-picker-hidden-inputs input[value="${cssEscape(value)}"]`);
  if (hiddenInput) hiddenInput.remove();

  const chip = field.querySelector(`.token-chip-remove[data-value="${cssEscape(value)}"]`)?.closest(".token-chip");
  if (chip) chip.remove();

  const optionButton = field.querySelector(`.token-picker-option[data-value="${cssEscape(value)}"]`);
  if (optionButton) {
    optionButton.disabled = false;
    optionButton.classList.remove("is-selected");
  }

  const selected = field.querySelector(".token-picker-selected");
  if (selected && !selected.querySelector(".token-chip")) {
    const placeholder = field.dataset.placeholder || "Select options";
    selected.innerHTML = `<span class="multi-select-summary-text" data-placeholder="${escapeHtml(placeholder)}">${escapeHtml(placeholder)}</span>`;
  }
}

function cssEscape(value) {
  return String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function textField(label, name, value = "", required = false, extraClass = "", id = "") {
  return `
    <label class="${extraClass}">
      ${label}${required ? " *" : ""}
      <input ${id ? `id="${id}"` : ""} type="text" name="${name}" value="${escapeHtml(value)}" ${required ? "required" : ""}>
    </label>
  `;
}

function textareaField(label, name, value = "", extraClass = "") {
  return `
    <label class="${extraClass}">
      ${label}
      <textarea name="${name}">${escapeHtml(value)}</textarea>
    </label>
  `;
}

function dateField(label, name, value = "", required = false, extraClass = "", id = "") {
  return `
    <label class="${extraClass}">
      ${label}${required ? " *" : ""}
      <input ${id ? `id="${id}"` : ""} type="date" name="${name}" value="${escapeHtml(value)}" ${required ? "required" : ""}>
    </label>
  `;
}

function numberField(label, name, value = "", min = "", max = "", step = "1") {
  return `
    <label>
      ${label}
      <input type="number" name="${name}" value="${escapeHtml(String(value || ""))}" ${min !== "" ? `min="${min}"` : ""} ${max !== "" ? `max="${max}"` : ""} step="${step}">
    </label>
  `;
}

function selectField(label, name, options, value, mode = "", id = "") {
  const items = Array.isArray(options) ? options : [];
  return `
    <label>
      ${label}
      <select ${id ? `id="${id}"` : ""} name="${name}">
        ${items.map((option) => {
          const actualValue = mode === "value-label" ? option.value : option;
          const actualLabel = mode === "value-label" ? option.label : option;
          return `<option value="${escapeHtml(actualValue)}" ${actualValue === value ? "selected" : ""}>${escapeHtml(actualLabel)}</option>`;
        }).join("")}
      </select>
    </label>
  `;
}

function statusBadge(status) {
  const tone = status === "Rejected" ? "danger" : status === "Offer" ? "success" : status.includes("Interview") || status === "Phone Screen" ? "warm" : "neutral";
  return `<span class="status-badge" data-tone="${tone}">${escapeHtml(status)}</span>`;
}

function priorityBadge(priority) {
  return `<span class="priority-badge" data-tone="${priority.toLowerCase()}">${escapeHtml(priority)}</span>`;
}

function formatDate(value) {
  if (!value) return "Not set";
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatTimestamp(value) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 18) return "Good afternoon!";
  return "Good evening!";
}

function getGreetingIcon() {
  const hour = new Date().getHours();
  if (hour < 12) return "☀";
  if (hour < 18) return "◐";
  return "☾";
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isoNow() {
  return new Date().toISOString();
}

function addDays(isoDate, days) {
  if (!isoDate) return "";
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatPracticeDuration(totalMinutes) {
  const minutes = Number(totalMinutes) || 0;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!remainder) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

function differenceInDays(laterIsoDate, earlierIsoDate) {
  if (!laterIsoDate || !earlierIsoDate) return 0;
  const later = new Date(`${laterIsoDate}T00:00:00`);
  const earlier = new Date(`${earlierIsoDate}T00:00:00`);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((later - earlier) / millisecondsPerDay);
}

function getControlValue(filterName) {
  return document.querySelector(`[data-filter="${filterName}"]`)?.value || "";
}

function parseTags(tagsValue) {
  return String(tagsValue || "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function getUniqueTags(items) {
  return [...new Set(items.flatMap((item) => parseTags(item.tags)))].sort((a, b) => a.localeCompare(b));
}

function sortItems(items, accessorMap, sortBy, sortOrder) {
  const direction = sortOrder === "asc" ? 1 : -1;
  return [...items].sort((a, b) => compareSortValues(accessorMap(sortBy, a), accessorMap(sortBy, b)) * direction);
}

function compareSortValues(left, right) {
  const a = left ?? "";
  const b = right ?? "";
  const aIsNumber = typeof a === "number";
  const bIsNumber = typeof b === "number";
  if (aIsNumber || bIsNumber) return (Number(a) || 0) - (Number(b) || 0);
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

function getApplicationsSortValue(sortBy, item) {
  const priorityRank = { High: 3, Medium: 2, Low: 1 };
  const statusRank = Object.fromEntries(STATUS_ORDER.map((status, index) => [status, index + 1]));
  const values = {
    updated: item.updatedAt || "",
    company: item.company || "",
    status: statusRank[item.status] || 0,
    priority: priorityRank[item.priority] || 0,
    deadline: item.deadline || "9999-12-31",
    nextStepDate: item.nextStepDate || "9999-12-31",
    applicationDate: item.applicationDate || "9999-12-31"
  };
  return values[sortBy] ?? values.updated;
}

function getContactsSortValue(sortBy, item) {
  const values = {
    updated: item.updatedAt || "",
    name: item.name || "",
    company: item.company || "",
    relationship: item.relationship || "",
    lastContactDate: item.lastContactDate || "",
    nextFollowUpDate: item.nextFollowUpDate || "9999-12-31"
  };
  return values[sortBy] ?? values.updated;
}

function getCaseSessionsSortValue(sortBy, item) {
  const values = {
    date: item.date || "",
    updated: item.updatedAt || "",
    rating: Number(item.rating) || 0,
    durationMinutes: Number(item.durationMinutes) || 0,
    caseType: item.caseType || ""
  };
  return values[sortBy] ?? values.date;
}

function getTipsSortValue(sortBy, item) {
  const values = {
    category: item.category || "",
    title: item.title || "",
    updated: item.updatedAt || ""
  };
  return values[sortBy] ?? values.category;
}

function computeNextDueDate(baseDate, intervalValue, intervalUnit) {
  const multiplier = intervalUnit === "weeks" ? 7 : 1;
  return addDays(baseDate, intervalValue * multiplier);
}

function sortByUpdatedDesc(a, b) {
  return (b.updatedAt || "").localeCompare(a.updatedAt || "");
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function collectionPath(collectionName) {
  const paths = {
    applications: "/api/applications",
    contacts: "/api/contacts",
    caseSessions: "/api/case-sessions",
    tips: "/api/tips",
    cadenceRules: "/api/cadence-rules"
  };
  return paths[collectionName];
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error || "Request failed.";
    window.alert(message);
    throw new Error(message);
  }
  return data;
}

function groupBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function truncate(value, maxLength) {
  if (!value || value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}...`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
