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
    <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl backdrop-blur">
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">
        Search Results
      </p>
      <div className="space-y-2">
        {results.map((result, index) => (
          <Link
            key={`${result.slug}-${index}`}
            className="block rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10"
            href={`/${result.slug}`}
          >
            <div>{result.title}</div>
            <div className="text-xs text-slate-400">{result.subtitle}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data } = useRecruitOS();
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(58,123,213,0.15),_transparent_35%),linear-gradient(180deg,_#07111f_0%,_#0f172a_40%,_#111827_100%)] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-300">
              RecruitOS
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Personal Recruiting Command Center
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Daily prep, linked action items, and one source of truth.
            </p>
          </div>
          <nav className="grid gap-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === `/${item.slug}` || (pathname === "/" && item.slug === "dashboard");
              return (
                <Link
                  key={item.slug}
                  href={`/${item.slug}`}
                  className={`rounded-2xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-sky-500/20 text-white shadow-[inset_0_0_0_1px_rgba(125,211,252,0.35)]"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-4 lg:px-8 lg:py-6">
          <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-950/45 p-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-400">One source of truth.</p>
              <p className="text-lg font-medium text-white">
                Every note can become an action. Every day has a clear plan.
              </p>
            </div>
            <div className="relative w-full max-w-xl">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search contacts, companies, applications, PARs, cases..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-sky-300/40"
              />
              <SearchResults data={data} query={query} />
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
