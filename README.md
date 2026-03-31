# RecruitOS

RecruitOS is a personal recruiting operating system for MBA students pursuing internships. The current MVP is a single-user web app focused on helping you stay organized, protect follow-ups, and always know the next best action across applications, networking, casing, and recruiting knowledge.

## Current MVP
- Minimal dashboard with a time-based greeting, status snapshot, attention queue, recent applications, and recent activity
- Left-rail navigation for `Dashboard`, `Applications`, `Networking`, `Casing`, `Tips`, and `Settings`
- Global primary actions for creating contacts and applications directly from the dashboard header
- Compact, light blue interface tuned to fit more of the dashboard above the fold
- Local private persistence through a Node/Express API backed by SQLite
- Contact interaction logging with per-contact history and follow-up tracking

## Core features
### Dashboard
- Shows KPI cards for active applications, interviews, contacts, and offers
- Surfaces overdue or upcoming application next steps, networking follow-ups, deadlines, and cadence tasks
- Displays a pipeline snapshot from `Researching` through `Rejected`
- Shows recent applications and a configurable recent activity feed
- Includes a static rule-based `Focus today` coaching card in the left rail

### Applications
- Full create, edit, and delete support
- Tracks company, role, type, priority, status, dates, compensation, notes, tags, and linked contacts
- Treats `nextStep` and `nextStepDate` as the main operational pair for dashboard attention logic
- Automatically clears and disables next-step fields when status is `Rejected`
- Includes a one-row search, filter, and sort toolbar for status, type, priority, tag, and ordering

### Networking
- CRM-lite contact tracking for recruiting relationships
- Supports follow-up dates, notes, tags, relationship types, and basic profile/contact details
- Includes interaction logging for coffee chats, messages, emails, calls, meetings, and referral asks
- Shows compact contact cards with expandable interaction history and last-contact nudges

### Casing
- Logs PM-style case interview practice sessions
- Tracks case type, firm style, method, duration, partner, notes, rating, and reflection fields
- Supports either a linked RecruitOS contact or a free-text partner label
- Includes top-level casing summary stats for total sessions, total practice time, and average rating

### Tips
- Personal knowledge base for reusable recruiting advice
- Supports free-text categories, tags, rich notes, and links to applications, contacts, and case sessions
- Includes search and sorting controls in the list view

### Settings
- Controls recent activity feed size
- Supports full CRUD for cadence rules used by the dashboard attention engine

## Tech stack
- Plain `HTML`, `CSS`, and `JavaScript`
- `Node.js` + `Express` backend
- `SQLite` via `better-sqlite3`
- No framework or authentication in the current MVP

## Project files
- `index.html` - app shell and global layout
- `styles.css` - visual system, spacing, responsive behavior, and component styling
- `app.js` - state management, rendering, CRUD flows, dashboard logic, and API client logic
- `server.js` - app server entrypoint and static file host
- `backend/` - database setup, API routes, and validation
- `data/` - local private SQLite database files (Git-ignored)
- `package.json` - run scripts
- `recruitos-prd.md` - living product requirements and scope doc
- `nextSteps.md` - quick-capture backlog file

## Run locally
### Requirements
- Node.js 18+ recommended

### Start the app
```bash
npm run dev
```

If PowerShell blocks `npm`, use:

```bash
npm.cmd run dev
```

Then open:

```text
http://127.0.0.1:3000
```

## Workflow
- Use `recruitos-prd.md` as the main source of truth for product scope and behavior
- Use `nextSteps.md` to capture fast ideas without rewriting the PRD
- Example instruction: `add to nextsteps.md - add CSV import for applications`
- When requested, update `README.md` to reflect the current product rather than leaving it as a stale setup file

## Current constraints
- Single-user only
- No authentication
- No cloud sync
- No external reminders
- No background agent automation inside the app yet

## Likely next steps
- Add import/export
- Add authentication
- Add reminder delivery and calendar sync
- Add agent-assisted application capture and workflow support
