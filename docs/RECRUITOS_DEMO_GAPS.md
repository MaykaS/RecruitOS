# RecruitOS Demo Gaps

Last updated: 2026-06-30
Purpose: Full inventory of demo-facing gaps discovered during product and code audit

## How To Read This

- This file is broader than the top 5 list in `BUGS.md`.
- A gap can be a bug, a reliability risk, a UX weakness, or an unfinished workflow.
- Use this list to understand the full demo surface, then prioritize from it.

## Critical And High-Priority Gaps

### 1. Live Supabase persistence is configured locally but not yet fully verified end-to-end
- Priority: Critical
- Why it matters: The product cannot be trusted in a demo if records can fail to persist or silently fall back.
- Current state: Supabase environment variables exist locally, but the configured host currently fails DNS resolution from this machine, so persistence across core modules still needs live verification after env repair.

### 2. Linked-record integrity has not yet been fully verified across all core relationships
- Priority: Critical
- Why it matters: RecruitOS depends on cross-linked records feeling like one system.
- Current state: Relationship logic exists, but manual verification remains incomplete.

### 3. Deleting linked records is not relationship-safe yet
- Priority: High
- Why it matters: Orphaned references are dangerous in a relationship-heavy product.
- Current state: Relationship-aware cleanup has been added for major delete paths and covered by automated tests, but a full manual matrix pass is still pending.

### 4. Action Items still need explicit verification as the shared source-of-truth layer
- Priority: High
- Why it matters: This is one of the most important product promises.
- Current state: Core action-item sync behavior now has automated coverage, but it still needs full module-by-module manual verification.

### 5. There is no automated test harness for core product logic yet
- Priority: High
- Why it matters: Without tests, regressions in linked-record behavior and workflow logic will be hard to catch.
- Current state: An initial Vitest harness now exists for critical domain and persistence logic, but coverage still needs to expand over time.

### 6. Some action-item views are exposed in UI but not actually implemented
- Priority: High
- Why it matters: Fake or misleading UI controls reduce trust fast in demos.
- Current state: Logic has been added so `By Priority` and `By Source` now map to real views, but a manual UI verification pass is still needed before closing the gap.

### 7. Multiple UI strings still contain mojibake / encoding artifacts
- Priority: High
- Why it matters: A working product can still look broken if text rendering is visibly corrupted.
- Current state: There are known artifacts in labels and summaries.

### 8. Dashboard card alignment and internal rhythm still need polish
- Priority: High
- Why it matters: The dashboard is the product's front door.
- Current state: The top cards still have known symmetry and alignment issues.

### 9. Some major workflows still feel generic rather than recruiting-native
- Priority: High
- Why it matters: The product story weakens if the UX feels like a CRUD app.
- Current state: Several modules still rely on generic table-plus-modal interaction patterns.

## Medium-Priority Gaps

### 10. Search results jump to a module, not directly to a specific record
- Priority: Medium
- Why it matters: Search is useful today, but it is less efficient than it should be.
- Current state: Search results route the user to the module page rather than opening the matched record.

### 11. Brain Dump exists as a capture flow, but not as a standalone nav destination
- Priority: Medium
- Why it matters: Capture exists, but the information architecture may still feel incomplete to a reviewer.
- Current state: Brain Dump is present in data and dashboard flow, not in the left-nav module list.

### 12. Some PRD-expected specialized views are still lightweight MVP versions
- Priority: Medium
- Why it matters: Some screens may feel less deep than the product vision suggests.
- Current state: This is intentional in places, but it still affects demo perception.

### 13. Fallback behavior is visible, but not yet fully proven under failure scenarios
- Priority: Medium
- Why it matters: Silent or confusing fallback could undermine confidence during use.
- Current state: The UI communicates local vs cloud mode, but live failure-path testing is still pending.

### 14. Deployment and production verification are not yet fully completed
- Priority: Medium
- Why it matters: Demo confidence improves when the hosted story is known-good.
- Current state: Local project state is ahead of deployment verification.

## Lower-Priority But Visible Gaps

### 15. Some modules still rely heavily on text-heavy forms with limited progressive guidance
- Priority: Low
- Why it matters: It increases friction and can make the experience feel dense.
- Current state: Functionally usable, but not yet as guided as the end-state product.

### 16. Cross-module drill-through is not always as direct as it could be
- Priority: Low
- Why it matters: A reviewer may expect faster movement from a linked summary to the underlying record.
- Current state: Some linkages are visible and derived, but not always surfaced as direct navigation.

## Summary

The biggest immediate risks are:

- persistence trust
- linked-record integrity
- action-item source-of-truth verification
- delete safety
- lack of automated tests
- visible UI trust issues like mojibake and misleading filters

These are the right things to handle first because they affect both product credibility and engineering safety.
