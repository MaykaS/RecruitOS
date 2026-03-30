# RecruitOS Next Steps

## North Star
- Build RecruitOS into a personal recruiting OS for MBA internship candidates.
- Make the product strongest at two things:
  - always knowing the next best action
  - never losing important recruiting information
- Keep the dashboard as the command center of the experience.
- Add AI as a layer that captures and organizes messy inputs, rather than making AI the whole product.
- Keep the product personal-first before worrying about multi-user productization.

## Phase 1 - Foundation
- ~~Move from localStorage to a real backend database~~
- ~~Design backend schema for applications, contacts, case sessions, tips, cadence rules, activity events, and settings~~
- Add migration/versioning strategy so saved data stays stable over time
- Add import/export support for data safety and transition

## Phase 2 - Workflow Depth
- Add application filters by status, priority, type, and tag
- Add sorting controls across applications, contacts, case sessions, and tips
- Improve dashboard prioritization so attention items sort by urgency and relevance
- ~~Add direct linking from dashboard attention items to the exact record or action that needs updating~~
- ~~Bring networking follow-up workflow more directly into the dashboard attention engine~~
- ~~Add richer contact detail view / contact profile panel~~
- Add dashboard quick actions for logging a case session and adding a tip

## Phase 3 - AI-Ready Capture
- Prepare application flows for AI-generated drafts without breaking manual editing
- Standardize fields needed for job-posting ingestion
- Define review/edit flow for machine-generated application drafts
- Keep human confirmation required before AI-created records are saved
- Prepare activity logging so AI-assisted drafts still appear clearly in the product history

## Phase 4 - First AI Feature
- Paste a job link or job posting into RecruitOS
- Parse the posting into a structured application draft
- Let the user review, edit, and confirm the draft before save
- Preserve the ability to link the created application to contacts, notes, tags, and next steps

## Later
- Authentication
- Multi-device persistence
- Multi-user collaboration
- Reminder delivery
- Calendar sync
- Browser extension or clipper
- Broader audience expansion beyond MBA internship candidates

## Open Product Questions
- Should networking follow-ups become first-class attention items beyond basic date tracking?
- Should tips remain fully free-form or evolve into templates plus free-form notes?
- Should casing stay PM-focused or broaden into consulting and general interview prep?
- After job-posting ingestion, what should the second AI workflow be?
