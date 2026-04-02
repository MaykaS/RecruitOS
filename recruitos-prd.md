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
- The first deeply agentic domain should be `Applications`.
- The long-term application workflow should be:
  - user sets filters and enabled job sources
  - agent finds matching jobs
  - agent creates an application record
  - agent creates a tailored application packet from one base resume
  - RecruitOS places that packet into an in-app approval queue
  - after approval, the agent submits the application
- Early AI behavior should still create structured drafts for user review, not silently write records without approval.
- Submission automation should come much later, after drafts, packet generation, and approval flows are stable.

### Near-term strategic focus
- The backend persistence foundation is now in place through a local SQLite-backed app.
- The app now uses forward-only migrations with automatic local backups before pending schema changes.
- The next major build phase should focus on workflow depth, prioritization, and UI polish.
- Applications should now be planned backward from the future agentic approval-based workflow.
- The next AI planning step should be defining the application draft object and review flow.

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
- No in-app AI workflows yet
- No application import pipeline or browser extension yet
- No agentic job discovery, packet generation, or submission yet

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
- Networking follow-up reminders can also surface through the attention engine

### Applications
- Full CRUD
- Search, filter, and sort controls in the list view
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
- Future direction:
  - Applications should become the first deeply agentic workflow in RecruitOS
  - AI-generated application drafts should still be fully reviewable and editable
  - Approval should happen per application packet, not in bulk

### Networking
- Full CRUD
- Search by name, company, role, and tag
- Sort controls in the list view
- Expandable contact detail area with interaction history
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
- Interaction support:
  - per-contact logged interactions
  - type
  - date
  - summary
  - followUpNeeded
  - followUpDate

### Casing
- Full CRUD
- Track PM-style case practice sessions
- Search and sort controls in the list view
- Top-of-page summary stats for session count, total practice time, and average rating
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
- Sort controls in the list view
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
  - full-workspace JSON export/import

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
### Workflow depth after persistence
- Add filtering and sorting across major modules.
- Improve dashboard prioritization and direct linking from attention items to the relevant record/action.
- Pull networking follow-up workflow more directly into the operational system.
- Continue visual polish so shared controls and layouts feel cohesive across modules.

### Remaining foundation work
- Foundation work is in place through local persistence, migrations, backups, and workspace import/export.

### Applications-first AI preparation
- Define the application draft object and review flow before implementing AI ingestion.
- Standardize application intake fields so job descriptions and job links can map cleanly into RecruitOS.
- Prepare the system for a later application packet model tied to each drafted role.
- Keep manual review first-class even when AI is introduced.

## Future AI Direction
- First AI workflow:
  - ingest a pasted job link or job posting and turn it into a structured application draft
  - require user review before save
- Longer-term Applications direction:
  - let the user define filters and enabled job sources
  - let the agent discover matching jobs
  - let the agent create both application records and application packets
  - let the user approve each prepared packet in an in-app queue
  - only after approval should the agent submit the application
- Resume tailoring direction:
  - start from one uploaded base resume
  - create a tailored version per job
- Later AI workflows may include:
  - casing session summarization and takeaway extraction
  - converting captured insights into tips
  - networking extraction from emails, outreach, or conversations
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
- Human approval before autonomous submission
