# RecruitOS PRD Checklist

Last updated: 2026-06-30
Purpose: Acceptance tracker for demo-critical product behavior

## How To Use This File

- Each line should answer "accepted when..."
- Check an item only after the related behavior has been tested in the app
- If behavior exists but feels fragile, leave it unchecked and log the issue in `BUGS.md`

## Dashboard

- [ ] Accepted when the dashboard shows a usable Today's Command Center rather than a generic landing page.
- [ ] Accepted when a daily STAR suggestion appears with working practice controls.
- [ ] Accepted when a daily case suggestion appears with working practice controls.
- [ ] Accepted when networking follow-ups due now are surfaced clearly.
- [ ] Accepted when applications requiring action are surfaced clearly.
- [ ] Accepted when open action items due today or overdue are visible and actionable.
- [ ] Accepted when weekly progress is visible and updates from real activity.
- [ ] Accepted when quick Brain Dump capture works from the dashboard.

## Action Items

- [ ] Accepted when a user can create, edit, complete, reopen, and delete action items.
- [ ] Accepted when action items stay linked to their source records.
- [ ] Accepted when marking an action item complete updates every place it appears.
- [ ] Accepted when Today, Overdue, This Week, Waiting, and Completed views behave correctly.

## PARs / STARs

- [ ] Accepted when a user can create, edit, and delete STAR stories.
- [ ] Accepted when interview questions can be created, edited, and linked to STAR stories.
- [ ] Accepted when one STAR can link to many interview questions and the relationship is visible from both sides.
- [ ] Accepted when STAR practice logs can be created and reflected back into the story record.
- [ ] Accepted when the daily STAR suggestion logic produces a believable recommendation.

## Interview Answers

- [ ] Accepted when a user can create, edit, and delete interview answers.
- [ ] Accepted when practicing an interview answer updates practice metadata correctly.
- [ ] Accepted when interview answers can link to STARs, applications, and interview prep records.

## Cases

- [ ] Accepted when a user can create, edit, and delete case records.
- [ ] Accepted when a daily case suggestion is shown and can be acted on.
- [ ] Accepted when case practice logs update scores, redo-needed behavior, and weakness tracking correctly.
- [ ] Accepted when case learnings can be created from practice and reused later.

## Networking

- [ ] Accepted when a user can create, edit, and delete contacts.
- [ ] Accepted when follow-up workflow behavior feels usable for real networking.
- [ ] Accepted when contacts link correctly to companies, applications, and action items.
- [ ] Accepted when marking a networking touch complete updates the next-step state correctly.

## Companies

- [ ] Accepted when a user can create, edit, and delete companies.
- [ ] Accepted when companies show linked contacts and linked applications correctly.
- [ ] Accepted when company context supports recruiting research and prep, not just storage.

## Applications

- [ ] Accepted when a user can create, edit, and delete applications.
- [ ] Accepted when an application can link to a company, contact, resume, and action items without broken references.
- [ ] Accepted when recruiting track, status, and follow-up behavior reflect real workflow state.
- [ ] Accepted when application progress contributes correctly to dashboard reporting.
- [ ] Accepted when application triage recommendations are believable enough to trust in a demo.

## Interview Prep

- [ ] Accepted when a user can create, edit, and delete interview prep records.
- [ ] Accepted when checklist action items are generated on create.
- [ ] Accepted when readiness score updates from linked checklist action items.
- [ ] Accepted when interview prep can pull together company, application, STAR, answer, case, and task context into one coherent prep flow.

## Mock Interviews

- [ ] Accepted when a user can create, edit, and delete mock interview records.
- [ ] Accepted when weekly mock reminder logic behaves correctly.
- [ ] Accepted when mocks can link to STARs, cases, and action items.
- [ ] Accepted when mock interview feedback can turn into follow-up work.

## Resumes

- [ ] Accepted when a user can create, edit, and delete resume versions.
- [ ] Accepted when a PDF resume can be uploaded successfully when Supabase storage is configured.
- [ ] Accepted when a resume can link to an application and reopen successfully later.

## Outreach Templates

- [ ] Accepted when a user can create, edit, and delete outreach templates.
- [ ] Accepted when outreach templates are usable for networking and application follow-up workflows.

## Settings

- [ ] Accepted when dashboard target settings are editable and update downstream behavior.
- [ ] Accepted when editable option lists support case types, statuses, priorities, and recruiting tracks.

## Global Search And Filters

- [ ] Accepted when global search returns useful results across major modules.
- [ ] Accepted when each major module can search and sort by its key fields without confusing behavior.
