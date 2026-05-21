"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BRAIN_DUMP_CATEGORIES,
  CrudModuleSlug,
  FieldConfig,
  MODULE_CONFIGS,
  ModuleSlug,
  RECRUITING_TRACKS,
  RecruitOSData,
  formatDate,
  formatDateTime,
  getLinkedActionItems,
  getSourceSummary,
  isActionDone,
  isDueTodayOrOverdue,
  isInCurrentWeek,
  isWithinNextDays,
  joinList,
  progressPercentage,
  resolveOptions,
  sortCaseSuggestions,
  sortParSuggestions,
  startOfWeek,
  toDateInput,
} from "@/lib/recruitos";
import { useRecruitOS } from "@/lib/recruitos-store";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function StatusBadge({
  value,
}: {
  value: string | number | boolean | string[];
}) {
  const label = Array.isArray(value) ? joinList(value) : String(value);
  const tone = label.toLowerCase();
  const className = tone.includes("done") || tone.includes("ready")
    ? "bg-emerald-500/15 text-emerald-200"
    : tone.includes("high") || tone.includes("critical") || tone.includes("overdue")
      ? "bg-rose-500/15 text-rose-200"
      : tone.includes("wait")
        ? "bg-amber-500/15 text-amber-100"
        : "bg-slate-500/15 text-slate-200";

  return (
    <span className={cx("inline-flex rounded-full px-2.5 py-1 text-xs", className)}>
      {label}
    </span>
  );
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.35)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-slate-400">
      {label}
    </div>
  );
}

function renderValue(value: unknown) {
  if (Array.isArray(value)) {
    if (!value.length) return "—";
    return joinList(value.map((item) => String(item)));
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (!value) return "—";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return formatDateTime(value);
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return formatDate(value);
  }
  return String(value);
}

function FieldInput({
  field,
  data,
  value,
  onChange,
}: {
  field: FieldConfig;
  data: RecruitOSData;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const options = resolveOptions(field.options, data);

  if (field.type === "textarea") {
    return (
      <textarea
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/40"
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-300/40"
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "multiselect") {
    const selected = Array.isArray(value) ? value.map(String) : [];
    return (
      <select
        multiple
        value={selected}
        onChange={(event) =>
          onChange(Array.from(event.currentTarget.selectedOptions).map((option) => option.value))
        }
        className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-300/40"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
        <input
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
          className="h-4 w-4 rounded border-white/10 bg-slate-900"
        />
        <span>Enabled</span>
      </label>
    );
  }

  return (
    <input
      value={String(value ?? "")}
      onChange={(event) =>
        onChange(field.type === "number" ? Number(event.target.value) : event.target.value)
      }
      type={field.type === "number" ? "number" : field.type}
      min={field.min}
      max={field.max}
      className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/40"
    />
  );
}

function RecordModal({
  title,
  open,
  onClose,
  module,
  initial,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  module: CrudModuleSlug;
  initial?: Record<string, unknown> | null;
}) {
  const { data, saveRecord, toggleActionItem } = useRecruitOS();
  const config = MODULE_CONFIGS[module];
  const [form, setForm] = useState<Record<string, unknown>>(initial ?? config.defaultValues);

  if (!open) return null;

  const linkedActions =
    initial?.id && module !== "action-items"
      ? getLinkedActionItems(data, module, String(initial.id))
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-white/10 bg-slate-950 p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-400">{config.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {config.fields.map((field) => (
            <label key={field.key} className={cx("space-y-2", field.type === "textarea" || field.type === "multiselect" ? "lg:col-span-2" : "")}>
              <span className="text-sm text-slate-300">{field.label}</span>
              <FieldInput
                field={field}
                data={data}
                value={form[field.key]}
                onChange={(nextValue) =>
                  setForm((current) => ({ ...current, [field.key]: nextValue }))
                }
              />
            </label>
          ))}
        </div>

        {linkedActions.length > 0 ? (
          <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-medium text-white">Linked action items</div>
            {linkedActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-slate-900/60 px-3 py-3"
              >
                <div>
                  <div className="text-sm text-white">{action.title}</div>
                  <div className="text-xs text-slate-400">
                    {action.priority} · {renderValue(action.due_date)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleActionItem(action.id)}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
                >
                  {action.status === "Done" ? "Reopen" : "Mark Done"}
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              saveRecord(module, {
                ...form,
                id: initial?.id ? String(initial.id) : undefined,
              });
              onClose();
            }}
            className="rounded-full bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-300"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardView() {
  const {
    data,
    logParPractice,
    markCasePracticed,
    markFollowUpDone,
    markApplicationActionDone,
    toggleActionItem,
    createActionItemFromSource,
    convertBrainDumpToActionItem,
    saveRecord,
    rescheduleActionItem,
  } = useRecruitOS();
  const [parIndex, setParIndex] = useState(0);
  const [caseIndex, setCaseIndex] = useState(0);
  const [selectedWeekDate, setSelectedWeekDate] = useState(toDateInput(new Date().toISOString()));
  const [brainDump, setBrainDump] = useState({
    title: "",
    note: "",
    category: "General",
  });

  const parCandidates = sortParSuggestions(data.parStories);
  const caseCandidates = sortCaseSuggestions(data.cases);
  const parSuggestion = parCandidates[parIndex % Math.max(parCandidates.length, 1)];
  const caseSuggestion = caseCandidates[caseIndex % Math.max(caseCandidates.length, 1)];
  const followUpsDue = data.contacts.filter((contact) =>
    isDueTodayOrOverdue(contact.next_follow_up_date),
  );
  const applicationsNeedingAction = data.applications.filter(
    (application) =>
      isDueTodayOrOverdue(application.follow_up_date) ||
      isWithinNextDays(application.deadline, 5) ||
      ["Ready to Apply", "Referral Requested", "Interviewing", "Assessment"].includes(
        application.status,
      ),
  );
  const openActionItems = data.actionItems.filter(
    (action) => !isActionDone(action) && isDueTodayOrOverdue(action.due_date),
  );
  const mocksThisWeek = data.mockInterviews.filter((mock) => isInCurrentWeek(mock.date));
  const parRepsThisWeek = data.parPracticeLogs.filter((log) => isInCurrentWeek(log.date)).length;
  const caseRepsThisWeek = data.cases.filter((item) => isInCurrentWeek(item.date)).length;
  const networkingTouchesThisWeek = data.contacts.filter((contact) =>
    isInCurrentWeek(contact.last_contact_date),
  ).length;
  const applicationsThisWeek = data.applications.filter((item) =>
    isInCurrentWeek(item.date_applied),
  );
  const actionsCompletedThisWeek = data.actionItems.filter((item) =>
    isInCurrentWeek(item.completed_at),
  ).length;
  const applicationsToday = data.applications.filter(
    (application) => application.date_applied === toDateInput(new Date().toISOString()),
  );
  const weekStart = startOfWeek();
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    const key = toDateInput(day.toISOString());
    return {
      key,
      label: day.toLocaleDateString(undefined, { weekday: "short" }),
      dateLabel: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      parLogs: data.parPracticeLogs.filter((log) => log.date === key),
      caseLogs: data.cases.filter((item) => item.date === key),
      followUps: data.contacts.filter((contact) => contact.next_follow_up_date === key),
      applicationActions: data.applications.filter(
        (application) => application.follow_up_date === key || application.deadline === key,
      ),
      mocks: data.mockInterviews.filter((mock) => mock.date === key),
      actionItems: data.actionItems.filter((action) => action.due_date === key && !isActionDone(action)),
    };
  });
  const selectedDay = weekDays.find((day) => day.key === selectedWeekDate) ?? weekDays[0];
  const trackCounts = RECRUITING_TRACKS.map((track) => ({
    track,
    count: applicationsToday.filter((application) => application.recruiting_track === track)
      .length,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card title="Today’s Command Center">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Assigned PAR Practice
              </div>
              {parSuggestion ? (
                <div className="mt-3 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{parSuggestion.title}</h3>
                    <p className="text-sm text-slate-400">
                      Prompt: Tell me about a time you influenced without authority.
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      Focus: {parSuggestion.weakness_or_focus_area || "Sharpen structure and confidence."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/pars" className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
                      Start Practice
                    </Link>
                    <button
                      type="button"
                      onClick={() => logParPractice(parSuggestion.id, "Daily dashboard practice")}
                      className="rounded-full bg-sky-400 px-3 py-2 text-sm font-medium text-slate-950"
                    >
                      Mark Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => setParIndex((current) => current + 1)}
                      className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
                    >
                      Change Assigned PAR
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyState label="Add a PAR story to start daily practice suggestions." />
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Assigned Case Practice
              </div>
              {caseSuggestion ? (
                <div className="mt-3 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{caseSuggestion.title}</h3>
                    <p className="text-sm text-slate-400">
                      Focus area: {caseSuggestion.weakness_area || "Keep sharp under time pressure."}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      Suggested session: {caseSuggestion.case_type}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/cases" className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
                      Start Case
                    </Link>
                    <button
                      type="button"
                      onClick={() => markCasePracticed(caseSuggestion.id)}
                      className="rounded-full bg-cyan-300 px-3 py-2 text-sm font-medium text-slate-950"
                    >
                      Mark Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => setCaseIndex((current) => current + 1)}
                      className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
                    >
                      Change Assigned Case
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyState label="Add a case practice record to start daily case suggestions." />
              )}
            </div>
          </div>
        </Card>

        <Card title="Weekly Progress Scoreboard">
          <div className="space-y-4">
            <ProgressBar
              label={`PAR reps this week (${parRepsThisWeek}/${data.settings.weekly_par_target})`}
              value={progressPercentage(parRepsThisWeek, data.settings.weekly_par_target)}
            />
            <ProgressBar
              label={`Case reps this week (${caseRepsThisWeek}/${data.settings.weekly_case_target})`}
              value={progressPercentage(caseRepsThisWeek, data.settings.weekly_case_target)}
            />
            <ProgressBar
              label={`Mocks this week (${mocksThisWeek.length}/${data.settings.weekly_mock_target})`}
              value={progressPercentage(mocksThisWeek.length, data.settings.weekly_mock_target)}
            />
            <ProgressBar
              label={`Networking touches (${networkingTouchesThisWeek}/${data.settings.weekly_networking_target})`}
              value={progressPercentage(
                networkingTouchesThisWeek,
                data.settings.weekly_networking_target,
              )}
            />
            <ProgressBar
              label={`Applications this week (${applicationsThisWeek.length}/${data.settings.weekly_application_target})`}
              value={progressPercentage(
                applicationsThisWeek.length,
                data.settings.weekly_application_target,
              )}
            />
            <ProgressBar
              label={`Action items completed (${actionsCompletedThisWeek})`}
              value={progressPercentage(actionsCompletedThisWeek, 15)}
            />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-medium text-white">
                Applications today: {applicationsToday.length}/{data.settings.daily_application_target}
              </div>
              <div className="mt-3 grid gap-2">
                {trackCounts.map((track) => (
                  <div
                    key={track.track}
                    className="flex items-center justify-between text-sm text-slate-300"
                  >
                    <span>{track.track}</span>
                    <span>{track.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Networking Follow-Ups Due">
          <div className="space-y-3">
            {followUpsDue.length ? (
              followUpsDue.map((contact) => (
                <div
                  key={contact.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {contact.name} · {contact.company_name || "No company"}
                      </div>
                      <div className="text-sm text-slate-400">
                        {contact.role || "No role"} · Last touch {renderValue(contact.last_contact_date)}
                      </div>
                      <div className="mt-2 text-sm text-slate-300">
                        Next step: {contact.conversation_notes || "Follow up and keep momentum moving."}
                      </div>
                    </div>
                    <StatusBadge value="Due" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => markFollowUpDone(contact.id)}
                      className="rounded-full bg-sky-400 px-3 py-2 text-sm font-medium text-slate-950"
                    >
                      Mark Follow-Up Done
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        createActionItemFromSource({
                          title: `Follow up with ${contact.name}`,
                          source_type: "Networking",
                          source_id: contact.id,
                          linked_contact_id: contact.id,
                          linked_company_id: contact.company_id,
                        })
                      }
                      className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
                    >
                      Create Action Item
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState label="No networking follow-ups due today." />
            )}
          </div>
        </Card>

        <Card title="Applications Requiring Action">
          <div className="space-y-3">
            {applicationsNeedingAction.length ? (
              applicationsNeedingAction.map((application) => (
                <div
                  key={application.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {application.role_title} · {application.company_name}
                      </div>
                      <div className="text-sm text-slate-400">
                        {application.status} · Referral {application.referral_status}
                      </div>
                      <div className="mt-2 text-sm text-slate-300">
                        Next step: {application.next_step || "Review application and move it forward."}
                      </div>
                    </div>
                    <StatusBadge
                      value={
                        isDueTodayOrOverdue(application.follow_up_date)
                          ? "Overdue"
                          : "Approaching"
                      }
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => markApplicationActionDone(application.id)}
                      className="rounded-full bg-cyan-300 px-3 py-2 text-sm font-medium text-slate-950"
                    >
                      Mark Action Complete
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        createActionItemFromSource({
                          title: `${application.company_name}: ${application.next_step || "Follow up on application"}`,
                          source_type: "Application",
                          source_id: application.id,
                          linked_application_id: application.id,
                          linked_company_id: application.company_id,
                        })
                      }
                      className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
                    >
                      Add Action Item
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState label="No application actions are due right now." />
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr_1fr]">
        <Card title="Mock Interview Reminder">
          {mocksThisWeek.length ? (
            <div className="space-y-3 text-sm text-slate-300">
              <p>You already logged {mocksThisWeek.length} mock interview(s) this week.</p>
              <Link
                href="/mock-interviews"
                className="inline-flex rounded-full border border-white/10 px-3 py-2 text-sm text-slate-100 hover:bg-white/5"
              >
                Review Mock Notes
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-300">
                No mock interview has been completed this week. Keep the cadence alive before live interviews.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/mock-interviews"
                  className="rounded-full bg-sky-400 px-3 py-2 text-sm font-medium text-slate-950"
                >
                  Log Mock Interview
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    createActionItemFromSource({
                      title: "Schedule this week’s mock interview",
                      source_type: "Mock Interview",
                      source_id: "dashboard-weekly-mock",
                    })
                  }
                  className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
                >
                  Create Mock Prep Action Item
                </button>
              </div>
            </div>
          )}
        </Card>

        <Card title="Open Action Items Due Today">
          <div className="space-y-3">
            {openActionItems.length ? (
              openActionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{item.title}</div>
                    <div className="text-xs text-slate-400">
                      {item.priority} · {getSourceSummary(data, item)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleActionItem(item.id)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
                  >
                    Check Off
                  </button>
                </div>
              ))
            ) : (
              <EmptyState label="No due action items right now." />
            )}
          </div>
        </Card>

        <Card title="Brain Dump / Quick Capture">
          <div className="space-y-3">
            <input
              value={brainDump.title}
              onChange={(event) => setBrainDump((current) => ({ ...current, title: event.target.value }))}
              placeholder="Quick title"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
            <textarea
              value={brainDump.note}
              onChange={(event) => setBrainDump((current) => ({ ...current, note: event.target.value }))}
              placeholder="Write anything you do not want to lose..."
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
            <select
              value={brainDump.category}
              onChange={(event) => setBrainDump((current) => ({ ...current, category: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
            >
              {BRAIN_DUMP_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (!brainDump.title.trim()) return;
                saveRecord("brain-dump", {
                  ...brainDump,
                  converted_action_item_id: "",
                  linked_contact_id: "",
                  linked_company_id: "",
                  linked_application_id: "",
                  linked_par_id: "",
                  linked_case_id: "",
                  linked_mock_interview_id: "",
                  linked_resume_id: "",
                  linked_interview_prep_id: "",
                });
                setBrainDump({ title: "", note: "", category: "General" });
              }}
              className="rounded-full bg-cyan-300 px-3 py-2 text-sm font-medium text-slate-950"
            >
              Save Brain Dump
            </button>
            <div className="space-y-2">
              {data.brainDumps.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-medium text-white">{item.title}</div>
                  <div className="text-xs text-slate-400">{item.category}</div>
                  <div className="mt-2 text-sm text-slate-300">{item.note}</div>
                  <button
                    type="button"
                    onClick={() => convertBrainDumpToActionItem(item.id)}
                    disabled={Boolean(item.converted_action_item_id)}
                    className="mt-3 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 disabled:opacity-40"
                  >
                    {item.converted_action_item_id ? "Converted" : "Convert to Action Item"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card title="Weekly View">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {weekDays.map((day) => (
            <button
              key={day.key}
              type="button"
              onClick={() => setSelectedWeekDate(day.key)}
              className={cx(
                "rounded-2xl border px-3 py-3 text-left transition",
                selectedWeekDate === day.key
                  ? "border-sky-300/40 bg-sky-400/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10",
              )}
            >
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {day.label}
              </div>
              <div className="text-sm font-medium text-white">{day.dateLabel}</div>
              <div className="mt-3 space-y-1 text-xs text-slate-300">
                <div>PAR: {day.parLogs.length ? "Completed" : "Open"}</div>
                <div>Case: {day.caseLogs.length ? "Completed" : "Open"}</div>
                <div>Networking: {day.followUps.length}</div>
                <div>Apps: {day.applicationActions.length}</div>
                <div>Mocks: {day.mocks.length}</div>
                <div>Tasks: {day.actionItems.length}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">
                {selectedDay.label} · {selectedDay.dateLabel}
              </div>
              <div className="text-sm text-slate-400">
                Click a day above to inspect and reschedule what is due.
              </div>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {selectedDay.actionItems.length ? (
              selectedDay.actionItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                  <div className="text-sm font-medium text-white">{item.title}</div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span>{item.priority}</span>
                    <span>{getSourceSummary(data, item)}</span>
                  </div>
                  <input
                    value={item.due_date}
                    onChange={(event) => rescheduleActionItem(item.id, event.target.value)}
                    type="date"
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
              ))
            ) : (
              <EmptyState label="No open action items on this day." />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function SettingsView() {
  const { data, saveSettings } = useRecruitOS();
  const [draft, setDraft] = useState({
    daily_application_target: data.settings.daily_application_target,
    weekly_application_target: data.settings.weekly_application_target,
    weekly_par_target: data.settings.weekly_par_target,
    weekly_case_target: data.settings.weekly_case_target,
    weekly_mock_target: data.settings.weekly_mock_target,
    weekly_networking_target: data.settings.weekly_networking_target,
    preferred_target_roles: data.settings.preferred_target_roles.join(", "),
    case_types: data.settings.case_types.join("\n"),
    application_statuses: data.settings.application_statuses.join("\n"),
    action_item_statuses: data.settings.action_item_statuses.join("\n"),
    action_item_priorities: data.settings.action_item_priorities.join("\n"),
    recruiting_tracks: data.settings.recruiting_tracks.join("\n"),
  });

  return (
    <div className="space-y-6">
      <Card title="Settings">
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            ["daily_application_target", "Daily application target"],
            ["weekly_application_target", "Weekly application target"],
            ["weekly_par_target", "Weekly PAR target"],
            ["weekly_case_target", "Weekly case target"],
            ["weekly_mock_target", "Weekly mock target"],
            ["weekly_networking_target", "Weekly networking touch target"],
          ].map(([key, label]) => (
            <label key={key} className="space-y-2">
              <span className="text-sm text-slate-300">{label}</span>
              <input
                value={draft[key as keyof typeof draft]}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [key]: Number(event.target.value),
                  }))
                }
                type="number"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />
            </label>
          ))}
          {[
            ["preferred_target_roles", "Preferred target roles (comma separated)"],
            ["case_types", "Editable case types (one per line)"],
            ["application_statuses", "Editable application statuses (one per line)"],
            ["action_item_statuses", "Editable action item statuses (one per line)"],
            ["action_item_priorities", "Editable action item priorities (one per line)"],
            ["recruiting_tracks", "Editable recruiting tracks (one per line)"],
          ].map(([key, label]) => (
            <label key={key} className="space-y-2 lg:col-span-2">
              <span className="text-sm text-slate-300">{label}</span>
              <textarea
                value={draft[key as keyof typeof draft]}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
                rows={key === "preferred_target_roles" ? 2 : 4}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() =>
              saveSettings({
                daily_application_target: Number(draft.daily_application_target),
                weekly_application_target: Number(draft.weekly_application_target),
                weekly_par_target: Number(draft.weekly_par_target),
                weekly_case_target: Number(draft.weekly_case_target),
                weekly_mock_target: Number(draft.weekly_mock_target),
                weekly_networking_target: Number(draft.weekly_networking_target),
                preferred_target_roles: draft.preferred_target_roles
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
                case_types: draft.case_types.split("\n").map((item) => item.trim()).filter(Boolean),
                application_statuses: draft.application_statuses
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
                action_item_statuses: draft.action_item_statuses
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
                action_item_priorities: draft.action_item_priorities
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
                recruiting_tracks: draft.recruiting_tracks
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
            className="rounded-full bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950"
          >
            Save Settings
          </button>
        </div>
      </Card>
    </div>
  );
}

function QuestionsSection() {
  const { data, saveInterviewQuestion, deleteInterviewQuestion } = useRecruitOS();
  const [draft, setDraft] = useState({
    id: "",
    question_text: "",
    category: "",
    notes: "",
    linked_par_story_ids: [] as string[],
  });

  return (
    <Card title="Interview Questions View">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          {data.interviewQuestions.map((question) => (
            <div key={question.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-white">{question.question_text}</div>
                  <div className="text-xs text-slate-400">{question.category || "General"}</div>
                </div>
                <button
                  type="button"
                  onClick={() => undefined}
                  className="hidden"
                />
              </div>
              <div className="mt-3 space-y-2">
                {question.linked_par_story_ids.length ? (
                  question.linked_par_story_ids.map((parId) => {
                    const par = data.parStories.find((item) => item.id === parId);
                    if (!par) return null;
                    return (
                      <div
                        key={parId}
                        className="rounded-2xl border border-white/5 bg-slate-900/60 px-3 py-2 text-sm text-slate-200"
                      >
                        {par.title}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-slate-400">No linked PAR stories yet.</div>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      id: question.id,
                      question_text: question.question_text,
                      category: question.category,
                      notes: question.notes,
                      linked_par_story_ids: question.linked_par_story_ids,
                    })
                  }
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
                >
                  Edit Question
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Delete this interview question?")) {
                      deleteInterviewQuestion(question.id);
                    }
                  }}
                  className="rounded-full border border-rose-400/20 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-400/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 text-sm font-medium text-white">Add or update question</div>
          <div className="space-y-3">
            <input
              value={draft.question_text}
              onChange={(event) =>
                setDraft((current) => ({ ...current, question_text: event.target.value }))
              }
              placeholder="Question text"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
            />
            <input
              value={draft.category}
              onChange={(event) =>
                setDraft((current) => ({ ...current, category: event.target.value }))
              }
              placeholder="Category"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
            />
            <textarea
              value={draft.notes}
              onChange={(event) =>
                setDraft((current) => ({ ...current, notes: event.target.value }))
              }
              rows={3}
              placeholder="Notes"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
            />
            <select
              multiple
              value={draft.linked_par_story_ids}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  linked_par_story_ids: Array.from(
                    event.currentTarget.selectedOptions,
                  ).map((option) => option.value),
                }))
              }
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
            >
              {data.parStories.map((par) => (
                <option key={par.id} value={par.id}>
                  {par.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (!draft.question_text.trim()) return;
                saveInterviewQuestion({
                  id: draft.id || undefined,
                  question_text: draft.question_text,
                  category: draft.category,
                  notes: draft.notes,
                  linked_par_story_ids: draft.linked_par_story_ids,
                });
                setDraft({
                  id: "",
                  question_text: "",
                  category: "",
                  notes: "",
                  linked_par_story_ids: [],
                });
              }}
              className="rounded-full bg-sky-400 px-3 py-2 text-sm font-medium text-slate-950"
            >
              Save Question
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ActionItemsFilters({
  active,
  setActive,
}: {
  active: string;
  setActive: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {["Today", "Overdue", "This Week", "Waiting", "Completed", "By Priority", "By Source"].map(
        (view) => (
          <button
            key={view}
            type="button"
            onClick={() => setActive(view)}
            className={cx(
              "rounded-full border px-3 py-1.5 text-xs transition",
              active === view
                ? "border-sky-300/40 bg-sky-400/10 text-white"
                : "border-white/10 text-slate-300 hover:bg-white/5",
            )}
          >
            {view}
          </button>
        ),
      )}
    </div>
  );
}

function GenericModuleView({ slug }: { slug: CrudModuleSlug }) {
  const { data, deleteRecord, logParPractice, markCasePracticed, markFollowUpDone, markInterviewAnswerPracticed, toggleActionItem, createActionItemFromSource } = useRecruitOS();
  const config = MODULE_CONFIGS[slug];
  const records = data[config.collection] as unknown as Array<Record<string, unknown>>;
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [actionView, setActionView] = useState("Today");

  const filtered = useMemo(() => {
    const base = records.filter((record) =>
      config.searchKeys.some((key) =>
        renderValue(record[key]).toLowerCase().includes(query.toLowerCase()),
      ),
    );
    if (slug !== "action-items") return base;
    return base.filter((record) => {
      const item = record as unknown as RecruitOSData["actionItems"][number];
      if (actionView === "Today") return !isActionDone(item) && item.due_date === toDateInput(new Date().toISOString());
      if (actionView === "Overdue") return !isActionDone(item) && item.due_date < toDateInput(new Date().toISOString());
      if (actionView === "This Week") return !isActionDone(item) && isInCurrentWeek(item.due_date);
      if (actionView === "Waiting") return item.status === "Waiting";
      if (actionView === "Completed") return item.status === "Done";
      return true;
    });
  }, [actionView, config.searchKeys, query, records, slug]);

  return (
    <div className="space-y-6">
      <Card
        title={config.title}
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="rounded-full bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950"
          >
            Add {config.singular}
          </button>
        }
      >
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-2xl text-sm text-slate-400">{config.description}</p>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${config.title.toLowerCase()}...`}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>
        {slug === "action-items" ? (
          <div className="mb-4">
            <ActionItemsFilters active={actionView} setActive={setActionView} />
          </div>
        ) : null}
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  {config.columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-3 py-2 text-left text-xs uppercase tracking-[0.18em] text-slate-400"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-right text-xs uppercase tracking-[0.18em] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={String(record.id)} className="rounded-2xl bg-white/5">
                    {config.columns.map((column) => (
                      <td key={column.key} className="px-3 py-3 text-sm text-slate-200">
                        {["status", "priority", "target_category", "referral_status", "prep_status"].includes(column.key) ||
                        typeof record[column.key] === "boolean" ? (
                          <StatusBadge value={record[column.key] as string} />
                        ) : (
                          renderValue(record[column.key])
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        {slug === "pars" ? (
                          <button
                            type="button"
                            onClick={() => logParPractice(String(record.id))}
                            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
                          >
                            Practice
                          </button>
                        ) : null}
                        {slug === "cases" ? (
                          <button
                            type="button"
                            onClick={() => markCasePracticed(String(record.id))}
                            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
                          >
                            Mark Practiced
                          </button>
                        ) : null}
                        {slug === "interview-answers" ? (
                          <button
                            type="button"
                            onClick={() => markInterviewAnswerPracticed(String(record.id))}
                            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
                          >
                            Practice
                          </button>
                        ) : null}
                        {slug === "networking" ? (
                          <button
                            type="button"
                            onClick={() => markFollowUpDone(String(record.id))}
                            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
                          >
                            Follow-Up Done
                          </button>
                        ) : null}
                        {slug === "action-items" ? (
                          <button
                            type="button"
                            onClick={() => toggleActionItem(String(record.id))}
                            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
                          >
                            {(record.status as string) === "Done" ? "Reopen" : "Check Off"}
                          </button>
                        ) : null}
                        {(slug === "applications" || slug === "mock-interviews" || slug === "pars" || slug === "networking") ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (slug === "applications") {
                                createActionItemFromSource({
                                  title: `${String(record.company_name || "")}: ${String(record.next_step || "Follow up")}`,
                                  source_type: "Application",
                                  source_id: String(record.id),
                                  linked_application_id: String(record.id),
                                  linked_company_id: String(record.company_id || ""),
                                });
                              }
                              if (slug === "networking") {
                                createActionItemFromSource({
                                  title: `Follow up with ${String(record.name)}`,
                                  source_type: "Networking",
                                  source_id: String(record.id),
                                  linked_contact_id: String(record.id),
                                  linked_company_id: String(record.company_id || ""),
                                });
                              }
                              if (slug === "mock-interviews") {
                                createActionItemFromSource({
                                  title: `Address mock feedback from ${formatDate(String(record.date || ""))}`,
                                  source_type: "Mock Interview",
                                  source_id: String(record.id),
                                  linked_mock_interview_id: String(record.id),
                                  linked_company_id: String(record.target_company_id || ""),
                                });
                              }
                              if (slug === "pars") {
                                createActionItemFromSource({
                                  title: `Improve PAR: ${String(record.title)}`,
                                  source_type: "PAR",
                                  source_id: String(record.id),
                                  linked_par_id: String(record.id),
                                });
                              }
                            }}
                            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
                          >
                            Add Action
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(record);
                            setModalOpen(true);
                          }}
                          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete this ${config.singular.toLowerCase()}?`)) {
                              deleteRecord(slug, String(record.id));
                            }
                          }}
                          className="rounded-full border border-rose-400/20 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-400/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState label={`No ${config.title.toLowerCase()} match this view yet.`} />
        )}
      </Card>

      {slug === "pars" ? <QuestionsSection /> : null}

      <RecordModal
        key={editing?.id ? String(editing.id) : "new"}
        title={editing ? `Edit ${config.singular}` : `Add ${config.singular}`}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        module={slug}
        initial={editing}
      />
    </div>
  );
}

export function ModuleView({ slug }: { slug: ModuleSlug }) {
  if (slug === "dashboard") return <DashboardView />;
  if (slug === "settings") return <SettingsView />;
  return <GenericModuleView slug={slug as CrudModuleSlug} />;
}
