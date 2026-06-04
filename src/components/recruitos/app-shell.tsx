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
    <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_20px_45px_rgba(15,23,42,0.12)] backdrop-blur">
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">
        Search Results
      </p>
      <div className="space-y-2">
        {results.map((result, index) => (
          <Link
            key={`${result.slug}-${index}`}
            className="block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 transition hover:bg-cyan-50"
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(191,232,226,0.42),_transparent_20%),radial-gradient(circle_at_top_right,_rgba(186,230,253,0.28),_transparent_18%),linear-gradient(180deg,_#fcfefe_0%,_#f5fafb_42%,_#edf5f7_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-slate-200/90 bg-white/75 px-4 py-4 backdrop-blur lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
          <div className="mb-5 flex items-center gap-3 rounded-[20px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(246,251,251,0.94))] px-3.5 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(13,148,136,0.16)]">
              RO
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700">
                RecruitOS
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                Personal workspace
              </p>
            </div>
          </div>
          <nav className="grid gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === `/${item.slug}` || (pathname === "/" && item.slug === "dashboard");
              return (
                <Link
                  key={item.slug}
                  href={`/${item.slug}`}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-white text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.08)] ring-1 ring-teal-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-4 lg:px-8 lg:py-5">
          <div className="mb-4 grid gap-3 rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(244,250,251,0.94))] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                One source of truth
              </p>
              <p className="mt-1 max-w-xl text-[0.9rem] leading-[1.15] font-normal text-slate-700 [font-family:var(--font-display)] lg:text-[0.97rem]">
                Every note can become an action. Every day has a clear plan.
              </p>
            </div>
            <div className="relative w-full justify-self-end">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search contacts, companies, applications, PARs, cases..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
              />
              <SearchResults data={data} query={query} />
            </div>
          </div>
          <div className="mb-5 flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-white/88 px-4 py-2 text-sm shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
            <div className="min-w-0">
              <div className="font-medium leading-5 text-slate-900">
                {persistenceMode === "supabase" ? "Cloud sync enabled" : "Temporary local mode"}
              </div>
              <div className="truncate text-sm leading-5 text-slate-600">
                {loaded ? syncMessage : "Loading RecruitOS data..."}
              </div>
            </div>
            <div
              className={`inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                persistenceMode === "supabase"
                  ? "bg-teal-50 text-teal-700"
                  : "bg-cyan-50 text-cyan-700"
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
