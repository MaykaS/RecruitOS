# RecruitOS Next Steps

## North Star
- Build RecruitOS into a personal recruiting OS for MBA internship candidates.
- Evolve Applications toward one core promise:
  - find, tailor, and apply for me with approval
- Keep the user in the loop with explicit review before any submission.
- Keep the dashboard as the command center of the experience.
- Keep the product personal-first before worrying about multi-user productization.

## Current Foundation
- ~~Move from localStorage to a real backend database~~
- ~~Design backend schema for applications, contacts, case sessions, tips, cadence rules, activity events, and settings~~
- ~~Add migration/versioning strategy so saved data stays stable over time~~
- ~~Add import/export support for data safety and transition~~
- ~~Add application filters by status, priority, type, and tag~~
- ~~Add sorting controls across applications, contacts, case sessions, and tips~~
- ~~Add direct linking from dashboard attention items to the exact record or action that needs updating~~
- ~~Bring networking follow-up workflow more directly into the dashboard attention engine~~
- ~~Add richer contact detail view / contact profile panel~~

## Near-Term Product Polish
- Improve dashboard prioritization so attention items sort by urgency and relevance
- Fix styles and UI polish across the app
- Fix "Focus today"

## Applications Roadmap
### Step 1 - Draft object and review flow
- Define what an AI-created application draft is
- Define which fields are AI-fillable versus user-confirmed
- Define the review and edit experience before save
- Define draft-specific activity logging

### Step 2 - Standardize application intake fields
- Make sure application records support job-ingestion cleanly
- Define which posting-derived fields should map directly into RecruitOS
- Identify missing packet-related fields or metadata
- Keep manual editing first-class while draft fields expand

### Step 3 - Job input ingestion
- Support pasted job descriptions as structured draft input
- Support pasted job links as structured draft input
- Keep save behind explicit user confirmation
- Preserve links to contacts, notes, tags, and next steps

### Step 4 - Job source and filter model
- Define user-configured search preferences
- Define enabled job sources and site configuration
- Define what "matching the user" means operationally
- Keep user-defined filters as the main matching basis

### Step 5 - Job discovery agent
- Let the agent find candidate jobs from enabled sources
- Create reviewable candidate or draft records
- Keep discovery separate from submission
- Log AI-found opportunities in activity history

### Step 6 - Resume and profile foundation
- Define one base resume upload flow
- Define user profile inputs needed for tailoring
- Define reusable application facts and answer inputs if needed
- Keep the base-resume-to-tailored-resume model explicit

### Step 7 - Application packet generation
- Create a tailored resume per job
- Create a structured application packet per job
- Associate the packet with the application record
- Keep packet contents reviewable before approval

### Step 8 - Approval queue
- Add an in-app queue for prepared application packets
- Make approval explicit per job
- Support approve, reject, or revise actions
- Log approval workflow actions in activity history

### Step 9 - Submission automation
- Allow approval to trigger agentic submission
- Keep the human confirmation gate mandatory
- Log submission attempts and outcomes
- Treat this as a late-stage step, not an early milestone

### Step 10 - Smarter matching and expansion
- Expand beyond simple source filtering over time
- Consider learning from approvals and rejections later
- Broaden source coverage carefully after user-selected sites are stable

## Later Agentic Tracks
- Casing:
  - summarize recordings or sessions
  - auto-log case sessions
  - extract takeaways and lessons
- Tips:
  - convert captured insights into reusable tips
  - surface reusable prompts from meetings or prep sessions
- Networking:
  - later extract contacts or recruiter information from emails, outreach, or conversations

## Still Later
- Authentication
- Multi-device persistence
- Multi-user collaboration
- Reminder delivery beyond the in-app queue
- Calendar sync
- Browser extension or clipper
- Broader audience expansion beyond MBA internship candidates

## Roadmap Logic
- Full autopilot requires submission.
- Submission requires an approval queue.
- Approval requires a prepared application packet.
- Application packets require a resume and profile foundation.
- Discovery requires a source and filter model.
- Discovery and packet generation both depend on a strong draft object and review flow.

## Open Product Questions
- What exact fields should belong to the first AI-created application draft?
- What should be part of the first application packet versus left manual?
- What should the first review screen look like for a machine-generated draft?
- After draft creation, what is the next highest-value agentic step: discovery, tailoring, or approval workflow?
