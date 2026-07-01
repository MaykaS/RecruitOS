"use client";

import Link from "next/link";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  ApplicationInsight,
  ContactWorkflowInsight,
  CrudModuleSlug,
  FieldConfig,
  InterviewPrepPacket,
  MODULE_CONFIGS,
  ModuleSlug,
  Option,
  RECRUITING_TRACKS,
  RecruitOSData,
  SortDirection,
  SortOption,
  buildInterviewPrepPacket,
  formatDate,
  formatDateTime,
  getApplicationInsights,
  getLinkedActionItems,
  getNetworkingWorkflowInsights,
  getSourceSummary,
  getTopPriorityQueue,
  isActionDone,
  isInCurrentWeek,
  joinList,
  progressPercentage,
  resolveOptions,
  sortCaseSuggestions,
  sortParSuggestions,
  startOfWeek,
  toDateInput,
} from "@/lib/recruitos";
import { RESUME_BUCKET, uploadResumePdf } from "@/lib/supabase/storage";
import { useRecruitOS } from "@/lib/recruitos-store";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function buttonClassName(tone: "primary" | "secondary" | "quiet" = "secondary") {
  if (tone === "primary") {
    return "inline-flex h-8 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-sky-500 px-2.5 text-xs font-medium text-white shadow-[0_8px_18px_rgba(13,148,136,0.16)] transition hover:from-teal-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-60";
  }
  if (tone === "quiet") {
    return "inline-flex h-8 items-center justify-center rounded-full px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900";
  }
  return "inline-flex h-8 items-center justify-center rounded-full border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100";
}

function iconButtonClassName(tone: "default" | "danger" = "default") {
  return cx(
    "inline-flex items-center justify-center p-1 text-[1.05rem] leading-none transition",
    tone === "danger"
      ? "text-rose-500 hover:text-rose-700"
      : "text-slate-500 hover:text-slate-800",
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[1.05rem] w-[1.05rem]" aria-hidden="true">
      <path d="M4.5 15.5 5.2 12.8 12.85 5.15a1.24 1.24 0 0 1 1.77 0l.23.23a1.24 1.24 0 0 1 0 1.77L7.2 14.8 4.5 15.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.7 6.3 13.7 8.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[1.05rem] w-[1.05rem]" aria-hidden="true">
      <path d="M4.75 5.75h10.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8 5.75V4.9c0-.5.4-.9.9-.9h2.2c.5 0 .9.4.9.9v.85" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m6.1 5.75.55 8.3c.05.74.66 1.3 1.4 1.3h3.9c.74 0 1.35-.56 1.4-1.3l.55-8.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.6 8.5v4.1M11.4 8.5v4.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="m5.75 7.75 4.25 4.5 4.25-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[1.1rem] w-[1.1rem]" aria-hidden="true">
      <path d="m5.5 5.5 9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconButton({
  label,
  icon,
  tone = "default",
  onClick,
}: {
  label: string;
  icon: ReactNode;
  tone?: "default" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={iconButtonClassName(tone)}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

function sanitizeText(value: unknown) {
  return String(value ?? "")
    .replaceAll("Ã¢â‚¬â€", "-")
    .replaceAll("Ã‚Â·", " - ")
    .replaceAll("Â·", " - ")
    .replaceAll("Ã¢â‚¬â„¢", "'")
    .replaceAll("â€™", "'");
}

function getSortValue(value: unknown, option: SortOption) {
  if (option.type === "date") {
    if (!value) return null;
    const timestamp = new Date(String(value)).getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
  }

  if (option.type === "number") {
    if (typeof value === "number") return value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (option.type === "boolean") {
    if (typeof value === "boolean") return value ? 1 : 0;
    if (Array.isArray(value)) return value.length ? 1 : 0;
    if (typeof value === "string") return value.trim() ? 1 : 0;
    return value ? 1 : 0;
  }

  if (Array.isArray(value)) {
    return sanitizeText(joinList(value.map((item) => String(item)))).toLowerCase();
  }

  if (value == null) return "";
  return sanitizeText(String(value)).toLowerCase();
}

function compareSortValues(
  left: unknown,
  right: unknown,
  option: SortOption,
  direction: SortDirection,
) {
  const leftComparable = getSortValue(left, option);
  const rightComparable = getSortValue(right, option);
  const leftEmpty =
    leftComparable == null ||
    leftComparable === "" ||
    (Array.isArray(leftComparable) && leftComparable.length === 0);
  const rightEmpty =
    rightComparable == null ||
    rightComparable === "" ||
    (Array.isArray(rightComparable) && rightComparable.length === 0);

  if (leftEmpty && rightEmpty) return 0;
  if (leftEmpty) return 1;
  if (rightEmpty) return -1;

  let comparison = 0;

  if (option.order) {
    const leftIndex = option.order.findIndex(
      (item) => item.toLowerCase() === String(leftComparable).toLowerCase(),
    );
    const rightIndex = option.order.findIndex(
      (item) => item.toLowerCase() === String(rightComparable).toLowerCase(),
    );
    const normalizedLeftIndex = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
    const normalizedRightIndex = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
    comparison = normalizedLeftIndex - normalizedRightIndex;
    if (comparison === 0) {
      comparison = String(leftComparable).localeCompare(String(rightComparable));
    }
  } else if (typeof leftComparable === "number" && typeof rightComparable === "number") {
    comparison = leftComparable - rightComparable;
  } else {
    comparison = String(leftComparable).localeCompare(String(rightComparable));
  }

  return direction === "asc" ? comparison : comparison * -1;
}

function downloadJsonFile(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

function StatusBadge({
  value,
}: {
  value: string | number | boolean | string[];
}) {
  const label = Array.isArray(value) ? joinList(value) : String(value);
  const tone = label.toLowerCase();
  const className = tone.includes("done") || tone.includes("ready")
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
    : tone.includes("high") || tone.includes("critical") || tone.includes("overdue")
      ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
      : tone.includes("wait")
        ? "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100"
        : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

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
        <span className="text-slate-700">{label}</span>
        <span className="font-medium text-slate-500">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function CommandCenterAssignmentCard({
  eyebrow,
  title,
  details,
  actions,
}: {
  eyebrow: string;
  title: string;
  details: Array<{ label: string; value: string }>;
  actions: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-[320px] flex-col rounded-[26px] border border-slate-200/90 bg-white/94 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.028)]">
      <div className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
        {eyebrow}
      </div>
      <div className="mt-3 grid h-full grid-rows-[auto_1fr_auto]">
        <h3
          className="min-h-[4.1rem] max-w-[19ch] text-[1.16rem] leading-[1.06] font-semibold text-slate-900 md:text-[1.22rem]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {sanitizeText(title)}
        </h3>
        <dl className="space-y-3 border-t border-slate-100 pt-4">
          {details.map((detail) => (
            <div key={detail.label} className="space-y-1">
              <dt className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {detail.label}
              </dt>
              <dd className="text-[0.94rem] leading-6 text-slate-700">{sanitizeText(detail.value)}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {actions}
        </div>
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
    <section className="rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,251,252,0.92))] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-[1.2rem] font-semibold text-slate-900 [font-family:var(--font-display)]">
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}

function InsightBadge({ label }: { label: string }) {
  const tone = label.toLowerCase();
  const className = tone.includes("double") || tone.includes("ready")
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
    : tone.includes("apply") || tone.includes("prep")
      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
      : tone.includes("risk") || tone.includes("drop") || tone.includes("waiting")
        ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
        : "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100";
  return <span className={cx("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", className)}>{label}</span>;
}

function MiniList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <div className="space-y-1.5">
      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[0.77rem] text-slate-600"
          >
            {sanitizeText(item)}
          </span>
        ))}
      </div>
    </div>
  );
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function buildStarPracticePrompt({
  title,
  question,
  durationLabel,
  followUpCount,
}: {
  title: string;
  question: string;
  durationLabel: string;
  followUpCount: number;
}) {
  return [
    "You are my MBA behavioral interview coach.",
    `Ask me this interview question: "${question}".`,
    `I will answer using my STAR story titled "${title}".`,
    `Time me for ${durationLabel}.`,
    followUpCount > 0
      ? `After my initial answer, ask ${followUpCount} concise interviewer-style follow-up question${followUpCount === 1 ? "" : "s"}, one at a time, the way a real interviewer would.`
      : "Do not ask follow-up questions after my initial answer.",
    "After I answer, give concise feedback on structure, clarity, specificity, leadership, and impact.",
    "Then score me from 1-5 on delivery, structure, and confidence, and tell me the single most important fix for the next rep.",
  ].join("\n");
}

function buildCasePracticePrompt({
  question,
  questionType,
  framework,
  durationLabel,
  probeCount,
}: {
  question: string;
  questionType: string;
  framework: string;
  durationLabel?: string;
  probeCount: number;
}) {
  return [
    "You are my MBA case interview coach.",
    `Run this ${questionType || "case"} interview question with me: "${question}".`,
    framework
      ? `I plan to use this framework to structure my answer: "${framework}".`
      : "Let me choose the framework as I work through the case.",
    durationLabel ? `If useful, roughly keep me moving with a ${durationLabel} answer window.` : "",
    "Act like a live interviewer. Ask the question first, let me drive the case step by step, and do not solve it for me too early.",
    probeCount > 0
      ? `During the case, push back like a real interviewer and ask about ${probeCount} concise probing follow-up question${probeCount === 1 ? "" : "s"} at natural moments to test my assumptions, math, prioritization, or next step.`
      : "Let me drive the case with minimal interruptions unless I get stuck or ask for clarification.",
    "After I finish, give concise feedback on structure, analysis, communication, synthesis, and whether my framework actually fit the question.",
    "Then score me from 1-5 on structure, analysis, communication, and overall performance, and tell me the single most important fix for the next rep.",
  ]
    .filter(Boolean)
    .join("\n");
}

function PracticeStarModal({
  open,
  onClose,
  storyId,
}: {
  open: boolean;
  onClose: () => void;
  storyId: string | null;
}) {
  const { data, logParPractice } = useRecruitOS();
  const story = data.parStories.find((item) => item.id === storyId) ?? null;
  const questionOptions = useMemo(() => {
    if (!story) return [];
    return story.linked_question_ids
      .map((questionId) => data.interviewQuestions.find((question) => question.id === questionId))
      .filter((question): question is RecruitOSData["interviewQuestions"][number] => Boolean(question));
  }, [data.interviewQuestions, story]);
  const initialQuestionId =
    questionOptions[0]?.id ?? data.interviewQuestions[0]?.id ?? "";
  const [questionId, setQuestionId] = useState(initialQuestionId);
  const [duration, setDuration] = useState(120);
  const [followUpCount, setFollowUpCount] = useState(2);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [running, setRunning] = useState(false);
  const [answerNotes, setAnswerNotes] = useState("");
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [nextFix, setNextFix] = useState("");
  const [deliveryScore, setDeliveryScore] = useState(4);
  const [structureScore, setStructureScore] = useState(4);
  const [confidenceScore, setConfidenceScore] = useState(4);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, running]);

  if (!open || !story) return null;

  const selectedQuestion =
    questionOptions.find((question) => question.id === questionId)?.question_text ||
    "Ask me a behavioral question that this STAR story can answer.";
  const durationLabel =
    duration === 60 ? "60 seconds" : duration === 120 ? "2 minutes" : "3 minutes";
  const prompt = buildStarPracticePrompt({
    title: story.title,
    question: selectedQuestion,
    durationLabel,
    followUpCount,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,252,0.98))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="sticky top-0 z-20 -mx-6 -mt-6 mb-5 flex items-start justify-between gap-4 border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,252,0.98))] px-6 py-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
              STAR Practice
            </p>
            <h3 className="text-xl font-semibold text-slate-900">{sanitizeText(story.title)}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sticky top-4 inline-flex items-center justify-center p-1 text-[1.35rem] leading-none text-slate-400 transition hover:text-slate-700"
            aria-label="Close practice modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="space-y-4">
            <div className="grid gap-4 rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Question</span>
                <select
                  value={questionId}
                  onChange={(event) => setQuestionId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-300 focus:bg-white"
                >
                  {questionOptions.length ? (
                    questionOptions.map((question) => (
                      <option key={question.id} value={question.id}>
                        {sanitizeText(question.question_text)}
                      </option>
                    ))
                  ) : (
                    <option value="">No linked questions yet</option>
                  )}
                </select>
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-700">Interviewer follow-ups</span>
                  <span className="text-xs text-slate-500">
                    {followUpCount === 0
                      ? "No follow-ups"
                      : `${followUpCount} follow-up${followUpCount === 1 ? "" : "s"} selected`}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[0, 1, 2, 3, 4].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFollowUpCount(value)}
                      className={cx(
                        "rounded-full border px-3 py-1.5 text-xs transition",
                        followUpCount === value
                          ? "border-teal-200 bg-cyan-50 text-teal-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      {value === 0 ? "None" : value}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Use 2 for a realistic default, or change it based on how intense you want the rep to feel.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-700">Timer</div>
                  <div className="mt-1 text-[2rem] font-semibold text-slate-900 [font-family:var(--font-display)]">
                    {formatTimer(secondsLeft)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[60, 120, 180].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setDuration(value);
                        setSecondsLeft(value);
                        setRunning(false);
                      }}
                      className={cx(
                        "rounded-full border px-3 py-1.5 text-xs transition",
                        duration === value
                          ? "border-teal-200 bg-cyan-50 text-teal-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      {value === 60 ? "60 sec" : value === 120 ? "2 min" : "3 min"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setRunning((current) => !current)}
                  className={buttonClassName("primary")}
                >
                  {running ? "Pause" : "Start Timer"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRunning(false);
                    setSecondsLeft(duration);
                  }}
                  className={buttonClassName("secondary")}
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="space-y-4 rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-700">GPT Practice Prompt</div>
                  <div className="text-xs text-slate-500">
                    Copy this into GPT to run the live coaching rep with {followUpCount} interviewer-style follow-up{followUpCount === 1 ? "" : "s"}.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(prompt);
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 2000);
                    }}
                    className={buttonClassName("secondary")}
                  >
                    {copied ? "Copied" : "Copy Prompt"}
                  </button>
                  <a
                    href="https://chatgpt.com/"
                    target="_blank"
                    rel="noreferrer"
                    className={buttonClassName("secondary")}
                  >
                    Open GPT
                  </a>
                </div>
              </div>
              <textarea
                readOnly
                value={prompt}
                rows={6}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { label: "Delivery", score: deliveryScore, setScore: setDeliveryScore },
                { label: "Structure", score: structureScore, setScore: setStructureScore },
                { label: "Confidence", score: confidenceScore, setScore: setConfidenceScore },
              ].map(({ label, score, setScore }) => (
                <label key={label} className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <select
                    value={score}
                    onChange={(event) => setScore(Number(event.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-300 focus:bg-white"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value}/5
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <div className="space-y-4 rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Answer notes</span>
                <textarea
                  value={answerNotes}
                  onChange={(event) => setAnswerNotes(event.target.value)}
                  rows={4}
                  placeholder="Paste your answer summary or quick notes from the rep."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Feedback notes</span>
                <textarea
                  value={feedbackNotes}
                  onChange={(event) => setFeedbackNotes(event.target.value)}
                  rows={4}
                  placeholder="Record the GPT feedback or your own takeaways."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Next fix</span>
                <textarea
                  value={nextFix}
                  onChange={(event) => setNextFix(event.target.value)}
                  rows={3}
                  placeholder="What will you improve on the next rep?"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
                />
              </label>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={buttonClassName("secondary")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logParPractice(story.id, {
                      prompt_used: selectedQuestion,
                      version_practiced: "Polished",
                      delivery_score: deliveryScore,
                      structure_score: structureScore,
                      confidence_score: confidenceScore,
                      notes: [answerNotes && `Answer notes:\n${answerNotes}`, feedbackNotes && `Feedback:\n${feedbackNotes}`]
                        .filter(Boolean)
                        .join("\n\n"),
                      next_fix: nextFix,
                    });
                    onClose();
                  }}
                  className={buttonClassName("primary")}
                >
                  Save Practice Log
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PracticeCaseModal({
  open,
  onClose,
  caseId,
}: {
  open: boolean;
  onClose: () => void;
  caseId: string | null;
}) {
  const { data, logCasePractice } = useRecruitOS();
  const caseRecord = data.cases.find((item) => item.id === caseId) ?? null;
  const [useTimer, setUseTimer] = useState(false);
  const [duration, setDuration] = useState(120);
  const [probeCount, setProbeCount] = useState(2);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [running, setRunning] = useState(false);
  const [frameworkUsed, setFrameworkUsed] = useState(() => caseRecord?.framework_used ?? "");
  const [answerNotes, setAnswerNotes] = useState("");
  const [structureScore, setStructureScore] = useState(4);
  const [analysisScore, setAnalysisScore] = useState(4);
  const [communicationScore, setCommunicationScore] = useState(4);
  const [overallScore, setOverallScore] = useState(4);
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [nextFix, setNextFix] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [redoNeeded, setRedoNeeded] = useState(false);
  const [createTip, setCreateTip] = useState(false);
  const [tipScopeType, setTipScopeType] = useState("Question Type");
  const [tipTitle, setTipTitle] = useState("");
  const [tipText, setTipText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, running]);

  if (!open || !caseRecord) return null;

  const durationLabel =
    duration === 60 ? "60 seconds" : duration === 120 ? "2 minutes" : "3 minutes";
  const prompt = buildCasePracticePrompt({
    question: caseRecord.title,
    questionType: caseRecord.case_type,
    framework: frameworkUsed,
    durationLabel: useTimer ? durationLabel : undefined,
    probeCount,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,252,0.98))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="sticky top-0 z-20 -mx-6 -mt-6 mb-5 flex items-start justify-between gap-4 border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,252,0.98))] px-6 py-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
              Case Practice
            </p>
            <h3 className="text-xl font-semibold text-slate-900">
              {sanitizeText(caseRecord.title)}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>{sanitizeText(caseRecord.case_type)}</span>
              {caseRecord.source ? <span>- {sanitizeText(caseRecord.source)}</span> : null}
              {caseRecord.difficulty ? <span>- {sanitizeText(caseRecord.difficulty)}</span> : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sticky top-4 inline-flex items-center justify-center p-1 text-[1.35rem] leading-none text-slate-400 transition hover:text-slate-700"
            aria-label="Close case practice modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <div className="text-sm font-medium text-slate-700">Framework used</div>
              <input
                value={frameworkUsed}
                onChange={(event) => setFrameworkUsed(event.target.value)}
                placeholder="Type the framework you used for this question"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
              />
              <div className="mt-2 text-xs text-slate-500">
                Framework suggestions for each question type can stay empty until you add your own.
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-700">Interviewer probes</span>
                  <span className="text-xs text-slate-500">
                    {probeCount === 0
                      ? "Minimal interruptions"
                      : `${probeCount} probe${probeCount === 1 ? "" : "s"} selected`}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[0, 1, 2, 3, 4].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setProbeCount(value)}
                      className={cx(
                        "rounded-full border px-3 py-1.5 text-xs transition",
                        probeCount === value
                          ? "border-teal-200 bg-cyan-50 text-teal-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      {value === 0 ? "Light" : value}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Use 2 for a realistic default, or increase it if you want more pushback during the case.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-700">Practice format</div>
                  <div className="mt-1 text-sm text-slate-500">
                    Cases are usually not strictly timed. Turn the timer on only if you want a paced rep.
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={useTimer}
                    onChange={(event) => {
                      const enabled = event.target.checked;
                      setUseTimer(enabled);
                      setRunning(false);
                      setSecondsLeft(duration);
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  Use timer for this rep
                </label>
              </div>
              {useTimer ? (
                <>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[2rem] font-semibold text-slate-900 [font-family:var(--font-display)]">
                      {formatTimer(secondsLeft)}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {[60, 120, 180].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setDuration(value);
                            setSecondsLeft(value);
                            setRunning(false);
                          }}
                          className={cx(
                            "rounded-full border px-3 py-1.5 text-xs transition",
                            duration === value
                              ? "border-teal-200 bg-cyan-50 text-teal-700"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                          )}
                        >
                          {value === 60 ? "60 sec" : value === 120 ? "2 min" : "3 min"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setRunning((current) => !current)}
                      className={buttonClassName("primary")}
                    >
                      {running ? "Pause" : "Start Timer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRunning(false);
                        setSecondsLeft(duration);
                      }}
                      className={buttonClassName("secondary")}
                    >
                      Reset
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                  Use GPT like a live interviewer, then save the feedback and next fix here.
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-700">GPT Case Prompt</div>
                    <div className="text-xs text-slate-500">
                      Copy this into GPT to run the live case rep with {probeCount} interviewer probe{probeCount === 1 ? "" : "s"}. Every save creates a new practice log for this same question.
                    </div>
                  </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(prompt);
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 2000);
                    }}
                    className={buttonClassName("secondary")}
                  >
                    {copied ? "Copied" : "Copy Prompt"}
                  </button>
                  <a
                    href="https://chatgpt.com/"
                    target="_blank"
                    rel="noreferrer"
                    className={buttonClassName("secondary")}
                  >
                    Open GPT
                  </a>
                </div>
              </div>
              <textarea
                readOnly
                value={prompt}
                rows={7}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              {[
                { label: "Structure", score: structureScore, setScore: setStructureScore },
                { label: "Analysis", score: analysisScore, setScore: setAnalysisScore },
                { label: "Communication", score: communicationScore, setScore: setCommunicationScore },
                { label: "Overall", score: overallScore, setScore: setOverallScore },
              ].map(({ label, score, setScore }) => (
                <label key={label} className="min-w-0 space-y-2">
                  <span className="block text-sm font-medium text-slate-700">{label}</span>
                  <select
                    value={score}
                    onChange={(event) => setScore(Number(event.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-300 focus:bg-white"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value}/5
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <div className="space-y-4 rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Answer notes</span>
                <textarea
                  value={answerNotes}
                  onChange={(event) => setAnswerNotes(event.target.value)}
                  rows={4}
                  placeholder="Capture your structure, key assumptions, and how you worked through the case."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">GPT feedback</span>
                <textarea
                  value={feedbackNotes}
                  onChange={(event) => setFeedbackNotes(event.target.value)}
                  rows={4}
                  placeholder="Paste the GPT evaluation or your core takeaways."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Next fix</span>
                <textarea
                  value={nextFix}
                  onChange={(event) => setNextFix(event.target.value)}
                  rows={3}
                  placeholder="What should you change next time?"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Session notes</span>
                <textarea
                  value={sessionNotes}
                  onChange={(event) => setSessionNotes(event.target.value)}
                  rows={3}
                  placeholder="Where you got stuck, what felt strong, or anything worth remembering."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={redoNeeded}
                  onChange={(event) => setRedoNeeded(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                Mark this case for another rep
              </label>
            </div>

            <div className="space-y-4 rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={createTip}
                  onChange={(event) => setCreateTip(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                Promote a reusable casing tip from this rep
              </label>
              {createTip ? (
                <div className="grid gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Tip scope</span>
                    <select
                      value={tipScopeType}
                      onChange={(event) => setTipScopeType(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-300 focus:bg-white"
                    >
                      {["Question", "Question Type", "General"].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Tip title</span>
                    <input
                      value={tipTitle}
                      onChange={(event) => setTipTitle(event.target.value)}
                      placeholder="Short label for the learning"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Tip text</span>
                    <textarea
                      value={tipText}
                      onChange={(event) => setTipText(event.target.value)}
                      rows={3}
                      placeholder="Write the recurring insight you want to keep."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
                    />
                  </label>
                </div>
              ) : null}
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={buttonClassName("secondary")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logCasePractice(caseRecord.id, {
                      framework_used: frameworkUsed,
                      structure_score: structureScore,
                      analysis_score: analysisScore,
                      communication_score: communicationScore,
                      overall_score: overallScore,
                      gpt_feedback: feedbackNotes,
                      next_fix: nextFix,
                      redo_needed: redoNeeded,
                      notes: [answerNotes && `Answer notes:\n${answerNotes}`, sessionNotes && `Session notes:\n${sessionNotes}`]
                        .filter(Boolean)
                        .join("\n\n"),
                      create_tip: createTip,
                      tip_scope_type: tipScopeType,
                      tip_title: tipTitle,
                      tip_text: tipText || nextFix || feedbackNotes,
                    });
                    onClose();
                  }}
                  className={buttonClassName("primary")}
                >
                  Save Practice Log
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function openRecordEditor(
  record: Record<string, unknown>,
  setEditing: React.Dispatch<React.SetStateAction<Record<string, unknown> | null>>,
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
) {
  setEditing(record);
  setModalOpen(true);
}

function renderValue(value: unknown) {
  if (Array.isArray(value)) {
    if (!value.length) return "-";
    return sanitizeText(joinList(value.map((item) => String(item))));
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (!value) return "-";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return sanitizeText(formatDateTime(value));
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return sanitizeText(formatDate(value));
  }
  return sanitizeText(String(value));
}

function isReferenceField(field: FieldConfig) {
  return field.key.endsWith("_id");
}

function collectExistingOptionValues(
  data: RecruitOSData,
  module: CrudModuleSlug,
  key: string,
) {
  const values = new Set<string>();
  const collectionKey = MODULE_CONFIGS[module].collection;
  const collection = data[collectionKey];

  if (Array.isArray(collection)) {
    collection.forEach((item) => {
      if (!item || typeof item !== "object" || !(key in item)) return;
      const value = (item as unknown as Record<string, unknown>)[key];
      if (typeof value === "string" && value.trim()) {
        values.add(value.trim());
      }
      if (Array.isArray(value)) {
        value.forEach((entry) => {
          if (typeof entry === "string" && entry.trim()) {
            values.add(entry.trim());
          }
        });
      }
    });
  }

  return [...values];
}

function EditableSelectInput({
  value,
  options,
  onChange,
  placeholder,
  allowCustom,
}: {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder: string;
  allowCustom: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedLabel = options.find((option) => option.value === value)?.label ?? value ?? "";

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const normalized = query.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  const exactMatch = options.some((option) => option.label.toLowerCase() === query.trim().toLowerCase());

  return (
    <div className="relative">
      <div className="relative">
        <input
          value={open ? query : selectedLabel}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setQuery("");
            setOpen((current) => !current);
          }}
          className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
        >
          <ChevronDownIcon />
        </button>
      </div>
      {open ? (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {allowCustom && query.trim() && !exactMatch ? (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  const nextValue = query.trim();
                  onChange(nextValue);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <span>Add {`"${query.trim()}"`}</span>
                <span className="text-xs uppercase tracking-[0.16em] text-teal-600">New</span>
              </button>
            ) : null}
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option.value);
                  setQuery("");
                  setOpen(false);
                }}
                className={cx(
                  "w-full rounded-xl px-3 py-2 text-left text-sm",
                  option.value === value
                    ? "bg-cyan-50 text-teal-700"
                    : "text-slate-700 hover:bg-slate-50",
                )}
              >
                {option.label}
              </button>
            ))}
            {!filteredOptions.length && !(allowCustom && query.trim() && !exactMatch) ? (
              <div className="px-3 py-2 text-sm text-slate-500">No matches yet.</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SearchableMultiSelectInput({
  value,
  options,
  onChange,
  placeholder,
  allowCustom,
}: {
  value: string[];
  options: Option[];
  onChange: (value: string[]) => void;
  placeholder: string;
  allowCustom: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const normalized = query.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  const exactMatch = options.some((option) => option.label.toLowerCase() === query.trim().toLowerCase());
  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);

  return (
    <div className="relative space-y-2">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm text-slate-900"
      >
        <span className="truncate">
          {selectedLabels.length ? `${selectedLabels.length} selected` : placeholder}
        </span>
        <span className="text-slate-500">
          <ChevronDownIcon />
        </span>
      </button>
      {selectedLabels.length ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedLabels.slice(0, 6).map((label) => (
            <span key={label} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
              {label}
            </span>
          ))}
          {selectedLabels.length > 6 ? (
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
              +{selectedLabels.length - 6}
            </span>
          ) : null}
        </div>
      ) : null}
      {open ? (
        <div className="absolute z-30 mt-1 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search..."
            className="mb-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
          />
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {allowCustom && query.trim() && !exactMatch ? (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  const nextValue = query.trim();
                  onChange(Array.from(new Set([...value, nextValue])));
                  setQuery("");
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <span>Add {`"${query.trim()}"`}</span>
                <span className="text-xs uppercase tracking-[0.16em] text-teal-600">New</span>
              </button>
            ) : null}
            {filteredOptions.map((option) => {
              const checked = value.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={cx(
                    "flex cursor-pointer items-start gap-2 rounded-xl px-3 py-2 text-sm",
                    checked ? "bg-cyan-50 text-teal-700" : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      const nextValues = event.target.checked
                        ? [...value, option.value]
                        : value.filter((item) => item !== option.value);
                      onChange(Array.from(new Set(nextValues)));
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-400"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
            {!filteredOptions.length && !(allowCustom && query.trim() && !exactMatch) ? (
              <div className="px-3 py-2 text-sm text-slate-500">No matches yet.</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FieldInput({
  module,
  field,
  data,
  value,
  onChange,
}: {
  module: CrudModuleSlug;
  field: FieldConfig;
  data: RecruitOSData;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const baseOptions = resolveOptions(field.options, data);
  const options = (() => {
    const merged = new Map(baseOptions.map((option) => [option.value, option]));
    collectExistingOptionValues(data, module, field.key).forEach((item) => {
      if (!merged.has(item)) merged.set(item, { label: item, value: item });
    });
    return [...merged.values()];
  })();

  if (field.type === "textarea") {
    return (
      <textarea
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
      />
    );
  }

  if (field.type === "select") {
    return (
      <EditableSelectInput
        value={String(value ?? "")}
        options={options}
        onChange={onChange}
        placeholder={field.placeholder ?? "Type or choose a saved option"}
        allowCustom={!isReferenceField(field)}
      />
    );
  }

  if (field.type === "multiselect") {
    const selected = Array.isArray(value) ? value.map(String) : [];
    const pickerLabel =
      field.key === "linked_question_ids"
        ? "Choose interview questions"
        : field.key === "linked_contact_ids"
          ? "Choose linked contacts"
          : field.key === "tags"
            ? "Choose or add tags"
          : `Choose ${field.label.toLowerCase()}`;

    return (
      <SearchableMultiSelectInput
        value={selected}
        options={options}
        onChange={onChange as (value: string[]) => void}
        placeholder={pickerLabel}
        allowCustom={field.key === "tags"}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
        <input
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 bg-white"
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
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
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
  const initialForm = useMemo(
    () => ({ ...config.defaultValues, ...(initial ?? {}) }),
    [config.defaultValues, initial],
  );
  const [form, setForm] = useState<Record<string, unknown>>(initialForm);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const companyNameValue =
    module === "networking" || module === "applications"
      ? String(form.company_name ?? initial?.company_name ?? "")
      : "";

  if (!open) return null;

  const linkedActions =
    initial?.id && module !== "action-items"
      ? getLinkedActionItems(data, module, String(initial.id))
      : [];
  const practiceLogs =
    initial?.id && module === "pars"
      ? (data.parPracticeLogs ?? [])
          .filter((log) => log.par_story_id === String(initial.id))
          .sort((left, right) =>
            String(right.created_at ?? "").localeCompare(String(left.created_at ?? "")),
          )
      : [];
  const casePracticeLogs =
    initial?.id && module === "cases"
      ? (data.casePracticeLogs ?? [])
          .filter((log) => log.case_id === String(initial.id))
          .sort((left, right) =>
            String(right.created_at ?? "").localeCompare(String(left.created_at ?? "")),
          )
      : [];
  const caseLearnings =
    initial?.id && module === "cases"
      ? (data.caseLearnings ?? []).filter(
          (learning) =>
            learning.linked_case_id === String(initial.id) ||
            learning.linked_question_type === String(initial.case_type || ""),
        )
      : [];
  const companyNetworkingContacts =
    initial?.id && module === "companies"
      ? data.contacts
          .filter((contact) => {
            const companyId = String(initial.id);
            const manuallyLinked = Array.isArray(initial.linked_contact_ids)
              ? initial.linked_contact_ids.map(String).includes(contact.id)
              : false;
            return contact.company_id === companyId || manuallyLinked;
          })
          .sort((left, right) => left.name.localeCompare(right.name))
      : [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,252,0.98))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="sticky top-0 z-20 -mx-6 -mt-6 mb-5 flex items-start justify-between gap-4 border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,252,0.98))] px-6 py-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
              {config.title}
            </p>
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sticky top-4 inline-flex items-center justify-center p-1 text-[1.35rem] leading-none text-slate-400 transition hover:text-slate-700"
            aria-label="Close form"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {config.fields.map((field) => {
            if ((module === "networking" || module === "applications") && field.key === "company_id") {
              return (
                <label
                  key={field.key}
                  className="space-y-2 rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                >
                  <span className="text-sm font-medium text-slate-700">{field.label}</span>
                  <input
                    list="networking-company-options"
                    value={companyNameValue}
                    onChange={(event) => {
                      const nextCompanyName = event.target.value;
                      const matchingCompany = data.companies.find(
                        (company) =>
                          company.name.trim().toLowerCase() === nextCompanyName.trim().toLowerCase(),
                      );

                      setForm((current) => ({
                        ...current,
                        company_name: nextCompanyName,
                        company_id: matchingCompany?.id ?? "",
                      }));
                    }}
                    placeholder={
                      module === "applications"
                        ? "Type the company you applied to or pick an existing one"
                        : "Type a company or pick an existing one"
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
                  />
                  <datalist id="networking-company-options">
                    {data.companies.map((company) => (
                      <option key={company.id} value={company.name} />
                    ))}
                  </datalist>
                  <p className="text-xs leading-5 text-slate-500">
                    {module === "applications"
                      ? "Applications create target company records from this field automatically."
                      : "Typing a company here keeps it on the contact unless you intentionally link an existing target company."}
                  </p>
                </label>
              );
            }

            return (
              <label
                key={field.key}
                className={cx(
                  "space-y-2 rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]",
                  field.type === "textarea" ||
                    (field.type === "multiselect" &&
                      !(module === "pars" && field.key === "linked_question_ids"))
                    ? "lg:col-span-2"
                    : "",
                )}
              >
                <span className="text-sm font-medium text-slate-700">{field.label}</span>
                <FieldInput
                  module={module}
                  field={field}
                  data={data}
                  value={form[field.key]}
                  onChange={(nextValue) =>
                    setForm((current) => ({ ...current, [field.key]: nextValue }))
                  }
                />
              </label>
            );
          })}
        </div>

        {module === "resumes" ? (
          <div className="mt-4 rounded-[24px] border border-dashed border-cyan-200 bg-cyan-50/60 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-900">Resume PDF Upload</div>
                <p className="text-sm text-slate-600">
                  Upload the PDF to Supabase Storage bucket{" "}
                  <span className="font-medium text-slate-900">{RESUME_BUCKET}</span>. The public
                  link will be saved to this resume version automatically.
                </p>
              </div>
              <label className={cx(buttonClassName("secondary"), "cursor-pointer")}>
                <input
                  accept=".pdf,application/pdf"
                  className="hidden"
                  disabled={isUploadingResume}
                  type="file"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setUploadError("");
                    setIsUploadingResume(true);

                    try {
                      const upload = await uploadResumePdf(file);
                      setForm((current) => ({
                        ...current,
                        file_link: upload.url,
                        last_updated_date:
                          String(current.last_updated_date || "") ||
                          toDateInput(new Date().toISOString()),
                        name:
                          String(current.name || "").trim() ||
                          file.name.replace(/\.pdf$/i, ""),
                      }));
                    } catch (error) {
                      setUploadError(
                        error instanceof Error
                          ? error.message
                          : "Resume upload failed. Please try again.",
                      );
                    } finally {
                      setIsUploadingResume(false);
                      event.target.value = "";
                    }
                  }}
                />
                {isUploadingResume ? "Uploading PDF..." : "Upload PDF"}
              </label>
            </div>

            {uploadError ? (
              <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {uploadError}
              </div>
            ) : null}

            {String(form.file_link || "").trim() ? (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Stored File
                  </div>
                  <div className="truncate text-sm font-medium text-slate-900">
                    {String(form.file_link)}
                  </div>
                </div>
                <a
                  className={buttonClassName("secondary")}
                  href={String(form.file_link)}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open PDF
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        {module === "pars" && practiceLogs.length > 0 ? (
          <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-900">Practice history</div>
            <div className="space-y-3">
              {practiceLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{renderValue(log.date)}</span>
                    <span>D {log.delivery_score}/5</span>
                    <span>-</span>
                    <span>S {log.structure_score}/5</span>
                    <span>-</span>
                    <span>C {log.confidence_score}/5</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Question:</span>{" "}
                    {sanitizeText(log.prompt_used)}
                  </div>
                  {log.next_fix ? (
                    <div className="mt-2 text-sm text-slate-700">
                      <span className="font-medium text-slate-900">Next fix:</span>{" "}
                      {sanitizeText(log.next_fix)}
                    </div>
                  ) : null}
                  {log.notes ? (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700">
                      {sanitizeText(log.notes)}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {module === "cases" && casePracticeLogs.length > 0 ? (
          <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-900">
              Practice history ({casePracticeLogs.length} rep{casePracticeLogs.length === 1 ? "" : "s"})
            </div>
            <div className="space-y-3">
              {casePracticeLogs.map((log, index) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">
                      Rep {casePracticeLogs.length - index}
                    </span>
                    <span>-</span>
                    <span>{renderValue(log.date)}</span>
                    <span>Overall {log.overall_score}/5</span>
                    <span>-</span>
                    <span>Structure {log.structure_score}/5</span>
                    <span>-</span>
                    <span>Analysis {log.analysis_score}/5</span>
                    <span>-</span>
                    <span>Communication {log.communication_score}/5</span>
                  </div>
                  {log.framework_used ? (
                    <div className="mt-2 text-sm text-slate-700">
                      <span className="font-medium text-slate-900">Framework:</span>{" "}
                      {sanitizeText(log.framework_used)}
                    </div>
                  ) : null}
                  {log.next_fix ? (
                    <div className="mt-2 text-sm text-slate-700">
                      <span className="font-medium text-slate-900">Next fix:</span>{" "}
                      {sanitizeText(log.next_fix)}
                    </div>
                  ) : null}
                  {log.gpt_feedback ? (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700">
                      {sanitizeText(log.gpt_feedback)}
                    </div>
                  ) : null}
                  {log.notes ? (
                    <div className="mt-3 text-sm whitespace-pre-line text-slate-600">
                      {sanitizeText(log.notes)}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {module === "cases" && caseLearnings.length > 0 ? (
          <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-900">Recurring tips</div>
            <div className="space-y-3">
              {caseLearnings.map((learning) => (
                <div
                  key={learning.id}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                    <span>{sanitizeText(learning.scope_type)}</span>
                    {learning.linked_question_type ? (
                      <span>- {sanitizeText(learning.linked_question_type)}</span>
                    ) : null}
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-900">
                    {sanitizeText(learning.title)}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">
                    {sanitizeText(learning.tip_text)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {module === "companies" && companyNetworkingContacts.length > 0 ? (
          <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-900">
              Networking connections ({companyNetworkingContacts.length})
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {companyNetworkingContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="text-sm font-medium text-slate-900">
                    {sanitizeText(contact.name)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {sanitizeText(contact.role || "Contact")}
                    {contact.company_name ? ` - ${sanitizeText(contact.company_name)}` : ""}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Strength {contact.relationship_strength}/5
                    {contact.next_follow_up_date
                      ? ` - follow-up ${sanitizeText(renderValue(contact.next_follow_up_date))}`
                      : ""}
                  </div>
                  {contact.tags.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {contact.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600"
                        >
                          {sanitizeText(tag)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {linkedActions.length > 0 ? (
          <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-900">Linked action items</div>
            {linkedActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-3 py-3"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">{action.title}</div>
                  <div className="text-xs text-slate-500">
                    {action.priority} - {renderValue(action.due_date)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleActionItem(action.id)}
                  className={buttonClassName("secondary")}
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
            className={buttonClassName("secondary")}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isUploadingResume}
            onClick={() => {
              saveRecord(module, {
                ...form,
                id: initial?.id ? String(initial.id) : undefined,
              });
              onClose();
            }}
            className={buttonClassName("primary")}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const APPLICATION_BUCKET_ORDER: ApplicationInsight["applicationStrategyLabel"][] = [
  "Double Down",
  "Apply This Week",
  "Network First",
  "At Risk",
  "Waiting Too Long",
  "Drop",
];

const CONTACT_BUCKET_ORDER: ContactWorkflowInsight["contactNextBestAction"][] = [
  "Follow Up Now",
  "Prep For Conversation",
  "Ask For Referral",
  "Convert To Application",
  "Log Takeaways",
  "Send Outreach",
];

function PipelineTriageSection({
  insights,
  createActionItemFromSource,
}: {
  insights: ApplicationInsight[];
  createActionItemFromSource: ReturnType<typeof useRecruitOS>["createActionItemFromSource"];
}) {
  return (
    <Card title="Pipeline Triage">
      <div className="space-y-4">
        {APPLICATION_BUCKET_ORDER.map((label) => {
          const items = insights.filter((insight) => insight.applicationStrategyLabel === label).slice(0, 3);
          if (!items.length) return null;
          return (
            <div key={label} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <InsightBadge label={label} />
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {items.length} in focus
                </div>
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                {items.map((insight) => (
                  <div key={insight.application.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {sanitizeText(insight.application.company_name)} - {sanitizeText(insight.application.role_title)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {sanitizeText(insight.application.status)} - {sanitizeText(insight.dueLabel)}
                        </div>
                      </div>
                      <StatusBadge value={insight.applicationPriorityScore} />
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{sanitizeText(insight.primaryReason)}</p>
                    <MiniList title="Drivers" items={insight.applicationRiskFlags.slice(0, 4)} />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          createActionItemFromSource({
                            title:
                              label === "Network First"
                                ? `Referral ask for ${insight.application.company_name}`
                                : label === "Apply This Week"
                                  ? `Submit ${insight.application.company_name} application`
                                  : label === "Waiting Too Long"
                                    ? `Re-engage ${insight.application.company_name}`
                                    : `${insight.application.company_name}: ${insight.application.next_step || "Recruiter follow-up"}`,
                            source_type: "Application",
                            source_id: insight.application.id,
                            linked_application_id: insight.application.id,
                            linked_company_id: insight.application.company_id,
                          })
                        }
                        className={buttonClassName("secondary")}
                      >
                        {label === "Network First"
                          ? "Referral Ask"
                          : label === "Apply This Week"
                            ? "Submit Application"
                            : label === "Waiting Too Long"
                              ? "Re-Engage"
                              : "Recruiter Follow-Up"}
                      </button>
                      <Link href="/applications" className={buttonClassName("quiet")}>
                        Open Pipeline
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function NetworkingWorkflowSection({
  insights,
  markFollowUpDone,
  openContactEditor,
}: {
  insights: ContactWorkflowInsight[];
  markFollowUpDone: ReturnType<typeof useRecruitOS>["markFollowUpDone"];
  openContactEditor: (contact: RecruitOSData["contacts"][number], mode?: "takeaway") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const bucketCounts = CONTACT_BUCKET_ORDER.map((label) => ({
    label,
    count: insights.filter((insight) => insight.contactNextBestAction === label).length,
  })).filter((bucket) => bucket.count > 0);

  return (
    <Card
      title="Networking Execution"
      actions={
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className={buttonClassName("secondary")}
          aria-expanded={expanded}
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            {insights.length} contact{insights.length === 1 ? "" : "s"} ranked
          </span>
          {bucketCounts.map((bucket) => (
            <span
              key={bucket.label}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
            >
              {bucket.label}: {bucket.count}
            </span>
          ))}
        </div>

        {expanded ? CONTACT_BUCKET_ORDER.map((label) => {
          const items = insights.filter((insight) => insight.contactNextBestAction === label).slice(0, 2);
          if (!items.length) return null;
          return (
            <div key={label} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <InsightBadge label={label} />
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {items.length} contact{items.length === 1 ? "" : "s"}
                </div>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {items.map((insight) => (
                  <div
                    key={insight.contact.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openContactEditor(insight.contact)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openContactEditor(insight.contact);
                      }
                    }}
                    className="cursor-pointer rounded-[24px] border border-slate-200 bg-slate-50 p-4 transition hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {sanitizeText(insight.contact.name)} - {sanitizeText(insight.company?.name || insight.contact.company_name || "Networking")}
                        </div>
                        <div className="text-xs text-slate-500">
                          {sanitizeText(insight.contact.role || "Contact")} - strength {insight.contact.relationship_strength}/5
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{sanitizeText(insight.primaryReason)}</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div><span className="font-medium text-slate-800">Why this person matters:</span> {sanitizeText(insight.whyThisPersonMatters)}</div>
                      <div><span className="font-medium text-slate-800">What to ask:</span> {sanitizeText(insight.askPrompt)}</div>
                      <div><span className="font-medium text-slate-800">What to send:</span> {sanitizeText(insight.sendPrompt)}</div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          markFollowUpDone(insight.contact.id);
                        }}
                        className={buttonClassName("secondary")}
                      >
                        Mark Touch Complete
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openContactEditor(insight.contact, "takeaway");
                        }}
                        className={buttonClassName("secondary")}
                      >
                        Log Takeaways
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }) : null}
      </div>
    </Card>
  );
}

function InterviewPrepPacketsSection({
  packets,
  toggleActionItem,
  createActionItemFromSource,
}: {
  packets: InterviewPrepPacket[];
  toggleActionItem: ReturnType<typeof useRecruitOS>["toggleActionItem"];
  createActionItemFromSource: ReturnType<typeof useRecruitOS>["createActionItemFromSource"];
}) {
  return (
    <Card title="Interview Prep Packets">
      <div className="space-y-4">
        {packets.length ? packets.map((packet) => (
          <div key={packet.prep.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {sanitizeText(packet.company?.name || "Interview")} - {sanitizeText(packet.prep.interview_round || packet.prep.interview_type)}
                </div>
                <div className="text-sm text-slate-500">
                  {sanitizeText(formatDateTime(packet.prep.interview_date))} - readiness {packet.prep.readiness_score}%
                </div>
              </div>
              <InsightBadge label={packet.gaps.length ? "Close Prep Gaps" : "Interview Ready"} />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <div className="text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Company snapshot:</span> {sanitizeText(packet.prep.company_notes || packet.company?.company_research_notes || packet.company?.why_this_company || "Add notes on the business, product, and angle for this role.")}
                </div>
                <MiniList title="Likely questions" items={packet.likelyQuestions.slice(0, 4)} />
                <MiniList title="Ask-back questions" items={packet.questionsToAsk.slice(0, 4)} />
                <MiniList title="Prep gaps" items={packet.gaps} />
              </div>
              <div className="space-y-3">
                <MiniList title="Recommended STARs" items={packet.recommendedPars.map((par) => par.title)} />
                <MiniList title="Recommended answers" items={packet.recommendedAnswers.map((answer) => answer.question)} />
                <MiniList title="Linked cases" items={packet.linkedCases.map((item) => item.title)} />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {packet.openPrepActionItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{sanitizeText(item.title)}</div>
                    <div className="text-xs text-slate-500">{sanitizeText(item.priority)} - {sanitizeText(renderValue(item.due_date))}</div>
                  </div>
                  <button type="button" onClick={() => toggleActionItem(item.id)} className={buttonClassName("secondary")}>
                    Check Off
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  createActionItemFromSource({
                    title: `Close missing prep gap for ${packet.company?.name || "interview"}`,
                    source_type: "Interview Prep",
                    source_id: packet.prep.id,
                    linked_interview_prep_id: packet.prep.id,
                    linked_company_id: packet.prep.company_id,
                    linked_application_id: packet.prep.application_id,
                  })
                }
                className={buttonClassName("secondary")}
              >
                Create Missing Prep Action
              </button>
              <Link href="/interview-prep" className={buttonClassName("quiet")}>
                Open Packet
              </Link>
            </div>
          </div>
        )) : <EmptyState label="No upcoming interviews need a packet yet." />}
      </div>
    </Card>
  );
}

function DashboardView() {
  const {
    data,
    logParPractice,
    markCasePracticed,
    toggleActionItem,
    createActionItemFromSource,
  } = useRecruitOS();
  const [parIndex, setParIndex] = useState(0);
  const [caseIndex, setCaseIndex] = useState(0);
  const [practiceStoryId, setPracticeStoryId] = useState<string | null>(null);
  const [practiceCaseId, setPracticeCaseId] = useState<string | null>(null);
  const [selectedWeekDate, setSelectedWeekDate] = useState(toDateInput(new Date().toISOString()));

  const parCandidates = sortParSuggestions(data.parStories);
  const caseCandidates = sortCaseSuggestions(data.cases);
  const parSuggestion = parCandidates[parIndex % Math.max(parCandidates.length, 1)];
  const caseSuggestion = caseCandidates[caseIndex % Math.max(caseCandidates.length, 1)];
  const queue = useMemo(() => getTopPriorityQueue(data), [data]);
  const applicationInsights = useMemo(() => getApplicationInsights(data), [data]);
  const mocksThisWeek = data.mockInterviews.filter((mock) => isInCurrentWeek(mock.date));
  const parRepsThisWeek = data.parPracticeLogs.filter((log) => isInCurrentWeek(log.date)).length;
  const caseRepsThisWeek = data.casePracticeLogs.filter((log) => isInCurrentWeek(log.date)).length;
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
      caseLogs: data.casePracticeLogs.filter((item) => item.date === key),
      followUps: data.contacts.filter((contact) => contact.next_follow_up_date === key),
      applicationActions: data.applications.filter(
        (application) => application.follow_up_date === key || application.deadline === key,
      ),
      mocks: data.mockInterviews.filter((mock) => mock.date === key),
      actionItems: data.actionItems.filter(
        (action) => action.due_date === key && !isActionDone(action),
      ),
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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
        <Card title="Today's Command Center">
          <div className="grid gap-4 md:grid-cols-2">
            {parSuggestion ? (
              <CommandCenterAssignmentCard
                eyebrow="Assigned STAR Practice"
                title={parSuggestion.title}
                details={[
                  {
                    label: "Question",
                    value: "Tell me about a time you influenced without authority.",
                  },
                  {
                    label: "Focus",
                    value:
                      parSuggestion.weakness_or_focus_area || "Sharpen structure and confidence.",
                  },
                ]}
                actions={
                  <>
                    <button
                      type="button"
                      onClick={() => setPracticeStoryId(parSuggestion.id)}
                      className={buttonClassName("secondary")}
                    >
                      Start Practice
                    </button>
                    <button
                      type="button"
                      onClick={() => logParPractice(parSuggestion.id, "Daily dashboard practice")}
                      className={buttonClassName("primary")}
                    >
                      Mark Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => setParIndex((current) => current + 1)}
                      className={buttonClassName("secondary")}
                    >
                      Swap
                    </button>
                  </>
                }
              />
            ) : (
              <div className="rounded-[28px] border border-slate-200/90 bg-white/92 p-6 shadow-[0_12px_28px_rgba(15,23,42,0.03)]">
                <EmptyState label="Add a STAR story to start daily practice suggestions." />
              </div>
            )}
            {caseSuggestion ? (
              <CommandCenterAssignmentCard
                eyebrow="Assigned Case Practice"
                title={caseSuggestion.title}
                details={[
                  {
                    label: "Focus",
                    value: caseSuggestion.weakness_area || "Keep sharp under time pressure.",
                  },
                  {
                    label: "Suggested Session",
                    value: caseSuggestion.case_type,
                  },
                ]}
                actions={
                  <>
                    <button
                      type="button"
                      onClick={() => setPracticeCaseId(caseSuggestion.id)}
                      className={buttonClassName("secondary")}
                    >
                      Start Case
                    </button>
                    <button
                      type="button"
                      onClick={() => markCasePracticed(caseSuggestion.id)}
                      className={buttonClassName("primary")}
                    >
                      Mark Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => setCaseIndex((current) => current + 1)}
                      className={buttonClassName("secondary")}
                    >
                      Swap
                    </button>
                  </>
                }
              />
            ) : (
              <div className="rounded-[28px] border border-slate-200/90 bg-white/92 p-6 shadow-[0_12px_28px_rgba(15,23,42,0.03)]">
                <EmptyState label="Add a case question to start daily case suggestions." />
              </div>
            )}
          </div>
        </Card>

        <Card title="Weekly Progress Scoreboard">
          <div className="space-y-4">
            <ProgressBar
              label={`STAR reps this week (${parRepsThisWeek}/${data.settings.weekly_par_target})`}
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
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-medium text-slate-900">
                Applications today: {applicationsToday.length}/{data.settings.daily_application_target}
              </div>
              <div className="mt-3 grid gap-2">
                {trackCounts.map((track) => (
                  <div
                    key={track.track}
                    className="flex items-center justify-between text-sm text-slate-700"
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

      <Card title="Next Steps">
        <div className="space-y-3">
          {queue.length ? (
            queue.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <InsightBadge label={item.recommendation} />
                      <StatusBadge value={item.badge} />
                    </div>
                    <div className="text-sm font-medium text-slate-900">{sanitizeText(item.title)}</div>
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{sanitizeText(item.subtitle)}</div>
                    <div className="text-sm text-slate-700">{sanitizeText(item.reason)}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {item.kind === "application" ? (
                      <button
                        type="button"
                        onClick={() =>
                          createActionItemFromSource({
                            title: item.title,
                            source_type: "Application",
                            source_id: item.linkedId,
                            linked_application_id: item.linkedId,
                            linked_company_id:
                              data.applications.find((application) => application.id === item.linkedId)?.company_id ?? "",
                          })
                        }
                        className={buttonClassName("secondary")}
                      >
                        Add Action
                      </button>
                    ) : null}
                    {item.kind === "contact" ? (
                      <Link href="/networking" className={buttonClassName("secondary")}>
                        Open Networking
                      </Link>
                    ) : null}
                    {item.kind === "interview-prep" ? (
                      <Link href="/interview-prep" className={buttonClassName("secondary")}>
                        Open Interview Prep
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState label="No urgent recruiting moves are surfaced right now." />
          )}
        </div>
      </Card>

      <div className="grid gap-6">
        <PipelineTriageSection
          insights={applicationInsights.slice(0, 12)}
          createActionItemFromSource={createActionItemFromSource}
        />
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
                  ? "border-teal-200 bg-cyan-50/70 shadow-sm"
                  : "border-slate-200 bg-white/80 hover:bg-white",
              )}
            >
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {day.label}
              </div>
              <div className="text-sm font-medium text-slate-900">{day.dateLabel}</div>
              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <div>STAR: {day.parLogs.length ? "Completed" : "Open"}</div>
                <div>Case: {day.caseLogs.length ? "Completed" : "Open"}</div>
                <div>Networking: {day.followUps.length}</div>
                <div>Apps: {day.applicationActions.length}</div>
                <div>Mocks: {day.mocks.length}</div>
                <div>Tasks: {day.actionItems.length}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-900">
                {selectedDay.label} - {selectedDay.dateLabel}
              </div>
              <div className="text-sm text-slate-500">
                Click a day above to inspect what is due.
              </div>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              {selectedDay.actionItems.length ? selectedDay.actionItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="text-sm font-medium text-slate-900">{item.title}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {item.priority} - {getSourceSummary(data, item)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleActionItem(item.id)}
                      className={buttonClassName("secondary")}
                    >
                      Check Off
                    </button>
                  </div>
                </div>
              )) : <EmptyState label="No action items on this day." />}
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-sm font-medium text-slate-900">
                  Networking follow-ups
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  {selectedDay.followUps.length
                    ? selectedDay.followUps.map((contact) => `${contact.name} (${contact.company_name || "No company"})`).join(", ")
                    : "No networking follow-ups on this day."}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-sm font-medium text-slate-900">
                  Application actions
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  {selectedDay.applicationActions.length
                    ? selectedDay.applicationActions.map((application) => `${application.company_name} - ${application.role_title}`).join(", ")
                    : "No application deadlines or follow-ups on this day."}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-sm font-medium text-slate-900">
                  Practice and mocks
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  {selectedDay.parLogs.length || selectedDay.caseLogs.length || selectedDay.mocks.length
                    ? [
                        selectedDay.parLogs.length ? `${selectedDay.parLogs.length} STAR practice log(s)` : "",
                        selectedDay.caseLogs.length ? `${selectedDay.caseLogs.length} case practice log(s)` : "",
                        selectedDay.mocks.length ? `${selectedDay.mocks.length} mock interview(s)` : "",
                      ].filter(Boolean).join(" - ")
                    : "No practice activity logged on this day."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <PracticeStarModal
        key={`${practiceStoryId ?? "none"}-${practiceStoryId ? "open" : "closed"}`}
        open={Boolean(practiceStoryId)}
        onClose={() => setPracticeStoryId(null)}
        storyId={practiceStoryId}
      />
      <PracticeCaseModal
        key={`${practiceCaseId ?? "none"}-${practiceCaseId ? "open" : "closed"}`}
        open={Boolean(practiceCaseId)}
        onClose={() => setPracticeCaseId(null)}
        caseId={practiceCaseId}
      />
    </div>
  );
}

function QuestionsSection({
  openStory,
  collapsed,
  onToggle,
}: {
  openStory: (story: RecruitOSData["parStories"][number]) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { data, saveInterviewQuestion, deleteInterviewQuestion } = useRecruitOS();
  const [draft, setDraft] = useState({
    id: "",
    question_text: "",
    linked_par_story_ids: [] as string[],
  });

  return (
    <div className="space-y-3">
      <div className="rounded-[26px] border border-slate-200 bg-slate-50/90 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Question Bank</div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
              {data.interviewQuestions.length} saved
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            <span>{collapsed ? "Expand" : "Collapse"}</span>
            <span
              className={cx(
                "text-slate-500 transition-transform",
                collapsed ? "-rotate-90" : "rotate-0",
              )}
            >
              <ChevronDownIcon />
            </span>
          </button>
        </div>
      </div>

      {collapsed ? null : (
        <>
          <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-2">
              {data.interviewQuestions.length ? (
                data.interviewQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const linkedStory = data.parStories.find((story) =>
                          question.linked_par_story_ids.includes(story.id),
                        );
                        if (linkedStory) openStory(linkedStory);
                      }}
                      className="min-w-0 flex-1 text-left text-sm leading-6 text-slate-800"
                    >
                      {sanitizeText(question.question_text)}
                    </button>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <IconButton
                        label={`Edit question ${question.question_text}`}
                        icon={<PencilIcon />}
                        onClick={() =>
                          setDraft({
                            id: question.id,
                            question_text: question.question_text,
                            linked_par_story_ids: question.linked_par_story_ids,
                          })
                        }
                      />
                      <IconButton
                        label={`Delete question ${question.question_text}`}
                        icon={<TrashIcon />}
                        tone="danger"
                        onClick={() => deleteInterviewQuestion(question.id)}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState label="Add interview questions to build your bank." />
              )}
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-900">
              {draft.id ? "Edit question" : "Add question"}
            </div>
            <div className="space-y-2.5">
              <input
                value={draft.question_text}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, question_text: event.target.value }))
                }
                placeholder="Add interview question"
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300"
              />
              <button
                type="button"
                onClick={() => {
                  if (!draft.question_text.trim()) return;
                  saveInterviewQuestion({
                    id: draft.id || undefined,
                    question_text: draft.question_text,
                    linked_par_story_ids: draft.linked_par_story_ids,
                  });
                  setDraft({
                    id: "",
                    question_text: "",
                    linked_par_story_ids: [],
                  });
                }}
                className="w-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500 px-3 py-2 text-sm font-medium text-white shadow-[0_8px_18px_rgba(13,148,136,0.14)] hover:from-teal-400 hover:to-sky-400"
              >
                {draft.id ? "Update Question" : "Save Question"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StarCoverageMatrix({
  stories,
  questions,
  openStory,
}: {
  stories: RecruitOSData["parStories"];
  questions: RecruitOSData["interviewQuestions"];
  openStory: (story: RecruitOSData["parStories"][number]) => void;
}) {
  return (
    <Card title="STAR Coverage Matrix">
      {stories.length && questions.length ? (
        <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white/80 p-2">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="min-w-[220px] px-3 py-2 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                  STAR Story
                </th>
                {questions.map((question) => (
                  <th
                    key={question.id}
                    className="min-w-[180px] px-3 py-2 text-left text-xs uppercase tracking-[0.12em] text-slate-500"
                  >
                    {sanitizeText(question.question_text)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => (
                <tr key={story.id} className="rounded-2xl bg-slate-50 shadow-[0_1px_0_rgba(226,232,240,1)]">
                  <td className="px-3 py-3 align-top">
                    <button
                      type="button"
                      onClick={() => openStory(story)}
                      className="text-left text-sm font-medium text-slate-900 transition hover:text-teal-700"
                    >
                      {sanitizeText(story.title)}
                    </button>
                    <div className="mt-1 text-xs text-slate-500">
                      {story.status} | Confidence {story.confidence_score}/5 | {story.linked_question_ids.length} question{story.linked_question_ids.length === 1 ? "" : "s"}
                    </div>
                  </td>
                  {questions.map((question) => (
                    <td key={question.id} className="px-3 py-3 align-top text-sm text-slate-700">
                      {story.linked_question_ids.includes(question.id) ? "Yes" : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState label="Add STAR stories and questions to see the coverage matrix." />
      )}
    </Card>
  );
}

function StarsWorkspaceSection({
  stories,
  query,
  setQuery,
  sortKey,
  setSortKey,
  sortDirection,
  setSortDirection,
  sortOptions,
  openStory,
  addStory,
  practiceStory,
  addAction,
  deleteStory,
  questionBank,
}: {
  stories: RecruitOSData["parStories"];
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  sortKey: string;
  setSortKey: React.Dispatch<React.SetStateAction<string>>;
  sortDirection: SortDirection;
  setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>;
  sortOptions: SortOption[];
  openStory: (story: RecruitOSData["parStories"][number]) => void;
  addStory: () => void;
  practiceStory: (storyId: string) => void;
  addAction: (story: RecruitOSData["parStories"][number]) => void;
  deleteStory: (storyId: string) => void;
  questionBank: (collapsed: boolean, onToggle: () => void) => React.ReactNode;
}) {
  const { data } = useRecruitOS();
  const [questionBankCollapsed, setQuestionBankCollapsed] = useState(true);

  return (
    <div
      className={cx(
        "grid gap-6",
        questionBankCollapsed
          ? "xl:grid-cols-[minmax(0,1fr)_220px]"
          : "xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.42fr)]",
      )}
    >
      <Card
        title="STAR Story Library"
        actions={
          <button
            type="button"
            onClick={addStory}
            className="rounded-full bg-gradient-to-r from-teal-500 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-[0_8px_18px_rgba(13,148,136,0.14)] hover:from-teal-400 hover:to-sky-400"
          >
            Add STAR Story
          </button>
        }
      >
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full max-w-3xl flex-col gap-2 lg:ml-auto lg:w-auto lg:flex-row lg:items-center">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search star stories..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white lg:min-w-[260px]"
            />
            <div className="flex gap-2">
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value)}
                className="min-w-[160px] rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-300 focus:bg-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {sortDirection === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>
          </div>
        </div>
        {stories.length ? (
          <div className="space-y-3">
            {stories.map((story) => {
              const linkedQuestions = story.linked_question_ids
                .map((questionId) => data.interviewQuestions.find((question) => question.id === questionId)?.question_text)
                .filter((value): value is string => Boolean(value));
              return (
                <article
                  key={story.id}
                  className="rounded-[24px] border border-slate-200/90 bg-white px-5 py-4 shadow-[0_10px_26px_rgba(15,23,42,0.035)] transition hover:border-slate-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.05)]"
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start xl:gap-6">
                    <div className="min-w-0 space-y-2.5">
                      <button
                        type="button"
                        onClick={() => openStory(story)}
                        className="text-left text-[0.98rem] font-semibold leading-tight text-slate-900 [font-family:var(--font-display)] transition hover:text-teal-700 lg:text-[1.03rem]"
                      >
                        {sanitizeText(story.title)}
                      </button>
                      <div className="flex flex-wrap items-center gap-2 text-[0.78rem] text-slate-500">
                        <span>{story.linked_question_ids.length ? `${story.linked_question_ids.length} question${story.linked_question_ids.length === 1 ? "" : "s"}` : "No questions linked"}</span>
                        <span>|</span>
                        <span>{story.status}</span>
                        <span>|</span>
                        <span>Confidence {story.confidence_score}/5</span>
                      </div>
                      <div className="max-w-full">
                        <MiniList title="Questions this story answers" items={linkedQuestions} />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 xl:max-w-[340px] xl:justify-end xl:self-start">
                      <button
                        type="button"
                        onClick={() => practiceStory(story.id)}
                        className={buttonClassName("secondary")}
                      >
                        Practice
                      </button>
                      <button
                        type="button"
                        onClick={() => addAction(story)}
                        className={buttonClassName("secondary")}
                      >
                        Add Action
                      </button>
                      <IconButton
                        label={`Delete STAR story ${story.title}`}
                        icon={<TrashIcon />}
                        tone="danger"
                        onClick={() => deleteStory(story.id)}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState label="No STAR stories match this view yet." />
        )}
      </Card>
      <aside className="xl:pt-[2px]">
        {questionBankCollapsed ? (
          <div className="rounded-[26px] border border-slate-200 bg-slate-50/90 p-4">
            <div className="flex min-h-[88px] flex-col justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Question Bank</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                  Hidden
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuestionBankCollapsed(false)}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <span>Open</span>
                <span className="-rotate-90 text-slate-500">
                  <ChevronDownIcon />
                </span>
              </button>
            </div>
          </div>
        ) : (
          <>{questionBank(questionBankCollapsed, () => setQuestionBankCollapsed((current) => !current))}</>
        )}
      </aside>
    </div>
  );
}

function SettingsView() {
  const { data, saveSettings, persistenceMode } = useRecruitOS();
  const [draft, setDraft] = useState({
    daily_application_target: data.settings.daily_application_target,
    weekly_application_target: data.settings.weekly_application_target,
    weekly_par_target: data.settings.weekly_par_target,
    weekly_case_target: data.settings.weekly_case_target,
    weekly_mock_target: data.settings.weekly_mock_target,
    weekly_networking_target: data.settings.weekly_networking_target,
  });

  return (
    <Card title="Settings">
      <div className="space-y-4">
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4">
          <div className="text-sm font-medium text-slate-900">Backup Your RecruitOS Data</div>
          <p className="mt-1 text-sm text-slate-600">
            Download a full JSON backup of your recruiting workspace. This includes your records,
            relationships, settings, export timestamp, and current storage mode.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const timestamp = new Date().toISOString();
                const safeTimestamp = timestamp.replaceAll(":", "-");
                downloadJsonFile(`recruitos-backup-${safeTimestamp}.json`, {
                  exported_at: timestamp,
                  persistence_mode: persistenceMode,
                  app: "RecruitOS",
                  data,
                });
              }}
              className={buttonClassName("primary")}
            >
              Export Backup JSON
            </button>
            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Current mode: {persistenceMode}
            </div>
          </div>
        </div>

        {[
          ["daily_application_target", "Daily application target"],
          ["weekly_application_target", "Weekly application target"],
          ["weekly_par_target", "Weekly STAR target"],
          ["weekly_case_target", "Weekly case target"],
          ["weekly_mock_target", "Weekly mock target"],
          ["weekly_networking_target", "Weekly networking touch target"],
        ].map(([key, label]) => (
          <label key={key} className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <input
              type="number"
              value={draft[key as keyof typeof draft]}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  [key]: Number(event.target.value),
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-300 focus:bg-white"
            />
          </label>
        ))}
        <button
          type="button"
          onClick={() => saveSettings(draft)}
          className={buttonClassName("primary")}
        >
          Save Settings
        </button>
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
                ? "border-teal-200 bg-cyan-50 text-teal-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
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
  const { data, deleteRecord, markFollowUpDone, markInterviewAnswerPracticed, toggleActionItem, createActionItemFromSource } = useRecruitOS();
  const config = MODULE_CONFIGS[slug];
  const records = data[config.collection] as unknown as Array<Record<string, unknown>>;
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [practiceStoryId, setPracticeStoryId] = useState<string | null>(null);
  const [practiceCaseId, setPracticeCaseId] = useState<string | null>(null);
  const [actionView, setActionView] = useState("Today");
  const [sortKey, setSortKey] = useState(config.defaultSort.key);
  const [sortDirection, setSortDirection] = useState<SortDirection>(config.defaultSort.direction);
  const applicationInsights = useMemo(() => getApplicationInsights(data), [data]);
  const networkingInsights = useMemo(() => getNetworkingWorkflowInsights(data), [data]);
  const prepPackets = useMemo(
    () =>
      data.interviewPrep
        .map((prep) => buildInterviewPrepPacket(data, prep.id))
        .filter((packet): packet is InterviewPrepPacket => Boolean(packet))
        .sort(
          (left, right) =>
            new Date(left.prep.interview_date || "9999-12-31").getTime() -
            new Date(right.prep.interview_date || "9999-12-31").getTime(),
        ),
    [data],
  );
  const activeSortOption = useMemo(
    () => config.sortOptions.find((option) => option.key === sortKey) ?? config.sortOptions[0],
    [config.sortOptions, sortKey],
  );
  const effectiveSort = useMemo(() => {
    if (slug === "action-items" && actionView === "By Priority") {
      return {
        option:
          config.sortOptions.find((option) => option.key === "priority") ?? activeSortOption,
        direction: "desc" as SortDirection,
      };
    }

    if (slug === "action-items" && actionView === "By Source") {
      return {
        option:
          config.sortOptions.find((option) => option.key === "source_type") ?? activeSortOption,
        direction: "asc" as SortDirection,
      };
    }

    return {
      option: activeSortOption,
      direction: sortDirection,
    };
  }, [actionView, activeSortOption, config.sortOptions, slug, sortDirection]);

  const filteredRecords = useMemo(() => {
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
      if (actionView === "By Priority") return !isActionDone(item);
      if (actionView === "By Source") return !isActionDone(item);
      return true;
    });
  }, [actionView, config.searchKeys, query, records, slug]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((left, right) =>
      compareSortValues(
        left[effectiveSort.option.key],
        right[effectiveSort.option.key],
        effectiveSort.option,
        effectiveSort.direction,
      ),
    );
  }, [effectiveSort, filteredRecords]);

  const openContactEditor = useCallback(
    (contact: RecruitOSData["contacts"][number], mode: "takeaway" | "edit" = "edit") => {
      setEditing(
        (mode === "takeaway"
          ? {
              ...contact,
              conversation_notes: contact.conversation_notes
                ? `${contact.conversation_notes}\nPost-call takeaway: `
                : "Post-call takeaway: ",
            }
          : contact) as unknown as Record<string, unknown>,
      );
      setModalOpen(true);
    },
    [],
  );
  const openStarEditor = useCallback(
    (story: RecruitOSData["parStories"][number]) => {
      openRecordEditor(story as unknown as Record<string, unknown>, setEditing, setModalOpen);
    },
    [],
  );
  const openGenericRecordEditor = useCallback(
    (record: Record<string, unknown>) => {
      openRecordEditor(record, setEditing, setModalOpen);
    },
    [],
  );

  return (
    <div className="space-y-6">
      {slug === "applications" ? (
        <PipelineTriageSection
          insights={applicationInsights}
          createActionItemFromSource={createActionItemFromSource}
        />
      ) : null}

      {slug === "networking" ? (
        <NetworkingWorkflowSection
          insights={networkingInsights}
          markFollowUpDone={markFollowUpDone}
          openContactEditor={openContactEditor}
        />
      ) : null}

      {slug === "interview-prep" ? (
        <InterviewPrepPacketsSection
          packets={prepPackets}
          toggleActionItem={toggleActionItem}
          createActionItemFromSource={createActionItemFromSource}
        />
      ) : null}

      {slug === "pars" ? (
        <>
          <StarsWorkspaceSection
            stories={sortedRecords as unknown as RecruitOSData["parStories"]}
            query={query}
            setQuery={setQuery}
            sortKey={sortKey}
            setSortKey={setSortKey}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            sortOptions={config.sortOptions}
            openStory={openStarEditor}
            addStory={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            practiceStory={(storyId) => setPracticeStoryId(storyId)}
            addAction={(story) =>
              createActionItemFromSource({
                title: `Improve STAR: ${story.title}`,
                source_type: "PAR",
                source_id: story.id,
                linked_par_id: story.id,
              })
            }
            deleteStory={(storyId) => deleteRecord("pars", storyId)}
            questionBank={(collapsed, onToggle) => (
              <QuestionsSection
                openStory={openStarEditor}
                collapsed={collapsed}
                onToggle={onToggle}
              />
            )}
          />
          <StarCoverageMatrix
            stories={sortedRecords as unknown as RecruitOSData["parStories"]}
            questions={data.interviewQuestions}
            openStory={openStarEditor}
          />
          <RecordModal
            key={`${editing?.id ? String(editing.id) : "new"}-${modalOpen ? "open" : "closed"}`}
            title={editing ? `Edit ${config.singular}` : `Add ${config.singular}`}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            module={slug}
            initial={editing}
          />
          <PracticeStarModal
            key={`${practiceStoryId ?? "none"}-${practiceStoryId ? "open" : "closed"}`}
            open={Boolean(practiceStoryId)}
            onClose={() => setPracticeStoryId(null)}
            storyId={practiceStoryId}
          />
        </>
      ) : null}

      {slug === "pars" ? null : (

      <Card
        title={config.title}
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="rounded-full bg-gradient-to-r from-teal-500 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-[0_8px_18px_rgba(13,148,136,0.14)] hover:from-teal-400 hover:to-sky-400"
          >
            Add {config.singular}
          </button>
        }
      >
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full max-w-3xl flex-col gap-2 lg:w-auto lg:flex-row lg:items-center">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${config.title.toLowerCase()}...`}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white lg:min-w-[260px]"
            />
            <div className="flex gap-2">
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value)}
                className="min-w-[160px] rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-300 focus:bg-white"
              >
                {config.sortOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {sortDirection === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>
          </div>
        </div>
        {slug === "action-items" ? (
          <div className="mb-4">
            <ActionItemsFilters active={actionView} setActive={setActionView} />
          </div>
        ) : null}
        {sortedRecords.length ? (
          <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white/80 p-2">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  {config.columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-3 py-2 text-left text-xs uppercase tracking-[0.18em] text-slate-500"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-right text-xs uppercase tracking-[0.18em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map((record) => (
                  <tr
                    key={String(record.id)}
                    onClick={
                      slug === "cases"
                        ? () => openGenericRecordEditor(record)
                        : slug === "networking"
                          ? () => openContactEditor(record as unknown as RecruitOSData["contacts"][number])
                        : undefined
                    }
                    className={cx(
                      "rounded-2xl bg-slate-50 shadow-[0_1px_0_rgba(226,232,240,1)]",
                      (slug === "cases" || slug === "networking") && "cursor-pointer transition hover:bg-white",
                    )}
                  >
                    {config.columns.map((column) => (
                      <td key={column.key} className="px-3 py-3.5 text-sm text-slate-700">
                        {slug === "networking" && column.key === "name" ? (
                          <span className="font-medium text-slate-900">
                            {renderValue(record[column.key])}
                          </span>
                        ) : ["status", "priority", "target_category", "referral_status", "prep_status"].includes(column.key) ||
                        typeof record[column.key] === "boolean" ? (
                          <StatusBadge value={record[column.key] as string} />
                        ) : (
                          renderValue(record[column.key])
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        {slug === "cases" ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setPracticeCaseId(String(record.id));
                            }}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Practice
                          </button>
                        ) : null}
                        {slug === "interview-answers" ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              markInterviewAnswerPracticed(String(record.id));
                            }}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Practice
                          </button>
                        ) : null}
                        {slug === "networking" ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              markFollowUpDone(String(record.id));
                            }}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Follow-Up Done
                          </button>
                        ) : null}
                        {slug === "action-items" ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleActionItem(String(record.id));
                            }}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            {(record.status as string) === "Done" ? "Reopen" : "Check Off"}
                          </button>
                        ) : null}
                        {(slug === "applications" || slug === "mock-interviews" || slug === "networking") ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
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
                            }}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Add Action
                          </button>
                        ) : null}
                        {slug === "resumes" && String(record.file_link || "").trim() ? (
                          <a
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            href={String(record.file_link)}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Open PDF
                          </a>
                        ) : null}
                        <IconButton
                          label={`Edit ${config.singular}`}
                          icon={<PencilIcon />}
                          onClick={() => {
                            if (slug === "networking") {
                              openContactEditor(record as unknown as RecruitOSData["contacts"][number]);
                              return;
                            }
                            openGenericRecordEditor(record);
                          }}
                        />
                        <IconButton
                          label={`Delete ${config.singular}`}
                          icon={<TrashIcon />}
                          tone="danger"
                          onClick={() => deleteRecord(slug, String(record.id))}
                        />
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
      )}

      {slug === "pars" ? null : (
        <RecordModal
          key={`${editing?.id ? String(editing.id) : "new"}-${modalOpen ? "open" : "closed"}`}
          title={editing ? `Edit ${config.singular}` : `Add ${config.singular}`}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          module={slug}
          initial={editing}
        />
      )}
      <PracticeCaseModal
        key={`${practiceCaseId ?? "none"}-${practiceCaseId ? "open" : "closed"}`}
        open={Boolean(practiceCaseId)}
        onClose={() => setPracticeCaseId(null)}
        caseId={practiceCaseId}
      />
    </div>
  );
}

export function ModuleView({ slug }: { slug: ModuleSlug }) {
  if (slug === "dashboard") return <DashboardView />;
  if (slug === "settings") return <SettingsView />;
  return <GenericModuleView slug={slug as CrudModuleSlug} />;
}

