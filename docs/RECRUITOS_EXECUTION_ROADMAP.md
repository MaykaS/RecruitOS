# RecruitOS Execution Roadmap

Last updated: 2026-06-30
Owner: Maya + Codex
Target: 95-97% demo-ready release candidate by 2026-07-31

## How To Use This Document

- This is the execution source of truth for getting RecruitOS to a strong final version by the end of July.
- Work top to bottom unless a blocker forces a reorder.
- Only check off an item after the related test has been run and passed.
- Do not mark work done because code exists. Mark it done only when the product behavior is verified.
- Keep fixes simple, typed, and maintainable. No elaborate code when a smaller clean solution works.
- If a change reveals a bug, add it to `BUGS.md` before fixing it.

## Release Standard

RecruitOS is ready for inspection, demo, or release candidate review when:

- a user can run daily recruiting from the dashboard
- core records persist with no silent data loss
- linked records behave reliably
- action items function as the shared execution system
- applications, networking, prep, STARs, and cases feel like one coherent system
- the UI feels polished enough that roughness does not distract from the product story
- the AI direction is useful, credible, and human-in-the-loop
- lint, typecheck, build, and full regression pass

## Phase 1: Foundation Lock

Window: 2026-06-30 to 2026-07-05
Gate: A real application can be created, linked, edited, reopened, and progressed end-to-end with no data loss or broken relationships.

### Tasks

- [x] Finalize the master product truth in `docs/RECRUITOS_MASTER_PRODUCT_DOC.md`.
- [x] Finalize the acceptance tracker in `docs/RECRUITOS_PRD_CHECKLIST.md`.
- [x] Document the top 5 demo gaps.
- [ ] Verify Supabase persistence across core modules.
- [ ] Verify all core data relationships bidirectionally where intended.
- [ ] Verify action items behave as the shared source of truth.
- [ ] Verify edit and delete safety on linked records.
- [x] Triage `BUGS.md` into `fix before demo`, `fix after demo`, and `won't fix`.

### Required Tests

- [ ] Create records in applications, contacts, STARs, cases, and action items; refresh and reopen; verify persistence.
- [ ] Create an application with linked company, contact, resume, and action item; reopen and verify all links.
- [ ] Complete an action item from one surface and verify the updated state everywhere else.
- [ ] Edit linked records and verify no broken references appear.
- [ ] Delete linked records and verify the remaining system fails safely and predictably.
- [ ] Verify Supabase fallback behavior is visible and understandable if sync fails.

## Phase 2: Core Workflow Integrity

Window: 2026-07-06 to 2026-07-11
Gate: The application, networking, and interview prep flows each work cleanly without narration, workaround, or broken context.

### Tasks

- [ ] Tighten the applications workflow.
- [ ] Tighten the networking workflow.
- [ ] Tighten the companies context workflow.
- [ ] Tighten the interview prep creation and checklist workflow.
- [ ] Tighten the resume upload and linking workflow.
- [ ] Tighten the brain dump to action item workflow.

### Required Tests

- [ ] Application happy path: create company if missing, create application, link contact, assign resume, create follow-up, reopen later, continue cleanly.
- [ ] Networking happy path: create contact, link company, log follow-up, create action item, mark follow-up complete.
- [ ] Interview prep happy path: create prep from interview, confirm checklist generation, link STARs, answers, and cases, verify readiness score updates.
- [ ] Resume flow: upload PDF, attach to application, reopen and verify file access works.
- [ ] Brain dump flow: capture note, convert to action item, verify linkage persists.

## Phase 3: Dashboard Command Center

Window: 2026-07-12 to 2026-07-16
Gate: The dashboard can drive a real day of recruiting work by itself.

### Tasks

- [ ] Refine daily recommendation logic.
- [ ] Improve weekly scoreboard trustworthiness.
- [ ] Improve application triage visibility.
- [ ] Improve networking follow-up surfacing.
- [ ] Improve interview prep urgency surfacing.
- [ ] Improve dashboard quick-capture behavior.
- [ ] Remove dead-end or low-value dashboard sections.

### Required Tests

- [ ] Empty-state dashboard test.
- [ ] Light-data dashboard test.
- [ ] Heavy-data dashboard test.
- [ ] Verify surfaced actions are immediately actionable.
- [ ] Verify recommendations feel sensible across at least 10 mixed records.
- [ ] Verify no top card is stale, misleading, or redundant.

## Phase 4: Practice System Maturity

Window: 2026-07-17 to 2026-07-21
Gate: Behavioral and case prep feel coherent enough for repeated weekly use.

### Tasks

- [ ] Tighten the STAR workspace.
- [ ] Tighten question-to-STAR coverage visibility.
- [ ] Tighten STAR practice logging and improvement loops.
- [ ] Tighten case practice flow and feedback visibility.
- [ ] Tighten case learnings reuse.
- [ ] Tighten interview answers practice behavior.
- [ ] Tighten mock interview follow-up conversion.

### Required Tests

- [ ] Practice the same STAR multiple times and verify history improves the story record.
- [ ] Link one STAR to many questions and verify both sides reflect the relationship.
- [ ] Practice the same case multiple times and verify logs, scores, and redo behavior.
- [ ] Create a case learning from practice and verify it persists and is reusable.
- [ ] Practice an interview answer and verify metadata updates correctly.
- [ ] Create a mock interview and verify follow-up work can be generated and tracked.

## Phase 5: UX Polish And Demo Readiness

Window: 2026-07-22 to 2026-07-26
Gate: No critical screen feels unfinished enough to weaken trust in the product story.

### Tasks

- [ ] Standardize spacing, hierarchy, and visual consistency across modules.
- [ ] Improve form ordering in major workflows.
- [ ] Reduce clutter in dense screens.
- [ ] Improve empty states and microcopy.
- [ ] Fix the top demo-critical UX rough edges.
- [ ] Improve search and navigation clarity.
- [ ] Confirm dashboard and major modules hold up on smaller screens if needed.

### Required Tests

- [ ] Module-by-module visual review.
- [ ] First-time viewer walkthrough from dashboard through applications, networking, prep, STARs, and cases.
- [ ] Search test across major modules.
- [ ] Sort and filter sanity checks across major modules.
- [ ] Verify every key screen has a clear primary action.
- [ ] Responsive sanity check on dashboard and core modules.

## Phase 6: AI Story And Product Positioning

Window: 2026-07-27 to 2026-07-29
Gate: The AI story can be explained clearly in two minutes and sounds practical, focused, and trustworthy.

### Tasks

- [ ] Define the AI experiences that already exist or are implied in the product.
- [ ] Define the near-term AI features worth showing or describing.
- [ ] Separate coach AI from agent AI.
- [ ] Define human-in-the-loop boundaries clearly.
- [ ] Define what AI writes back into RecruitOS and what it does not.
- [ ] Finalize one future-state AI architecture view.

### Required Tests

- [ ] Verify each AI concept strengthens an existing workflow instead of creating a disconnected surface.
- [ ] Verify writeback expectations are explicit for records, tasks, notes, and recommendations.
- [ ] Review the AI story for trust, clarity, and product realism.

## Phase 7: Final QA And Release Candidate

Window: 2026-07-30 to 2026-07-31
Gate: The release candidate is stable, build-clean, demo-safe, and ready for inspection.

### Tasks

- [ ] Run full regression across all major modules.
- [ ] Run lint.
- [ ] Run typecheck.
- [ ] Run build.
- [ ] Re-test persistence after the final changes.
- [ ] Re-test the top 10 workflows.
- [ ] Prepare release or inspection notes.
- [ ] Prepare and rehearse the demo path.
- [ ] Freeze scope except for true blockers.

### Required Tests

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] Full app smoke test.
- [ ] Fresh-session persistence test.
- [ ] Full demo rehearsal from start to finish.
- [ ] Bug bash against all `fix before demo` items.

## Sequential Master Checklist

- [x] Lock product truth docs.
- [x] Lock acceptance checklist.
- [x] Lock bug triage and top demo gaps.
- [ ] Verify persistence.
- [ ] Verify relationships.
- [ ] Verify action item shared-state behavior.
- [ ] Verify edit and delete safety.
- [ ] Tighten applications flow.
- [ ] Tighten networking flow.
- [ ] Tighten companies context flow.
- [ ] Tighten interview prep flow.
- [ ] Tighten resumes flow.
- [ ] Tighten brain dump conversion flow.
- [ ] Upgrade dashboard usefulness.
- [ ] Upgrade STAR system.
- [ ] Upgrade case system.
- [ ] Upgrade interview answers and mock workflow.
- [ ] Polish UI across modules.
- [ ] Finalize AI story and near-term AI scope.
- [ ] Run final QA, build checks, and demo rehearsal.

## Definition Of Done For 2026-07-31

RecruitOS is done enough for release candidate review when:

- data persists reliably
- no core linked-record workflow is broken
- action items truly behave like one shared system
- the dashboard clearly tells the user what to do next
- applications, networking, prep, STARs, and cases feel like one coherent operating system
- the UI no longer needs apology during a demo
- the AI direction is focused and credible
- the build is clean and the demo can be run confidently
