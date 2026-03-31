const express = require("express");

const { db, createBackup } = require("../db");
const {
  normalizeApplication,
  normalizeContact,
  normalizeCaseSession,
  normalizeTip,
  normalizeCadenceRule,
  normalizeSettings,
  normalizeInteraction
} = require("../validation");

const router = express.Router();
const EXPORT_VERSION = 1;

router.get("/bootstrap", (_request, response) => {
  response.json(getState());
});

router.get("/applications", (_request, response) => response.json(getState().applications));
router.post("/applications", createHandler(saveApplication));
router.put("/applications/:id", createHandler(saveApplication));
router.delete("/applications/:id", createDeleteHandler(deleteApplication));

router.get("/contacts", (_request, response) => response.json(getState().contacts));
router.post("/contacts", createHandler(saveContact));
router.put("/contacts/:id", createHandler(saveContact));
router.delete("/contacts/:id", createDeleteHandler(deleteContact));
router.get("/contacts/:id/interactions", (request, response, next) => {
  try {
    response.json(getContactInteractions(request.params.id));
  } catch (error) {
    next(error);
  }
});
router.post("/contacts/:id/interactions", (request, response, next) => {
  try {
    saveInteraction(request.body || {}, request.params.id);
    response.json(getState());
  } catch (error) {
    next(error);
  }
});
router.put("/interactions/:id", (request, response, next) => {
  try {
    saveInteraction({ ...(request.body || {}), id: request.params.id });
    response.json(getState());
  } catch (error) {
    next(error);
  }
});
router.delete("/interactions/:id", (request, response, next) => {
  try {
    deleteInteraction(request.params.id);
    response.json(getState());
  } catch (error) {
    next(error);
  }
});

router.get("/case-sessions", (_request, response) => response.json(getState().caseSessions));
router.post("/case-sessions", createHandler(saveCaseSession));
router.put("/case-sessions/:id", createHandler(saveCaseSession));
router.delete("/case-sessions/:id", createDeleteHandler(deleteCaseSession));

router.get("/tips", (_request, response) => response.json(getState().tips));
router.post("/tips", createHandler(saveTip));
router.put("/tips/:id", createHandler(saveTip));
router.delete("/tips/:id", createDeleteHandler(deleteTip));

router.get("/cadence-rules", (_request, response) => response.json(getState().cadenceRules));
router.post("/cadence-rules", createHandler(saveCadenceRule));
router.put("/cadence-rules/:id", createHandler(saveCadenceRule));
router.delete("/cadence-rules/:id", createDeleteHandler(deleteCadenceRule));
router.post("/cadence-rules/:id/complete", (request, response, next) => {
  try {
    completeCadenceRule(request.params.id);
    response.json(getState());
  } catch (error) {
    next(error);
  }
});

router.get("/activity-events", (_request, response) => response.json(getState().activityEvents));
router.get("/workspace-export", (_request, response) => {
  response.json(createWorkspaceExport());
});
router.post("/workspace-import", (request, response, next) => {
  try {
    if (request.body?.confirmReplace !== true) {
      throw new Error("Import confirmation is required.");
    }
    importWorkspace(request.body?.payload);
    response.json(getState());
  } catch (error) {
    next(error);
  }
});
router.get("/settings", (_request, response) => response.json(getState().settings));
router.put("/settings", (request, response, next) => {
  try {
    const settings = normalizeSettings(request.body || {});
    db.prepare("UPDATE settings SET recent_activity_limit = ? WHERE id = 'default'").run(settings.recentActivityLimit);
    insertActivity("system", "", "event", "Updated settings", `Recent activity feed now shows ${settings.recentActivityLimit} items.`);
    response.json(getState());
  } catch (error) {
    next(error);
  }
});

router.use((error, _request, response, _next) => {
  response.status(400).json({ error: error.message || "Request failed." });
});

function createHandler(saver) {
  return (request, response, next) => {
    try {
      saver(request.body || {});
      response.json(getState());
    } catch (error) {
      next(error);
    }
  };
}

function createDeleteHandler(deleter) {
  return (request, response, next) => {
    try {
      deleter(request.params.id);
      response.json(getState());
    } catch (error) {
      next(error);
    }
  };
}

function saveApplication(payload) {
  const item = normalizeApplication(payload);
  ensureContactsExist(item.linkedContactIds);
  const existing = db.prepare("SELECT id FROM applications WHERE id = ?").get(item.id);
  const transaction = db.transaction(() => {
    if (existing) {
      db.prepare(`
        UPDATE applications SET
          company = ?, role = ?, location = ?, type = ?, priority = ?, status = ?, salary = ?,
          application_date = ?, deadline = ?, job_url = ?, next_step = ?, next_step_date = ?,
          notes = ?, tags = ?, updated_at = ?
        WHERE id = ?
      `).run(
        item.company, item.role, item.location, item.type, item.priority, item.status, item.salary,
        item.applicationDate, item.deadline, item.jobUrl, item.nextStep, item.nextStepDate,
        item.notes, item.tags, item.updatedAt, item.id
      );
    } else {
      db.prepare(`
        INSERT INTO applications (
          id, company, role, location, type, priority, status, salary, application_date,
          deadline, job_url, next_step, next_step_date, notes, tags, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        item.id, item.company, item.role, item.location, item.type, item.priority, item.status, item.salary,
        item.applicationDate, item.deadline, item.jobUrl, item.nextStep, item.nextStepDate,
        item.notes, item.tags, item.createdAt, item.updatedAt
      );
    }

    db.prepare("DELETE FROM application_contacts WHERE application_id = ?").run(item.id);
    const insertLink = db.prepare("INSERT INTO application_contacts (application_id, contact_id) VALUES (?, ?)");
    for (const contactId of item.linkedContactIds) insertLink.run(item.id, contactId);
  });

  transaction();
  insertActivity("application", item.id, existing ? "update" : "create", existing ? "Updated application" : "Created application", `${item.company} - ${item.role} ${existing ? "was updated." : "was added."}`);
}

function saveContact(payload) {
  const item = normalizeContact(payload);
  const existing = db.prepare("SELECT id FROM contacts WHERE id = ?").get(item.id);
  if (existing) {
    db.prepare(`
      UPDATE contacts SET
        name = ?, relationship = ?, company = ?, role = ?, email = ?, phone = ?, linkedin_url = ?,
        how_we_met = ?, last_contact_date = ?, next_follow_up_date = ?, notes = ?, tags = ?, updated_at = ?
      WHERE id = ?
    `).run(
      item.name, item.relationship, item.company, item.role, item.email, item.phone, item.linkedInUrl,
      item.howWeMet, item.lastContactDate, item.nextFollowUpDate, item.notes, item.tags, item.updatedAt, item.id
    );
  } else {
    db.prepare(`
      INSERT INTO contacts (
        id, name, relationship, company, role, email, phone, linkedin_url,
        how_we_met, last_contact_date, next_follow_up_date, notes, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.id, item.name, item.relationship, item.company, item.role, item.email, item.phone, item.linkedInUrl,
      item.howWeMet, item.lastContactDate, item.nextFollowUpDate, item.notes, item.tags, item.createdAt, item.updatedAt
    );
  }
  insertActivity("contact", item.id, existing ? "update" : "create", existing ? "Updated contact" : "Created contact", `${item.name} ${existing ? "was updated." : "was added."}`);
}

function saveCaseSession(payload) {
  const item = normalizeCaseSession(payload);
  ensureContactsExist(item.linkedContactId ? [item.linkedContactId] : []);
  const existing = db.prepare("SELECT id FROM case_sessions WHERE id = ?").get(item.id);
  if (existing) {
    db.prepare(`
      UPDATE case_sessions SET
        title = ?, case_type = ?, firm_style = ?, method = ?, date = ?, duration_minutes = ?, source = ?,
        rating = ?, what_went_well = ?, what_to_improve = ?, notes = ?, linked_contact_id = ?, partner_label = ?,
        tags = ?, updated_at = ?
      WHERE id = ?
    `).run(
      item.title, item.caseType, item.firmStyle, item.method, item.date, item.durationMinutes, item.source,
      item.rating, item.whatWentWell, item.whatToImprove, item.notes, item.linkedContactId, item.partnerLabel,
      item.tags, item.updatedAt, item.id
    );
  } else {
    db.prepare(`
      INSERT INTO case_sessions (
        id, title, case_type, firm_style, method, date, duration_minutes, source, rating,
        what_went_well, what_to_improve, notes, linked_contact_id, partner_label, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.id, item.title, item.caseType, item.firmStyle, item.method, item.date, item.durationMinutes, item.source,
      item.rating, item.whatWentWell, item.whatToImprove, item.notes, item.linkedContactId, item.partnerLabel,
      item.tags, item.createdAt, item.updatedAt
    );
  }
  insertActivity("caseSession", item.id, existing ? "update" : "create", existing ? "Updated case session" : "Created case session", `${item.title} ${existing ? "was updated." : "was added."}`);
}

function saveInteraction(payload, contactIdFromRoute = "") {
  const item = normalizeInteraction(payload, contactIdFromRoute);
  ensureContactsExist([item.contactId]);
  const existing = db.prepare("SELECT id FROM contact_interactions WHERE id = ?").get(item.id);
  if (existing) {
    db.prepare(`
      UPDATE contact_interactions SET
        contact_id = ?, type = ?, date = ?, summary = ?, follow_up_needed = ?, follow_up_date = ?, updated_at = ?
      WHERE id = ?
    `).run(
      item.contactId, item.type, item.date, item.summary, item.followUpNeeded ? 1 : 0, item.followUpDate, item.updatedAt, item.id
    );
  } else {
    db.prepare(`
      INSERT INTO contact_interactions (
        id, contact_id, type, date, summary, follow_up_needed, follow_up_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.id, item.contactId, item.type, item.date, item.summary, item.followUpNeeded ? 1 : 0, item.followUpDate, item.createdAt, item.updatedAt
    );
  }
  syncContactFollowUps(item.contactId);
  insertActivity("contactInteraction", item.id, existing ? "update" : "create", existing ? "Updated interaction" : "Logged interaction", `${item.type} ${existing ? "was updated." : "was logged."}`);
}

function saveTip(payload) {
  const item = normalizeTip(payload);
  ensureApplicationsExist(item.linkedApplicationIds);
  ensureContactsExist(item.linkedContactIds);
  ensureCaseSessionsExist(item.linkedCaseSessionIds);
  const existing = db.prepare("SELECT id FROM tips WHERE id = ?").get(item.id);
  const transaction = db.transaction(() => {
    if (existing) {
      db.prepare("UPDATE tips SET title = ?, category = ?, body = ?, tags = ?, updated_at = ? WHERE id = ?")
        .run(item.title, item.category, item.body, item.tags, item.updatedAt, item.id);
    } else {
      db.prepare("INSERT INTO tips (id, title, category, body, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(item.id, item.title, item.category, item.body, item.tags, item.createdAt, item.updatedAt);
    }
    resetJoinTable("tip_applications", "tip_id", "application_id", item.id, item.linkedApplicationIds);
    resetJoinTable("tip_contacts", "tip_id", "contact_id", item.id, item.linkedContactIds);
    resetJoinTable("tip_case_sessions", "tip_id", "case_session_id", item.id, item.linkedCaseSessionIds);
  });
  transaction();
  insertActivity("tip", item.id, existing ? "update" : "create", existing ? "Updated tip" : "Created tip", `${item.title} ${existing ? "was updated." : "was added."}`);
}

function saveCadenceRule(payload) {
  const item = normalizeCadenceRule(payload);
  const existing = db.prepare("SELECT id FROM cadence_rules WHERE id = ?").get(item.id);
  if (existing) {
    db.prepare(`
      UPDATE cadence_rules SET
        title = ?, cadence_type = ?, interval_unit = ?, interval_value = ?, active = ?,
        last_completed_date = ?, next_due_date = ?, updated_at = ?
      WHERE id = ?
    `).run(
      item.title, item.cadenceType, item.intervalUnit, item.intervalValue, item.active,
      item.lastCompletedDate, item.nextDueDate, item.updatedAt, item.id
    );
  } else {
    db.prepare(`
      INSERT INTO cadence_rules (
        id, title, cadence_type, interval_unit, interval_value, active,
        last_completed_date, next_due_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.id, item.title, item.cadenceType, item.intervalUnit, item.intervalValue, item.active,
      item.lastCompletedDate, item.nextDueDate, item.createdAt, item.updatedAt
    );
  }
  insertActivity("cadenceRule", item.id, existing ? "update" : "create", existing ? "Updated cadence rule" : "Created cadence rule", `${item.title} ${existing ? "was updated." : "was added."}`);
}

function completeCadenceRule(id) {
  const existing = db.prepare("SELECT * FROM cadence_rules WHERE id = ?").get(id);
  if (!existing) throw new Error("Cadence rule not found.");
  const today = new Date().toISOString().slice(0, 10);
  const days = existing.interval_unit === "weeks" ? existing.interval_value * 7 : existing.interval_value;
  db.prepare("UPDATE cadence_rules SET last_completed_date = ?, next_due_date = ?, updated_at = ? WHERE id = ?")
    .run(today, addDays(today, days), new Date().toISOString(), id);
  insertActivity("cadenceRule", id, "complete", "Completed cadence task", `${existing.title} was marked complete.`);
}

function deleteApplication(id) {
  const item = db.prepare("SELECT company FROM applications WHERE id = ?").get(id);
  if (!item) throw new Error("Application not found.");
  db.prepare("DELETE FROM applications WHERE id = ?").run(id);
  insertActivity("application", id, "delete", "Deleted application", `${item.company} was removed.`);
}

function deleteContact(id) {
  const item = db.prepare("SELECT name FROM contacts WHERE id = ?").get(id);
  if (!item) throw new Error("Contact not found.");
  db.prepare("DELETE FROM contacts WHERE id = ?").run(id);
  insertActivity("contact", id, "delete", "Deleted contact", `${item.name} was removed.`);
}

function deleteCaseSession(id) {
  const item = db.prepare("SELECT title FROM case_sessions WHERE id = ?").get(id);
  if (!item) throw new Error("Case session not found.");
  db.prepare("DELETE FROM case_sessions WHERE id = ?").run(id);
  insertActivity("caseSession", id, "delete", "Deleted case session", `${item.title} was removed.`);
}

function deleteTip(id) {
  const item = db.prepare("SELECT title FROM tips WHERE id = ?").get(id);
  if (!item) throw new Error("Tip not found.");
  db.prepare("DELETE FROM tips WHERE id = ?").run(id);
  insertActivity("tip", id, "delete", "Deleted tip", `${item.title} was removed.`);
}

function deleteCadenceRule(id) {
  const item = db.prepare("SELECT title FROM cadence_rules WHERE id = ?").get(id);
  if (!item) throw new Error("Cadence rule not found.");
  db.prepare("DELETE FROM cadence_rules WHERE id = ?").run(id);
  insertActivity("cadenceRule", id, "delete", "Deleted cadence rule", `${item.title} was removed.`);
}

function deleteInteraction(id) {
  const interaction = db.prepare("SELECT contact_id, type FROM contact_interactions WHERE id = ?").get(id);
  if (!interaction) throw new Error("Interaction not found.");
  db.prepare("DELETE FROM contact_interactions WHERE id = ?").run(id);
  syncContactFollowUps(interaction.contact_id);
  insertActivity("contactInteraction", id, "delete", "Deleted interaction", `${interaction.type} interaction was removed.`);
}

function getState() {
  return {
    applications: getApplications(),
    contacts: getContacts(),
    caseSessions: getCaseSessions(),
    tips: getTips(),
    cadenceRules: getCadenceRules(),
    activityEvents: getActivityEvents(),
    settings: getSettings()
  };
}

function createWorkspaceExport() {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    workspace: {
      applications: getApplications(),
      contacts: getContacts().map((contact) => ({
        ...contact,
        interactions: undefined
      })).map(stripUndefinedFields),
      contactInteractions: getContactInteractionRows().map(mapInteractionRow),
      caseSessions: getCaseSessions(),
      tips: getTips(),
      cadenceRules: getCadenceRules(),
      activityEvents: getActivityEvents(),
      settings: getSettings()
    }
  };
}

function importWorkspace(payload) {
  const workspace = normalizeWorkspaceImport(payload);
  validateWorkspaceLinks(workspace);
  createBackup();

  const transaction = db.transaction(() => {
    clearWorkspaceTables();
    insertImportedContacts(workspace.contacts);
    insertImportedApplications(workspace.applications);
    insertImportedCaseSessions(workspace.caseSessions);
    insertImportedTips(workspace.tips);
    insertImportedCadenceRules(workspace.cadenceRules);
    insertImportedSettings(workspace.settings);
    insertImportedInteractions(workspace.contactInteractions);
    insertImportedActivityEvents(workspace.activityEvents);
  });

  transaction();
}

function getApplications() {
  const rows = db.prepare("SELECT * FROM applications ORDER BY updated_at DESC").all();
  const links = groupLinks(db.prepare("SELECT application_id, contact_id FROM application_contacts").all(), "application_id", "contact_id");
  return rows.map((row) => ({
    id: row.id,
    company: row.company,
    role: row.role,
    location: row.location,
    type: row.type,
    priority: row.priority,
    status: row.status,
    salary: row.salary,
    applicationDate: row.application_date,
    deadline: row.deadline,
    jobUrl: row.job_url,
    nextStep: row.next_step,
    nextStepDate: row.next_step_date,
    linkedContactIds: links[row.id] || [],
    notes: row.notes,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

function getContacts() {
  const interactionsByContact = groupLinks(getContactInteractionRows(), "contact_id");
  return db.prepare("SELECT * FROM contacts ORDER BY updated_at DESC").all().map((row) => ({
    id: row.id,
    name: row.name,
    relationship: row.relationship,
    company: row.company,
    role: row.role,
    email: row.email,
    phone: row.phone,
    linkedInUrl: row.linkedin_url,
    howWeMet: row.how_we_met,
    lastContactDate: row.last_contact_date,
    nextFollowUpDate: row.next_follow_up_date,
    notes: row.notes,
    tags: row.tags,
    interactions: (interactionsByContact[row.id] || []).map(mapInteractionRow),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

function getCaseSessions() {
  return db.prepare("SELECT * FROM case_sessions ORDER BY updated_at DESC").all().map((row) => ({
    id: row.id,
    title: row.title,
    caseType: row.case_type,
    firmStyle: row.firm_style,
    method: row.method,
    date: row.date,
    durationMinutes: row.duration_minutes,
    source: row.source,
    rating: row.rating,
    whatWentWell: row.what_went_well,
    whatToImprove: row.what_to_improve,
    notes: row.notes,
    linkedContactId: row.linked_contact_id,
    partnerLabel: row.partner_label,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

function getTips() {
  const rows = db.prepare("SELECT * FROM tips ORDER BY category ASC, updated_at DESC").all();
  const applicationLinks = groupLinks(db.prepare("SELECT tip_id, application_id FROM tip_applications").all(), "tip_id", "application_id");
  const contactLinks = groupLinks(db.prepare("SELECT tip_id, contact_id FROM tip_contacts").all(), "tip_id", "contact_id");
  const caseLinks = groupLinks(db.prepare("SELECT tip_id, case_session_id FROM tip_case_sessions").all(), "tip_id", "case_session_id");
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    body: row.body,
    tags: row.tags,
    linkedApplicationIds: applicationLinks[row.id] || [],
    linkedContactIds: contactLinks[row.id] || [],
    linkedCaseSessionIds: caseLinks[row.id] || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

function getCadenceRules() {
  return db.prepare("SELECT * FROM cadence_rules ORDER BY updated_at DESC").all().map((row) => ({
    id: row.id,
    title: row.title,
    cadenceType: row.cadence_type,
    intervalUnit: row.interval_unit,
    intervalValue: row.interval_value,
    active: Boolean(row.active),
    lastCompletedDate: row.last_completed_date,
    nextDueDate: row.next_due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

function getActivityEvents() {
  return db.prepare("SELECT * FROM activity_events ORDER BY timestamp DESC").all().map((row) => ({
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actionType: row.action_type,
    title: row.title,
    detail: row.detail,
    timestamp: row.timestamp
  }));
}

function getSettings() {
  const row = db.prepare("SELECT recent_activity_limit FROM settings WHERE id = 'default'").get();
  return { recentActivityLimit: row?.recent_activity_limit ?? 6 };
}

function getContactInteractions(contactId) {
  ensureContactsExist([contactId]);
  return getContactInteractionRows(contactId).map(mapInteractionRow);
}

function insertActivity(entityType, entityId, actionType, title, detail) {
  db.prepare(`
    INSERT INTO activity_events (id, entity_type, entity_id, action_type, title, detail, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(randomId(), entityType, entityId, actionType, title, detail, new Date().toISOString());
}

function normalizeWorkspaceImport(payload) {
  if (!payload || typeof payload !== "object") throw new Error("Import payload is required.");
  if (payload.version !== EXPORT_VERSION) throw new Error("Unsupported RecruitOS export version.");
  const workspace = payload.workspace;
  if (!workspace || typeof workspace !== "object") throw new Error("Workspace data is missing.");

  return {
    applications: normalizeArray(workspace.applications, normalizeApplication),
    contacts: normalizeArray(workspace.contacts, normalizeContact),
    contactInteractions: normalizeArray(workspace.contactInteractions, (item) => normalizeInteraction(item)),
    caseSessions: normalizeArray(workspace.caseSessions, normalizeCaseSession),
    tips: normalizeArray(workspace.tips, normalizeTip),
    cadenceRules: normalizeArray(workspace.cadenceRules, normalizeCadenceRule),
    activityEvents: normalizeActivityEvents(workspace.activityEvents),
    settings: normalizeSettings(workspace.settings || {})
  };
}

function normalizeArray(value, normalizer) {
  if (!Array.isArray(value)) throw new Error("Import file is missing one or more record collections.");
  return value.map((item) => normalizer(item));
}

function normalizeActivityEvents(value) {
  if (!Array.isArray(value)) throw new Error("Import file is missing activity events.");
  return value.map((item) => ({
    id: requiredString(item.id, "Activity event id is required."),
    entityType: requiredString(item.entityType, "Activity event entity type is required."),
    entityId: String(item.entityId ?? "").trim(),
    actionType: requiredString(item.actionType, "Activity event action type is required."),
    title: requiredString(item.title, "Activity event title is required."),
    detail: String(item.detail ?? "").trim(),
    timestamp: requiredString(item.timestamp, "Activity event timestamp is required.")
  }));
}

function validateWorkspaceLinks(workspace) {
  const contactIds = new Set(workspace.contacts.map((item) => item.id));
  const applicationIds = new Set(workspace.applications.map((item) => item.id));
  const caseSessionIds = new Set(workspace.caseSessions.map((item) => item.id));
  const tipIds = new Set(workspace.tips.map((item) => item.id));

  for (const application of workspace.applications) {
    for (const contactId of application.linkedContactIds) {
      if (!contactIds.has(contactId)) throw new Error("Import contains an application linked to a missing contact.");
    }
  }

  for (const interaction of workspace.contactInteractions) {
    if (!contactIds.has(interaction.contactId)) throw new Error("Import contains an interaction linked to a missing contact.");
  }

  for (const caseSession of workspace.caseSessions) {
    if (caseSession.linkedContactId && !contactIds.has(caseSession.linkedContactId)) {
      throw new Error("Import contains a case session linked to a missing contact.");
    }
  }

  for (const tip of workspace.tips) {
    for (const applicationId of tip.linkedApplicationIds) {
      if (!applicationIds.has(applicationId)) throw new Error("Import contains a tip linked to a missing application.");
    }
    for (const contactId of tip.linkedContactIds) {
      if (!contactIds.has(contactId)) throw new Error("Import contains a tip linked to a missing contact.");
    }
    for (const caseSessionId of tip.linkedCaseSessionIds) {
      if (!caseSessionIds.has(caseSessionId)) throw new Error("Import contains a tip linked to a missing case session.");
    }
  }

  if (tipIds.size !== workspace.tips.length) throw new Error("Import contains duplicate tip ids.");
}

function clearWorkspaceTables() {
  [
    "application_contacts",
    "tip_applications",
    "tip_contacts",
    "tip_case_sessions",
    "contact_interactions",
    "activity_events",
    "cadence_rules",
    "tips",
    "case_sessions",
    "applications",
    "contacts",
    "settings"
  ].forEach((tableName) => db.prepare(`DELETE FROM ${tableName}`).run());
}

function insertImportedContacts(items) {
  const insert = db.prepare(`
    INSERT INTO contacts (
      id, name, relationship, company, role, email, phone, linkedin_url,
      how_we_met, last_contact_date, next_follow_up_date, notes, tags, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of items) {
    insert.run(
      item.id, item.name, item.relationship, item.company, item.role, item.email, item.phone, item.linkedInUrl,
      item.howWeMet, item.lastContactDate, item.nextFollowUpDate, item.notes, item.tags, item.createdAt, item.updatedAt
    );
  }
}

function insertImportedApplications(items) {
  const insert = db.prepare(`
    INSERT INTO applications (
      id, company, role, location, type, priority, status, salary, application_date,
      deadline, job_url, next_step, next_step_date, notes, tags, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertLink = db.prepare("INSERT INTO application_contacts (application_id, contact_id) VALUES (?, ?)");
  for (const item of items) {
    insert.run(
      item.id, item.company, item.role, item.location, item.type, item.priority, item.status, item.salary,
      item.applicationDate, item.deadline, item.jobUrl, item.nextStep, item.nextStepDate, item.notes, item.tags,
      item.createdAt, item.updatedAt
    );
    for (const contactId of item.linkedContactIds) insertLink.run(item.id, contactId);
  }
}

function insertImportedCaseSessions(items) {
  const insert = db.prepare(`
    INSERT INTO case_sessions (
      id, title, case_type, firm_style, method, date, duration_minutes, source, rating,
      what_went_well, what_to_improve, notes, linked_contact_id, partner_label, tags, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of items) {
    insert.run(
      item.id, item.title, item.caseType, item.firmStyle, item.method, item.date, item.durationMinutes, item.source,
      item.rating, item.whatWentWell, item.whatToImprove, item.notes, item.linkedContactId, item.partnerLabel,
      item.tags, item.createdAt, item.updatedAt
    );
  }
}

function insertImportedTips(items) {
  const insert = db.prepare("INSERT INTO tips (id, title, category, body, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const insertTipApplication = db.prepare("INSERT INTO tip_applications (tip_id, application_id) VALUES (?, ?)");
  const insertTipContact = db.prepare("INSERT INTO tip_contacts (tip_id, contact_id) VALUES (?, ?)");
  const insertTipCase = db.prepare("INSERT INTO tip_case_sessions (tip_id, case_session_id) VALUES (?, ?)");
  for (const item of items) {
    insert.run(item.id, item.title, item.category, item.body, item.tags, item.createdAt, item.updatedAt);
    for (const applicationId of item.linkedApplicationIds) insertTipApplication.run(item.id, applicationId);
    for (const contactId of item.linkedContactIds) insertTipContact.run(item.id, contactId);
    for (const caseSessionId of item.linkedCaseSessionIds) insertTipCase.run(item.id, caseSessionId);
  }
}

function insertImportedCadenceRules(items) {
  const insert = db.prepare(`
    INSERT INTO cadence_rules (
      id, title, cadence_type, interval_unit, interval_value, active,
      last_completed_date, next_due_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of items) {
    insert.run(
      item.id, item.title, item.cadenceType, item.intervalUnit, item.intervalValue, item.active,
      item.lastCompletedDate, item.nextDueDate, item.createdAt, item.updatedAt
    );
  }
}

function insertImportedSettings(item) {
  db.prepare("INSERT INTO settings (id, recent_activity_limit) VALUES (?, ?)").run("default", item.recentActivityLimit);
}

function insertImportedInteractions(items) {
  const insert = db.prepare(`
    INSERT INTO contact_interactions (
      id, contact_id, type, date, summary, follow_up_needed, follow_up_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of items) {
    insert.run(
      item.id, item.contactId, item.type, item.date, item.summary, item.followUpNeeded ? 1 : 0, item.followUpDate, item.createdAt, item.updatedAt
    );
  }
}

function insertImportedActivityEvents(items) {
  const insert = db.prepare(`
    INSERT INTO activity_events (id, entity_type, entity_id, action_type, title, detail, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of items) {
    insert.run(item.id, item.entityType, item.entityId, item.actionType, item.title, item.detail, item.timestamp);
  }
}

function ensureContactsExist(ids) {
  if (!ids.length) return;
  const rows = db.prepare(`SELECT id FROM contacts WHERE id IN (${ids.map(() => "?").join(",")})`).all(...ids);
  if (rows.length !== ids.length) throw new Error("One or more linked contacts do not exist.");
}

function ensureApplicationsExist(ids) {
  if (!ids.length) return;
  const rows = db.prepare(`SELECT id FROM applications WHERE id IN (${ids.map(() => "?").join(",")})`).all(...ids);
  if (rows.length !== ids.length) throw new Error("One or more linked applications do not exist.");
}

function ensureCaseSessionsExist(ids) {
  if (!ids.length) return;
  const rows = db.prepare(`SELECT id FROM case_sessions WHERE id IN (${ids.map(() => "?").join(",")})`).all(...ids);
  if (rows.length !== ids.length) throw new Error("One or more linked case sessions do not exist.");
}

function resetJoinTable(tableName, ownerColumn, targetColumn, ownerId, ids) {
  db.prepare(`DELETE FROM ${tableName} WHERE ${ownerColumn} = ?`).run(ownerId);
  const insert = db.prepare(`INSERT INTO ${tableName} (${ownerColumn}, ${targetColumn}) VALUES (?, ?)`);
  for (const id of ids) insert.run(ownerId, id);
}

function groupLinks(rows, ownerKey, targetKey) {
  if (!targetKey) {
    return rows.reduce((accumulator, row) => {
      if (!accumulator[row[ownerKey]]) accumulator[row[ownerKey]] = [];
      accumulator[row[ownerKey]].push(row);
      return accumulator;
    }, {});
  }
  return rows.reduce((accumulator, row) => {
    if (!accumulator[row[ownerKey]]) accumulator[row[ownerKey]] = [];
    accumulator[row[ownerKey]].push(row[targetKey]);
    return accumulator;
  }, {});
}

function getContactInteractionRows(contactId = "") {
  if (contactId) {
    return db.prepare("SELECT * FROM contact_interactions WHERE contact_id = ? ORDER BY date DESC, created_at DESC").all(contactId);
  }
  return db.prepare("SELECT * FROM contact_interactions ORDER BY date DESC, created_at DESC").all();
}

function mapInteractionRow(row) {
  return {
    id: row.id,
    contactId: row.contact_id,
    type: row.type,
    date: row.date,
    summary: row.summary,
    followUpNeeded: Boolean(row.follow_up_needed),
    followUpDate: row.follow_up_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function syncContactFollowUps(contactId) {
  const interactions = db.prepare("SELECT date, follow_up_needed, follow_up_date FROM contact_interactions WHERE contact_id = ? ORDER BY date DESC, created_at DESC").all(contactId);
  const lastContactDate = interactions[0]?.date || "";
  const followUpSource = interactions.find((interaction) => interaction.follow_up_needed && interaction.follow_up_date);
  db.prepare("UPDATE contacts SET last_contact_date = ?, next_follow_up_date = ?, updated_at = ? WHERE id = ?")
    .run(lastContactDate, followUpSource?.follow_up_date || "", new Date().toISOString(), contactId);
}

function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function randomId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function requiredString(value, message) {
  const normalized = String(value ?? "").trim();
  if (!normalized) throw new Error(message);
  return normalized;
}

function stripUndefinedFields(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
}

module.exports = router;
