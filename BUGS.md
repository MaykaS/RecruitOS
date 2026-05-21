# RecruitOS Bug Tracker

Last updated: 2026-05-21

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

No active implementation bugs are currently tracked after the initial scaffold-hardening pass. Remaining work is captured in Implementation Gaps below.

## Fixed Issues

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
- Severity: High
- Module: Data Layer
- PRD requirement: Use Supabase for the database and preserve app relationships in deployed use.
- Current state: The app ships with a typed local-first store, seed data, `.env.example`, a lazy Supabase client helper, and `supabase/schema.sql`, but the runtime still persists to browser localStorage.
- Desired state: CRUD and relational syncing should read/write to Supabase with environment variables configured for local and Vercel use.
- Fix plan: Add a Supabase-backed repository layer, migrate seeded entities into tables, and switch the provider from localStorage to remote persistence with optimistic UI where useful.
- Verification steps: Configure env vars, run CRUD flows across modules, confirm persistence after refresh and across browsers, then rerun `lint`, `typecheck`, and `build`.
- Files changed:
- Notes: This is the main remaining product gap before calling the stack fully Supabase-backed.

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
