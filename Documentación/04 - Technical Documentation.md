# EntrenaMos — Technical Documentation

> Scope: `Beta/` — the active Next.js + Supabase implementation.
> This document describes the codebase **as it exists today** (2026-07-16), not the aspirational mock-data prototype described in `Beta/README.md` / `Beta/REFACTOR.md` (see [Section 6](#6-current-state) for why those two files are stale).

---

## Table of Contents

1. [Feature Overview by Role](#1-feature-overview-by-role)
2. [User Journeys](#2-user-journeys)
3. [Data Models](#3-data-models)
4. [API / Server Actions](#4-api--server-actions)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Current State](#6-current-state)
7. [Tech Stack Details](#7-tech-stack-details)

---

## 1. Feature Overview by Role

The app has three roles, stored in `profiles.role`: `admin`, `trainer`, `student`. Each role has its own route namespace, its own layout (with its own bottom/side nav), and route-level + row-level enforcement (see [Section 5](#5-authentication--authorization)).

### 1.1 Admin

Root: `Beta/app/admin/` · Layout: `Beta/app/admin/layout.tsx` · Nav: single item, "Entrenadores".

| Page | Path | Purpose |
|---|---|---|
| Trainer list + create form | `app/admin/page.tsx` | Lists all `profiles` with `role = 'trainer'`; form to create a new trainer account |

**Actions available:** `createTrainer` (`app/admin/actions.ts`) — the only admin-specific server action.

**Data visible:** all trainer profiles (`id, full_name, email, created_at`) via the `profiles_select_admin` RLS policy (see `is_admin()` SQL function). Admin has no visibility into students, routines, or sessions — the UI simply doesn't query for them, and RLS would block it anyway (admin is not `trainer_id` or `student_id` on any other table).

**Cannot do:** create students, routines, or exercises; view any trainer's roster; edit trainer profiles (no update form is wired up, even though RLS would allow trainers to edit their own profile).

### 1.2 Trainer

Root: `Beta/app/trainer/` · Layout: `Beta/app/trainer/layout.tsx` · Nav: Panel, Alumnos, Ejercicios, Rutinas, Agenda, Config.

| Page | Path | Purpose |
|---|---|---|
| Dashboard | `app/trainer/page.tsx` | KPI tiles (active students, alerts, today's appointments, adherence %) + "priority student" callout |
| Students list | `app/trainer/students/page.tsx` + `StudentsList.tsx` | Searchable/filterable roster with per-student stats |
| Student detail | `app/trainer/students/[id]/page.tsx` + `StudentDetailActions.tsx` | Status toggle, routine assignment, coach note, body-metrics history + entry form, last 5 sessions |
| New student | `app/trainer/students/new/page.tsx` | Creates a Supabase Auth user + `students` row |
| Exercises list | `app/trainer/exercises/page.tsx` | CRUD list of the trainer's exercise library |
| New/Edit exercise | `app/trainer/exercises/new/page.tsx`, `app/trainer/exercises/[id]/page.tsx` | Create/edit form |
| Routines list | `app/trainer/routines/page.tsx` | Routine cards with embedded exercise preview |
| New routine | `app/trainer/routines/new/page.tsx` | Create routine, redirects into detail |
| Routine detail | `app/trainer/routines/[id]/page.tsx` | Add/remove exercises from a routine, delete routine |
| Agenda | `app/trainer/agenda/page.tsx` + `AppointmentStatusSelect.tsx` | Create appointments, change status, delete |
| Settings | `app/trainer/settings/page.tsx` + `LogoUploader.tsx` + `BrandColorPicker.tsx` | Upload logo (Supabase Storage), pick brand colors |

**Data visible:** only rows scoped to `trainer_id = auth.uid()` (own students, own exercises, own routines, own appointments) plus body metrics and sessions belonging to *their* students (via the `exists (select ... students s where s.trainer_id = auth.uid())` RLS pattern).

**Cannot do:** see another trainer's students/exercises/routines (enforced by RLS, not just UI); create trainer or admin accounts.

### 1.3 Student

Root: `Beta/app/student/` · Layout: `Beta/app/student/layout.tsx` · Nav: Hoy, Rutina, Resumen, Perfil.

| Page | Path | Purpose |
|---|---|---|
| Home ("Hoy") | `app/student/page.tsx` | Today's assigned routine card + weekly-goal progress bar |
| Workout | `app/student/workout/page.tsx` + `WorkoutClient.tsx` | Step-through exercise list, mark complete, RPE (effort) selector, finish |
| Summary | `app/student/summary/page.tsx` + `SummaryNoteEditor.tsx` | Post-workout recap (time, exercises done, effort), editable note field |
| Profile | `app/student/profile/page.tsx` | Session/effort stats, body-metrics history + entry form, edit display name |

**Data visible:** their own `assignments` (active only), the `routines`/`routine_exercises`/`exercises` reachable through that assignment, their own `sessions`/`session_exercises`, their own `body_metrics`, and (read-only, via the layout) their trainer's `full_name`/`logo_url`/brand colors for co-branding.

**Cannot do:** see other students, edit routines/exercises (trainer-only via RLS `..._all_trainer` policies), see the trainer's roster or agenda.

---

## 2. User Journeys

### 2.1 Login flow

```
/login (email step)
   │  LoginForm.tsx calls supabase.rpc("get_student_trainer_branding", {p_email})
   │  → shows "Ingresando como alumno de {trainer}" branding card if a match exists
   ▼
/login (password step)
   │  <form action={login}>  →  app/login/actions.ts: login()
   │      supabase.auth.signInWithPassword({email, password})
   │      SELECT role FROM profiles WHERE id = user.id
   │      redirect(roleHome(role))
   ▼
role-based redirect
   admin   → /admin
   trainer → /trainer
   student → /student   (roleHome() in lib/roleHome.ts; default fallback is "student")
```

Middleware (`Beta/middleware.ts` → `Beta/lib/supabase/middleware.ts`) runs on every request and:
- Redirects unauthenticated users to `/login` for any non-public path.
- Redirects an authenticated user who lands on `/login` straight to their role home.
- Redirects an authenticated user who is in the *wrong* role area (e.g. a student hitting `/trainer/...`) back to their own role home.

Logout: `logout()` server action in `app/login/actions.ts` calls `supabase.auth.signOut()` and redirects to `/login`.

Email confirmation callback: `app/auth/callback/route.ts` exchanges a Supabase auth code for a session, then redirects to `/login` (used for the email-confirmation link flow, though in practice accounts are created with `email_confirm: true` by admin/trainer so this path is rarely exercised).

### 2.2 Student workout flow

```
/student (Home)
   getActiveAssignment() → assignments WHERE student_id = me AND active = true
   │
   ▼ [Iniciar entrenamiento]
/student/workout
   WorkoutClient.tsx (client component, holds local state: activeIndex, completedIds, effort, startedAt)
   │  for each exercise: show name/focus/sets/reps-or-time/rest
   │  "Marcar completado" → adds exerciseId to completedIds (local only, no server round-trip per exercise)
   │  "Siguiente ejercicio" → advances index; on last exercise → finish()
   │  "Terminar incompleto" → finish() with whatever was completed so far
   ▼
finishSession() server action (app/student/workout/actions.ts)
   INSERT sessions {student_id, routine_id, assignment_id, effort, elapsed_minutes,
                     status: completedIds.length === total ? "completada" : "incompleta"}
   INSERT session_exercises (one row per completed exercise)
   redirect(/student/summary?session={id})
   ▼
/student/summary
   getSessionWithRoutine() joins sessions + routines + counts of session_exercises
   shows elapsed time, completed/total, effort, editable coach_note (SummaryNoteEditor → updateSessionNote())
```

Note: exercise completion is tracked only in React state during the workout — nothing is persisted until `finishSession` runs at the very end (or on "Terminar incompleto"). If the tab is closed mid-workout, no `sessions` row is created at all.

### 2.3 Trainer management flow

```
/trainer (Dashboard)
   getStudentsWithStats() + getAppointments()
   KPIs: active students, "needs attention" count (RPE ≥ 5 OR status=inactivo), sessions today, adherence %
   │
   ▼
/trainer/students → StudentsList (search/filter client component)
   │
   ▼ [click a student]
/trainer/students/[id]
   StudentDetailActions.tsx (client):
     - toggleStudentStatus(studentId, "activo"|"inactivo")
     - assignRoutineToStudent(studentId, routineId)
         → deactivates any current active assignment, inserts a new active one
     - updateStudentNote(studentId, note)
   ActionForm → logMetricForStudent(studentId, ...) to log body composition on the student's behalf
   Shows last 5 sessions with status + RPE
```

Routine authoring is a separate branch: `/trainer/routines` → `/trainer/routines/new` (create) → `/trainer/routines/[id]` (add/remove exercises from `/trainer/exercises` library, delete routine). Exercises are authored independently under `/trainer/exercises`.

Agenda (`/trainer/agenda`) is a flat CRUD flow: create appointment (select student + date/time + notes) → list → change status inline (`AppointmentStatusSelect`) or delete.

### 2.4 Admin setup flow

```
node scripts/create-admin.mjs "Name" admin@email.com password
   → reads Beta/.env.local (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
   → supabase.auth.admin.createUser({email, password, email_confirm: true,
                                      user_metadata: {role: "admin", full_name}})
   → handle_new_user() trigger (SQL) inserts the matching profiles row automatically
   ▼
Admin logs in at /login → redirected to /admin
   ▼
/admin: ActionForm → createTrainer() (app/admin/actions.ts)
   uses createAdminClient() (service-role, bypasses RLS) to auth.admin.createUser({role: "trainer", ...})
   trigger creates the profiles row; no separate insert needed (trainer has no "students"-like link table)
```

There is **no public sign-up** for admin or trainer — both are provisioned out-of-band (CLI script for the first admin, admin UI for every subsequent trainer). Students are provisioned by their trainer via `/trainer/students/new` → `createStudent()`, which also inserts the `students` link row (`profile_id`, `trainer_id`, `note`).

---

## 3. Data Models

Manually-maintained TypeScript types mirroring the SQL schema live in `Beta/lib/supabase/database.types.ts` (the file's own header comment notes it should be regenerated with `supabase gen types typescript` once the CLI is wired up — currently it is hand-kept in sync with the migrations). Migrations live in `Beta/supabase/migrations/000{1..5}_*.sql`.

### `profiles`
- **Defined in:** `0001_init.sql` (base columns), extended by `0002_admin_role.sql` (role check + admin), `0004_trainer_branding.sql` (`logo_url`), `0005_trainer_colors.sql` (`brand_primary`, `brand_secondary`).
- **Key fields:** `id` (= `auth.users.id`, PK/FK, cascade delete), `role` (`'admin'|'trainer'|'student'`), `full_name`, `email`, `logo_url`, `brand_primary`/`brand_secondary` (hex, validated by CHECK constraints `^#[0-9A-Fa-f]{6}$`), `created_at`.
- **Relationships:** self-referenced by almost every other table's `trainer_id`/`student_id` FK (all point at `profiles.id`). Auto-created by the `handle_new_user()` trigger on `auth.users` insert, reading `role`/`full_name` from `raw_user_meta_data`.
- **RLS:** `profiles_select_own_or_trainer` (read your own row, or any student whose `trainer_id = auth.uid()`), `profiles_update_own` (only your own row), `profiles_select_admin` (admin sees all, via `SECURITY DEFINER` function `is_admin()` to avoid RLS recursion).

### `students`
- **Defined in:** `0001_init.sql`.
- **Key fields:** `profile_id` (PK, FK → `profiles.id`, 1:1), `trainer_id` (FK → `profiles.id`), `status` (`'activo'|'inactivo'`), `note`, `created_at`.
- **Relationships:** links a student `profiles` row to its owning trainer. `assignments.student_id`, `sessions.student_id`, `appointments.student_id`, `body_metrics.student_id` all FK to `students.profile_id`.
- **RLS:** select if you are the student or the trainer; insert/update/delete restricted to `trainer_id = auth.uid()` (only trainers create/manage student links — students cannot self-register).

### `exercises`
- **Defined in:** `0001_init.sql`. TypeScript type in `database.types.ts`.
- **Key fields:** `id`, `trainer_id`, `name`, `default_sets`, `default_reps` (nullable — reps XOR time), `default_time` (nullable text, e.g. "45 seg"), `default_rest` (seconds), `focus` (free-text muscle group/tag).
- **Relationships:** owned by a trainer; referenced by `routine_exercises.exercise_id` and `session_exercises.exercise_id`.
- **RLS:** `exercises_all_trainer` (full CRUD for the owning trainer); `exercises_select_assigned_student` lets a student read an exercise only if it's part of a routine they're actively assigned (join through `routine_exercises` + `assignments`).

### `routines`
- **Defined in:** `0001_init.sql`.
- **Key fields:** `id`, `trainer_id`, `name`, `goal` (free text), `estimated_minutes`.
- **Relationships:** parent of `routine_exercises` (the exercise list + per-routine set/rep/rest overrides); target of `assignments.routine_id` and `sessions.routine_id`.
- **RLS:** `routines_all_trainer` (owner CRUD); `routines_select_assigned_student` (read-only if actively assigned).

### `routine_exercises` (join/detail table)
- Per-routine copy of an exercise's prescription: `sets`, `reps`, `time`, `rest`, `order_index`. This is where a trainer can override an exercise's defaults for a specific routine (the form in `RoutineDetailPage` defaults these fields but they're independent columns, not FKs to the exercise's defaults).
- **RLS:** trainer CRUD via `exists (routines r where r.trainer_id = auth.uid())`; student read-only via active assignment.

### `assignments`
- **Defined in:** `0001_init.sql`.
- **Key fields:** `id`, `trainer_id`, `student_id`, `routine_id`, `active` (boolean), `assigned_at`.
- **Semantics:** a student can have multiple historical assignment rows, but the app enforces "one active assignment at a time" in application code (`assignRoutineToStudent()` deactivates the previous active row before inserting the new one) — **not** via a DB constraint.
- **RLS:** select if trainer or student owns the row; all writes restricted to `trainer_id = auth.uid()`.

### `sessions`
- **Defined in:** `0001_init.sql`.
- **Key fields:** `id`, `student_id`, `routine_id`, `assignment_id` (nullable, `ON DELETE SET NULL`), `effort` (1–5, CHECK constraint), `elapsed_minutes`, `status` (`'completada'|'incompleta'`), `coach_note`.
- **Relationships:** parent of `session_exercises` (which specific exercises the student marked done that session).
- **RLS:** select if student or their trainer; insert/update restricted to `student_id = auth.uid()` — **trainers cannot write sessions**, only read them and edit `coach_note` (the app lets the trainer's UI never actually calls an update on `coach_note`; only the student-side `SummaryNoteEditor` does, via `updateSessionNote()`, which itself has no ownership check beyond RLS).

### `session_exercises`
- Detail rows: `session_id`, `exercise_id`, `completed`. RLS mirrors `sessions` (student owns writes, trainer read-only via join).

### `appointments`
- **Defined in:** `0001_init.sql`.
- **Key fields:** `id`, `trainer_id`, `student_id`, `scheduled_at`, `status` (`'pendiente'|'confirmado'|'cancelado'|'completado'`), `notes`.
- **RLS:** select if trainer or student; all writes trainer-only (`appointments_write_trainer`). Students can see their own upcoming appointments in principle, though no student-facing agenda page currently consumes this table — it's trainer-only in the UI today.

### `body_metrics`
- **Defined in:** `0003_body_metrics.sql`.
- **Key fields:** `id`, `student_id`, `recorded_by` (who logged it — student or trainer), `recorded_at` (date), `weight_kg`, `height_cm`, `body_fat_pct`, `muscle_mass_kg`, `notes`.
- **RLS:** select for student or trainer; insert requires `recorded_by = auth.uid()` **and** (`student_id = auth.uid()` or trainer-of relationship) — so a trainer can log on behalf of their student, but only tagged as themselves; delete allowed for student or trainer. No update policy exists (entries are append-only / delete-and-reinsert).
- Indexed by `(student_id, recorded_at desc)` for the trend queries in `lib/data/bodyMetrics.ts`.

### Supabase Storage & RPC (supporting `profiles`)
- `logos` bucket (`0004_trainer_branding.sql`): public read; write/update/delete restricted to `(storage.foldername(name))[1] = auth.uid()::text` (i.e., a trainer can only write under their own folder).
- `get_student_trainer_branding(p_email text)` RPC (`0004`, reshaped in `0005`): `SECURITY DEFINER` function granted to `anon` + `authenticated`, used by the login screen to show the trainer's name/logo/colors *before* the student authenticates (deliberately bypasses RLS since the caller isn't logged in yet — only returns non-sensitive branding fields).

---

## 4. API / Server Actions

All Server Actions are files marked `"use server"` at the top and live in per-feature `actions.ts` files (Next.js App Router convention — these compile to POST endpoints, not REST routes). There is exactly one Route Handler in the app (`app/auth/callback/route.ts`, GET) — everything else is Server Actions.

| File | Function | Input | Effect / Return | Caller / auth |
|---|---|---|---|---|
| `app/login/actions.ts` | `login(prevState, formData)` | `email`, `password` | `signInWithPassword`; looks up role; `redirect(roleHome(role))`. Returns `{error}` on failure. | Public (unauthenticated) |
| `app/login/actions.ts` | `logout()` | — | `signOut()`; `redirect("/login")` | Any authenticated user |
| `app/admin/actions.ts` | `createTrainer(prevState, formData)` | `full_name`, `email`, `password` | Service-role `auth.admin.createUser({role:"trainer"})`; `revalidatePath("/admin")`; `redirect("/admin")` | Admin only (UI-gated; no explicit role re-check inside the action beyond requiring a logged-in user) |
| `app/trainer/students/actions.ts` | `createStudent(prevState, formData)` | `full_name`, `email`, `password`, `note` | Service-role creates auth user (`role:"student"`), then inserts `students {profile_id, trainer_id: caller, note}`; redirects to `/trainer/students` | Trainer |
| `app/trainer/students/actions.ts` | `updateStudentNote(studentId, note)` | ids/string | `UPDATE students SET note` (scoped by RLS `trainer_id = auth.uid()`); revalidates student detail + list | Trainer |
| `app/trainer/students/actions.ts` | `toggleStudentStatus(studentId, nextStatus)` | ids/enum | `UPDATE students SET status`; revalidates detail, list, dashboard | Trainer |
| `app/trainer/students/actions.ts` | `assignRoutineToStudent(studentId, routineId)` | ids | Deactivates prior active `assignments` row for that student, inserts new active one | Trainer |
| `app/trainer/students/actions.ts` | `logMetricForStudent(studentId, prevState, formData)` | weight/height/fat/muscle/notes | `INSERT body_metrics {recorded_by: caller}`; revalidates detail | Trainer |
| `app/trainer/exercises/actions.ts` | `createExercise(prevState, formData)` | name, focus, sets, reps, time, rest | `INSERT exercises`; redirect to list | Trainer |
| `app/trainer/exercises/actions.ts` | `updateExercise(exerciseId, prevState, formData)` | same fields | `UPDATE exercises`; redirect to list | Trainer (RLS-scoped; action itself doesn't re-check ownership beyond RLS) |
| `app/trainer/exercises/actions.ts` | `deleteExercise(exerciseId)` | id | `DELETE exercises`; revalidate list | Trainer |
| `app/trainer/routines/actions.ts` | `createRoutine(prevState, formData)` | name, goal, estimated_minutes | `INSERT routines`; redirect to new routine's detail page | Trainer |
| `app/trainer/routines/actions.ts` | `deleteRoutine(routineId)` | id | `DELETE routines`; redirect to list | Trainer |
| `app/trainer/routines/actions.ts` | `addExerciseToRoutine(routineId, formData)` | exercise_id, sets, reps, time, rest | `INSERT routine_exercises` with computed `order_index` (current count) | Trainer |
| `app/trainer/routines/actions.ts` | `removeExerciseFromRoutine(routineId, routineExerciseId)` | ids | `DELETE routine_exercises` | Trainer |
| `app/trainer/agenda/actions.ts` | `createAppointment(formData)` | student_id, date, time, notes | `INSERT appointments {trainer_id: caller}`; revalidates agenda + dashboard | Trainer |
| `app/trainer/agenda/actions.ts` | `updateAppointmentStatus(id, status)` | id, enum | `UPDATE appointments SET status` | Trainer |
| `app/trainer/agenda/actions.ts` | `deleteAppointment(id)` | id | `DELETE appointments` | Trainer |
| `app/student/workout/actions.ts` | `finishSession(input)` | assignmentId, routineId, totalExercises, completedExerciseIds[], effort, elapsedMinutes | `INSERT sessions` (status derived from completed vs total) + `INSERT session_exercises`; `redirect(/student/summary?session=id)` | Student |
| `app/student/workout/actions.ts` | `updateSessionNote(sessionId, note)` | id, string | `UPDATE sessions SET coach_note` | Student (no explicit ownership check in the action — relies on RLS, but `sessions` update policy only allows `student_id = auth.uid()`, so it's self-consistent) |
| `app/student/profile/actions.ts` | `updateFullName(prevState, formData)` | full_name | `UPDATE profiles SET full_name` for caller; revalidate profile | Student |
| `app/student/profile/actions.ts` | `logBodyMetric(prevState, formData)` | weight/height/fat/muscle/notes | `INSERT body_metrics {student_id: caller, recorded_by: caller}` | Student |

**Client-side Supabase calls (not Server Actions, but worth noting as "API surface"):**
- `LoginForm.tsx` → `supabase.rpc("get_student_trainer_branding", {p_email})` (browser client, anon-safe RPC).
- `LogoUploader.tsx` → `supabase.storage.from("logos").upload/getPublicUrl` + `profiles` update, straight from the browser client (RLS + storage policies enforce trainer-only write to their own folder).
- `BrandColorPicker.tsx` → direct `profiles` update from the browser client.

None of these Server Actions perform an explicit `role === "trainer"` check inside the function body — authorization is delegated entirely to (a) the page-level `requireProfile(role)` gate that renders the form in the first place, and (b) Postgres RLS on the underlying table. This means the actions are technically callable by any authenticated user who knows the function exists (Next.js Server Actions are just POST endpoints keyed by an obfuscated ID), but RLS ultimately blocks unauthorized writes at the database layer.

---

## 5. Authentication & Authorization

**Auth provider:** Supabase Auth (email + password only; no OAuth/magic-link UI wired up, though `app/auth/callback/route.ts` supports the code-exchange flow Supabase uses for email confirmation links).

**Three cooperating Supabase client wrappers** (`Beta/lib/supabase/`):
- `client.ts` — `createBrowserClient`, used in `"use client"` components (`LoginForm`, `LogoUploader`, `BrandColorPicker`).
- `server.ts` — `createServerClient` bound to Next.js `cookies()`, used in Server Components/Server Actions/Route Handlers. Respects the caller's session and RLS.
- `admin.ts` — `createAdminClient`, service-role key, **bypasses RLS**. Used exclusively for `auth.admin.createUser()` in `createTrainer` and `createStudent`. Comment in the file explicitly warns never to import it from a client component.

**Role determination:** a single column, `profiles.role`, populated automatically by the `handle_new_user()` Postgres trigger (`0001_init.sql`) reading `role` out of `auth.users.raw_user_meta_data` at signup time. There is no separate roles/permissions table — it's a flat enum-like `text` column with a CHECK constraint (`'admin'|'trainer'|'student'`, extended in `0002_admin_role.sql`).

**Route protection layers (defense in depth):**
1. **Middleware** (`Beta/middleware.ts` + `Beta/lib/supabase/middleware.ts`) — runs on almost every request (matcher excludes `_next/static`, `_next/image`, favicon, and image assets). Redirects unauthenticated users away from private paths, redirects logged-in users away from `/login`, and redirects a user whose role doesn't match the `/admin`, `/trainer`, or `/student` prefix they're trying to access.
2. **Page/layout-level gate** (`Beta/lib/auth.ts` → `requireProfile(role)`) — called at the top of every role-scoped `layout.tsx`/`page.tsx`. Fetches the current user + their `profiles` row; if there's no user, `redirect("/login")`; if the role doesn't match the expected one, `redirect(roleHome(profile?.role))`. This is a second, server-side check independent of middleware (defends against middleware misconfiguration and covers Server Component data fetching that middleware alone can't gate).
3. **Row-Level Security in Postgres** — the actual data access boundary. Every table has RLS enabled with explicit `select`/`insert`/`update`/`delete` policies (see [Section 3](#3-data-models) per table). Even if application code has a bug, the database itself refuses cross-tenant reads/writes.

**`roleHome(role)`** (`Beta/lib/roleHome.ts`) is the single source of truth for "where does this role land": `admin → /admin`, `trainer → /trainer`, anything else (including `null`/`undefined`) → `/student`. Used by middleware, `login()`, and `requireProfile()`.

**Admin/trainer bootstrap is out-of-band by design:** there is no public sign-up route. The first admin is created via `Beta/scripts/create-admin.mjs` (a Node CLI script run manually against `.env.local`, using the service-role key). Every trainer after that is created by an existing admin through `/admin`. Every student is created by their trainer through `/trainer/students/new`. Comments in the code (`0002_admin_role.sql`, `create-admin.mjs`) confirm this is intentional, not an oversight.

---

## 6. Current State

### Fully working
- Email/password auth, three-tier role redirect, middleware + page-level + RLS defense in depth.
- Full trainer CRUD for exercises, routines (with routine-exercise composition), students, appointments.
- Student workout flow end-to-end: view assigned routine → step through exercises → log RPE → persist a `sessions` + `session_exercises` record → summary screen → editable coach note.
- Body composition tracking from both sides (student self-logs, trainer logs on behalf of student), with a shared trend/sparkline helper (`lib/data/bodyMetrics.ts` → `buildTrend()`).
- Per-trainer white-labeling: logo upload to Supabase Storage, brand primary/secondary colors written to CSS variables (`lib/color.ts` → `brandCssVars()`) and consumed by Tailwind's `rgb(var(--brand-primary-rgb, fallback) / <alpha-value>)` pattern, applied in the student layout so a student sees their trainer's colors, and shown pre-login via the branding RPC.
- Admin trainer-provisioning flow.

### Incomplete / mock / placeholder
- **`Beta/README.md` and `Beta/REFACTOR.md` are stale** — they document an earlier, pre-Supabase prototype built entirely on mock data (`app/data/users.ts`, `app/data/workouts.ts`, a `useAppState` hook, `Header`/`BottomNav` components). Git status shows all of those files as **deleted** in the working tree (the real Supabase-backed app has replaced them with `app/admin`, `app/auth`, `app/login`, `app/student`, `app/trainer`, `lib/`, `middleware.ts`, `supabase/`). The two markdown files were never updated to reflect the rewrite and should not be trusted as current architecture docs.
- **`database.types.ts` is hand-maintained**, not generated — its own header comment flags this as a TODO ("update this file, or generate it with `supabase gen types typescript` once the CLI is connected"). Any schema drift has to be manually mirrored here.
- **No student-facing agenda/appointments view** — `appointments` RLS already allows students to read their own rows, but no student page queries the table; appointments are trainer-only in the UI today.
- **Assignment "single active routine" is an app-level convention, not a DB constraint** — `assignRoutineToStudent()` deactivates the previous row before inserting a new one, but nothing in the schema prevents two `active = true` rows for the same student if a caller bypasses that action (e.g., a race condition or a future integration writing directly to the table).
- **No trainer profile self-edit form** apart from name/logo/colors — email or password changes aren't exposed anywhere in the UI.
- **Server Actions do not re-check role inside the function body** (see [Section 4](#4-api--server-actions)) — they rely entirely on the calling page having gated access and on RLS to stop unauthorized writes. This is a reasonable defense-in-depth posture but worth knowing if actions are ever called from a context that skips the page gate.
- **`session_exercises` completion is only written once, at the end of the workout** — there's no incremental save-as-you-go, so a crashed/closed tab mid-workout loses the entire session.
- **`.stitch-reference/` directory** contains static HTML/PNG design mockups (Stitch-generated) that appear to be the original visual reference for the UI — not live code, just design source material.

### Known limitations
- Password minimum length enforced client/server-side is only 6 characters (`createTrainer`, `createStudent`).
- No email verification is actually required in practice — accounts are created with `email_confirm: true` by an admin/trainer, so the `auth/callback` route exists but is rarely hit.
- No automated tests exist anywhere in `Beta/` (no `__tests__`, no test runner configured in `package.json`).

---

## 7. Tech Stack Details

### Next.js App Router
- Next.js "latest" (canary-tracking, per `package.json`) with the App Router exclusively — no `pages/` directory.
- Route groups by role: `app/admin/`, `app/trainer/`, `app/student/`, each with its own `layout.tsx` that calls `requireProfile(role)` and renders the shared `Sidebar`/`TopBar`/`SectionNav` chrome.
- Dynamic routes: `app/trainer/exercises/[id]/page.tsx`, `app/trainer/routines/[id]/page.tsx`, `app/trainer/students/[id]/page.tsx` — all `params` are typed as `Promise<{id: string}>` and `await`ed (Next.js 15+ async params convention).
- `searchParams` also typed as a Promise and awaited, e.g. `app/student/summary/page.tsx`.
- One Route Handler: `app/auth/callback/route.ts` (GET), for the Supabase email-confirmation code exchange.
- `revalidatePath()` is used pervasively after mutations instead of client-side cache invalidation (e.g., every trainer action revalidates the relevant list/detail path, sometimes multiple paths like `/trainer/students/[id]` + `/trainer/students` + `/trainer`).

### Server Components vs Client Components
- **Default is Server Components.** Every `page.tsx` and `layout.tsx` is a Server Component that calls `requireProfile()` and fetches data directly via the server Supabase client — no client-side data-fetching library (no SWR/React Query).
- **Client Components (`"use client"`) are used narrowly**, for interactivity that needs local state or browser APIs:
  - `LoginForm.tsx` — two-step email/password form with `useActionState` + a `useTransition`-wrapped branding lookup.
  - `WorkoutClient.tsx` — the exercise step-through state machine.
  - `SummaryNoteEditor.tsx`, `StudentDetailActions.tsx`, `AppointmentStatusSelect.tsx`, `DeleteButton.tsx`, `ActionForm.tsx` — small islands wrapping a Server Action call in `useTransition`/`useActionState` for pending-state UX.
  - `LogoUploader.tsx`, `BrandColorPicker.tsx` — call the **browser** Supabase client directly (Storage upload, direct table update) rather than going through a Server Action, then call `router.refresh()` to re-run the Server Component tree.
- Server Actions (`"use server"` files) are the primary mutation mechanism; forms use the native `<form action={...}>` binding or `.bind(null, id)` to curry an ID into the action signature (e.g., `updateExercise.bind(null, exercise.id)`).

### Supabase client wrappers
Three call sites, each with a distinct purpose (see [Section 5](#5-authentication--authorization) for details): `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server, cookie-bound, RLS-respecting), `lib/supabase/admin.ts` (service-role, RLS-bypassing, action-only). `lib/supabase/middleware.ts` holds a fourth, middleware-specific client construction because middleware can't use `next/headers` `cookies()`.

### Styling approach
- Tailwind CSS 3.4 (`tailwind.config.ts`), content scanned from `app/`, `components/`, `lib/`.
- **Dynamic per-trainer branding via CSS variables**: `primary`/`secondary`/`soft` Tailwind colors are defined as `rgb(var(--brand-primary-rgb, <fallback R G B>) / <alpha-value>)` — i.e., Tailwind color utilities (`bg-primary`, `text-secondary/20`, etc.) resolve to whatever CSS variable is in scope, falling back to the default green palette if unset. `lib/color.ts`'s `brandCssVars()` converts a trainer's hex `brand_primary`/`brand_secondary` into `"R G B"` channel strings and returns a style object (`--brand-primary-rgb`, `--brand-soft-rgb`, `--brand-secondary-rgb`) that gets spread onto a wrapping `<div style={...}>` in the student layout (and the login form once branding is looked up), so nested Tailwind utility classes pick up the trainer's colors automatically without any per-component conditional logic.
- Custom utility classes (`glass-card`, `premium-button`, `secondary-button`, `ghost-button`, `field-input`) are defined in `app/globals.css` (glass-morphism aesthetic — semi-transparent cards, soft shadows) rather than being composed inline everywhere.
- Font: Google Font `Inter` loaded via `next/font/google` in `app/layout.tsx`, exposed as the `--font-inter` CSS variable and wired into Tailwind's `fontFamily.sans`.
