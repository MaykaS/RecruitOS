# RecruitOS Master Product Document

Last updated: 2026-06-30
Owner: Maya + Codex
Document type: Living product source of truth

## 1. Purpose Of This Document

This document is the master product-management source of truth for RecruitOS.

It combines:
- product vision
- product strategy
- PRD-level requirements
- current-state assessment
- target-state definition
- feature inventory
- detailed module specs
- roadmap
- technical architecture context
- launch and scaling considerations

This document should answer:
- What is RecruitOS?
- Who is it for?
- What should it do by the end of July?
- What already exists?
- What still needs to be built or improved?
- How should each major feature work?
- What are the biggest risks, dependencies, and decisions?

## 2. Product Snapshot

### Product Name
RecruitOS

### Product Category
Personal recruiting operating system for MBA students

### Current Product Stage
Single-user MVP with working modules, active UX iteration, and early workflow design

### Long-Term Direction
Evolve from a personal recruiting command center into a multi-user recruiting productivity product for students, with agent-assisted job discovery and semi-automated application support.

## 3. Product Vision

RecruitOS should become the operating system a serious MBA student uses to run full-time recruiting end to end.

It should bring applications, networking, STAR stories, interview answers, case prep, interview prep, mock interviews, action items, resumes, outreach, and future agent support into one system.

The product should reduce friction, improve follow-through, and make it obvious what the user should do next.

## 4. Product Goal By End Of July

By the end of July, RecruitOS should be ready for a strong product demo and internal review.

That means:
- the recruiting workflows feel coherent and realistic
- the UI is usable enough for daily use
- the major modules are working and connected
- the system clearly supports MBA recruiting behavior
- the product direction for agent-assisted workflows is specified
- the remaining gaps are known, prioritized, and documented

This does not require a full public launch.

It does require:
- a convincing end-to-end story
- solid core workflows
- clear product documentation
- clear next-step roadmap to move from MVP to real-user product

## 5. Target User

### Primary User
One MBA student recruiting for full-time roles in product, TPM, product strategy, BizOps, consulting, AI product, or adjacent roles.

### User Characteristics
- managing many applications at once
- balancing networking, casing, STAR prep, and interview prep
- needs structured follow-through
- wants low-friction data entry
- wants context preserved across activities
- often works quickly and updates information incrementally

### Later User Expansion
- other MBA students
- graduate students in adjacent recruiting funnels
- possibly school clubs or career communities

## 6. Product Principles

### 6.1 One Source Of Truth
Every meaningful recruiting object should live once and be linked, not duplicated.

### 6.2 Every Note Can Become An Action
Recruiting notes, follow-ups, prep gaps, and feedback should be easy to convert into action items.

### 6.3 Dashboard First
The product should help the user decide what to do today, not just store information.

### 6.4 Low Friction Over Fancy
Fast entry, clear updating, and usable workflows matter more than decorative UI.

### 6.5 Real Recruiting Logic
The structure should reflect how MBA recruiting actually works:
- discover role
- evaluate fit
- identify people
- do outreach
- prepare materials
- apply
- follow up
- interview prep
- practice
- post-interview actions

### 6.6 Single User First, Multi-User Later
Today the product should optimize for one user.
The architecture should not block a later multi-user model.

## 7. Product Scope

### In Scope Now
- dashboard and daily command center
- applications tracking
- companies
- networking CRM
- universal action items
- STAR story library and question bank
- interview answers
- case practice
- interview prep plans
- mock interviews
- resumes and resume upload
- outreach templates
- settings and targets
- PM documentation and roadmap

### In Scope Soon
- smarter interview prep logic
- stronger prioritization and recommendation logic
- better recurring review workflows
- better demo polish
- stronger persistence and deployment reliability

### Not In Scope Right Now
- team collaboration
- recruiter-facing features
- payments
- external marketplace launch
- broad multi-tenant enterprise architecture

## 8. Current Product State Summary

RecruitOS already has a meaningful MVP foundation.

### What Exists Today
- Next.js + TypeScript + Tailwind app
- Supabase integration path
- Dashboard / Today’s Command Center
- universal Action Items module
- Applications, Companies, Networking, Interview Prep, Mock Interviews
- STAR workspace with story library, question bank, and coverage matrix
- Case workspace with practice logs and learnings
- Interview Answers, Resumes, Outreach Templates, Brain Dump, Settings
- sorting, filtering, search patterns across modules
- editable forms and linked relationships in core flows

### What Is Still In Progress
- recruiting workflows should feel more native and less database-like
- some modules need better prioritization and UX sequencing
- dashboard polish and symmetry
- more complete prompt-assisted prep flows
- stronger documentation of target product state
- a structured roadmap for agent-assisted job search and application support

## 9. End-State Product Definition

RecruitOS should eventually behave like a personal recruiting chief of staff.

The user should be able to:
- see what matters today
- manage the full application funnel
- know which people to contact and when
- prepare for interviews with structured prep plans
- repeatedly practice STARs and cases with logged feedback
- keep company, role, outreach, and prep context tied together
- upload and manage resume versions
- move from opportunity discovery to application execution with minimal friction
- later use agents to find strong-fit roles and prepare high-quality application packages with human approval

## 10. Master Feature Inventory

| Area | Feature | Current State | End-State Goal | Gap Level | Priority |
| --- | --- | --- | --- | --- | --- |
| Dashboard | Today’s Command Center | Exists | Be the daily decision surface for all recruiting work | Medium | Critical |
| Dashboard | Weekly progress scoreboard | Exists | Reliably track goals and drive behavior | Medium | High |
| Dashboard | Smart daily recommendations | Partial | Recommend best STAR, case, outreach, and prep work | High | High |
| Action Items | Universal linked action items | Exists | Stay synced everywhere and power all workflows | Medium | Critical |
| Applications | Opportunity tracker | Exists | Become the main recruiting execution hub | Medium | Critical |
| Applications | Outreach / recruiter / referral workflow | Partial | Reflect how MBA users actually pursue roles | High | Critical |
| Companies | Company intelligence and linkage | Exists | Be driven primarily by real recruiting targets and show real networking coverage | Medium | High |
| Networking | Contact CRM and follow-up | Exists | Support warm outreach, referral tracking, and next steps | Medium | Critical |
| STAR | Story library | Exists | Fast to browse, practice, improve, and map to questions | Medium | Critical |
| STAR | Question bank and coverage | Exists | Show real coverage strengths and gaps | Medium | High |
| STAR | Practice workflow | Exists | Capture GPT practice feedback and improve stories over time | Medium | High |
| Interview Answers | Reusable non-STAR answers | Exists | Be organized, linked, and easy to practice | Medium | High |
| Cases | Case question library | Exists | Support repeated GPT-style practice and reusable learnings | Medium | Critical |
| Cases | Framework and tip system | Partial | Let user store question-type-specific frameworks and insights | High | High |
| Interview Prep | Prep packets and readiness | Exists | Create a natural week-before-interview operating flow | Medium | Critical |
| Mock Interviews | Log and feedback tracking | Exists | Tie mocks to prep readiness and next actions | Medium | High |
| Resumes | Resume versioning and PDF upload | Exists | Support role targeting and application linkage | Medium | High |
| Outreach Templates | Reusable outreach copy | Exists | Integrate tightly with real networking/application actions | Medium | Medium |
| Brain Dump | Quick capture | Exists | Feed action items and structured modules with minimal friction | Medium | Medium |
| Settings | Targets and editable options | Exists | Let user adapt the system to their process | Medium | High |
| Search / Filter | Search and sorting | Exists | Be consistent, predictable, and useful at scale | Medium | Medium |
| PM Docs | Product source of truth | Partial | One complete living product document | Low | Critical |
| Agent Roadmap | Job search agent design | Planned | Find jobs, score fit, prepare packages, keep human in loop | Very High | Critical |
| Platform | Multi-user readiness direction | Planned | Clean path from single-user MVP to real-user product | Very High | High |

## 11. Detailed Module Specifications

## 11.1 Dashboard / Today’s Command Center

### Purpose
Answer the question: “What should I do today?”

### Core User Jobs
- see today’s most important prep work
- see overdue outreach and application actions
- track weekly progress
- catch time-sensitive interview prep
- capture quick thoughts without losing them

### Current Capabilities
- assigned STAR practice
- assigned case practice
- weekly scoreboard
- supporting workflow cards and sections

### Required End-State Behavior
- show the best next STAR and case to practice
- show follow-ups due today and overdue
- show application actions and looming deadlines
- show interview prep items tied to real interview dates
- show open action items due now
- show progress against weekly targets
- support quick capture from the dashboard

### Key UX Rules
- calm visual hierarchy
- low scan time
- action buttons should move work forward immediately
- no dead-end cards

### Main Gaps
- recommendation logic can become smarter
- overall layout still needs polish and tighter prioritization
- top section should feel cleaner and more trustworthy

## 11.2 Action Items

### Purpose
Act as the shared execution layer across the entire system.

### Current Capabilities
- central task system
- linked sources
- status and due date flows
- task completion sync behavior in core flows

### Required End-State Behavior
- action items can be created from any meaningful record
- one task record stays linked to the source rather than duplicated
- completing from one view updates everywhere
- today / overdue / by source / by priority views remain reliable

### Main Gaps
- more workflows should create action items naturally
- delete and edit interactions should stay low-friction but safe

## 11.3 Applications

### Purpose
Track opportunities and drive application execution.

### Current Capabilities
- application records
- recruiting track fields
- linked company and contacts
- recruiter-related fields exist
- status and priority fields

### Required End-State Behavior
- application form should mirror actual recruiting sequence
- user can quickly capture:
  - company
  - role
  - status
  - recruiter info
  - hiring manager / leader info
  - referral paths
  - follow-up actions
  - resume used
  - next step
- user should be nudged toward good behavior:
  - find recruiter
  - identify referral path
  - do outreach if appropriate
  - prepare application package
  - follow up after submission

### Main Gaps
- stronger guided workflow
- better human-friendly ordering of fields
- more explicit “should I outreach / who should I contact / what is missing” logic

## 11.4 Companies

### Purpose
Track target companies and hold recruiting context.

### Current Capabilities
- company CRUD
- linkage to related records
- auto-derived networking contacts from contact company assignments
- multi-role-fit support

### Required End-State Behavior
- company list should be driven primarily by actual target / applied companies
- networking should link into companies, not accidentally define the main company universe
- company pages should help with prep, positioning, and contact mapping
- companies should show relevant networking contacts clearly
- company-contact linkage should support:
  - automatic company matching from contact `company_id`
  - manual override links from the Company side when needed
- role fit should support multiple relevant functions, not only one

### Main Gaps
- stronger Company detail visibility for:
  - linked networking contacts
  - linked applications
  - warm-contact coverage
  - referral-path visibility

## 11.5 Networking / Contacts

### Purpose
Act as the recruiting CRM for people, follow-ups, referral paths, and relationship tracking.

### Current Capabilities
- contact CRUD
- multi-tag behavior
- link to companies and applications
- follow-up fields
- automatic visibility inside linked Company records when company matches

### Required End-State Behavior
- fast contact entry
- multiple tags
- editable linked company and application context
- visible next step and referral potential
- contact-to-company linkage should remain company-driven on the Contact side
- actions like:
  - send outreach
  - log takeaways
  - mark touch complete
  - create follow-up action

### Main Gaps
- more natural contact-entry flow
- stronger prioritization and smarter next-step surfaces

## 11.6 STAR Stories

### Purpose
Store and improve behavioral interview stories.

### Current Capabilities
- STAR story library
- question bank
- many-to-many question linkage
- coverage matrix
- practice modal and practice history

### Required End-State Behavior
- one STAR can answer many questions
- one question can map to many STARs
- user can browse stories quickly
- user can practice repeatedly with GPT-style feedback logging
- user can improve polished answer over time
- user can see which question areas are under-covered

### Main Gaps
- UI still needs polish to feel spacious and elegant
- practice history should feel tightly integrated with improvement of the core story
- dashboard recommendation logic can better reflect actual prep priorities

## 11.7 Interview Answers

### Purpose
Store non-STAR answers such as:
- tell me about yourself
- why this company
- why this role
- strengths
- weaknesses
- leadership style

### Current Capabilities
- answer records
- practice metadata
- linked records support

### Required End-State Behavior
- organized by general answer purpose rather than unnecessary complexity
- quick to edit and practice
- linked to relevant interview prep or applications

### Main Gaps
- answer taxonomy should stay simple and user-centered

## 11.8 Cases

### Purpose
Support case question practice and learning capture.

### Current Capabilities
- case question library
- case practice logs
- reusable learnings/tips
- GPT-style practice modal

### Required End-State Behavior
- cases are treated as questions, not generic titles
- case types drive organization
- user can practice the same question multiple times
- user can log framework used, answer notes, feedback, and next steps
- reusable learnings should accumulate into a case knowledge base
- framework suggestions should remain user-authored, not auto-invented

### Main Gaps
- more explicit consolidation of cross-practice learnings
- even tighter connection between question type, frameworks, and common mistakes

## 11.9 Interview Prep

### Purpose
Turn an upcoming interview into a structured prep plan.

### Current Capabilities
- interview prep records
- linked action items
- readiness behavior
- prep packet support

### Required End-State Behavior
When an interview is logged, the system should naturally support:
- company review
- role review
- recruiter / contact prep
- STAR selection
- interview answer prep
- case prep if applicable
- mock scheduling
- thank-you note planning
- readiness tracking

### Main Gaps
- stronger real-world sequencing
- smarter suggestions tied to date proximity and interview type

## 11.10 Mock Interviews

### Purpose
Track simulated practice, weaknesses, and resulting follow-up work.

### Current Capabilities
- CRUD
- linked records
- feedback storage

### Required End-State Behavior
- mock feedback should create actionable next steps
- mocks should support interview readiness
- dashboard should remind user when mocks are missing

## 11.11 Resumes

### Purpose
Track resume versions and their use across applications.

### Current Capabilities
- resume CRUD
- resume upload flow
- link to applications

### Required End-State Behavior
- upload PDF easily
- link each application to the actual version used
- later support tailored-resume generation workflows

## 11.12 Outreach Templates

### Purpose
Store reusable messaging for networking and recruiting outreach.

### Required End-State Behavior
- message templates should stay easy to reuse and edit
- tightly support:
  - cold outreach
  - alumni outreach
  - referral ask
  - recruiter follow-up
  - post-call follow-up
  - rejection-to-networking conversion
  - thank-you notes

## 11.13 Brain Dump

### Purpose
Support low-friction quick capture that can later be structured.

### Required End-State Behavior
- quick capture from dashboard
- later convert to action items or linked records
- useful during recruiting chaos

## 11.14 Settings

### Purpose
Let the user adapt targets and option sets without engineering changes.

### Required End-State Behavior
- daily/weekly targets
- editable option lists
- flexible value extension for dropdown-based systems

## 12. Future Agent Product Spec

## 12.1 Vision

The future RecruitOS agent layer should help the user discover, evaluate, prepare, and possibly submit strong-fit applications with a human in the loop.

## 12.2 Core Agent Jobs

### Job Search Agent
- search selected sources on a schedule
- collect job descriptions
- deduplicate roles
- identify likely-fit roles

### Fit Scoring Agent
- compare job description to resume and target preferences
- output a fit score with reasoning
- let user set threshold preferences

### Package Preparation Agent
- tailor a resume draft
- draft outreach suggestions
- surface likely application gaps
- propose next actions

### Human Approval Layer
- user reviews role
- user reviews tailored package
- user explicitly approves next step
- no fully autonomous applying at first

### Workflow Logging
- agent actions should write back into RecruitOS:
  - applications
  - companies
  - action items
  - notes
  - recommendations

## 12.3 Agent Constraints

- human in the loop is required
- observability is required
- data quality matters
- resume tailoring should follow explicit rules
- early versions should focus on preparation, not blind automation

## 12.4 Agent Build Tracks

| Track | Goal | Priority |
| --- | --- | --- |
| Job ingestion | Pull roles from selected sources | Critical |
| JD parsing | Extract structured fields from postings | Critical |
| Fit scoring | Score based on user resume and preferences | Critical |
| Resume tailoring | Draft tailored resume changes | High |
| Application package prep | Bundle resume + notes + outreach suggestions | High |
| Human approval flow | Require explicit user confirmation | Critical |
| Auto-fill / apply assist | Optional later step | Medium |
| Activity logging | Write agent activity back into RecruitOS | Critical |

## 13. Product Architecture Summary

### Frontend
- Next.js App Router
- TypeScript
- Tailwind CSS

### Data Layer
- Supabase-backed repository architecture
- shared typed domain model
- client-side normalization and linked-record sync

### Deployment
- Vercel

### Current Product Shape
- single-user application
- cloud-backed direction
- personal productivity system first

### Future Architecture Needs
- real per-user auth and data partitioning
- stronger persistence guarantees
- auditable agent actions
- production-safe file, prompt, and workflow storage

## 14. Data Model Principles

### Shared Entities
- Applications
- Companies
- Contacts
- Action Items
- STAR Stories
- Interview Questions
- STAR Practice Logs
- Cases
- Case Practice Logs
- Case Learnings
- Interview Answers
- Interview Prep
- Mock Interviews
- Resumes
- Outreach Templates
- Brain Dumps
- Settings

### Core Relationship Rules
- Action Items link back to source records
- Contacts link to companies and applications
- Companies expose the union of:
  - contacts whose `company_id` points to the company
  - contacts manually linked through company `linked_contact_ids`
- Applications link to companies, contacts, resumes, and prep
- STAR Stories link many-to-many with interview questions
- Cases can have many practice logs
- Interview Prep connects applications, companies, STARs, answers, cases, contacts, and action items

## 15. Roadmap To End Of July

## Phase 1: Product Clarity And Workflow Cleanup

Goal:
Align documentation, UX, and workflow logic.

Includes:
- complete PM documentation
- clarify current-state vs target-state
- tighten dashboard priorities
- refine form flows for major modules

## Phase 2: Recruiting Execution Strength

Goal:
Make daily use feel truly helpful.

Includes:
- smarter applications flow
- stronger networking workflow
- better interview prep sequencing
- more useful action-item generation
- cleaner daily command center

## Phase 3: Practice System Maturity

Goal:
Make STAR and case practice feel like real prep workflows.

Includes:
- strong practice logging
- better feedback visibility
- consolidated reusable learnings
- stronger recommendation logic

## Phase 4: Agent-Ready Planning Layer

Goal:
Be able to demo the future of RecruitOS clearly.

Includes:
- agent feature specs
- JD ingestion and fit-scoring design
- resume-tailoring workflow design
- human-approval flow design
- writeback architecture plan

## 16. Priority Breakdown

### Critical
- dashboard usefulness
- action item integrity
- applications workflow realism
- networking follow-up quality
- STAR and case practice clarity
- interview prep usefulness
- PM documentation completeness
- agent roadmap definition

### High
- UI polish and consistency
- reusable learnings systems
- resume/application workflow strength
- better recommendation logic
- launch-readiness planning

### Medium
- additional filters and reporting
- advanced scoring systems
- more nuanced automation

## 17. Success Criteria For End Of July

RecruitOS is in a strong demo-ready state if:
- a user can run daily recruiting from it with reasonable confidence
- the dashboard clearly surfaces next work
- applications, networking, STARs, cases, prep, and tasks feel connected
- the practice systems preserve useful feedback
- the product story is coherent enough to show a stakeholder
- the future agent direction is concrete and credible
- the roadmap to multi-user productization is understandable

## 18. Open Risks And Questions

### Product Risks
- too much data-entry friction
- workflows that feel like generic databases instead of recruiting support
- recommendation logic that is not trusted
- agent scope expanding too early

### Technical Risks
- single-user assumptions leaking too deeply into architecture
- future user auth and tenancy requiring large refactors
- agent logging and observability complexity
- external-source scraping or ingestion complexity

### UX Risks
- cluttered forms
- inconsistent layout quality across modules
- recommendation cards that look polished but are not truly useful

## 19. Documentation Maintenance Rules

- Update this document when target product direction changes materially.
- Update feature inventory when a major feature moves from planned to partial or live.
- Keep this aligned with `BUGS.md` and `docs/RECRUITOS_PRD_CHECKLIST.md`.
- Use this doc for product truth, `BUGS.md` for issues, and the PRD checklist for acceptance tracking.

## 20. Recommended Companion Docs

This document should work alongside:
- [RECRUITOS_PRD_CHECKLIST.md](/C:/Users/mayas/OneDrive/Desktop/Projects/RecruitOS/docs/RECRUITOS_PRD_CHECKLIST.md)
- [BUGS.md](/C:/Users/mayas/OneDrive/Desktop/Projects/RecruitOS/BUGS.md)

Recommended future docs:
- `docs/RECRUITOS_AGENT_ROADMAP.md`
- `docs/RECRUITOS_TECH_ARCHITECTURE.md`
- `docs/RECRUITOS_LAUNCH_PLAN.md`

## 21. Immediate Next PM Actions

1. Use this document as the master source for the July target state.
2. Turn the master feature inventory into a tracking table in Notion.
3. Identify the top 5 demo-critical workflow gaps.
4. Prioritize UX cleanup on dashboard, applications, interview prep, STARs, and cases.
5. Write the first agent-specific spec around:
   - job ingestion
   - fit scoring
   - human approval
   - tailored package generation
