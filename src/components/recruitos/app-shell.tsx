"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MODULE_CONFIGS,
  NAV_ITEMS,
  RecruitOSData,
  searchModuleRecords,
} from "@/lib/recruitos";
import { useRecruitOS } from "@/lib/recruitos-store";
import { useMemo, useState } from "react";

function SearchResults({ data, query }: { data: RecruitOSData; query: string }) {
  const results = useMemo(() => {
    if (!query) return [];
    return (Object.keys(MODULE_CONFIGS) as Array<keyof typeof MODULE_CONFIGS>)
      .flatMap((slug) =>
        searchModuleRecords(data, slug, query).slice(0, 3).map((record) => ({
          slug,
          title:
            String(
              record[MODULE_CONFIGS[slug].titleKey as keyof typeof record] ?? "Untitled",
            ),
          subtitle: MODULE_CONFIGS[slug].title,
        })),
      )
      .slice(0, 10);
  }, [data, query]);

  if (!query || !results.length) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-stone-200 bg-white/95 p-3 shadow-[0_20px_45px_rgba(15,23,42,0.12)] backdrop-blur">
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">
        Search Results
      </p>
      <div className="space-y-2">
        {results.map((result, index) => (
          <Link
            key={`${result.slug}-${index}`}
            className="block rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-slate-900 transition hover:bg-teal-50"
            href={`/${result.slug}`}
          >
            <div>{result.title}</div>
            <div className="text-xs text-slate-500">{result.subtitle}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, loaded, persistenceMode, syncMessage, isSyncing } = useRecruitOS();
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(13,148,136,0.08),_transparent_28%),linear-gradient(180deg,_#fafaf8_0%,_#f5f7f4_44%,_#eef2ef_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-stone-200/90 bg-stone-50/90 px-5 py-5 backdrop-blur lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="mb-8 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
              RecruitOS
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Personal Recruiting Command Center
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              Daily prep, linked action items, and one source of truth.
            </p>
          </div>
          <nav className="grid gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === `/${item.slug}` || (pathname === "/" && item.slug === "dashboard");
              return (
                <Link
                  key={item.slug}
                  href={`/${item.slug}`}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-white text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.08)] ring-1 ring-teal-200"
                      : "text-slate-600 hover:bg-white/75 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-4 lg:px-8 lg:py-6">
          <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-stone-200 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">One source of truth.</p>
              <p className="text-lg font-semibold text-slate-900">
                Every note can become an action. Every day has a clear plan.
              </p>
            </div>
            <div className="relative w-full max-w-xl">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search contacts, companies, applications, PARs, cases..."
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
              />
              <SearchResults data={data} query={query} />
            </div>
          </div>
          <div className="mb-6 flex flex-col gap-3 rounded-[24px] border border-stone-200 bg-white/85 px-5 py-4 text-sm shadow-[0_12px_36px_rgba(15,23,42,0.05)] md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="font-medium text-slate-900">
                {persistenceMode === "supabase" ? "Cloud sync enabled" : "Temporary local mode"}
              </div>
              <div className="text-slate-600">
                {loaded ? syncMessage : "Loading RecruitOS data..."}
              </div>
            </div>
            <div
              className={`inline-flex h-10 items-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.18em] ${
                persistenceMode === "supabase"
                  ? "bg-teal-50 text-teal-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {isSyncing ? "Syncing" : persistenceMode}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
