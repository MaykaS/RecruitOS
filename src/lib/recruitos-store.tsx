"use client";

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
  seedData,
  toDateInput,
} from "@/lib/recruitos";
import {
  PersistenceMode,
  getPersistenceCollectionsForModule,
  loadRecruitOSData,
  persistRecruitOSCollections,
} from "@/lib/recruitos-repository";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SaveRecordInput = Record<string, unknown> & { id?: string };

interface RecruitOSContextValue {
  data: RecruitOSData;
  loaded: boolean;
  persistenceMode: PersistenceMode;
  syncMessage: string;
  isSyncing: boolean;
  saveRecord: (module: CrudModuleSlug, record: SaveRecordInput) => void;
  saveInterviewQuestion: (record: SaveRecordInput) => void;
  deleteInterviewQuestion: (id: string) => void;
  deleteRecord: (module: CrudModuleSlug, id: string) => void;
  toggleActionItem: (id: string) => void;
  logParPractice: (parId: string, prompt?: string) => void;
  markCasePracticed: (caseId: string) => void;
  markInterviewAnswerPracticed: (answerId: string) => void;
  markFollowUpDone: (contactId: string) => void;
  markApplicationActionDone: (applicationId: string) => void;
  convertBrainDumpToActionItem: (brainDumpId: string) => void;
  createActionItemFromSource: (
    partial: Partial<ActionItem> & { title: string; source_type: string; source_id: string },
  ) => void;
  saveSettings: (updates: Partial<RecruitOSData["settings"]>) => void;
  rescheduleActionItem: (id: string, dueDate: string) => void;
}

const RecruitOSContext = createContext<RecruitOSContextValue | null>(null);

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function syncDerivedState(input: RecruitOSData): RecruitOSData {
  const companies = input.companies.map((company) => ({
    ...company,
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
    company_name: lookupCompanyName({ ...input, companies }, contact.company_id),
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
    company_name: lookupCompanyName({ ...input, companies }, application.company_id),
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

function withTimestamps(record: SaveRecordInput, existingId?: string) {
  const timestamp = nowIso();
  return {
    ...record,
    id: existingId ?? record.id ?? createId("item"),
    created_at: typeof record.created_at === "string" ? record.created_at : timestamp,
    updated_at: timestamp,
  };
}

function createChecklistActionItems(
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

export function RecruitOSProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<RecruitOSData>(syncDerivedState(seedData()));
  const [loaded, setLoaded] = useState(false);
  const [persistenceMode, setPersistenceMode] = useState<PersistenceMode>("local");
  const [syncMessage, setSyncMessage] = useState(
    "Loading RecruitOS data...",
  );
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const result = await loadRecruitOSData();
      if (cancelled) return;
      setData(syncDerivedState(result.data));
      setPersistenceMode(result.mode);
      setSyncMessage(result.message);
      setLoaded(true);
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    async (
      previous: RecruitOSData,
      next: RecruitOSData,
      collections: Parameters<typeof persistRecruitOSCollections>[2],
    ) => {
      setIsSyncing(true);
      const result = await persistRecruitOSCollections(previous, next, collections);
      setPersistenceMode(result.mode);
      setSyncMessage(result.message);
      setIsSyncing(false);
    },
    [],
  );

  const applyMutation = useCallback(
    (
      collections: Parameters<typeof persistRecruitOSCollections>[2],
      updater: (current: RecruitOSData) => RecruitOSData,
    ) => {
      setData((current) => {
        const next = syncDerivedState(updater(current));
        void persist(current, next, collections);
        return next;
      });
    },
    [persist],
  );

  const saveRecord = useCallback(
    (module: CrudModuleSlug, record: SaveRecordInput) => {
      applyMutation(getPersistenceCollectionsForModule(module), (current) => {
        const collectionKey = getCollectionKey(module);
        const collection = current[collectionKey] as unknown as Array<Record<string, unknown>>;
        const existing = collection.find((item) => item.id === record.id);
        let preparedRecord = { ...record };
        let nextCompanies = current.companies;

        if (module === "networking") {
          const rawCompanyName = String(preparedRecord.company_name ?? "").trim();
          let companyId = String(preparedRecord.company_id ?? "").trim();
          const normalizedTags = Array.isArray(preparedRecord.tags)
            ? uniqueStrings(preparedRecord.tags.map((tag) => String(tag).trim()))
            : [];

          if (rawCompanyName) {
            const existingCompany = current.companies.find(
              (company) => company.name.trim().toLowerCase() === rawCompanyName.toLowerCase(),
            );

            if (existingCompany) {
              companyId = existingCompany.id;
            } else {
              const newCompany = withTimestamps(
                {
                  ...MODULE_CONFIGS.companies.defaultValues,
                  name: rawCompanyName,
                },
              ) as RecruitOSData["companies"][number];
              nextCompanies = [...current.companies, newCompany];
              companyId = newCompany.id;
            }
          }

          preparedRecord = {
            ...preparedRecord,
            company_id: companyId,
            company_name:
              rawCompanyName || lookupCompanyName({ ...current, companies: nextCompanies }, companyId),
            tags: normalizedTags,
          };
        }

        const nextRecord = withTimestamps(preparedRecord, existing?.id as string | undefined);
        let nextState: RecruitOSData = {
          ...current,
          companies: nextCompanies,
          [collectionKey]: existing
            ? collection.map((item) =>
                item.id === existing.id ? { ...item, ...nextRecord } : item,
              )
            : [...collection, nextRecord],
        } as RecruitOSData;

        if (module === "interview-prep" && !existing) {
          const prepRecord = nextRecord as {
            id: string;
            interview_date?: unknown;
            company_id?: unknown;
            application_id?: unknown;
          };
          const checklist = createChecklistActionItems(
            prepRecord.id,
            String(prepRecord.interview_date ?? ""),
            String(prepRecord.company_id ?? ""),
            String(prepRecord.application_id ?? ""),
          );
          nextState = {
            ...nextState,
            actionItems: [...nextState.actionItems, ...checklist],
          };
        }

        return nextState;
      });
    },
    [applyMutation],
  );

  const saveInterviewQuestion = useCallback(
    (record: SaveRecordInput) => {
      applyMutation(["interviewQuestions"], (current) => {
        const existing = current.interviewQuestions.find((item) => item.id === record.id);
        const nextRecord = withTimestamps(record, existing?.id) as RecruitOSData["interviewQuestions"][number];
        return {
          ...current,
          interviewQuestions: existing
            ? current.interviewQuestions.map((item) =>
                item.id === existing.id ? { ...item, ...nextRecord } : item,
              )
            : [...current.interviewQuestions, nextRecord],
        };
      });
    },
    [applyMutation],
  );

  const deleteInterviewQuestion = useCallback(
    (id: string) => {
      applyMutation(["interviewQuestions"], (current) => ({
        ...current,
        interviewQuestions: current.interviewQuestions.filter((item) => item.id !== id),
      }));
    },
    [applyMutation],
  );

  const deleteRecord = useCallback(
    (module: CrudModuleSlug, id: string) => {
      applyMutation(getPersistenceCollectionsForModule(module), (current) => {
        const collectionKey = getCollectionKey(module);
        const nextCollection = (
          current[collectionKey] as unknown as Array<Record<string, unknown>>
        ).filter((item) => item.id !== id);
        return {
          ...current,
          [collectionKey]: nextCollection,
        } as RecruitOSData;
      });
    },
    [applyMutation],
  );

  const toggleActionItem = useCallback(
    (id: string) => {
      applyMutation(["actionItems"], (current) => ({
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
      }));
    },
    [applyMutation],
  );

  const logParPractice = useCallback(
    (parId: string, prompt = "Daily practice prompt") => {
      applyMutation(["parStories", "parPracticeLogs"], (current) => ({
        ...current,
        parPracticeLogs: [
          ...current.parPracticeLogs,
          {
            id: createId("practice"),
            created_at: nowIso(),
            updated_at: nowIso(),
            par_story_id: parId,
            date: toDateInput(nowIso()),
            prompt_used: prompt,
            version_practiced: "Full",
            delivery_score: 4,
            structure_score: 4,
            confidence_score: 4,
            notes: "",
            next_fix: "",
          },
        ],
        parStories: current.parStories.map((par) =>
          par.id === parId
            ? {
                ...par,
                last_practiced_date: toDateInput(nowIso()),
                number_of_reps: par.number_of_reps + 1,
                confidence_score: Math.min(5, par.confidence_score + 1),
                updated_at: nowIso(),
              }
            : par,
        ),
      }));
    },
    [applyMutation],
  );

  const markCasePracticed = useCallback(
    (caseId: string) => {
      applyMutation(["cases"], (current) => ({
        ...current,
        cases: current.cases.map((item) =>
          item.id === caseId
            ? {
                ...item,
                date: toDateInput(nowIso()),
                score: Math.min(5, item.score + 1),
                redo_needed: false,
                updated_at: nowIso(),
              }
            : item,
        ),
      }));
    },
    [applyMutation],
  );

  const markInterviewAnswerPracticed = useCallback(
    (answerId: string) => {
      applyMutation(["interviewAnswers"], (current) => ({
        ...current,
        interviewAnswers: current.interviewAnswers.map((item) =>
          item.id === answerId
            ? {
                ...item,
                last_practiced_date: toDateInput(nowIso()),
                confidence_score: Math.min(5, item.confidence_score + 1),
                updated_at: nowIso(),
              }
            : item,
        ),
      }));
    },
    [applyMutation],
  );

  const markFollowUpDone = useCallback(
    (contactId: string) => {
      applyMutation(["contacts"], (current) => ({
        ...current,
        contacts: current.contacts.map((contact) =>
          contact.id === contactId
            ? {
                ...contact,
                last_contact_date: toDateInput(nowIso()),
                next_follow_up_date: dateOffset(7),
                updated_at: nowIso(),
              }
            : contact,
        ),
      }));
    },
    [applyMutation],
  );

  const markApplicationActionDone = useCallback(
    (applicationId: string) => {
      applyMutation(["applications"], (current) => ({
        ...current,
        applications: current.applications.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                follow_up_date: "",
                updated_at: nowIso(),
              }
            : application,
        ),
      }));
    },
    [applyMutation],
  );

  const createActionItemFromSource = useCallback(
    (
      partial: Partial<ActionItem> & {
        title: string;
        source_type: string;
        source_id: string;
      },
    ) => {
      applyMutation(["actionItems"], (current) => ({
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
      }));
    },
    [applyMutation],
  );

  const convertBrainDumpToActionItem = useCallback(
    (brainDumpId: string) => {
      applyMutation(["brainDumps", "actionItems"], (current) => {
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
      });
    },
    [applyMutation],
  );

  const saveSettings = useCallback(
    (updates: Partial<RecruitOSData["settings"]>) => {
      applyMutation(["settings"], (current) => ({
        ...current,
        settings: {
          ...current.settings,
          ...updates,
          updated_at: nowIso(),
        },
      }));
    },
    [applyMutation],
  );

  const rescheduleActionItem = useCallback(
    (id: string, dueDate: string) => {
      applyMutation(["actionItems"], (current) => ({
        ...current,
        actionItems: current.actionItems.map((item) =>
          item.id === id ? { ...item, due_date: dueDate, updated_at: nowIso() } : item,
        ),
      }));
    },
    [applyMutation],
  );

  const value = useMemo(
    () => ({
      data,
      loaded,
      persistenceMode,
      syncMessage,
      isSyncing,
      saveRecord,
      saveInterviewQuestion,
      deleteInterviewQuestion,
      deleteRecord,
      toggleActionItem,
      logParPractice,
      markCasePracticed,
      markInterviewAnswerPracticed,
      markFollowUpDone,
      markApplicationActionDone,
      convertBrainDumpToActionItem,
      createActionItemFromSource,
      saveSettings,
      rescheduleActionItem,
    }),
    [
      createActionItemFromSource,
      convertBrainDumpToActionItem,
      data,
      deleteInterviewQuestion,
      deleteRecord,
      isSyncing,
      loaded,
      logParPractice,
      markApplicationActionDone,
      markCasePracticed,
      markFollowUpDone,
      markInterviewAnswerPracticed,
      persistenceMode,
      rescheduleActionItem,
      saveInterviewQuestion,
      saveRecord,
      saveSettings,
      syncMessage,
      toggleActionItem,
    ],
  );

  return (
    <RecruitOSContext.Provider value={value}>{children}</RecruitOSContext.Provider>
  );
}

export function useRecruitOS() {
  const context = useContext(RecruitOSContext);
  if (!context) {
    throw new Error("useRecruitOS must be used within RecruitOSProvider");
  }
  return context;
}
