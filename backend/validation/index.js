const STATUS_ORDER = ["Researching", "Applied", "Phone Screen", "Interview", "Final Round", "Offer", "Rejected"];
const PRIORITIES = ["High", "Medium", "Low"];
const APPLICATION_TYPES = ["Internship", "MBA Internship", "Full-time", "Part-time", "Fellowship", "Other"];
const RELATIONSHIPS = ["Alumni", "Recruiter", "Mentor", "New", "Professional", "Peer", "Friend"];
const CASE_TYPES = ["Market Sizing", "Profitability", "Growth Strategy", "Operations", "Product Strategy", "Pricing"];
const FIRM_STYLES = ["Consulting", "Tech PM", "General Business", "Behavioral Prep", "Mixed"];
const CASE_METHODS = ["Solo", "Partner", "Mock Interview", "Platform"];
const INTERACTION_TYPES = ["Coffee Chat", "LinkedIn Message", "Email", "Call", "Meeting", "Referral Ask"];

function normalizeApplication(payload) {
  const item = {
    id: requiredString(payload.id, "Application id is required."),
    company: requiredString(payload.company, "Company is required."),
    role: requiredString(payload.role, "Role is required."),
    location: safeString(payload.location),
    type: enumValue(payload.type, APPLICATION_TYPES, "Invalid application type."),
    priority: enumValue(payload.priority, PRIORITIES, "Invalid priority."),
    status: enumValue(payload.status, STATUS_ORDER, "Invalid status."),
    salary: safeString(payload.salary),
    applicationDate: safeDate(payload.applicationDate),
    deadline: safeDate(payload.deadline),
    jobUrl: safeString(payload.jobUrl),
    nextStep: safeString(payload.nextStep),
    nextStepDate: safeDate(payload.nextStepDate),
    linkedContactIds: uniqueIds(payload.linkedContactIds),
    notes: safeString(payload.notes),
    tags: safeString(payload.tags),
    createdAt: requiredString(payload.createdAt, "createdAt is required."),
    updatedAt: requiredString(payload.updatedAt, "updatedAt is required.")
  };
  if (item.status === "Rejected") {
    item.nextStep = "";
    item.nextStepDate = "";
  }
  if (item.nextStepDate && !item.nextStep) throw new Error("Next step is required when next step date is set.");
  return item;
}

function normalizeContact(payload) {
  return {
    id: requiredString(payload.id, "Contact id is required."),
    name: requiredString(payload.name, "Name is required."),
    relationship: enumValue(payload.relationship, RELATIONSHIPS, "Invalid relationship."),
    company: safeString(payload.company),
    role: safeString(payload.role),
    email: safeString(payload.email),
    phone: safeString(payload.phone),
    linkedInUrl: safeString(payload.linkedInUrl),
    howWeMet: safeString(payload.howWeMet),
    lastContactDate: safeDate(payload.lastContactDate),
    nextFollowUpDate: safeDate(payload.nextFollowUpDate),
    notes: safeString(payload.notes),
    tags: safeString(payload.tags),
    createdAt: requiredString(payload.createdAt, "createdAt is required."),
    updatedAt: requiredString(payload.updatedAt, "updatedAt is required.")
  };
}

function normalizeCaseSession(payload) {
  const linkedContactId = safeString(payload.linkedContactId);
  return {
    id: requiredString(payload.id, "Case session id is required."),
    title: requiredString(payload.title, "Title is required."),
    caseType: enumValue(payload.caseType, CASE_TYPES, "Invalid case type."),
    firmStyle: enumValue(payload.firmStyle, FIRM_STYLES, "Invalid firm style."),
    method: enumValue(payload.method, CASE_METHODS, "Invalid method."),
    date: safeDate(payload.date),
    durationMinutes: safeString(payload.durationMinutes),
    source: safeString(payload.source),
    rating: safeString(payload.rating ?? "0"),
    whatWentWell: safeString(payload.whatWentWell),
    whatToImprove: safeString(payload.whatToImprove),
    notes: safeString(payload.notes),
    linkedContactId,
    partnerLabel: linkedContactId ? "" : safeString(payload.partnerLabel),
    tags: safeString(payload.tags),
    createdAt: requiredString(payload.createdAt, "createdAt is required."),
    updatedAt: requiredString(payload.updatedAt, "updatedAt is required.")
  };
}

function normalizeTip(payload) {
  return {
    id: requiredString(payload.id, "Tip id is required."),
    title: requiredString(payload.title, "Title is required."),
    category: requiredString(payload.category, "Category is required."),
    body: safeString(payload.body),
    tags: safeString(payload.tags),
    linkedApplicationIds: uniqueIds(payload.linkedApplicationIds),
    linkedContactIds: uniqueIds(payload.linkedContactIds),
    linkedCaseSessionIds: uniqueIds(payload.linkedCaseSessionIds),
    createdAt: requiredString(payload.createdAt, "createdAt is required."),
    updatedAt: requiredString(payload.updatedAt, "updatedAt is required.")
  };
}

function normalizeCadenceRule(payload) {
  const intervalValue = Number(payload.intervalValue);
  if (!Number.isInteger(intervalValue) || intervalValue < 1) throw new Error("Interval value must be a positive integer.");
  return {
    id: requiredString(payload.id, "Cadence id is required."),
    title: requiredString(payload.title, "Title is required."),
    cadenceType: requiredString(payload.cadenceType, "Cadence type is required."),
    intervalUnit: enumValue(payload.intervalUnit, ["days", "weeks"], "Invalid interval unit."),
    intervalValue,
    active: payload.active === true || payload.active === "true" || payload.active === 1 ? 1 : 0,
    lastCompletedDate: safeDate(payload.lastCompletedDate),
    nextDueDate: safeDate(payload.nextDueDate),
    createdAt: requiredString(payload.createdAt, "createdAt is required."),
    updatedAt: requiredString(payload.updatedAt, "updatedAt is required.")
  };
}

function normalizeInteraction(payload, contactIdFromRoute = "") {
  const followUpNeeded = payload.followUpNeeded === true || payload.followUpNeeded === "true" || payload.followUpNeeded === 1;
  const interaction = {
    id: requiredString(payload.id, "Interaction id is required."),
    contactId: requiredString(contactIdFromRoute || payload.contactId, "Contact id is required."),
    type: enumValue(payload.type, INTERACTION_TYPES, "Invalid interaction type."),
    date: safeDate(payload.date),
    summary: safeString(payload.summary),
    followUpNeeded,
    followUpDate: safeDate(payload.followUpDate),
    createdAt: requiredString(payload.createdAt, "createdAt is required."),
    updatedAt: requiredString(payload.updatedAt, "updatedAt is required.")
  };
  if (interaction.followUpNeeded && !interaction.followUpDate) {
    throw new Error("Follow-up date is required when follow-up is needed.");
  }
  if (!interaction.followUpNeeded) {
    interaction.followUpDate = "";
  }
  return interaction;
}

function normalizeSettings(payload) {
  const limit = Number(payload.recentActivityLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 30) throw new Error("Recent activity limit must be between 1 and 30.");
  return { recentActivityLimit: limit };
}

function requiredString(value, message) {
  const normalized = String(value ?? "").trim();
  if (!normalized) throw new Error(message);
  return normalized;
}

function safeString(value) {
  return String(value ?? "").trim();
}

function safeDate(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) throw new Error("Invalid date format. Expected YYYY-MM-DD.");
  return normalized;
}

function enumValue(value, options, message) {
  const normalized = String(value ?? "").trim();
  if (!options.includes(normalized)) throw new Error(message);
  return normalized;
}

function uniqueIds(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((value) => safeString(value)).filter(Boolean))];
}

module.exports = {
  normalizeApplication,
  normalizeContact,
  normalizeCaseSession,
  normalizeTip,
  normalizeCadenceRule,
  normalizeSettings,
  normalizeInteraction
};
