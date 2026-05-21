import {
  AppSettings,
  CrudModuleSlug,
  RecruitOSData,
  STORAGE_KEY,
  emptySettings,
  seedData,
} from "@/lib/recruitos";
import { getSupabaseClient } from "@/lib/supabase/client";

export type PersistenceMode = "supabase" | "local";

type CollectionKey = Exclude<keyof RecruitOSData, "settings">;
type PersistableCollection = CollectionKey | "settings";
type WritableRow = Record<string, unknown>;
type QueryResult = Promise<{ data: WritableRow[] | null; error: { message: string } | null }>;
type MutationResult = Promise<{ error: { message: string } | null }>;

interface SupabaseMutation {
  in(column: string, values: string[]): MutationResult;
  upsert(rows: WritableRow[], options?: { onConflict: string }): MutationResult;
}

interface SupabaseSelect {
  order(column: string, options: { ascending: boolean }): QueryResult;
  limit(count: number): QueryResult;
}

interface SupabaseTransport {
  from(table: string): {
    select(columns: string): SupabaseSelect;
    upsert(rows: WritableRow[], options?: { onConflict: string }): MutationResult;
    delete(): SupabaseMutation;
  };
}

interface LoadResult {
  data: RecruitOSData;
  mode: PersistenceMode;
  message: string;
}

const TABLE_BY_COLLECTION: Record<CollectionKey, string> = {
  actionItems: "action_items",
  applications: "applications",
  brainDumps: "brain_dumps",
  cases: "cases",
  companies: "companies",
  contacts: "contacts",
  interviewAnswers: "interview_answers",
  interviewPrep: "interview_prep",
  interviewQuestions: "interview_questions",
  mockInterviews: "mock_interviews",
  outreachTemplates: "outreach_templates",
  parPracticeLogs: "par_practice_logs",
  parStories: "par_stories",
  resumes: "resumes",
};

const COLLECTIONS = Object.keys(TABLE_BY_COLLECTION) as CollectionKey[];

const ARRAY_FIELDS: Record<string, string[]> = {
  applications: ["linked_contact_ids", "linked_action_item_ids"],
  brain_dumps: [],
  companies: ["linked_contact_ids", "linked_application_ids"],
  contacts: ["tags", "linked_application_ids"],
  interview_answers: [
    "linked_par_story_ids",
    "linked_application_ids",
    "linked_interview_prep_ids",
  ],
  interview_prep: [
    "linked_contact_ids",
    "linked_par_story_ids",
    "linked_interview_answer_ids",
    "linked_case_ids",
    "linked_action_item_ids",
  ],
  interview_questions: ["linked_par_story_ids"],
  mock_interviews: [
    "linked_par_story_ids",
    "linked_case_ids",
    "linked_action_item_ids",
  ],
  outreach_templates: [],
  par_practice_logs: [],
  par_stories: ["target_roles", "linked_question_ids"],
  resumes: ["linked_application_ids"],
  settings: [
    "preferred_target_roles",
    "case_types",
    "application_statuses",
    "action_item_statuses",
    "action_item_priorities",
    "recruiting_tracks",
  ],
};

function cloneSeed() {
  return seedData();
}

function readLocalSnapshot() {
  if (typeof window === "undefined") return cloneSeed();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return cloneSeed();

  try {
    return JSON.parse(raw) as RecruitOSData;
  } catch {
    return cloneSeed();
  }
}

function writeLocalSnapshot(data: RecruitOSData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function normalizeArrays(table: string, row: WritableRow): WritableRow {
  const arrayFields = ARRAY_FIELDS[table] ?? [];
  const next: WritableRow = { ...row };
  for (const field of arrayFields) {
    const value = next[field];
    next[field] = Array.isArray(value) ? value : [];
  }
  return next;
}

function normalizeSettings(settings?: Partial<AppSettings> | null): AppSettings {
  return {
    ...emptySettings(),
    ...(settings ?? {}),
    preferred_target_roles: Array.isArray(settings?.preferred_target_roles)
      ? settings.preferred_target_roles
      : emptySettings().preferred_target_roles,
    case_types: Array.isArray(settings?.case_types)
      ? settings.case_types
      : emptySettings().case_types,
    application_statuses: Array.isArray(settings?.application_statuses)
      ? settings.application_statuses
      : emptySettings().application_statuses,
    action_item_statuses: Array.isArray(settings?.action_item_statuses)
      ? settings.action_item_statuses
      : emptySettings().action_item_statuses,
    action_item_priorities: Array.isArray(settings?.action_item_priorities)
      ? settings.action_item_priorities
      : emptySettings().action_item_priorities,
    recruiting_tracks: Array.isArray(settings?.recruiting_tracks)
      ? settings.recruiting_tracks
      : emptySettings().recruiting_tracks,
  };
}

function toRows(value: unknown): WritableRow[] {
  return Array.isArray(value) ? (value as WritableRow[]) : [];
}

function mapNormalized(table: string, value: unknown): WritableRow[] {
  return toRows(value).map((row) => normalizeArrays(table, row));
}

function asTransport(client: NonNullable<ReturnType<typeof getSupabaseClient>>) {
  return client as unknown as SupabaseTransport;
}

function buildDataFromTables(
  rowsByCollection: Partial<Record<CollectionKey, WritableRow[]>>,
  settingsRow?: Partial<AppSettings> | null,
): RecruitOSData {
  const fallback = cloneSeed();

  return {
    actionItems: mapNormalized("action_items", rowsByCollection.actionItems ?? fallback.actionItems) as unknown as RecruitOSData["actionItems"],
    applications: mapNormalized("applications", rowsByCollection.applications ?? fallback.applications) as unknown as RecruitOSData["applications"],
    brainDumps: mapNormalized("brain_dumps", rowsByCollection.brainDumps ?? fallback.brainDumps) as unknown as RecruitOSData["brainDumps"],
    cases: toRows(rowsByCollection.cases ?? fallback.cases) as unknown as RecruitOSData["cases"],
    companies: mapNormalized("companies", rowsByCollection.companies ?? fallback.companies) as unknown as RecruitOSData["companies"],
    contacts: mapNormalized("contacts", rowsByCollection.contacts ?? fallback.contacts) as unknown as RecruitOSData["contacts"],
    interviewAnswers: mapNormalized("interview_answers", rowsByCollection.interviewAnswers ?? fallback.interviewAnswers) as unknown as RecruitOSData["interviewAnswers"],
    interviewPrep: mapNormalized("interview_prep", rowsByCollection.interviewPrep ?? fallback.interviewPrep) as unknown as RecruitOSData["interviewPrep"],
    interviewQuestions: mapNormalized("interview_questions", rowsByCollection.interviewQuestions ?? fallback.interviewQuestions) as unknown as RecruitOSData["interviewQuestions"],
    mockInterviews: mapNormalized("mock_interviews", rowsByCollection.mockInterviews ?? fallback.mockInterviews) as unknown as RecruitOSData["mockInterviews"],
    outreachTemplates: toRows(rowsByCollection.outreachTemplates ?? fallback.outreachTemplates) as unknown as RecruitOSData["outreachTemplates"],
    parPracticeLogs: toRows(rowsByCollection.parPracticeLogs ?? fallback.parPracticeLogs) as unknown as RecruitOSData["parPracticeLogs"],
    parStories: mapNormalized("par_stories", rowsByCollection.parStories ?? fallback.parStories) as unknown as RecruitOSData["parStories"],
    resumes: mapNormalized("resumes", rowsByCollection.resumes ?? fallback.resumes) as unknown as RecruitOSData["resumes"],
    settings: normalizeSettings(settingsRow),
  };
}

async function seedSupabaseData(data: RecruitOSData) {
  const client = getSupabaseClient();
  if (!client) return;
  const db = asTransport(client);

  for (const collection of COLLECTIONS) {
    const table = TABLE_BY_COLLECTION[collection];
    const rows = data[collection] as unknown as WritableRow[];
    if (!rows.length) continue;
    const { error } = await db.from(table).upsert(rows, { onConflict: "id" });
    if (error) throw error;
  }

  const { error: settingsError } = await db
    .from("settings")
    .upsert([data.settings as unknown as WritableRow], { onConflict: "id" });
  if (settingsError) throw settingsError;
}

export async function loadRecruitOSData(): Promise<LoadResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      data: readLocalSnapshot(),
      mode: "local",
      message:
        "Using temporary local storage. Add Supabase env vars to sync data across devices.",
    };
  }

  try {
    const db = asTransport(client);
    const tableResults = await Promise.all(
      COLLECTIONS.map(async (collection) => {
        const table = TABLE_BY_COLLECTION[collection];
        const query = db.from(table).select("*");
        const orderedQuery = query.order("created_at", { ascending: true });
        const { data, error } = await orderedQuery;
        if (error) throw error;
        return [collection, data ?? []] as const;
      }),
    );

    const { data: settingsRows, error: settingsError } = await db
      .from("settings")
      .select("*")
      .limit(1);
    if (settingsError) throw settingsError;

    const rowsByCollection = Object.fromEntries(tableResults) as Partial<
      Record<CollectionKey, WritableRow[]>
    >;
    const isEmpty = COLLECTIONS.every(
      (collection) => (rowsByCollection[collection] ?? []).length === 0,
    );

    if (isEmpty && (!settingsRows || settingsRows.length === 0)) {
      const seeded = cloneSeed();
      await seedSupabaseData(seeded);
      return {
        data: seeded,
        mode: "supabase",
        message: "Supabase connected and seeded with starter data.",
      };
    }

    return {
      data: buildDataFromTables(rowsByCollection, settingsRows?.[0] as Partial<AppSettings> | null),
      mode: "supabase",
      message: "Supabase connected. Changes sync across devices.",
    };
  } catch {
    const localData = readLocalSnapshot();
    return {
      data: localData,
      mode: "local",
      message:
        "Supabase connection failed, so RecruitOS fell back to local browser storage.",
    };
  }
}

async function syncCollection(
  table: string,
  previousRows: WritableRow[],
  nextRows: WritableRow[],
) {
  const client = getSupabaseClient();
  if (!client) return;
  const db = asTransport(client);

  const previousIds = new Set(previousRows.map((row) => String(row.id)));
  const nextIds = new Set(nextRows.map((row) => String(row.id)));
  const deletedIds = [...previousIds].filter((id) => !nextIds.has(id));

  if (deletedIds.length) {
    const { error } = await db.from(table).delete().in("id", deletedIds);
    if (error) throw error;
  }

  if (nextRows.length) {
    const { error } = await db.from(table).upsert(nextRows, { onConflict: "id" });
    if (error) throw error;
  }
}

export async function persistRecruitOSCollections(
  previous: RecruitOSData,
  next: RecruitOSData,
  collections: PersistableCollection[],
): Promise<{ mode: PersistenceMode; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    writeLocalSnapshot(next);
    return {
      mode: "local",
      message:
        "Saved locally in this browser. Add Supabase env vars to enable cloud sync.",
    };
  }

  try {
    const db = asTransport(client);
    for (const collection of collections) {
      if (collection === "settings") {
        const { error } = await db
          .from("settings")
          .upsert([next.settings as unknown as WritableRow], { onConflict: "id" });
        if (error) throw error;
        continue;
      }

      const table = TABLE_BY_COLLECTION[collection];
      await syncCollection(
        table,
        previous[collection] as unknown as WritableRow[],
        next[collection] as unknown as WritableRow[],
      );
    }

    return {
      mode: "supabase",
      message: "Synced to Supabase.",
    };
  } catch {
    writeLocalSnapshot(next);
    return {
      mode: "local",
      message:
        "Save completed locally because Supabase sync failed. Recheck your env vars or schema.",
    };
  }
}

export function getPersistenceCollectionsForModule(
  module: CrudModuleSlug,
): PersistableCollection[] {
  const moduleMap: Record<CrudModuleSlug, CollectionKey> = {
    "action-items": "actionItems",
    applications: "applications",
    "brain-dump": "brainDumps",
    cases: "cases",
    companies: "companies",
    "interview-answers": "interviewAnswers",
    "interview-prep": "interviewPrep",
    "mock-interviews": "mockInterviews",
    networking: "contacts",
    pars: "parStories",
    resumes: "resumes",
    "outreach-templates": "outreachTemplates",
  };

  if (module === "interview-prep") {
    return ["interviewPrep", "actionItems"];
  }

  return [moduleMap[module]];
}
