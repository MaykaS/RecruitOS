# RecruitOS PRD

## Product Vision
RecruitOS is a personal recruiting operating system for MBA internship candidates. Its job is to help one person run a serious recruiting process with less chaos, stronger memory, and clearer next actions.

The long-term product promise is:
- always know the next best action
- never lose important recruiting information

RecruitOS is not meant to become a generic tracker first and figure out its value later. It should stay opinionated around MBA internship recruiting, personal workflow depth, and structured execution.

## Product Direction
### Final-ish direction
- RecruitOS should mature into a personal recruiting OS first, not a broad multi-user SaaS product.
- The dashboard should remain the operational center of the product.
- Structured records should become reliable enough that the product can act as both workflow system and recruiting memory.
- AI should be a layer on top of the system, not the system itself.

### Role of AI
- AI should primarily help capture and organize messy recruiting input.
- The first major AI workflow should focus on job links and job postings.
- Early AI behavior should create structured drafts for user review, not silently write records without approval.
- AI execution can come later, after the data foundation and review flows are stable.

### Near-term strategic focus
- The next major build phase should be real backend persistence, schema design, and migrations.
- Workflow depth should improve after the backend foundation is in place.
- AI-ready capture flows should be designed before the first AI feature is implemented.

### Explicitly later
- Notifications
- Authentication
- Multi-user collaboration
- Broader any-job-seeker positioning

## Current MVP Goals
- Reduce recruiting chaos by centralizing applications, networking, casing, and recruiting knowledge.
- Surface what needs attention now through one dashboard instead of making the user hunt across lists.
- Make every core record actionable through dated next steps, deadlines, follow-ups, cadence rules, and recent activity.
- Keep the current version lightweight enough to iterate quickly without backend complexity in the UI layer.

## Current MVP Boundaries
- No email, SMS, or calendar reminders
- No authentication
- No multi-user collaboration
- No backend database yet
- No in-app AI workflows yet
- No application import pipeline or browser extension yet

## Product Structure
### Global layout
- Product name: `RecruitOS`
- Subtitle: `Recruiting operating system`
- Persistent coaching widget: `Focus today`
- Primary navigation:
  - Dashboard
  - Applications
  - Networking
  - Casing
  - Tips
  - Settings
- Primary actions are available from the dashboard header for quickly creating contacts and applications

### First-run experience
- Start with an empty but guided workspace.
- Use empty states to teach the workflow and encourage first entries.
- Seed cadence rules if helpful, but do not seed mock applications, contacts, or sessions.

## Current MVP Modules
### Dashboard
- Time-aware greeting and current date
- KPI cards:
  - Active Applications
  - Interviews
  - Contacts
  - Offers
- `What needs attention now` panel merges:
  - Due or overdue cadence tasks
  - Application next steps
  - Deadline alerts
- `Snapshot` panel shows counts across the full application pipeline
- `Recent applications` shows the latest 2-3 application records
- `Recent activity` shows the latest `N` actions where `N` is configured in Settings

### Applications
- Full CRUD
- Full data model:
  - id
  - company
  - role
  - location
  - type
  - priority
  - status
  - salary or compensation
  - applicationDate
  - deadline
  - jobUrl
  - nextStep
  - nextStepDate
  - linkedContactIds
  - notes
  - tags
  - createdAt
  - updatedAt
- Business rule:
  - if status = `Rejected`, clear and disable `nextStep` and `nextStepDate`
- Linked contacts come from the Networking module

### Networking
- Full CRUD
- Search by name, company, role, and tag
- Full data model:
  - id
  - name
  - relationship
  - company
  - role
  - email
  - phone
  - linkedInUrl
  - howWeMet
  - lastContactDate
  - nextFollowUpDate
  - notes
  - tags
  - createdAt
  - updatedAt

### Casing
- Full CRUD
- Track PM-style case practice sessions
- Support partner as either:
  - linkedContactId
  - partnerLabel
- Full data model:
  - id
  - title
  - caseType
  - firmStyle
  - method
  - date
  - durationMinutes
  - source
  - rating
  - whatWentWell
  - whatToImprove
  - notes
  - linkedContactId
  - partnerLabel
  - tags
  - createdAt
  - updatedAt

### Tips
- Full CRUD
- Search by category, title, body, and tag
- Free-text category so new groups can be created by typing
- Link tips to:
  - applications
  - contacts
  - case sessions
- Full data model:
  - id
  - title
  - category
  - body
  - tags
  - linkedApplicationIds
  - linkedContactIds
  - linkedCaseSessionIds
  - createdAt
  - updatedAt

### Settings
- Lightweight configuration only
- Controls:
  - recent activity feed size
  - cadence rule CRUD

## Supporting Data Contracts
### CadenceRule
- id
- title
- cadenceType
- intervalUnit
- intervalValue
- active
- lastCompletedDate
- nextDueDate
- createdAt
- updatedAt

### ActivityEvent
- id
- entityType
- entityId
- actionType
- title
- detail
- timestamp

### UserSettings
- recentActivityLimit
- default display preferences can be added later

## Dashboard Logic
### Active applications
- Count all applications whose status is not `Rejected`

### Interviews
- Count statuses:
  - Phone Screen
  - Interview
  - Final Round

### Offers
- Count status `Offer`

### Attention engine
- Cadence rules:
  - show when due soon or overdue
- Application next steps:
  - show when nextStepDate is due soon or overdue
- Deadline alerts:
  - show when deadline is near or past due

## Next Major Product Phase
### Foundation before AI
- Move from `localStorage` to real backend persistence.
- Design stable schemas for applications, contacts, case sessions, tips, cadence rules, activity events, and settings.
- Add migration/versioning strategy so the product can evolve without breaking saved user data.

### Workflow depth after persistence
- Add filtering and sorting across major modules.
- Improve dashboard prioritization and direct linking from attention items to the relevant record/action.
- Pull networking follow-up workflow more directly into the operational system.

### AI-ready capture phase
- Prepare application flows so AI-generated drafts fit naturally into the product.
- Keep manual review first-class even when AI is introduced.
- Shape the data model so pasted job links or descriptions can become structured application drafts cleanly.

## Future AI Direction
- First AI workflow: ingest a pasted job link or job posting and turn it into a structured application draft.
- The output should be reviewed and confirmed by the user before it becomes a saved record.
- Later AI workflows may include networking note organization, next-step suggestions, and recap generation.
- AI should build on stable backend-backed records rather than local-only temporary state.

## Acceptance Criteria
- The dashboard updates immediately as the user changes core records.
- Rejected applications stop showing actionable next-step fields.
- Cadence rules can be created, edited, completed, and deleted.
- Tips can create new categories without an admin setup step.
- Recent activity respects the configured feed limit.
- Empty states guide a first-time user clearly.

## Product Principles
- Personal-first before productized
- Structured enough to trust
- Fast to review, edit, and act on
- AI as accelerator, not replacement
