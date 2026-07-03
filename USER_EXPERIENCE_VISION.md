# Acampadentro User Experience Vision

This document describes the experience we are trying to build for **DESPERTA! Acampadentro** based on the original conversation and planning.

The app is not supposed to feel like “just a Kahoot.” Kahoot/quiz mechanics are only one activity inside a bigger camp experience. The real product is a live camp companion that starts before the event, keeps momentum building, helps admins run the event from their phones, gives captains special controls, and makes the big screen feel alive.

## North Star

A young person registers, gets pulled into the camp before it starts, joins their team, receives prompts and notifications, follows live instructions during the camp, participates in challenges, and sees their team progress through the weekend.

Admins should be able to run the whole event from their phones.

The presenter screen should make the room feel like something is happening live.

## Core UX Feeling

The app should feel:

- alive before the camp starts;
- simple enough for teens to use without explanation;
- strong and energetic, matching DESPERTA;
- useful during the actual event, not just decorative;
- trustworthy, where every button does something;
- role-aware, where participant, captain, admin, and presenter each see what they need;
- phone-first for participants, captains, and admins;
- public-safe on the presenter screen.

## Main Roles

### Participant

The participant is a teen or young person attending the camp.

Their experience should be:

1. Register.
2. Confirm payment.
3. Enter the camp app.
4. Verify identity through phone number, with email as recovery.
5. Choose an avatar from three generated options.
6. Add the app to their home screen.
7. Enable notifications.
8. Receive pre-camp prompts.
9. See their team after reveal.
10. Follow live instructions during camp.
11. Take notes during message mode.
12. See unlocked criteria and team progress.
13. Help the team earn points.

### Captain

The captain is a participant with extra responsibility.

Their experience should be:

- see captain-only treasure hunt clues;
- submit official team answers;
- upload the team video;
- possibly submit menus, decoration plans, supply lists, or team status updates;
- act as the official phone for instructions when only one phone per team should see something.

When a regular participant opens a captain-only activity, they should see a clear locked state, not an error. Example: “Only your captain can see this right now.”

### Admin

There will be four admins.

Their experience should be:

- use the app comfortably from a phone;
- see all registrations;
- confirm payments;
- approve or deny participants;
- create teams;
- assign/remove/move participants;
- choose captains;
- reveal teams;
- send notifications;
- switch active camp mode;
- score teams and participants;
- judge activities using criteria;
- mark meal completion times;
- see treasure hunt progress;
- mark someone asleep during message mode;
- control what appears on the presenter screen;
- audit points and corrections.

The admin experience should be dense but organized. It should feel like a control panel, not a marketing page.

### Presenter

Presenter view is a public screen, likely on a separate computer connected to a big display.

Its experience should be:

- default to leaderboard;
- follow the active mode selected by admins;
- show only public-safe information;
- never expose private registration, emergency, payment, admin, or note data;
- be readable from across the room;
- show progress, rankings, statuses, and results in a polished way.

## End-To-End Participant Journey

### 1. Registration

The first real touchpoint is the registration form.

The participant fills out:

- face photo;
- full name;
- age;
- WhatsApp/phone;
- emergency contact name;
- emergency contact phone;
- dietary restrictions/allergies;
- strengths/skills;
- custom skill;
- funny bonus answer about the “11th commandment”;
- image/video permission;
- late-night agreement;
- payment proof;
- payment confirmation.

The form should feel like DESPERTA, not like a generic form. It should use the blue/yellow event identity, energetic copy, and clear sectioning.

After submit, the participant should see a handoff message like:

> Now that you’re here, you’re ready to start the camp.

From there, they should be guided into the app.

### 2. Identity and Session

The desired identity flow is phone-first.

The app should find the participant through the phone number used in registration. Email can be used as backup/recovery.

Important:

- Google sign-in should not be the primary participant flow.
- IP address should not be used as identity.
- The participant should stay signed in as much as possible.
- If they lose access, they should be able to recover through phone/email.

### 3. Avatar Selection

After registration/approval, the app should generate three avatar options from the participant’s uploaded photo.

Desired behavior:

- use Gemini or another avatar generation service later;
- generate exactly three options;
- participant must choose one of the three;
- participant cannot upload a different custom avatar at this stage;
- chosen avatar appears in profile, team lists, admin views, and possibly presenter/leaderboard visuals.

### 4. Add To Home Screen

The app should behave like a real PWA.

The participant should be guided to:

1. add the app to their phone home screen;
2. open the app again from the home screen;
3. then enable notifications.

The notification ask should happen after they understand why notifications matter.

### 5. Notifications

Notifications are central to the pre-camp buildup.

They should be used for:

- reading prompts;
- daily or periodic keywords;
- questions;
- team reveal;
- menu/decor reminders;
- active mode changes;
- captain/team-specific instructions;
- wake-up alerts if a teammate is marked asleep.

## Pre-Camp Momentum

The app should start before the camp begins.

The goal is to build momentum so participants are already engaged before arriving.

Important dates:

- July 18: registrations close.
- July 19: teams are announced.
- July 25: menu/decor plans should be sent for approval.
- July 31: camp begins.

Pre-camp experience:

1. Participant receives a notification.
2. They open the app.
3. They see a reading, keyword, or question.
4. They answer inside the app.
5. Correct answers give early team points.
6. The app keeps anticipation building toward the treasure hunt.

Questions should be hard to answer with AI alone. They should depend on:

- specific reading context;
- church/camp wording;
- information only sent through the app;
- details from previous prompts;
- live/event context.

## Team Reveal Experience

Before camp, admins assign participants into teams.

Admins need to:

- see who signed up;
- filter by approval/payment;
- create teams;
- move people between teams;
- choose captains;
- balance by age/skills;
- reveal teams when ready.

When teams are revealed:

- participants receive a notification;
- they can see their team;
- they can see teammates and avatars;
- they can see captains;
- they may also see other teams, depending on the final decision.

The reveal should feel like a moment, not just a list.

## Food, Menu, Decoration, And Cleanup

Teams will rotate responsibilities.

Example with three teams:

- Breakfast: Team A cooks, Team B decorates/serves, Team C cleans.
- Lunch: Team B cooks, Team C decorates/serves, Team A cleans.
- Dinner: Team C cooks, Team A decorates/serves, Team B cleans.

Before camp:

- cooking team submits menu and supply list;
- decoration/service team submits decoration plan and supply list;
- admins can send budget guidance;
- admins can approve or request changes;
- reminders should go out before the due date.

During meal mode:

- cooking team sees menu, supplies, budget note, and countdown;
- decoration/service team sees decoration plan, supplies, budget note, and countdown;
- cleaning team sees cleaning expectations;
- admins see timer and completion buttons;
- admins record actual ready/completion times;
- punctuality affects scoring.

Meal scoring should include:

- food quality;
- thoughtfulness;
- enough food for everyone;
- teamwork;
- hospitality/service;
- decoration creativity;
- cleanup participation;
- punctuality.

All admins should be able to vote where required.

## Live Camp Mode System

The app should revolve around the active mode.

When an admin changes the active mode:

- participant app changes;
- captain app changes;
- admin controls change;
- presenter screen changes.

This is the heart of the UX.

## Event Modes

### Arrival

Admins can check people in, mark late/missing, and possibly apply late penalties.

Participants see arrival/welcome status.

Presenter can show welcome or countdown if useful.

### Treasure Hunt

Captain:

- sees the active clue;
- submits answers;
- advances team progress.

Regular participant:

- sees locked state if not captain;
- knows to stay with the team and listen to captain.

Admin:

- sees each team’s progress;
- sees correct/wrong attempts;
- sees how many tries each team made;
- can monitor stuck teams;
- can award points.

Presenter:

- shows progress race from 0% to 100%;
- can show attempts/progress in a public-friendly way;
- should not show secret answers.

### Conversation

Participants:

- see that conversation mode is active;
- are encouraged to pay attention and participate.

Admins:

- tap/select a participant;
- score contribution from 1 to 5;
- can score multiple contributions but with a cap per person per round;
- points go to the team;
- scoring should reflect quality and meaningful participation.

Desired scoring meaning:

- 1: talked just to talk.
- 2: little bit of substance.
- 3: okay, but not very meaningful.
- 4: meaningful and good, maybe a little forced.
- 5: genuinely added to the conversation.

Presenter:

- shows conversation active;
- encourages focus and participation;
- does not show private admin scoring controls.

### Video Challenge

After conversation, teams create a video based on the conversation.

Participants:

- see criteria only when video mode starts;
- can keep seeing criteria after it is unlocked.

Captain:

- uploads the team video;
- upload should preserve quality;
- later this may go to Google Drive or Supabase storage.

Admin:

- receives notification when a team uploads;
- sees submitted/not submitted status;
- judges with criteria;
- adds Instagram vote bonus separately.

Presenter:

- shows video submission status;
- may show countdown/results.

### Message / Notes

Participants:

- can take notes in the app;
- should be able to access notes later;
- may have private notes and/or team-shared notes.

Admins:

- may be able to view notes only if that is clearly communicated and intentionally designed;
- can mark someone asleep.

Sleep behavior:

- admin taps a participant/avatar and marks asleep;
- participant’s team is notified to wake them up;
- points can be deducted or penalty ledger entry created.

### Pie Quiz

This is a front-of-room quiz activity, different from everyone answering on phones.

Desired experience:

- app randomly selects one participant from one team and one from another;
- selection should be fair across teams and participants;
- avoid repeats until needed;
- admins mark correct/wrong;
- wrong answer may trigger pie/whipped cream consequence if final safety rules allow it;
- presenter shows selected participants and result;
- team points are updated.

### Presentation Prep And Judging

During prep:

- teams see instructions and criteria;
- criteria stay available after unlock;
- prep timer may be shown.

During judging:

- admins vote using criteria;
- all admin votes may be required before publishing;
- points are aggregated;
- presenter shows current/next team and results.

### Outdoor Circuit

Potential future mode for physical stations and Bible questions.

Could include:

- station progress;
- physical challenge completion;
- captain-only or whole-team questions;
- presenter progress race.

### Closing

Closing mode should:

- freeze/finalize points;
- show final leaderboard;
- reveal winner on presenter;
- support export of final results.

## Admin UX Principles

Admin screens should be:

- fast on phone;
- dense but not confusing;
- based on current mode;
- built around clear action buttons;
- auditable;
- multi-admin safe.

Admins need confidence that when they tap something, it is recorded.

Every scoring action should eventually create a point ledger entry or admin vote record.

Corrections should not silently overwrite history. They should supersede or audit previous entries.

## Presenter UX Principles

Presenter is not admin.

Presenter should show:

- leaderboard;
- treasure progress;
- active conversation status;
- video submission progress;
- meal status;
- quiz matchup;
- presentation order/results;
- final winner.

Presenter should not show:

- emergency contacts;
- payment info;
- private notes;
- admin-only controls;
- secret clues/answers;
- private participant data.

## Interaction Principles

- If it looks clickable, it must do something.
- If it does not do anything, it should not look like a button.
- Every action should show feedback.
- Every active mode should have a role-specific screen.
- Participants should not need to understand admin logic.
- Captains should see only the extra things they need.
- Admins should be able to run live activities quickly.
- Presenter should be simple, bold, and public-safe.

## Final Destination

The final version should feel like this:

Before camp, participants are already receiving prompts and earning points.

When teams are revealed, the app makes it feel like a real moment.

When camp starts, admins control the event from their phones.

When a mode changes, everyone’s app changes with it.

When captains need secret instructions, only captains get them.

When points are earned, the team feels it.

When something needs to be shown to the room, the presenter view handles it cleanly.

When the weekend ends, the app has the story of the whole event: teams, points, notes, submissions, moments, and winners.
