# Project Context: Placement Drive Management Portal

> Context file for AI coding assistants. Read fully before generating code.

## 1. Overview
A web platform that replaces the Google Forms + Excel + WhatsApp workflow used by college placement cells.
Students maintain one verified profile and apply to drives they're eligible for; coordinators and the TPO manage drives, rounds, and results; the system handles eligibility, notifications, and analytics.

**Goals:** not a CRUD app — the project must demonstrate real system design: a rules engine, concurrency-safe applications, queue-backed notifications, audit logging, and RBAC.

## 2. Tech Stack
- **Framework:** Next.js (App Router) + TypeScript (strict mode)
- **Database:** PostgreSQL (Neon / Supabase)
- **ORM:** Drizzle ORM + drizzle-kit migrations
- **Auth:** Auth.js (NextAuth), restricted to college email domain
- **Validation:** Zod (shared between client and server)
- **Cache / rate limiting:** Upstash Redis
- **Job queue:** pg-boss (Postgres-backed) — runs in a separate worker process
- **File storage:** Cloudflare R2 (S3-compatible), presigned uploads
- **Email:** Resend
- **UI:** Tailwind CSS + shadcn/ui
- **Testing:** Vitest (unit), Playwright (e2e), k6 (load)
- **Local dev:** Docker Compose (Postgres + Redis)

**Deliberately NOT used:** Kafka — event volume is low; Postgres-backed queue is the correct choice.

## 3. Deployment (free tier)
- Next.js app → Vercel
- Worker (pg-boss consumers) → Render / Koyeb (long-running process; Vercel is serverless and can't run it)
- Postgres → Neon/Supabase · Redis → Upstash · Files → R2 · Email → Resend

## 4. Roles (RBAC)
| Role | Permissions |
|---|---|
| `STUDENT` | Edit unverified profile fields, upload resumes, view eligible drives, apply, track status |
| `COORDINATOR` | Manage assigned drives, update round results (incl. bulk CSV), send notifications |
| `ADMIN` (TPO) | Create drives/companies, verify student data, manage coordinators, view analytics |
| `RECRUITER` (phase 4) | View shortlists, download resumes, mark round results for own drives |

Enforce permissions **server-side** in every route handler / server action via a central `authorize(user, action, resource)` helper. Never rely on UI hiding.

## 5. Core Features
1. **Verified student profile** — entered once; admin verifies and locks fields (CGPA, backlogs, branch).
2. **Drive creation with eligibility rules** — rules stored as JSON (e.g. CGPA ≥ 7, branch in [CS, CSBS, IT], no active backlogs, batch 2027).
3. **Eligibility filtering** — students see only eligible drives; ineligible ones show the failing reason.
4. **Apply** — one click; snapshots profile + resume at apply time.
5. **Round tracking** — Applied → OA → Technical → HR → Offer, pass/fail per round.
6. **Bulk round results** — coordinator uploads CSV; statuses update in one transaction.
7. **Notifications** — new eligible drive, deadline reminders, round results (email + in-app).
8. **Placement policies** — e.g. placed in Dream tier → can't apply to lower tiers; max offers per student.
9. **Exports & analytics** — shortlist Excel export, resume ZIP, placement %, branch-wise stats, CTC distribution.
10. **Audit log** — every change to verified data and round results.

## 6. System Design Decisions (must follow)

### 6.1 Eligibility rules engine
- `drives.eligibility_rules` is JSONB validated by a Zod schema.
- Example:
  ```json
  {
    "all": [
      { "field": "cgpa", "op": "gte", "value": 7.0 },
      { "field": "branch", "op": "in", "value": ["CS", "CSBS", "IT"] },
      { "field": "active_backlogs", "op": "eq", "value": 0 },
      { "field": "batch", "op": "eq", "value": 2027 }
    ]
  }
  ```
- Allowed fields/operators are a **whitelist** — never interpolate raw input into SQL.
- Two evaluators sharing the same rule definitions:
  - `rulesToSqlWhere(rules)` → Drizzle `where` clause for listing eligible students / drives at scale.
  - `evaluateRules(rules, student)` → `{ eligible: boolean, failedRules: Rule[] }` for single-student checks and showing reasons.

### 6.2 Concurrency-safe apply (deadline rush)
- `UNIQUE(student_id, drive_id)` on `applications`.
- Apply runs in **one transaction**: lock student row (`SELECT ... FOR UPDATE`), re-check deadline using DB time (`now()`), re-check eligibility, check placement policy, insert application.
- Client sends an `Idempotency-Key`; duplicate submissions return the existing application, not an error.
- Rate limit apply endpoint per user via Upstash Redis.
- Deadline is enforced server-side only — frontend timers are cosmetic.

### 6.3 Notification fan-out
- Never send emails inside a request.
- Request → enqueue a single job (e.g. `drive.published`) → worker expands to eligible students → enqueues batched `email.send` jobs.
- Retries with exponential backoff; failed jobs go to a dead-letter queue.
- Idempotent sends: `notifications` row with a unique `(user_id, type, ref_id)` dedupe key, checked before sending.

### 6.4 Application snapshots
- `applications.profile_snapshot` (JSONB) + `resume_id` capture state at apply time.
- Intentional denormalization: later profile edits must not change what the recruiter received.

### 6.5 Audit log
- Write audit rows in the **same transaction** as the change.
- Store `actor_id`, `entity`, `entity_id`, `action`, `diff` (before/after JSON).

### 6.6 File uploads
- Client requests presigned PUT URL → uploads directly to R2 → server confirms and creates `resumes` row.
- Resumes are versioned; only PDF, max size enforced.
- Bulk resume ZIP for a drive is generated by a background job, delivered via presigned GET URL.

### 6.7 Caching
- Analytics dashboard aggregates cached in Redis with short TTL; invalidate on round result updates.

### 6.8 Multi-tenancy (future-proofing)
- Include `college_id` on tenant-scoped tables from day one, even with a single college.

## 7. Database Schema (initial)
```sql
colleges(id, name, email_domain)

users(id, college_id, email UNIQUE, name, role, created_at)

students(user_id PK/FK, roll_no, branch, batch, cgpa NUMERIC(4,2),
         active_backlogs INT, verified_at, verified_by,
         placement_status, placed_tier)

resumes(id, student_id, file_key, version, created_at)

companies(id, college_id, name, website)

drives(id, college_id, company_id, title, description, ctc NUMERIC,
       tier, deadline TIMESTAMPTZ, eligibility_rules JSONB,
       status, created_by, created_at)

drive_rounds(id, drive_id, name, sequence)

drive_coordinators(drive_id, user_id)

applications(id, student_id, drive_id, resume_id,
             profile_snapshot JSONB, status, idempotency_key,
             applied_at, UNIQUE(student_id, drive_id))

round_results(application_id, round_id, result, updated_by, updated_at,
              PRIMARY KEY(application_id, round_id))

notifications(id, user_id, type, ref_id, payload JSONB,
              read_at, sent_at, UNIQUE(user_id, type, ref_id))

audit_logs(id, actor_id, entity, entity_id, action, diff JSONB, created_at)
```
**Indexes:** `drives(college_id, status, deadline)`, `applications(drive_id, status)`, `students(branch, batch, cgpa)`, `audit_logs(entity, entity_id)`.

## 8. Suggested Folder Structure
```
/src
  /app                  # Next.js routes (App Router)
    /(student)/...
    /(admin)/...
    /api/...            # route handlers (webhooks, presign, etc.)
  /server
    /db                 # drizzle schema, client, migrations
    /services           # business logic (applications, drives, eligibility)
    /rules              # eligibility rules engine
    /auth               # Auth.js config, authorize()
    /queue              # pg-boss job definitions + enqueue helpers
  /worker               # standalone worker entrypoint (deployed separately)
  /lib                  # shared utils, zod schemas
  /components           # UI components
/tests
/load                   # k6 scripts
docker-compose.yml
```

## 9. Coding Conventions
- TypeScript strict; no `any`.
- Business logic lives in `/server/services`, not in route handlers or components.
- All inputs validated with Zod at the boundary.
- All multi-step writes wrapped in DB transactions.
- Every mutation checks authorization server-side.
- Consistent error shape: `{ error: { code, message } }`.
- Times stored as `TIMESTAMPTZ`; compare deadlines using DB time.
- Write unit tests for the rules engine and apply flow first.

## 10. Build Phases
1. **MVP** — auth (college domain), student profile, admin verification, drive CRUD, simple eligibility, apply, status view.
2. **Core depth** — JSON rules engine (SQL + in-memory evaluators), rounds + bulk CSV results, placement policies, audit log, idempotent transactional apply.
3. **Scale features** — pg-boss worker, notification fan-out, presigned R2 uploads + resume versions, exports (Excel, ZIP), analytics + Redis cache, rate limiting.
4. **Polish** — recruiter portal, seed script (1,000 students / 50 drives), k6 load test of deadline rush, Playwright e2e, architecture diagram + README with design decisions.

## 11. Success Metrics (for README / resume)
- Zero duplicate applications under k6 deadline-rush load test (report req/s and p95 latency).
- Notification fan-out to N students without request timeouts.
- Full audit trail on all verified-data and result changes.