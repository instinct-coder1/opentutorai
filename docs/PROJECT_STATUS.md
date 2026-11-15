# OpenTutor AI — Project status

Last updated: 2026-11-15

## Starting point (audit)

- The app was migrated from a Bolt export. It had sign-in, a 3-step onboarding wizard and profile saving; its main page was a placeholder.
- The brief refers to an existing **LearnSphere AI** project (FastAPI + Python + Redis). That archive was **not attached**, so nothing from it has been inspected or ported (including the lesson-assessment bug it mentions).
- Stack used here: TanStack Start (React + TypeScript + Vite) with Lovable Cloud for database, sign-in and server code, and Lovable AI for the tutor. The brief's FastAPI/Redis backend is not used; the same jobs are done by Lovable Cloud and server routes.

## Module checklist

| Module | Status | Tested |
| --- | --- | --- |
| Accounts: sign up, sign in, sign out, password reset | Complete | Yes (reset email delivery not tested with a real inbox) |
| Onboarding (11 categories, autosave, resume) | Complete | Yes |
| App shell (sidebar, mobile menu) | Complete | Yes (desktop); mobile menu not tested |
| AI Tutor: 6 modes, saved conversations, streaming, profile-aware | Complete | Yes — 2 threads, multi-turn, reload restore, other users blocked |
| Home page | Partial — lacks search, FAQ, feature sections from brief | Yes |
| Public pages (features, about, faq, contact, privacy, terms, subjects, courses) | Not started | — |
| Education catalogue (DB-driven) | Not started | — |
| Adaptive diagnostics + mastery | Not started | — |
| Personalised roadmap | Not started | — |
| Interactive lesson player | Not started | — |
| Progress, revision, gamification | Not started | — |
| Documents & research | Not started | — |
| Career mentor | Not started | — |
| Coding workspace | Not started — needs a code-execution sandbox decision | — |
| AI agents | Not started | — |
| Admin & content management | Not started | — |
| Account deletion / data export | Not started | — |
| Dark mode | Not started | — |

## Security notes

- Every table has owner-only access rules; checked that another account cannot read or change profiles or tutor chats.
- The AI key stays on the server; the tutor endpoint checks the learner's sign-in on every request.
- No default admin accounts exist.

## Waiting on the product owner

- LearnSphere AI archive, if its content/courses should be ported.
- Bolt data export for existing learners.

## Tests

`bunx vitest run` — 8 tests passing (onboarding rules, redirects, tutor modes, routing).
