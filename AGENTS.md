# RecruitOS Agent Instructions

Project name:
RecruitOS

Project purpose:
RecruitOS is a personal full-time recruiting operating system for MBA recruiting preparation. It helps the user manage daily prep, behavioral stories, casing, networking, applications, mock interviews, interview answers, interview prep plans, resumes, outreach templates, and linked action items.

Tech stack:
- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

Main product modules:
- Dashboard
- PARs
- Interview Answers
- Cases
- Networking
- Applications
- Companies
- Interview Prep
- Mock Interviews
- Action Items
- Resumes
- Outreach Templates
- Settings

Development rules:
- Keep the app low-friction and dashboard-first.
- Everything should be editable.
- Preserve relational links between records.
- Action Items are a central shared system, not duplicated task copies.
- When marking an action item complete from one place, it must update everywhere it is linked.
- Do not overbuild or add unnecessary SaaS/multi-user complexity.
- Prefer simple, typed, maintainable code.
- Use TypeScript types for major entities.
- Run lint/typecheck/build after meaningful changes when available.
- Update BUGS.md after every bug investigation or fix.
- If you discover a new issue while working, add it to BUGS.md before fixing it.
- Do not delete fixed bugs. Move them to the Fixed Issues section with verification notes.
- Keep the product focused on one user preparing for full-time recruiting.
