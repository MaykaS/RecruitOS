# RecruitOS Bug Tracker

Last updated: 2026-08-24

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

## Priority Tags

- Fix Before Demo
- Fix After Demo
- Won't Fix

## Top 5 Demo Gaps

### DEMO-001: Persistence still needs live end-to-end verification against the real Supabase project
- Priority tag: Fix Before Demo
- Why it matters: If records reset, fail to save, or silently fall back during a demo, trust in the whole product collapses.

### DEMO-002: Some core workflows still feel like generic CRUD instead of recruiting-native flows
- Priority tag: Fix Before Demo
- Why it matters: The product story weakens if applications, companies, and prep feel like database rows instead of a recruiting operating system.

### DEMO-003: Dashboard polish and symmetry are not yet strong enough for a confident external walkthrough
- Priority tag: Fix Before Demo
- Why it matters: The dashboard is the first thing people see, so layout roughness or weak prioritization damages the product narrative immediately.

### DEMO-004: Linked-record integrity still needs explicit manual verification across all critical relationships
- Priority tag: Fix Before Demo
- Why it matters: Broken links between applications, companies, contacts, resumes, prep, and tasks would undermine the core operating-system promise.

### DEMO-005: Open text-encoding and UI polish defects still make parts of the product feel unfinished
- Priority tag: Fix Before Demo
- Why it matters: Mojibake, uneven cards, and rough copy make a working product look broken.

## Open Issues

### BUG-006: Multiple UI labels render with mojibake characters instead of clean punctuation
- Status: In Progress
- Severity: Medium
- Module: UI
- Priority tag: Fix Before Demo
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
- Priority tag: Fix Before Demo
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

### BUG-021: Action Items exposes By Priority and By Source views that do not actually change the data view
- Status: In Progress
- Severity: Medium
- Module: Action Items
- Priority tag: Fix Before Demo
- Discovered: 2026-06-30
- Description: The Action Items filter chips include `By Priority` and `By Source`, but the filtering logic only handles Today, Overdue, This Week, Waiting, and Completed.
- Expected behavior: Each visible filter/view option should produce a distinct, meaningful view of action items.
- Actual behavior: Clicking `By Priority` or `By Source` leaves the table in the default catch-all state.
- Reproduction steps: Open Action Items and click the `By Priority` and `By Source` chips.
- Suspected cause: The UI exposes more view states than the `filteredRecords` logic implements.
- Files likely involved: `src/components/recruitos/module-view.tsx`
- Fix plan: Either implement these views properly or remove them until they exist.
- Verification steps: Confirm each filter chip produces the expected dataset and ordering.
- Files changed: `src/components/recruitos/module-view.tsx`
- Notes: Sorting and filtering logic has been updated so these views do real work, but a manual UI pass is still needed before closing.

### BUG-022: Deleting linked records leaves orphaned references across related modules
- Status: In Progress
- Severity: High
- Module: Linked Records
- Priority tag: Fix Before Demo
- Discovered: 2026-06-30
- Description: Deleting a record currently removes it from its own collection, but most cross-module link fields and arrays are not cleaned up, which can leave orphaned references in related records.
- Expected behavior: Deleting a linked record should either cascade safely or clear dependent links predictably across the in-memory model and persistence layer.
- Actual behavior: Only the Cases path currently cleans up a subset of dependent records; other modules mostly leave stale IDs behind.
- Reproduction steps: Review `deleteRecord` logic and delete linked records such as companies, contacts, applications, or PARs after creating cross-links.
- Suspected cause: Delete behavior is implemented as collection removal, not relationship-aware cleanup.
- Files likely involved: `src/lib/recruitos-store.tsx`, `src/lib/recruitos.ts`
- Fix plan: Centralize relationship-aware delete cleanup and add unit tests for linked-record deletion safety.
- Verification steps: Delete linked records across major modules and verify remaining records do not retain stale relationships.
- Files changed: `src/lib/recruitos-store.tsx`, `src/lib/recruitos-store-helpers.ts`, `src/lib/recruitos-store-helpers.test.ts`
- Notes: Relationship-aware delete cleanup and automated tests were added for major linked paths, but a full manual matrix pass is still needed before closing.

### BUG-023: Configured Supabase project host is not resolvable from the local environment
- Status: Open
- Severity: Critical
- Module: Persistence
- Priority tag: Fix Before Demo
- Discovered: 2026-06-30
- Description: The current `NEXT_PUBLIC_SUPABASE_URL` host in `.env.local` fails DNS resolution, which blocks live persistence verification from this machine.
- Expected behavior: The configured Supabase host should resolve and accept HTTPS connections so RecruitOS can use cloud persistence.
- Actual behavior: `Test-NetConnection` and `Invoke-WebRequest` both fail because the hostname cannot be resolved.
- Reproduction steps: Run `Test-NetConnection <supabase-host> -Port 443` or request the `/rest/v1/` endpoint from this environment.
- Suspected cause: The Supabase project URL is wrong, stale, deleted, or not reachable from the current environment.
- Files likely involved: `.env.local`
- Fix plan: Confirm the active Supabase project URL, update `.env.local` and deployment env vars if needed, then rerun live persistence verification.
- Verification steps: Confirm DNS resolution, successful HTTPS response, then rerun the live persistence probe across core tables.
- Files changed:
- Notes:

### BUG-024: Dashboard tries to host too many module workflows at once and feels cognitively heavy
- Status: In Progress
- Severity: Medium
- Module: Dashboard UX
- Priority tag: Fix Before Demo
- Discovered: 2026-06-30
- Description: The dashboard currently mixes command-center content with deeper module execution surfaces, which makes the home page feel dense and less friendly to scan.
- Expected behavior: The dashboard should orient the user quickly, show progress, surface next steps and triage, and leave deeper execution inside the module pages.
- Actual behavior: Networking execution, prep packet depth, reminder cards, and quick-capture surfaces compete for attention on the same page.
- Reproduction steps: Open the dashboard and scan from top to bottom as a first-time reviewer.
- Suspected cause: The dashboard accumulated too many secondary surfaces while trying to expose value across modules.
- Files likely involved: `src/components/recruitos/module-view.tsx`
- Fix plan: Simplify the dashboard to Today's Command Center, Weekly Progress, Next Steps, Triage, and Weekly View; remove duplicate deep workflow sections from the home page.
- Verification steps: Run the app, verify the dashboard contains only the agreed sections, and confirm scanability is improved on desktop and tablet.
- Files changed: `src/components/recruitos/module-view.tsx`
- Notes: The dashboard has been reduced to Today's Command Center, Weekly Progress, Next Steps, Triage, and Weekly View. Visual/manual verification is still needed before closing.

## Fixed Issues

### BUG-027: Applications lack a visual recruiting timeline and structured step logging
- Status: Fixed
- Severity: Medium
- Module: Applications
- Fixed date: 2026-08-24
- Description: Application records did not show a stage-by-stage recruiting timeline and did not provide structured UI for logging steps like applied, referral, outreach, or interview rounds.
- Fix summary: Replaced the generic Applications table with recruiting cards that show a horizontal timeline, added quick-add timeline steps on each card, and added a timeline editor inside the application modal with persistence-safe structured storage.
- Files changed: `src/components/recruitos/module-view.tsx`, `src/lib/recruitos.ts`, `src/lib/recruitos-store.tsx`, `BUGS.md`
- Verification performed: `npm run typecheck`, `npm exec eslint src/components/recruitos/module-view.tsx src/lib/recruitos.ts src/lib/recruitos-store.tsx`, `npm run build`
- Notes: Timeline events are stored behind the scenes inside the application notes payload so this UI can ship without requiring a new Supabase column first.

### BUG-026: Application triage buckets cannot collapse and dashboard actions feel broken
- Status: Fixed
- Severity: Medium
- Module: Applications
- Fixed date: 2026-08-24
- Description: The dashboard pipeline triage stayed fully expanded, took too much space, and its action controls did not feel dependable from the user perspective.
- Fix summary: Made triage buckets collapsible, reduced the card footprint, made the full card open the Applications pipeline via router navigation, and kept a smaller explicit action-item button inside each card.
- Files changed: `src/components/recruitos/module-view.tsx`, `BUGS.md`
- Verification performed: `npm run typecheck`, `npm exec eslint src/components/recruitos/module-view.tsx`, `npm run build`
- Notes:

### BUG-025: Application triage cards are oversized and expose unexplained score badges
- Status: Fixed
- Severity: Low
- Module: Applications
- Fixed date: 2026-08-24
- Description: The Applications pipeline triage cards used large layouts with extra metadata and numeric side badges that took too much space and were not self-explanatory.
- Fix summary: Reduced triage cards to company name, role title, and primary reason, tightened spacing, and removed the visible application priority score pill from the dashboard card view.
- Files changed: `src/components/recruitos/module-view.tsx`, `BUGS.md`
- Verification performed: `npm run typecheck`, `npm run lint`, `npm run build`
- Notes: The hidden numbers were internal application priority scores used to rank triage items before slicing the top items per bucket.

### BUG-020: Networking rows and execution cards do not open from the full item click target
- Status: Fixed
- Severity: Low
- Module: Networking
- Fixed date: 2026-06-18
- Description: Contact names opened the contact editor, but clicking elsewhere on a Networking row or Networking Execution card did not behave like the Cases section row opening pattern.
- Fix summary: Made full Networking table rows and Networking Execution contact cards open the existing contact editor, while preserving action button behavior with isolated clicks.
- Files changed: `src/components/recruitos/module-view.tsx`, `BUGS.md`
- Verification performed: `npm run typecheck`, `npm run lint`, `npm run build`
- Notes: This makes Networking match the click affordance already used by case records.

### BUG-019: Networking contact names do not open the contact editor
- Status: Fixed
- Severity: Low
- Module: Networking
- Fixed date: 2026-06-18
- Description: Contacts could be opened through the edit icon, but clicking a contact name in the Networking table or Networking Execution card did nothing.
- Fix summary: Made contact names open the existing contact editor in both the main Networking table and Networking Execution cards.
- Files changed: `src/components/recruitos/module-view.tsx`, `BUGS.md`
- Verification performed: `npm run typecheck`, `npm run lint`, `npm run build`
- Notes: The behavior uses the existing edit modal so relationship links and follow-up fields stay editable in one place.

### BUG-018: Networking Execution is oversized and over-eager with some contact suggestions
- Status: Fixed
- Severity: Medium
- Module: Networking
- Fixed date: 2026-06-18
- Description: The Networking Execution section rendered all suggestion groups expanded by default, making the Networking page feel heavy. Its follow-up heuristic also missed contacts due today, and its convert-to-application heuristic could suggest conversion based on high priority alone rather than a genuinely warm relationship.
- Fix summary: Made Networking Execution collapsible with compact bucket counts, treated follow-ups due today as Follow Up Now, prioritized missing takeaways before conversion suggestions, and required strong relationship strength before recommending Convert To Application.
- Files changed: `src/components/recruitos/module-view.tsx`, `src/lib/recruitos.ts`, `BUGS.md`
- Verification performed: `npm run typecheck`, `npm run lint`, `npm run build`
- Notes: The bucket labels remain heuristic-driven, but the rules now better match actual networking workflow timing.

### BUG-017: Case practice prompt could not simulate configurable interviewer probes
- Status: Fixed
- Severity: Medium
- Module: Cases
- Fixed date: 2026-06-16
- Description: The case practice modal encouraged GPT to challenge assumptions, but the user could not control how much interviewer pushback or probing the case rep should include.
- Fix summary: Added an interviewer probe selector to the case practice modal, defaulted it to 2 for a realistic rep, reflected the selected intensity in the UI, and injected the configured probe behavior directly into the GPT case prompt.
- Files changed: `src/components/recruitos/module-view.tsx`, `BUGS.md`
- Verification performed:
- Notes: The selector supports a light mode with minimal interruptions and higher probe counts for more realistic pushback.

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
- Priority tag: Fix Before Demo
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
- Priority tag: Fix After Demo
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
- Priority tag: Fix After Demo
- PRD requirement: Rich specialized views such as fully differentiated Action Item views, deeper weekly planning, and exhaustive module-specific workflows.
- Current state: The app includes the core modules, CRUD, dashboard, linked action items, search, weekly view, and question mapping, but some views are intentionally simplified into shared tables and modal editing for MVP speed.
- Desired state: Expand the remaining module-specific workflows without losing the low-friction feel.
- Fix plan: Prioritize the highest-value follow-up views after live persistence and deployment are complete.
- Verification steps: Manual UX walkthrough for dashboard, action items, applications, networking, PARs, and interview prep after each enhancement.
- Files changed:
- Notes: This is a deliberate MVP tradeoff, not a broken core workflow.

### GAP-004: RecruitOS does not yet have automated tests covering critical product logic
- Status: In Progress
- Severity: High
- Module: Quality
- Priority tag: Fix Before Demo
- PRD requirement: Core workflows should be reliable enough for inspection and repeated iteration.
- Current state: The repo now has an initial Vitest harness with coverage for core domain, persistence fallback, task sync, and linked-record cleanup, but coverage is not yet exhaustive.
- Desired state: RecruitOS should have automated tests for critical linked-record, task-sync, persistence, and workflow logic so regressions are visible early.
- Fix plan: Add a lightweight test runner, write focused tests around domain and store helper logic, and use those tests to validate Phase 1 behaviors.
- Verification steps: Run the test suite locally and confirm coverage of Phase 1 critical logic.
- Files changed: `package.json`, `vitest.config.ts`, `src/lib/recruitos-repository.test.ts`, `src/lib/recruitos-store-helpers.test.ts`
- Notes: This is now a narrowing gap rather than a blank spot.

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


