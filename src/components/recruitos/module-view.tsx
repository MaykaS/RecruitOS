"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  ApplicationInsight,
  BRAIN_DUMP_CATEGORIES,
  ContactWorkflowInsight,
  CrudModuleSlug,
  FieldConfig,
  InterviewPrepPacket,
  MODULE_CONFIGS,
  ModuleSlug,
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
  isDueTodayOrOverdue,
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

function sanitizeText(value: string) {
  return value
    .replaceAll("â€”", "-")
    .replaceAll("Â·", " - ")
    .replaceAll("·", " - ")
    .replaceAll("â€™", "'")
    .replaceAll("’", "'");
}

function parseTagInput(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => sanitizeText(item).trim())
        .filter(Boolean),
    ),
  );
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
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600"
          >
            {sanitizeText(item)}
          </span>
        ))}
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
    if (!value.length) return "—";
    return sanitizeText(joinList(value.map((item) => String(item))));
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (!value) return "—";
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
    });
  }

  return [...values];
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
    if (!isReferenceField(field)) {
      const listId = `options-${field.key}`;
      return (
        <div className="space-y-2">
          <input
            list={listId}
            value={String(value ?? "")}
            onChange={(event) => onChange(event.target.value)}
            placeholder={field.placeholder ?? "Type or choose a saved option"}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
          />
          <datalist id={listId}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </datalist>
          <p className="text-xs leading-5 text-slate-500">
            Type a new value if you need one. Once saved, it will show up as a reusable option.
          </p>
        </div>
      );
    }

    return (
      <select
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-300 focus:bg-white"
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
    const selectedLabels = options
      .filter((option) => selected.includes(option.value))
      .map((option) => option.label);
    const pickerLabel =
      field.key === "linked_question_ids"
        ? "Choose interview questions"
        : field.key === "linked_contact_ids"
          ? "Choose linked contacts"
          : `Choose ${field.label.toLowerCase()}`;

    return (
      <details className="rounded-2xl border border-slate-200 bg-slate-50">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-sm text-slate-900">
          {selectedLabels.length
            ? `${selectedLabels.length} selected`
            : pickerLabel}
        </summary>
        <div className="max-h-56 space-y-2 overflow-y-auto border-t border-slate-200 px-3 py-3">
          {options.map((option) => {
            const checked = selected.includes(option.value);
            return (
              <label key={option.value} className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    const nextValues = event.target.checked
                      ? [...selected, option.value]
                      : selected.filter((item) => item !== option.value);
                    onChange(Array.from(new Set(nextValues)));
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-400"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </details>
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
  const [form, setForm] = useState<Record<string, unknown>>(initial ?? config.defaultValues);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const networkingTagOptions =
    module === "networking"
      ? resolveOptions(
          MODULE_CONFIGS.networking.fields.find((field) => field.key === "tags")?.options ?? [],
          data,
        )
      : [];
  const companyNameValue =
    module === "networking" || module === "applications"
      ? String(form.company_name ?? initial?.company_name ?? "")
      : "";
  const tagInputValue =
    module === "networking" && Array.isArray(form.tags)
      ? form.tags.map((tag) => sanitizeText(String(tag))).join(", ")
      : "";

  if (!open) return null;

  const linkedActions =
    initial?.id && module !== "action-items"
      ? getLinkedActionItems(data, module, String(initial.id))
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,252,0.98))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
              {config.title}
            </p>
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600">{config.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={buttonClassName("secondary")}
          >
            Close
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

            if (module === "networking" && field.key === "tags") {
              return (
                <label
                  key={field.key}
                  className="space-y-3 rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] lg:col-span-2"
                >
                  <span className="text-sm font-medium text-slate-700">{field.label}</span>
                  <input
                    value={tagInputValue}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        tags: parseTagInput(event.target.value),
                      }))
                    }
                    placeholder="Cornell, Alum, PM"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
                  />
                  <div className="flex flex-wrap gap-2">
                    {networkingTagOptions.map((option) => {
                      const selected = Array.isArray(form.tags) && form.tags.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setForm((current) => {
                              const currentTags = Array.isArray(current.tags)
                                ? current.tags.map(String)
                                : [];
                              const nextTags = currentTags.includes(option.value)
                                ? currentTags.filter((tag) => tag !== option.value)
                                : [...currentTags, option.value];
                              return { ...current, tags: nextTags };
                            })
                          }
                          className={cx(
                            "rounded-full border px-2.5 py-1 text-xs transition",
                            selected
                              ? "border-teal-200 bg-cyan-50 text-teal-700"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs leading-5 text-slate-500">
                    Type your own tags or tap suggestions to add them quickly.
                  </p>
                </label>
              );
            }

            return (
              <label
                key={field.key}
                className={cx(
                  "space-y-2 rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]",
                  field.type === "textarea" || field.type === "multiselect"
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
                    {action.priority} · {renderValue(action.due_date)}
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
  return (
    <Card title="Networking Execution">
      <div className="space-y-4">
        {CONTACT_BUCKET_ORDER.map((label) => {
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
                  <div key={insight.contact.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
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
                        onClick={() => markFollowUpDone(insight.contact.id)}
                        className={buttonClassName("secondary")}
                      >
                        Mark Touch Complete
                      </button>
                      <button
                        type="button"
                        onClick={() => openContactEditor(insight.contact, "takeaway")}
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
        })}
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
    markFollowUpDone,
    toggleActionItem,
    createActionItemFromSource,
    convertBrainDumpToActionItem,
    saveRecord,
  } = useRecruitOS();
  const [parIndex, setParIndex] = useState(0);
  const [caseIndex, setCaseIndex] = useState(0);
  const [selectedWeekDate, setSelectedWeekDate] = useState(toDateInput(new Date().toISOString()));
  const [networkingModalOpen, setNetworkingModalOpen] = useState(false);
  const [networkingEditing, setNetworkingEditing] = useState<Record<string, unknown> | null>(null);
  const [brainDump, setBrainDump] = useState({
    title: "",
    note: "",
    category: "General",
  });
  const openNetworkingContactEditor = useCallback(
    (contact: RecruitOSData["contacts"][number], mode?: "takeaway") => {
      const existingNotes = String(contact.conversation_notes ?? "").trim();
      const takeawayStub = existingNotes
        ? `${existingNotes}\nPost-call takeaway: `
        : "Post-call takeaway: ";
      setNetworkingEditing({
        ...contact,
        conversation_notes: mode === "takeaway" ? takeawayStub : contact.conversation_notes,
      });
      setNetworkingModalOpen(true);
    },
    [],
  );

  const parCandidates = sortParSuggestions(data.parStories);
  const caseCandidates = sortCaseSuggestions(data.cases);
  const parSuggestion = parCandidates[parIndex % Math.max(parCandidates.length, 1)];
  const caseSuggestion = caseCandidates[caseIndex % Math.max(caseCandidates.length, 1)];
  const queue = useMemo(() => getTopPriorityQueue(data), [data]);
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
        )
        .slice(0, 3),
    [data],
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
            <div className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-[rgba(255,255,255,0.82)] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Assigned STAR Practice
              </div>
              {parSuggestion ? (
                <div className="mt-3 flex h-full flex-col">
                  <div className="space-y-2.5">
                    <h3 className="min-h-[3rem] text-[1.6rem] leading-[1.08] font-semibold text-slate-900 [font-family:var(--font-display)]">
                      {parSuggestion.title}
                    </h3>
                    <p className="min-h-[3rem] text-sm leading-5 text-slate-600">
                      Prompt: Tell me about a time you influenced without authority.
                    </p>
                    <p className="min-h-[3rem] text-sm leading-5 text-slate-700">
                      Focus: {parSuggestion.weakness_or_focus_area || "Sharpen structure and confidence."}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4 sm:flex-nowrap">
                    <Link href="/pars" className={buttonClassName("secondary")}>
                      Start Practice
                    </Link>
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
                  </div>
                </div>
              ) : (
                <EmptyState label="Add a STAR story to start daily practice suggestions." />
              )}
            </div>

            <div className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-[rgba(255,255,255,0.82)] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Assigned Case Practice
              </div>
              {caseSuggestion ? (
                <div className="mt-3 flex h-full flex-col">
                  <div className="space-y-2.5">
                    <h3 className="min-h-[3rem] text-[1.6rem] leading-[1.08] font-semibold text-slate-900 [font-family:var(--font-display)]">
                      {caseSuggestion.title}
                    </h3>
                    <p className="min-h-[3rem] text-sm leading-5 text-slate-600">
                      Focus area: {caseSuggestion.weakness_area || "Keep sharp under time pressure."}
                    </p>
                    <p className="min-h-[3rem] text-sm leading-5 text-slate-700">
                      Suggested session: {caseSuggestion.case_type}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4 sm:flex-nowrap">
                    <Link href="/cases" className={buttonClassName("secondary")}>
                      Start Case
                    </Link>
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

      <Card title="What To Do Now">
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
                    {item.kind === "contact" ? (
                      <button
                        type="button"
                        onClick={() => markFollowUpDone(item.linkedId)}
                        className={buttonClassName("secondary")}
                      >
                        Mark Touch Complete
                      </button>
                    ) : null}
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
                    {item.kind === "interview-prep" ? (
                      <Link href="/interview-prep" className={buttonClassName("secondary")}>
                        Open Packet
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
        <NetworkingWorkflowSection
          insights={networkingInsights.slice(0, 10)}
          markFollowUpDone={markFollowUpDone}
          openContactEditor={openNetworkingContactEditor}
        />
        <InterviewPrepPacketsSection
          packets={prepPackets}
          toggleActionItem={toggleActionItem}
          createActionItemFromSource={createActionItemFromSource}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr_1fr]">
        <Card title="Mock Interview Reminder">
          {mocksThisWeek.length ? (
            <div className="space-y-3 text-sm text-slate-700">
              <p>You already logged {mocksThisWeek.length} mock interview(s) this week.</p>
              <Link href="/mock-interviews" className={buttonClassName("secondary")}>
                Review Mock Notes
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                No mock interview has been completed this week. Keep the cadence alive before live interviews.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/mock-interviews" className={buttonClassName("primary")}>
                  Log Mock Interview
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    createActionItemFromSource({
                      title: "Schedule this week's mock interview",
                      source_type: "Mock Interview",
                      source_id: "dashboard-weekly-mock",
                    })
                  }
                  className={buttonClassName("secondary")}
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
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-500">
                      {item.priority} - {getSourceSummary(data, item)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleActionItem(item.id)}
                    className={buttonClassName("secondary")}
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
            />
            <textarea
              value={brainDump.note}
              onChange={(event) => setBrainDump((current) => ({ ...current, note: event.target.value }))}
              placeholder="Write anything you do not want to lose..."
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
            />
            <select
              value={brainDump.category}
              onChange={(event) => setBrainDump((current) => ({ ...current, category: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-300 focus:bg-white"
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
              className={buttonClassName("primary")}
            >
              Save Brain Dump
            </button>
            <div className="space-y-2">
              {data.brainDumps.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-sm font-medium text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.category}</div>
                  <div className="mt-2 text-sm text-slate-700">{item.note}</div>
                  <button
                    type="button"
                    onClick={() => convertBrainDumpToActionItem(item.id)}
                    disabled={Boolean(item.converted_action_item_id)}
                    className={buttonClassName("secondary")}
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

      <RecordModal
        key={`${networkingEditing?.id ? String(networkingEditing.id) : "new"}-${networkingModalOpen ? "open" : "closed"}`}
        title={
          networkingEditing?.id
            ? `Edit ${String(networkingEditing.name ?? "networking contact")}`
            : "Edit Networking Contact"
        }
        open={networkingModalOpen}
        onClose={() => setNetworkingModalOpen(false)}
        module="networking"
        initial={networkingEditing}
      />
    </div>
  );
}

function QuestionsSection({
  openStory,
}: {
  openStory: (story: RecruitOSData["parStories"][number]) => void;
}) {
  const { data, saveInterviewQuestion, deleteInterviewQuestion } = useRecruitOS();
  const [draft, setDraft] = useState({
    id: "",
    question_text: "",
    linked_par_story_ids: [] as string[],
  });

  return (
    <div className="space-y-3">
      <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-1 text-sm font-semibold text-slate-900">Question Bank</div>
        <p className="mb-3 text-xs leading-5 text-slate-500">
          Keep a simple list of interview questions, then pick as many of them as you want inside each STAR story.
        </p>
        <div className="space-y-2">
          {data.interviewQuestions.length ? (
            data.interviewQuestions.map((question) => (
              <div key={question.id} className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                <button
                  type="button"
                  onClick={() => {
                    const linkedStory = data.parStories.find((story) =>
                      question.linked_par_story_ids.includes(story.id),
                    );
                    if (linkedStory) openStory(linkedStory);
                  }}
                  className="text-left text-sm leading-6 text-slate-800"
                >
                  {sanitizeText(question.question_text)}
                </button>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        id: question.id,
                        question_text: question.question_text,
                        linked_par_story_ids: question.linked_par_story_ids,
                      })
                    }
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteInterviewQuestion(question.id)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                  >
                    Remove
                  </button>
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
                      {sanitizeText(story.category || "General")} | {story.linked_question_ids.length} question{story.linked_question_ids.length === 1 ? "" : "s"}
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
  questionBank: React.ReactNode;
}) {
  const { data } = useRecruitOS();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,4fr)_minmax(280px,1fr)]">
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
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Add your STAR stories, link each one to as many interview questions as it answers, and open any story title to review the full note.
          </p>
          <div className="flex w-full max-w-3xl flex-col gap-2 lg:w-auto lg:flex-row lg:items-center">
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
          <div className="grid gap-4 xl:grid-cols-2">
            {stories.map((story) => {
              const linkedQuestions = story.linked_question_ids
                .map((questionId) => data.interviewQuestions.find((question) => question.id === questionId)?.question_text)
                .filter((value): value is string => Boolean(value));
              return (
                <article key={story.id} className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => openStory(story)}
                        className="text-left text-[1.1rem] font-semibold text-slate-900 [font-family:var(--font-display)] transition hover:text-teal-700"
                      >
                        {sanitizeText(story.title)}
                      </button>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{sanitizeText(story.category || "General")}</span>
                        <span>|</span>
                        <span>{story.status}</span>
                        <span>|</span>
                        <span>Confidence {story.confidence_score}/5</span>
                      </div>
                    </div>
                    <StatusBadge value={story.status} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {sanitizeText(
                      story.weakness_or_focus_area ||
                        story.polished_answer ||
                        story.result ||
                        "Open the story to see the full STAR note.",
                    )}
                  </p>
                  <div className="mt-4 space-y-3">
                    <MiniList title="Questions this story answers" items={linkedQuestions} />
                    <div className="flex flex-wrap gap-2">
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
                      <button
                        type="button"
                        onClick={() => openStory(story)}
                        className={buttonClassName("secondary")}
                      >
                        Open Story
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteStory(story.id)}
                        className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                      >
                        Delete
                      </button>
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
      <aside className="xl:pt-[2px]">{questionBank}</aside>
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
  const { data, deleteRecord, logParPractice, markCasePracticed, markFollowUpDone, markInterviewAnswerPracticed, toggleActionItem, createActionItemFromSource } = useRecruitOS();
  const config = MODULE_CONFIGS[slug];
  const records = data[config.collection] as unknown as Array<Record<string, unknown>>;
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
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
      return true;
    });
  }, [actionView, config.searchKeys, query, records, slug]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((left, right) =>
      compareSortValues(left[activeSortOption.key], right[activeSortOption.key], activeSortOption, sortDirection),
    );
  }, [activeSortOption, filteredRecords, sortDirection]);

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
            practiceStory={(storyId) => logParPractice(storyId)}
            addAction={(story) =>
              createActionItemFromSource({
                title: `Improve STAR: ${story.title}`,
                source_type: "PAR",
                source_id: story.id,
                linked_par_id: story.id,
              })
            }
            deleteStory={(storyId) => deleteRecord("pars", storyId)}
            questionBank={<QuestionsSection openStory={openStarEditor} />}
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
          <p className="max-w-2xl text-sm leading-6 text-slate-600">{config.description}</p>
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
                    className="rounded-2xl bg-slate-50 shadow-[0_1px_0_rgba(226,232,240,1)]"
                  >
                    {config.columns.map((column) => (
                      <td key={column.key} className="px-3 py-3.5 text-sm text-slate-700">
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
                        {slug === "cases" ? (
                          <button
                            type="button"
                            onClick={() => markCasePracticed(String(record.id))}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Mark Practiced
                          </button>
                        ) : null}
                        {slug === "interview-answers" ? (
                          <button
                            type="button"
                            onClick={() => markInterviewAnswerPracticed(String(record.id))}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Practice
                          </button>
                        ) : null}
                        {slug === "networking" ? (
                          <button
                            type="button"
                            onClick={() => markFollowUpDone(String(record.id))}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Follow-Up Done
                          </button>
                        ) : null}
                        {slug === "action-items" ? (
                          <button
                            type="button"
                            onClick={() => toggleActionItem(String(record.id))}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            {(record.status as string) === "Done" ? "Reopen" : "Check Off"}
                          </button>
                        ) : null}
                        {(slug === "applications" || slug === "mock-interviews" || slug === "networking") ? (
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
                        <button
                          type="button"
                          onClick={() => {
                            if (slug === "networking") {
                              openContactEditor(record as unknown as RecruitOSData["contacts"][number]);
                              return;
                            }
                            setEditing(record);
                            setModalOpen(true);
                          }}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRecord(slug, String(record.id))}
                          className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
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
    </div>
  );
}

export function ModuleView({ slug }: { slug: ModuleSlug }) {
  if (slug === "dashboard") return <DashboardView />;
  if (slug === "settings") return <SettingsView />;
  return <GenericModuleView slug={slug as CrudModuleSlug} />;
}

