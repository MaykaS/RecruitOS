import {
  ActionItem,
  CrudModuleSlug,
  INTERVIEW_PREP_CHECKLIST,
  MODULE_CONFIGS,
  RecruitOSData,
  calculateReadinessScore,
  createId,
  dateOffset,
  emptySettings,
  getCollectionKey,
  lookupCompanyName,
  nowIso,
  toDateInput,
} from "@/lib/recruitos";

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return uniqueStrings(value.map((item) => String(item).trim()));
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

export function syncDerivedState(input: RecruitOSData): RecruitOSData {
  const cases = input.cases.map((item) => ({
    ...MODULE_CONFIGS.cases.defaultValues,
    ...item,
    status:
      item.status ||
      (item.redo_needed
        ? "Redo Needed"
        : item.last_practiced_date || item.date
          ? "Practiced"
          : "Not Started"),
    last_practiced_date: item.last_practiced_date || item.date,
    times_practiced:
      typeof item.times_practiced === "number" ? item.times_practiced : item.date ? 1 : 0,
    average_score:
      typeof item.average_score === "number" ? item.average_score : item.score ?? 0,
  }));

  const companies = input.companies.map((company) => ({
    ...company,
    role_fit: normalizeStringArray(company.role_fit),
    linked_contact_ids: uniqueStrings([
      ...company.linked_contact_ids,
      ...input.contacts
        .filter((contact) => contact.company_id === company.id)
        .map((contact) => contact.id),
    ]),
    linked_application_ids: uniqueStrings([
      ...company.linked_application_ids,
      ...input.applications
        .filter((application) => application.company_id === company.id)
        .map((application) => application.id),
    ]),
  }));

  const contacts = input.contacts.map((contact) => ({
    ...contact,
    company_name:
      lookupCompanyName({ ...input, companies }, contact.company_id) || contact.company_name,
    linked_application_ids: uniqueStrings([
      ...contact.linked_application_ids,
      ...input.applications
        .filter(
          (application) =>
            application.referral_person_contact_id === contact.id ||
            application.linked_contact_ids.includes(contact.id),
        )
        .map((application) => application.id),
    ]),
  }));

  const applications = input.applications.map((application) => ({
    ...application,
    company_name:
      lookupCompanyName({ ...input, companies }, application.company_id) || application.company_name,
    linked_action_item_ids: uniqueStrings([
      ...application.linked_action_item_ids,
      ...input.actionItems
        .filter((actionItem) => actionItem.linked_application_id === application.id)
        .map((actionItem) => actionItem.id),
    ]),
  }));

  const resumes = input.resumes.map((resume) => ({
    ...resume,
    linked_application_ids: uniqueStrings([
      ...resume.linked_application_ids,
      ...applications
        .filter((application) => application.resume_version_id === resume.id)
        .map((application) => application.id),
    ]),
  }));

  const mockInterviews = input.mockInterviews.map((mock) => ({
    ...mock,
    linked_action_item_ids: uniqueStrings([
      ...mock.linked_action_item_ids,
      ...input.actionItems
        .filter((actionItem) => actionItem.linked_mock_interview_id === mock.id)
        .map((actionItem) => actionItem.id),
    ]),
  }));

  const interviewPrep = input.interviewPrep.map((prep) => ({
    ...prep,
    linked_action_item_ids: uniqueStrings([
      ...prep.linked_action_item_ids,
      ...input.actionItems
        .filter((actionItem) => actionItem.linked_interview_prep_id === prep.id)
        .map((actionItem) => actionItem.id),
    ]),
    readiness_score: calculateReadinessScore(input.actionItems, prep.id),
  }));

  const parStories = input.parStories.map((par) => ({
    ...par,
    linked_question_ids: uniqueStrings([
      ...par.linked_question_ids,
      ...input.interviewQuestions
        .filter((question) => question.linked_par_story_ids.includes(par.id))
        .map((question) => question.id),
    ]),
  }));

  const interviewQuestions = input.interviewQuestions.map((question) => ({
    ...question,
    linked_par_story_ids: uniqueStrings([
      ...question.linked_par_story_ids,
      ...parStories
        .filter((par) => par.linked_question_ids.includes(question.id))
        .map((par) => par.id),
    ]),
  }));

  const actionItems = input.actionItems.map((actionItem) => ({
    ...actionItem,
    completed_at: actionItem.status === "Done" ? actionItem.completed_at || nowIso() : "",
  }));

  return {
    ...input,
    parPracticeLogs: input.parPracticeLogs ?? [],
    casePracticeLogs: input.casePracticeLogs ?? [],
    caseLearnings: input.caseLearnings ?? [],
    brainDumps: input.brainDumps ?? [],
    cases,
    companies,
    contacts,
    applications,
    resumes,
    mockInterviews,
    interviewPrep,
    parStories,
    interviewQuestions,
    actionItems,
    settings: input.settings ?? emptySettings(),
  };
}

export function createChecklistActionItems(
  prepId: string,
  interviewDate: string,
  companyId: string,
  applicationId: string,
) {
  return INTERVIEW_PREP_CHECKLIST.map((title, index) => ({
    id: createId("action"),
    created_at: nowIso(),
    updated_at: nowIso(),
    title,
    description: "",
    status: "Open",
    priority: index < 4 ? "High" : "Medium",
    due_date: interviewDate ? toDateInput(interviewDate) : dateOffset(2),
    completed_at: "",
    source_type: "Interview Prep",
    source_id: prepId,
    linked_contact_id: "",
    linked_company_id: companyId,
    linked_application_id: applicationId,
    linked_par_id: "",
    linked_case_id: "",
    linked_mock_interview_id: "",
    linked_resume_id: "",
    linked_interview_prep_id: prepId,
    linked_interview_answer_id: "",
  }));
}

function clearDeletedIdFromArray(values: string[], targetId: string) {
  return values.filter((value) => value !== targetId);
}

function clearActionSourceForDeletedRecord(
  actionItem: RecruitOSData["actionItems"][number],
  sourceType: string,
  recordId: string,
) {
  if (actionItem.source_type === sourceType && actionItem.source_id === recordId) {
    return {
      ...actionItem,
      source_type: "General",
      source_id: "",
      updated_at: nowIso(),
    };
  }

  return actionItem;
}

export function deleteRecordFromData(
  current: RecruitOSData,
  module: CrudModuleSlug,
  id: string,
): RecruitOSData {
  const collectionKey = getCollectionKey(module);
  const nextCollection = (
    current[collectionKey] as unknown as Array<Record<string, unknown>>
  ).filter((item) => item.id !== id);
  let nextState = {
    ...current,
    [collectionKey]: nextCollection,
  } as RecruitOSData;

  if (module === "applications") {
    nextState = {
      ...nextState,
      companies: nextState.companies.map((company) => ({
        ...company,
        linked_application_ids: clearDeletedIdFromArray(company.linked_application_ids, id),
      })),
      contacts: nextState.contacts.map((contact) => ({
        ...contact,
        linked_application_ids: clearDeletedIdFromArray(contact.linked_application_ids, id),
      })),
      resumes: nextState.resumes.map((resume) => ({
        ...resume,
        linked_application_ids: clearDeletedIdFromArray(resume.linked_application_ids, id),
      })),
      interviewAnswers: nextState.interviewAnswers.map((answer) => ({
        ...answer,
        linked_application_ids: clearDeletedIdFromArray(answer.linked_application_ids, id),
      })),
      interviewPrep: nextState.interviewPrep.map((prep) => ({
        ...prep,
        application_id: prep.application_id === id ? "" : prep.application_id,
      })),
      actionItems: nextState.actionItems.map((item) =>
        clearActionSourceForDeletedRecord(
          {
            ...item,
            linked_application_id: item.linked_application_id === id ? "" : item.linked_application_id,
          },
          "Application",
          id,
        ),
      ),
      brainDumps: nextState.brainDumps.map((brainDump) => ({
        ...brainDump,
        linked_application_id:
          brainDump.linked_application_id === id ? "" : brainDump.linked_application_id,
      })),
    };
  }

  if (module === "companies") {
    nextState = {
      ...nextState,
      contacts: nextState.contacts.map((contact) => ({
        ...contact,
        company_id: contact.company_id === id ? "" : contact.company_id,
      })),
      applications: nextState.applications.map((application) => ({
        ...application,
        company_id: application.company_id === id ? "" : application.company_id,
      })),
      interviewPrep: nextState.interviewPrep.map((prep) => ({
        ...prep,
        company_id: prep.company_id === id ? "" : prep.company_id,
      })),
      mockInterviews: nextState.mockInterviews.map((mock) => ({
        ...mock,
        target_company_id: mock.target_company_id === id ? "" : mock.target_company_id,
      })),
      actionItems: nextState.actionItems.map((item) =>
        clearActionSourceForDeletedRecord(
          {
            ...item,
            linked_company_id: item.linked_company_id === id ? "" : item.linked_company_id,
          },
          "Company",
          id,
        ),
      ),
      brainDumps: nextState.brainDumps.map((brainDump) => ({
        ...brainDump,
        linked_company_id: brainDump.linked_company_id === id ? "" : brainDump.linked_company_id,
      })),
    };
  }

  if (module === "networking") {
    nextState = {
      ...nextState,
      companies: nextState.companies.map((company) => ({
        ...company,
        linked_contact_ids: clearDeletedIdFromArray(company.linked_contact_ids, id),
      })),
      applications: nextState.applications.map((application) => ({
        ...application,
        referral_person_contact_id:
          application.referral_person_contact_id === id ? "" : application.referral_person_contact_id,
        linked_contact_ids: clearDeletedIdFromArray(application.linked_contact_ids, id),
      })),
      interviewPrep: nextState.interviewPrep.map((prep) => ({
        ...prep,
        linked_contact_ids: clearDeletedIdFromArray(prep.linked_contact_ids, id),
      })),
      actionItems: nextState.actionItems.map((item) =>
        clearActionSourceForDeletedRecord(
          {
            ...item,
            linked_contact_id: item.linked_contact_id === id ? "" : item.linked_contact_id,
          },
          "Networking",
          id,
        ),
      ),
      brainDumps: nextState.brainDumps.map((brainDump) => ({
        ...brainDump,
        linked_contact_id: brainDump.linked_contact_id === id ? "" : brainDump.linked_contact_id,
      })),
    };
  }

  if (module === "pars") {
    nextState = {
      ...nextState,
      interviewQuestions: nextState.interviewQuestions.map((question) => ({
        ...question,
        linked_par_story_ids: clearDeletedIdFromArray(question.linked_par_story_ids, id),
      })),
      interviewAnswers: nextState.interviewAnswers.map((answer) => ({
        ...answer,
        linked_par_story_ids: clearDeletedIdFromArray(answer.linked_par_story_ids, id),
      })),
      interviewPrep: nextState.interviewPrep.map((prep) => ({
        ...prep,
        linked_par_story_ids: clearDeletedIdFromArray(prep.linked_par_story_ids, id),
      })),
      mockInterviews: nextState.mockInterviews.map((mock) => ({
        ...mock,
        linked_par_story_ids: clearDeletedIdFromArray(mock.linked_par_story_ids, id),
      })),
      parPracticeLogs: nextState.parPracticeLogs.filter((log) => log.par_story_id !== id),
      actionItems: nextState.actionItems.map((item) =>
        clearActionSourceForDeletedRecord(
          {
            ...item,
            linked_par_id: item.linked_par_id === id ? "" : item.linked_par_id,
          },
          "PAR",
          id,
        ),
      ),
      brainDumps: nextState.brainDumps.map((brainDump) => ({
        ...brainDump,
        linked_par_id: brainDump.linked_par_id === id ? "" : brainDump.linked_par_id,
      })),
    };
  }

  if (module === "cases") {
    nextState = {
      ...nextState,
      interviewPrep: nextState.interviewPrep.map((prep) => ({
        ...prep,
        linked_case_ids: clearDeletedIdFromArray(prep.linked_case_ids, id),
      })),
      mockInterviews: nextState.mockInterviews.map((mock) => ({
        ...mock,
        linked_case_ids: clearDeletedIdFromArray(mock.linked_case_ids, id),
      })),
      casePracticeLogs: nextState.casePracticeLogs.filter((log) => log.case_id !== id),
      caseLearnings: nextState.caseLearnings.filter((learning) => learning.linked_case_id !== id),
      actionItems: nextState.actionItems.map((item) =>
        clearActionSourceForDeletedRecord(
          {
            ...item,
            linked_case_id: item.linked_case_id === id ? "" : item.linked_case_id,
          },
          "Case",
          id,
        ),
      ),
      brainDumps: nextState.brainDumps.map((brainDump) => ({
        ...brainDump,
        linked_case_id: brainDump.linked_case_id === id ? "" : brainDump.linked_case_id,
      })),
    };
  }

  if (module === "mock-interviews") {
    nextState = {
      ...nextState,
      actionItems: nextState.actionItems.map((item) =>
        clearActionSourceForDeletedRecord(
          {
            ...item,
            linked_mock_interview_id:
              item.linked_mock_interview_id === id ? "" : item.linked_mock_interview_id,
          },
          "Mock Interview",
          id,
        ),
      ),
      brainDumps: nextState.brainDumps.map((brainDump) => ({
        ...brainDump,
        linked_mock_interview_id:
          brainDump.linked_mock_interview_id === id ? "" : brainDump.linked_mock_interview_id,
      })),
    };
  }

  if (module === "resumes") {
    nextState = {
      ...nextState,
      applications: nextState.applications.map((application) => ({
        ...application,
        resume_version_id:
          application.resume_version_id === id ? "" : application.resume_version_id,
      })),
      actionItems: nextState.actionItems.map((item) => ({
        ...item,
        linked_resume_id: item.linked_resume_id === id ? "" : item.linked_resume_id,
      })),
      brainDumps: nextState.brainDumps.map((brainDump) => ({
        ...brainDump,
        linked_resume_id: brainDump.linked_resume_id === id ? "" : brainDump.linked_resume_id,
      })),
    };
  }

  if (module === "interview-prep") {
    nextState = {
      ...nextState,
      interviewAnswers: nextState.interviewAnswers.map((answer) => ({
        ...answer,
        linked_interview_prep_ids: clearDeletedIdFromArray(answer.linked_interview_prep_ids, id),
      })),
      actionItems: nextState.actionItems.map((item) =>
        clearActionSourceForDeletedRecord(
          {
            ...item,
            linked_interview_prep_id:
              item.linked_interview_prep_id === id ? "" : item.linked_interview_prep_id,
          },
          "Interview Prep",
          id,
        ),
      ),
      brainDumps: nextState.brainDumps.map((brainDump) => ({
        ...brainDump,
        linked_interview_prep_id:
          brainDump.linked_interview_prep_id === id ? "" : brainDump.linked_interview_prep_id,
      })),
    };
  }

  if (module === "interview-answers") {
    nextState = {
      ...nextState,
      interviewPrep: nextState.interviewPrep.map((prep) => ({
        ...prep,
        linked_interview_answer_ids: clearDeletedIdFromArray(
          prep.linked_interview_answer_ids,
          id,
        ),
      })),
      actionItems: nextState.actionItems.map((item) =>
        clearActionSourceForDeletedRecord(
          {
            ...item,
            linked_interview_answer_id:
              item.linked_interview_answer_id === id ? "" : item.linked_interview_answer_id,
          },
          "Interview Answer",
          id,
        ),
      ),
    };
  }

  return nextState;
}

export function toggleActionItemInData(current: RecruitOSData, id: string): RecruitOSData {
  return {
    ...current,
    actionItems: current.actionItems.map((item) =>
      item.id === id
        ? {
            ...item,
            status: item.status === "Done" ? "Open" : "Done",
            completed_at: item.status === "Done" ? "" : nowIso(),
            updated_at: nowIso(),
          }
        : item,
    ),
  };
}

export function createActionItemFromSourceInData(
  current: RecruitOSData,
  partial: Partial<ActionItem> & { title: string; source_type: string; source_id: string },
): RecruitOSData {
  return {
    ...current,
    actionItems: [
      ...current.actionItems,
      {
        id: createId("action"),
        created_at: nowIso(),
        updated_at: nowIso(),
        title: partial.title,
        description: partial.description ?? "",
        status: partial.status ?? "Open",
        priority: partial.priority ?? "Medium",
        due_date: partial.due_date ?? toDateInput(nowIso()),
        completed_at: "",
        source_type: partial.source_type,
        source_id: partial.source_id,
        linked_contact_id: partial.linked_contact_id ?? "",
        linked_company_id: partial.linked_company_id ?? "",
        linked_application_id: partial.linked_application_id ?? "",
        linked_par_id: partial.linked_par_id ?? "",
        linked_case_id: partial.linked_case_id ?? "",
        linked_mock_interview_id: partial.linked_mock_interview_id ?? "",
        linked_resume_id: partial.linked_resume_id ?? "",
        linked_interview_prep_id: partial.linked_interview_prep_id ?? "",
        linked_interview_answer_id: partial.linked_interview_answer_id ?? "",
      },
    ],
  };
}

export function convertBrainDumpToActionItemInData(
  current: RecruitOSData,
  brainDumpId: string,
): RecruitOSData {
  const brainDump = current.brainDumps.find((item) => item.id === brainDumpId);
  if (!brainDump || brainDump.converted_action_item_id) return current;
  const actionId = createId("action");

  return {
    ...current,
    brainDumps: current.brainDumps.map((item) =>
      item.id === brainDumpId
        ? { ...item, converted_action_item_id: actionId, updated_at: nowIso() }
        : item,
    ),
    actionItems: [
      ...current.actionItems,
      {
        id: actionId,
        created_at: nowIso(),
        updated_at: nowIso(),
        title: brainDump.title,
        description: brainDump.note,
        status: "Open",
        priority: "Medium",
        due_date: toDateInput(nowIso()),
        completed_at: "",
        source_type: "Brain Dump",
        source_id: brainDump.id,
        linked_contact_id: brainDump.linked_contact_id,
        linked_company_id: brainDump.linked_company_id,
        linked_application_id: brainDump.linked_application_id,
        linked_par_id: brainDump.linked_par_id,
        linked_case_id: brainDump.linked_case_id,
        linked_mock_interview_id: brainDump.linked_mock_interview_id,
        linked_resume_id: brainDump.linked_resume_id,
        linked_interview_prep_id: brainDump.linked_interview_prep_id,
        linked_interview_answer_id: "",
      },
    ],
  };
}
