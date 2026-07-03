# DESPERTA! Acampadentro App

This project is becoming the operating app for **DESPERTA! Acampadentro 2026**, an overnight church camp experience for teens/young people.

It started as a Kahoot-style ministry quiz app. That quiz still exists and should remain usable, but it is no longer the main product. The main product is now a camp companion and live-event control system for:

- participants on phones;
- captains with team-only controls;
- admins running the event from phones;
- a presenter screen shown on a big display.

## Current Status

The app is currently a **mocked, clickable scaffold**.

That means the main flows are implemented enough to click through, test, and understand the experience, but most camp-specific data is not persisted to Supabase yet. Many actions update local React state only.

Already working:

- Acampadentro-first portal at `/`.
- Registration form at `/register`, based on `../inscricao-acampamento.html`.
- Onboarding flow at `/onboarding`.
- Participant app under `/app`.
- Captain controls at `/captain`.
- Admin control panel under `/admin`.
- Presenter screen at `/presenter`.
- Legacy Kahoot routes under `/host`, `/join`, `/play`, and `/watch`.
- Playwright end-to-end test for the main mocked flows.
- Camp planning docs and schema draft.

## Product Vision

The final app should coordinate the whole camp before and during the event.

The core pattern is:

```text
Admin activates a camp mode
  -> participant phones show the right current instructions
  -> captain phones show extra controls when needed
  -> admin phones show scoring/progress controls
  -> presenter screen shows a public-safe room display
  -> points, notes, submissions, and activity history are saved
```

The goal is not just to run quizzes. The app should build momentum before camp, reveal teams, send reminders, guide activities, track points fairly, handle meal responsibilities, and make the room display feel alive.

## Key Event Assumptions

Current planning assumes:

- Registration deadline: July 18.
- Team reveal: July 19.
- Menu/decor plans due: July 25.
- Camp starts: Friday, July 31, 2026.
- Camp ends/check-out: Sunday, August 2, 2026.
- Expected team count: likely 3 teams if around 29-30 people attend.
- There will be 4 admins.

These should be confirmed before real launch.

## Roles

### Participant

Participants should eventually be able to:

- register and upload face photo/payment proof;
- sign in through phone number, with email as recovery;
- stay signed in on their phone;
- choose one of three generated avatar options;
- install the PWA to the home screen;
- enable push notifications;
- see their team after reveal;
- receive readings, keywords, reminders, and active-mode instructions;
- answer pre-camp prompts for team points;
- view unlocked criteria;
- take notes during message mode;
- receive team alerts, including wake-up alerts if someone is marked asleep.

Current mocked routes:

- `/register`
- `/onboarding`
- `/app`
- `/app/team`
- `/app/criteria`
- `/app/notes`
- `/app/profile`

### Captain

Captains are participants with extra responsibility.

Captains should eventually be able to:

- see treasure hunt clues that regular team members cannot see;
- submit treasure hunt answers;
- upload team video submissions;
- manage team-specific instructions when an activity requires one official phone.

Current mocked route:

- `/captain`

### Admin

Admins should eventually be able to:

- review registrations;
- confirm payments;
- approve/deny participants;
- create and balance teams;
- assign captains;
- reveal teams;
- send notifications;
- control active event mode;
- score teams and participants;
- mark meal completion times;
- judge video/presentation/meal criteria;
- enter Instagram bonus votes;
- mark participants asleep during message mode;
- control presenter view;
- audit point changes.

Current mocked routes:

- `/admin`
- `/admin/registrations`
- `/admin/teams`
- `/admin/modes`
- `/admin/meals`
- `/admin/points`
- `/admin/submissions`
- `/admin/notifications`
- `/admin/presenter`

### Presenter

Presenter view is public and should be opened on a separate computer or screen.

It should:

- default to leaderboard when no specific mode needs a display;
- follow the active mode selected by admins;
- show treasure hunt progress, conversation status, meal status, quiz matchups, video status, presentation state, and final results;
- never expose payment proof, emergency contacts, admin controls, private notes, or sensitive registration details.

Current mocked route:

- `/presenter`

## Current Route Map

| Route | Purpose | Current behavior |
| --- | --- | --- |
| `/` | Acampadentro portal | Links to registration, onboarding/app, admin, presenter, and legacy Kahoot tools |
| `/register` | Participant registration | Client-side form with validation, file selection feedback, skill chips, payment proof, copy summary, success handoff |
| `/onboarding` | First app setup | Clickable mock steps for phone, avatar, home screen, notifications |
| `/app` | Participant home | Shows active mode, team/criteria links, meal/notification status, captain shortcut |
| `/app/team` | Participant team view | Shows teams, members, points, meal responsibilities |
| `/app/criteria` | Criteria view | Shows unlocked/locked criteria |
| `/app/notes` | Message notes | Saves note locally and toggles private/team scope |
| `/app/profile` | Participant profile | Mock avatar selection and notification toggle |
| `/captain` | Captain control view | Mock clue answer and video upload |
| `/admin` | Admin overview | Metrics and links to admin workflows |
| `/admin/registrations` | Registration review | Mock approve/review/deny controls |
| `/admin/teams` | Team management | Mock reveal/hidden state per team |
| `/admin/modes` | Event mode control | Mock active mode switching |
| `/admin/meals` | Meal operations | Mock timestamp buttons for food/decor/service/cleaning |
| `/admin/points` | Point ledger | Mock manual point entry |
| `/admin/submissions` | Videos/menus/bonus | Mock video status, judging status, Instagram vote bonus |
| `/admin/notifications` | Push/message composer | Mock send form and local history |
| `/admin/presenter` | Presenter control | Mock public view selector |
| `/presenter` | Public display | Public-safe treasure progress and leaderboard |
| `/host`, `/join`, `/play`, `/watch` | Legacy Kahoot app | Existing quiz experience remains available |

## What Is Mocked Right Now

These are intentionally not real yet:

- registration saving;
- file upload storage;
- payment proof review;
- phone OTP/login;
- persistent sessions;
- avatar generation;
- PWA install detection;
- push notification subscriptions/delivery;
- team assignment persistence;
- active mode persistence;
- point ledger writes;
- admin audit logs;
- realtime presenter updates;
- Google Drive/Supabase video storage;
- Instagram vote verification.

Mock state currently lives in React component state and resets on refresh.

Shared mock data lives in:

- `lib/camp/mockData.ts`

Domain types live in:

- `types/camp.ts`

## Design Direction

The visual direction is based on the existing registration HTML:

- event-first, not generic dashboard;
- DESPERTA blue/yellow identity;
- bold uppercase type;
- hard borders and high contrast;
- participant screens energetic;
- admin screens dense and practical;
- presenter screen simplified and readable.

The repeated signature component is the **Mode Beacon**, used to show the current active camp mode in participant, captain, admin, and presenter contexts.

Important UX rule:

> If it looks clickable, it must do something.

For this scaffold, “doing something” can be navigation, local state update, validation, copy feedback, selected-file feedback, or a visible mocked status change.

## Important Files

Planning and documentation:

- `README.md` - this project guide.
- `AGENTS.md` - local agent/project instruction file.
- `../../acampadentro-app-requirements.md` - organized requirements from the user conversation.

Older one-off planning, review, setup, and legacy Kahoot design notes were consolidated into this README and removed from the app root to keep the project readable.

Source references:

- `../inscricao-acampamento.html` - original standalone registration form that informed `/register`.
- `../../context/cronograma-acampamento.docx` - camp schedule document.

App code:

- `app/page.tsx` - Acampadentro portal.
- `app/register/page.tsx` - registration form.
- `app/onboarding/page.tsx` - first app setup.
- `app/app/*` - participant routes.
- `app/captain/page.tsx` - captain route.
- `app/admin/*` - admin routes.
- `app/presenter/page.tsx` - public presenter route.
- `components/camp/*` - shared camp UI components.
- `lib/camp/mockData.ts` - mock camp data.
- `types/camp.ts` - camp domain types.

Data/schema:

- `supabase/migrations/005_camp_core.sql` - camp schema draft.
- Existing legacy quiz migrations remain in `supabase/migrations/001_*` through `004_*`.

Testing:

- `playwright.config.ts`
- `tests/acampadentro.spec.ts`

## Supabase Schema Direction

The camp schema draft includes tables for:

- camp events;
- admin users;
- registrations;
- participants;
- avatar options;
- teams and team memberships;
- team reveals;
- event modes and transitions;
- activity rounds;
- criteria/rubrics;
- point ledger;
- admin votes;
- arrival check-ins;
- conversation contributions;
- sleep events;
- treasure hunt steps/attempts;
- pie quiz selections;
- pre-camp prompts/answers;
- meal assignments/plans/completions;
- video and presentation submissions;
- Instagram bonus entries;
- notes;
- notification subscriptions/jobs;
- presenter state;
- admin audit log.

RLS is enabled in the migration, but production policies still need to be built carefully.

Security/privacy priorities:

- payment proof must be admin-only;
- emergency contact information must be admin-only;
- dietary/allergy info should be protected;
- participants must not be able to write points;
- captains must not access other teams' clues;
- presenter must never expose private admin/registration data;
- admin actions should be audited.

## How To Run

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## How To Test

Run lint:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

Run Playwright end-to-end tests:

```bash
npm run test:e2e
```

The current e2e test covers:

- portal navigation;
- registration validation/submission;
- onboarding completion;
- participant notes/profile controls;
- captain answer/upload controls;
- admin meal/registration/points/notification/submission/presenter controls.

## Development Notes

- This is a Next.js App Router project.
- Use `Link` for navigation.
- Use real `button` elements for state changes.
- Do not nest `button` inside `Link`.
- Add `'use client'` only to files that need local state/events/browser APIs.
- Keep participant and admin mobile flows usable.
- Keep presenter public-safe.
- Keep legacy Kahoot routes working unless explicitly removed later.

## Next Major Work

Recommended next phases:

1. Connect `/register` to Supabase and storage.
2. Build phone/email identity and persistent session flow.
3. Add real admin allowlist and policies.
4. Implement real team assignment and reveal.
5. Implement PWA manifest/service worker/install guidance.
6. Implement push notification subscriptions and send endpoints.
7. Persist active event mode and presenter state.
8. Build scoring helpers and real point ledger writes.
9. Add realtime subscriptions for presenter/admin views.
10. Connect captain treasure hunt flow to real steps/attempts.
11. Connect video upload to chosen storage provider.
12. Add admin audit logs.

## Current Verification

Last verified after the UX refocus:

- `npm run test:e2e`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- Playwright route scan: passed for the main Acampadentro routes, with no nested interactive controls and no horizontal overflow on checked mobile routes.
- HTTP smoke checks returned `200 OK` for:
  - `/`
  - `/register`
  - `/onboarding`
  - `/app`
  - `/captain`
  - `/admin`
  - `/presenter`
  - `/host`
  - `/join`
  - `/watch`

## Known Caveats

- The app is not production-ready yet.
- Most Acampadentro state is mocked and resets on refresh.
- Supabase tables exist as a draft migration, but policies and app integration are incomplete.
- The package is still named `ministry-game`; rename later if desired.
- Legacy Kahoot docs/features are still present because the old quiz is still an activity/tool.
- `npm install` reported moderate dependency vulnerabilities; no forced audit fix was applied because that can change versions broadly.
