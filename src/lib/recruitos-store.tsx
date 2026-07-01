"use client";

import {
  ActionItem,
  CrudModuleSlug,
  MODULE_CONFIGS,
  RecruitOSData,
  createId,
  dateOffset,
  getCollectionKey,
  lookupCompanyName,
  nowIso,
  seedData,
  toDateInput,
} from "@/lib/recruitos";
import {
  convertBrainDumpToActionItemInData,
  createActionItemFromSourceInData,
  createChecklistActionItems,
  deleteRecordFromData,
  syncDerivedState,
  toggleActionItemInData,
} from "@/lib/recruitos-store-helpers";
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
type ParPracticeInput =
  | string
  | {
      prompt_used?: string;
      version_practiced?: string;
      delivery_score?: number;
      structure_score?: number;
      confidence_score?: number;
      notes?: string;
      next_fix?: string;
      date?: string;
    };
type CasePracticeInput = {
  framework_used?: string;
  structure_score?: number;
  analysis_score?: number;
  communication_score?: number;
  overall_score?: number;
  gpt_feedback?: string;
  next_fix?: string;
  redo_needed?: boolean;
  notes?: string;
  date?: string;
  create_tip?: boolean;
  tip_scope_type?: string;
  tip_title?: string;
  tip_text?: string;
};

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
  logParPractice: (parId: string, input?: ParPracticeInput) => void;
  logCasePractice: (caseId: string, input?: CasePracticeInput) => void;
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

function withTimestamps(record: SaveRecordInput, existingId?: string) {
  const timestamp = nowIso();
  return {
    ...record,
    id: existingId ?? record.id ?? createId("item"),
    created_at: typeof record.created_at === "string" ? record.created_at : timestamp,
    updated_at: timestamp,
  };
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
        let preparedRecord = { ...MODULE_CONFIGS[module].defaultValues, ...record };
        let nextCompanies = current.companies;

        if (module === "networking" || module === "applications") {
          const rawCompanyName = String(preparedRecord.company_name ?? "").trim();
          let companyId = String(preparedRecord.company_id ?? "").trim();
          const normalizedTags =
            module === "networking" && Array.isArray(preparedRecord.tags)
              ? uniqueStrings(preparedRecord.tags.map((tag) => String(tag).trim()))
              : [];

          const existingCompany = rawCompanyName
            ? current.companies.find(
                (company) => company.name.trim().toLowerCase() === rawCompanyName.toLowerCase(),
              )
            : null;

          if (existingCompany) {
            companyId = existingCompany.id;
          } else if (module === "applications" && rawCompanyName) {
            const newCompany = withTimestamps({
              ...MODULE_CONFIGS.companies.defaultValues,
              name: rawCompanyName,
            }) as RecruitOSData["companies"][number];
            nextCompanies = [...current.companies, newCompany];
            companyId = newCompany.id;
          } else if (module === "networking" && !existingCompany) {
            companyId = "";
          }

          preparedRecord = {
            ...preparedRecord,
            company_id: companyId,
            company_name:
              rawCompanyName || lookupCompanyName({ ...current, companies: nextCompanies }, companyId),
            ...(module === "networking" ? { tags: normalizedTags } : {}),
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
      applyMutation(getPersistenceCollectionsForModule(module), (current) =>
        deleteRecordFromData(current, module, id),
      );
    },
    [applyMutation],
  );

  const toggleActionItem = useCallback(
    (id: string) => {
      applyMutation(["actionItems"], (current) => toggleActionItemInData(current, id));
    },
    [applyMutation],
  );

  const logParPractice = useCallback(
    (parId: string, input: ParPracticeInput = "Daily practice prompt") => {
      const normalized =
        typeof input === "string"
          ? {
              prompt_used: input,
              version_practiced: "Full",
              delivery_score: 4,
              structure_score: 4,
              confidence_score: 4,
              notes: "",
              next_fix: "",
              date: toDateInput(nowIso()),
            }
          : {
              prompt_used: input.prompt_used || "Daily practice prompt",
              version_practiced: input.version_practiced || "Full",
              delivery_score: input.delivery_score ?? 4,
              structure_score: input.structure_score ?? 4,
              confidence_score: input.confidence_score ?? 4,
              notes: input.notes ?? "",
              next_fix: input.next_fix ?? "",
              date: input.date || toDateInput(nowIso()),
            };
      applyMutation(["parStories", "parPracticeLogs"], (current) => ({
        ...current,
        parPracticeLogs: [
          ...current.parPracticeLogs,
          {
            id: createId("practice"),
            created_at: nowIso(),
            updated_at: nowIso(),
            par_story_id: parId,
            date: normalized.date,
            prompt_used: normalized.prompt_used,
            version_practiced: normalized.version_practiced,
            delivery_score: normalized.delivery_score,
            structure_score: normalized.structure_score,
            confidence_score: normalized.confidence_score,
            notes: normalized.notes,
            next_fix: normalized.next_fix,
          },
        ],
        parStories: current.parStories.map((par) =>
          par.id === parId
            ? {
                ...par,
                last_practiced_date: normalized.date,
                number_of_reps: par.number_of_reps + 1,
                confidence_score: Math.max(
                  1,
                  Math.min(5, normalized.confidence_score || par.confidence_score),
                ),
                weakness_or_focus_area:
                  normalized.next_fix.trim() || par.weakness_or_focus_area,
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
      applyMutation(["cases", "casePracticeLogs"], (current) => {
        const targetCase = current.cases.find((item) => item.id === caseId);
        if (!targetCase) return current;

        const quickLog = {
          id: createId("case-practice"),
          created_at: nowIso(),
          updated_at: nowIso(),
          case_id: caseId,
          date: toDateInput(nowIso()),
          framework_used: targetCase.framework_used,
          structure_score: 4,
          analysis_score: 4,
          communication_score: 4,
          overall_score: 4,
          gpt_feedback: "Quick completion from dashboard.",
          next_fix: targetCase.weakness_area || "",
          redo_needed: false,
          notes: "",
        };

        const nextPracticeLogs = [...current.casePracticeLogs, quickLog];
        const relatedLogs = nextPracticeLogs.filter((log) => log.case_id === caseId);
        const averageScore = Number(
          (
            relatedLogs.reduce((sum, log) => sum + log.overall_score, 0) /
            Math.max(relatedLogs.length, 1)
          ).toFixed(1),
        );

        return {
          ...current,
          casePracticeLogs: nextPracticeLogs,
          cases: current.cases.map((item) =>
            item.id === caseId
              ? {
                  ...item,
                  date: quickLog.date,
                  last_practiced_date: quickLog.date,
                  times_practiced: relatedLogs.length,
                  score: averageScore,
                  average_score: averageScore,
                  redo_needed: false,
                  status: item.status === "Strong" ? "Strong" : "Practiced",
                  updated_at: nowIso(),
                }
              : item,
          ),
        };
      });
    },
    [applyMutation],
  );

  const logCasePractice = useCallback(
    (caseId: string, input: CasePracticeInput = {}) => {
      const normalized = {
        framework_used: input.framework_used?.trim() ?? "",
        structure_score: input.structure_score ?? 4,
        analysis_score: input.analysis_score ?? 4,
        communication_score: input.communication_score ?? 4,
        overall_score: input.overall_score ?? 4,
        gpt_feedback: input.gpt_feedback?.trim() ?? "",
        next_fix: input.next_fix?.trim() ?? "",
        redo_needed: input.redo_needed ?? false,
        notes: input.notes?.trim() ?? "",
        date: input.date || toDateInput(nowIso()),
        create_tip: input.create_tip ?? false,
        tip_scope_type: input.tip_scope_type || "Question Type",
        tip_title: input.tip_title?.trim() ?? "",
        tip_text: input.tip_text?.trim() ?? "",
      };

      applyMutation(["cases", "casePracticeLogs", "caseLearnings"], (current) => {
        const targetCase = current.cases.find((item) => item.id === caseId);
        if (!targetCase) return current;

        const nextLog = {
          id: createId("case-practice"),
          created_at: nowIso(),
          updated_at: nowIso(),
          case_id: caseId,
          date: normalized.date,
          framework_used: normalized.framework_used,
          structure_score: normalized.structure_score,
          analysis_score: normalized.analysis_score,
          communication_score: normalized.communication_score,
          overall_score: normalized.overall_score,
          gpt_feedback: normalized.gpt_feedback,
          next_fix: normalized.next_fix,
          redo_needed: normalized.redo_needed,
          notes: normalized.notes,
        };

        const nextPracticeLogs = [...current.casePracticeLogs, nextLog];
        const relatedLogs = nextPracticeLogs.filter((log) => log.case_id === caseId);
        const averageScore = Number(
          (
            relatedLogs.reduce((sum, log) => sum + log.overall_score, 0) /
            Math.max(relatedLogs.length, 1)
          ).toFixed(1),
        );

        const nextCaseLearnings =
          normalized.create_tip && normalized.tip_text
            ? [
                ...current.caseLearnings,
                {
                  id: createId("case-learning"),
                  created_at: nowIso(),
                  updated_at: nowIso(),
                  title:
                    normalized.tip_title ||
                    normalized.next_fix ||
                    `Learning for ${targetCase.case_type}`,
                  tip_text: normalized.tip_text,
                  scope_type: normalized.tip_scope_type,
                  linked_case_id:
                    normalized.tip_scope_type === "Question" ? caseId : "",
                  linked_question_type:
                    normalized.tip_scope_type === "Question Type"
                      ? targetCase.case_type
                      : "",
                },
              ]
            : current.caseLearnings;

        return {
          ...current,
          casePracticeLogs: nextPracticeLogs,
          caseLearnings: nextCaseLearnings,
          cases: current.cases.map((item) =>
            item.id === caseId
              ? {
                  ...item,
                  date: normalized.date,
                  last_practiced_date: normalized.date,
                  framework_used: normalized.framework_used || item.framework_used,
                  score: averageScore,
                  average_score: averageScore,
                  weakness_area: normalized.next_fix || item.weakness_area,
                  redo_needed: normalized.redo_needed,
                  status: normalized.redo_needed ? "Redo Needed" : "Practiced",
                  times_practiced: relatedLogs.length,
                  updated_at: nowIso(),
                }
              : item,
          ),
        };
      });
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
      applyMutation(["actionItems"], (current) =>
        createActionItemFromSourceInData(current, partial),
      );
    },
    [applyMutation],
  );

  const convertBrainDumpToActionItem = useCallback(
    (brainDumpId: string) => {
      applyMutation(["brainDumps", "actionItems"], (current) =>
        convertBrainDumpToActionItemInData(current, brainDumpId),
      );
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
      logCasePractice,
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
      logCasePractice,
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
