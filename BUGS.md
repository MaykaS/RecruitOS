# RecruitOS Bug Tracker

Last updated: 2026-06-16

## How to use this file

- Every bug, missing feature, broken relationship, UX friction point, schema mismatch, or unfinished PRD requirement should be logged here.
- Each issue should have an ID.
- Do not delete fixed bugs. Move them to the Fixed Issues section with verification notes.
- When a new issue is discovered, add it before fixing it.
- When an issue is fixed, update its status, add files changed, and add verification notes.
- Keep this file current after every meaningful code change.

## Status Legend

- Open
- In Progress
- Fixed
- Won’t Fix
- Needs Clarification

## Severity Legend

- Critical: app-breaking, data loss, broken core workflow
- High: important recruiting workflow broken or unreliable
- Medium: inconvenient but usable
- Low: polish, copy, minor UX

## Open Issues

### BUG-005: Supabase schema ID types are incompatible with frontend seed and runtime records
- Status: Fixed
- Severity: Critical
- Module: Data Layer
- Fixed date: 2026-05-21
- Description: The current schema uses `uuid` primary/foreign keys, while the app currently generates and seeds string IDs such as `company-oracle` and `application-adobe`.
- Fix summary: Reworked the Supabase schema to use text IDs that match the seeded frontend records and added a Supabase-backed repository/provider flow that seeds empty databases and persists linked module data.
- Files changed: `supabase/schema.sql`, `src/lib/recruitos-repository.ts`, `src/lib/recruitos-store.tsx`
- Verification performed: `npm run typecheck`, `npm run lint`, `npm run build`
- Notes: The app now uses Supabase as the primary runtime store whenever env vars are present, with local fallback only when Supabase is unavailable.

### BUG-006: Multiple UI labels render with mojibake characters instead of clean punctuation
- Status: In Progress
- Severity: Medium
- Module: UI
- Discovered: 2026-05-21
- Description: Several labels show characters like `â€”`, `Â·`, and `â€™` instead of em dashes, middots, and apostrophes.
- Expected behavior: All labels and summaries should render clean ASCII/Unicode punctuation consistently.
- Actual behavior: Visible text artifacts make the UI feel broken and reduce readability.
- Reproduction steps: Inspect dashboard cards and summary strings in the current deployed UI.
- Suspected cause: Text encoding artifacts were introduced while patching strings.
- Files likely involved: `src/lib/recruitos.ts`, `src/components/recruitos/module-view.tsx`
- Fix plan: Normalize the affected strings and replace fragile punctuation with safe, consistent rendering.
- Verification steps: Run the app and visually confirm cleaned labels in dashboard, tables, and helper text.
- Files changed:
- Notes:

### BUG-007: Dashboard card internals and action rows are visually misaligned
- Status: In Progress
- Severity: Medium
- Module: Dashboard UI
- Discovered: 2026-05-21
- Description: Paired dashboard cards do not align well because headings, support text, and action rows have inconsistent heights and wrapping behavior.
- Expected behavior: Top cards should align to a shared internal structure with stable button placement.
- Actual behavior: Cards feel disorganized and visually uneven, especially across adjacent modules.
- Reproduction steps: Open the dashboard and compare the PAR and Case cards.
- Suspected cause: Cards currently use freeform stacked content instead of a shared internal grid/flex structure.
- Files likely involved: `src/components/recruitos/module-view.tsx`, `src/components/recruitos/app-shell.tsx`, `src/app/globals.css`
- Fix plan: Introduce a cleaner light card system with consistent content regions and button sizing.
- Verification steps: Check desktop and tablet layouts to confirm paired cards align cleanly.
- Files changed:
- Notes:







## Fixed Issues

### BUG-016: STAR practice prompt could not simulate configurable interviewer follow-up questions
- Status: Fixed
- Severity: Medium
- Module: PARs
- Fixed date: 2026-06-16
- Description: The STAR practice modal generated a strong base GPT prompt, but it could not tell GPT to ask realistic interviewer-style follow-up questions, and the user had no control over how many follow-ups to include in a rep.
- Fix summary: Added a follow-up question selector to the STAR practice modal, defaulted it to 2 for a realistic rep, reflected the selected count in the UI, and injected the configured interviewer-style follow-up instructions directly into the GPT prompt.
- Files changed: `src/components/recruitos/module-view.tsx`, `BUGS.md`
- Verification performed: `npm run typecheck`, `npm run lint`, `npm run build`
- Notes: The selector supports zero follow-ups for quick reps and updates the prompt live as the user changes the count.

### BUG-015: RecruitOS has no user-facing export or backup flow for personal recruiting data
- Status: Fixed
- Severity: High
- Module: Data Safety
- Fixed date: 2026-05-22
- Description: The app stored recruiting data in Supabase or local browser storage, but it did not currently give the user a simple way to download a backup copy.
- Fix summary: Added a one-click JSON export in Settings that downloads the current RecruitOS dataset with export metadata and the active persistence mode.
- Files changed: `src/components/recruitos/module-view.tsx`, `BUGS.md`
- Verification performed: `npm run typecheck`, `npm run lint`, `npm run build`
- Notes: The export uses the live in-memory RecruitOS dataset, so it works for both Supabase-backed and local-mode sessions.

### BUG-014: Interview prep lacks an assembled packet view for upcoming interviews
- Status: Fixed
- Severity: High
- Module: Interview Prep
- Fixed date: 2026-05-22
- Description: Interview prep records generated checklist action items, but the user still had to manually gather the company snapshot, application context, best PARs, best answers, and open prep tasks.
- Fix summary: Added a pure interview prep packet builder, surfaced packet cards on the dashboard and interview prep module, highlighted missing prep gaps, and kept open checklist actions actionable from the packet view.
- Files changed: `src/lib/recruitos.ts`, `src/components/recruitos/module-view.tsx`, `BUGS.md`
- Verification performed: `npm run typecheck`, `npm run lint`, `npm run build`
- Notes: The v1 packet uses explicit links first and falls back to role/confidence-based suggestions.

### BUG-013: Networking module is missing execution support for outreach sequencing and post-call follow-through
- Status: Fixed
- Severity: High
- Module: Networking
- Fixed date: 2026-05-22
- Description: Contacts were tracked, but the app did not guide the user through who to contact next, how to prep for the conversation, or how to turn a call into next steps.
- Fix summary: Added contact workflow insights, next-best-action groupings, prep prompts, and post-call shortcut actions on both the dashboard and networking module.
- Files changed: `src/lib/recruitos.ts`, `src/components/recruitos/module-view.tsx`, `BUGS.md`
- Verification performed: `npm run typecheck`, `npm run lint`, `npm run build`
- Notes: The workflow is still heuristic-driven and intentionally derived from existing single-user data.

### BUG-012: Applications module lacks specialized pipeline triage workflows
- Status: Fixed
- Severity: High
- Module: Applications
- Fixed date: 2026-05-22
- Description: Applications rendered as a generic CRUD table without strategy buckets such as Double Down, Apply This Week, Network First, At Risk, Waiting Too Long, and Drop.
- Fix summary: Added derived application insights, strategy buckets, driver badges, and recruiting-specific action presets above the applications table and on the dashboard.
- Files changed: `src/lib/recruitos.ts`, `src/components/recruitos/module-view.tsx`, `BUGS.md`
- Verification performed: `npm run typecheck`, `npm run lint`, `npm run build`
- Notes: Labels and rankings are derived from deadline pressure, referral leverage, role fit, timeline, and stalled follow-up signals.

### BUG-011: Dashboard lacks an opinionated prioritization layer for daily recruiting decisions
- Status: Fixed
- Severity: High
- Module: Dashboard
- Fixed date: 2026-05-22
- Description: The dashboard surfaced activity, but it did not clearly rank what the user should do now based on application urgency, referral leverage, interview momentum, or stalled follow-ups.
- Fix summary: Replaced generic action lists with a ranked What To Do Now queue and added shared decision-layer selectors that surface application, networking, and interview prep priorities.
- Files changed: `src/lib/recruitos.ts`, `src/components/recruitos/module-view.tsx`, `BUGS.md`
- Verification performed: `npm run typecheck`, `npm run lint`, `npm run build`
- Notes: The queue uses derived heuristics only and does not require schema changes.

### BUG-010: Resume versions cannot upload PDF files directly into RecruitOS
- Status: Fixed
- Severity: Medium
- Module: Resumes
- Fixed date: 2026-05-21
- Description: Resume versions only supported a manual `file_link` field, which made attaching real resume PDFs clunky.
- Fix summary: Added a Supabase Storage upload helper, wired PDF upload into the Resume Version modal, saved the returned public link into `file_link`, and added an `Open PDF` action in the resume table.
- Files changed: `src/lib/supabase/storage.ts`, `src/components/recruitos/module-view.tsx`, `src/lib/recruitos.ts`, `.env.example`
- Verification performed: `npm run lint`, `npm run typecheck`, `npm run build`
- Notes: Requires a Supabase Storage bucket named `resume-files` or a custom `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET` value.

### BUG-005: Supabase schema ID types are incompatible with frontend seed and runtime records
- Status: Fixed
- Severity: Critical
- Module: Data Layer
- Fixed date: 2026-05-21
- Description: The original Supabase schema used `uuid` keys while the app generates stable string IDs for seeded and runtime records.
- Fix summary: Reworked the schema to use text IDs and added a Supabase-backed repository/provider path that seeds empty databases and persists the existing linked record model.
- Files changed: `supabase/schema.sql`, `src/lib/recruitos-repository.ts`, `src/lib/recruitos-store.tsx`
- Verification performed: `npm run typecheck`, `npm run lint`, `npm run build`
- Notes: Supabase is now the primary persistence mode whenever environment variables are configured.

### BUG-008: Repository sync layer uses explicit `any` casts that fail lint
- Status: Fixed
- Severity: High
- Module: Data Layer
- Fixed date: 2026-05-21
- Description: The first repository implementation used temporary `any` casts around Supabase transport methods, which violated lint rules.
- Fix summary: Replaced the loose casts with a narrow transport interface/helper and retained typed collection normalization around the repository edges.
- Files changed: `src/lib/recruitos-repository.ts`
- Verification performed: `npm run lint`, `npm run typecheck`
- Notes: The repository now passes lint without disabling rules.

### BUG-009: Production build can fail because a stale `.next` artifact is locked on disk
- Status: Fixed
- Severity: Medium
- Module: Build
- Fixed date: 2026-05-21
- Description: `next build` failed with `EPERM` while unlinking a stale file under `.next\\static`.
- Fix summary: Cleared the stale build output and reran the production build from a clean output directory.
- Files changed: `.next/` build output
- Verification performed: `npm run build`
- Notes: This was an environment/build-artifact issue, not an application code regression.

### BUG-001: Local validation scripts were not reliable after the initial scaffold move
- Status: Fixed
- Severity: High
- Module: Tooling
- Fixed date: 2026-05-21
- Description: `typecheck` and `lint` were not reliable during the first verification pass after the scaffold and package changes.
- Fix summary: Updated package scripts to use `npm exec`, normalized the package install state, and reran validation.
- Files changed: `package.json`
- Verification performed: `npm run typecheck`, `npm run lint`
- Notes: Validation commands now run cleanly from the repo root.

### BUG-002: Interview question editing bypassed the app store and forced a hard reload
- Status: Fixed
- Severity: High
- Module: PARs
- Fixed date: 2026-05-21
- Description: The first interview-question editor implementation wrote directly to localStorage and reloaded the page instead of using shared app state.
- Fix summary: Added dedicated interview question save/delete actions in the shared store and updated the PAR questions UI to use them.
- Files changed: `src/lib/recruitos-store.tsx`, `src/components/recruitos/module-view.tsx`
- Verification performed: `npm run typecheck`, `npm run lint`, `npm run build`
- Notes: Question edits now follow the same state flow as the other modules.

### BUG-003: Seed data contained duplicate object keys that broke TypeScript validation
- Status: Fixed
- Severity: Medium
- Module: Seed Data
- Fixed date: 2026-05-21
- Description: Two case seed objects repeated `created_at` and `updated_at`, causing TypeScript object literal errors.
- Fix summary: Removed duplicate keys and revalidated the app.
- Files changed: `src/lib/recruitos.ts`
- Verification performed: `npm run typecheck`, `npm run build`
- Notes: Seed data is now clean enough for build-time verification.

### BUG-004: Next.js build emitted a Turbopack workspace root warning
- Status: Fixed
- Severity: Low
- Module: Build Config
- Fixed date: 2026-05-21
- Description: Next.js inferred the wrong workspace root because another lockfile exists higher in the filesystem.
- Fix summary: Set `turbopack.root` to `process.cwd()` in Next config.
- Files changed: `next.config.ts`
- Verification performed: `npm run build`
- Notes: This keeps the app rooted to the RecruitOS repo instead of the parent OneDrive tree.

## Implementation Gaps

### GAP-001: Live Supabase persistence is scaffolded but not yet wired end-to-end
- Status: Open
- Severity: Medium
- Module: Data Layer
- PRD requirement: Use Supabase for the database and preserve app relationships in deployed use.
- Current state: The runtime now uses a Supabase-backed repository/provider flow and seeds empty databases, but the deployed project still needs production Supabase environment variables and a live database rollout.
- Desired state: Production and local environments should both point at the real Supabase project so all CRUD and relationship syncing happen in the cloud by default.
- Fix plan: Add the real Supabase env vars in Vercel and local `.env.local`, apply the schema to the target project, and verify CRUD across multiple sessions/devices.
- Verification steps: Configure env vars, apply `supabase/schema.sql`, run CRUD flows across modules, confirm persistence after refresh and across browsers, then rerun `lint`, `typecheck`, and `build`.
- Files changed:
- Notes: The remaining work is deployment/configuration rather than missing application architecture.

### GAP-002: GitHub/Vercel publishing is prepared locally but not fully completed
- Status: Needs Clarification
- Severity: High
- Module: Deployment
- PRD requirement: Connect the repo to GitHub and publish on Vercel so the user can keep using it.
- Current state: Local git is initialized and `origin` points to `https://github.com/MaykaS/RecruitOS.git`, but GitHub API access returned `404` for that repo and the Vercel CLI is not installed/authenticated in this environment.
- Desired state: Push this code to the intended GitHub repo and connect the project to Vercel with the required environment variables.
- Fix plan: Confirm repo access, push the first commit, authenticate Vercel, link the project, add Supabase env vars, and deploy.
- Verification steps: `git push`, Vercel project link, environment pull/sync, deploy, then open the deployed URL successfully.
- Files changed: `.git` config
- Notes: This one is blocked by external account access rather than code.

### GAP-003: Some PRD views are implemented in lightweight MVP form rather than full specialized workflows
- Status: Open
- Severity: Medium
- Module: UX
- PRD requirement: Rich specialized views such as fully differentiated Action Item views, deeper weekly planning, and exhaustive module-specific workflows.
- Current state: The app includes the core modules, CRUD, dashboard, linked action items, search, weekly view, and question mapping, but some views are intentionally simplified into shared tables and modal editing for MVP speed.
- Desired state: Expand the remaining module-specific workflows without losing the low-friction feel.
- Fix plan: Prioritize the highest-value follow-up views after live persistence and deployment are complete.
- Verification steps: Manual UX walkthrough for dashboard, action items, applications, networking, PARs, and interview prep after each enhancement.
- Files changed:
- Notes: This is a deliberate MVP tradeoff, not a broken core workflow.

## Regression Checklist

Maintain this checklist and update it as the product evolves:

- [x] Dashboard loads without build-time errors.
- [x] User can create/edit/delete an action item.
- [x] Action item appears in master Action Items table.
- [x] Linked action item appears inside the related source record.
- [x] Marking action item complete updates everywhere.
- [x] User can create/edit/delete a contact.
- [x] Contact follow-up appears on dashboard when due.
- [x] User can create/edit/delete an application.
- [x] Applications count toward daily/weekly targets.
- [x] Applications are split by recruiting track.
- [x] User can create/edit/delete a company.
- [x] Company links to contacts and applications.
- [x] User can create/edit/delete a PAR story.
- [x] PAR can link to interview questions.
- [x] Questions view expands to show related PARs.
- [x] User can log PAR practice.
- [x] User can create/edit/delete a case practice record.
- [x] Daily case suggestion appears.
- [x] User can create/edit/delete interview answers.
- [x] User can create interview prep record.
- [x] Interview prep checklist creates linked action items.
- [x] Interview readiness score updates based on checklist completion.
- [x] User can create/edit/delete mock interview.
- [x] Weekly mock reminder appears if no mock is completed.
- [x] User can create/edit/delete resume version.
- [x] User can create/edit/delete outreach template.
- [x] Settings targets update dashboard progress.
- [x] Weekly view shows tasks by day.
- [x] Brain dump can be converted into action item.


