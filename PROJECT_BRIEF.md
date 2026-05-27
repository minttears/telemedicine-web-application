# Project Brief

## Product

This project is a telemedicine web application for remote medical consultations.

The MVP must let a patient register, sign in, complete a profile, browse doctors, filter by specialty and availability, book a consultation time, create a consultation, and chat with the doctor. Doctors must be able to manage their profile, schedule, consultations, patients, chat messages, and attached files. Administrators must be able to manage users, doctors, specialties, consultations, audit logs, and basic system settings.

The first release is a working MVP, not a full production medical platform.

## Source Of Truth

The technical and product source of truth is `Requirements Specification.md`.

If implementation questions arise, prefer the requirements file over assumptions. If the requirements do not answer the question, record the decision in `DECISIONS.md` after user approval.

## Technical Stack

- Next.js App Router
- React
- TypeScript
- Node.js runtime
- Prisma ORM
- Supabase Postgres
- Supabase Realtime
- Supabase Storage
- Tailwind CSS
- Vercel

Backend functionality must use Next.js Route Handlers. Do not add a separate Express backend for the MVP.

## User Roles

- `PATIENT`
- `DOCTOR`
- `ADMIN`

## MVP Flow

1. Patient registers and signs in.
2. Patient completes their profile.
3. Patient opens the doctor list.
4. Patient filters doctors by specialty, availability, experience, and other criteria.
5. Patient opens a doctor profile.
6. Patient selects an available consultation time.
7. Patient creates a consultation.
8. Doctor sees the new consultation in their workspace.
9. Patient and doctor chat inside the consultation.
10. Users attach files to chat messages.
11. Chat updates in real time.
12. Admin manages doctors, patients, consultations, specialties, and audit logs.

## Patient Workspace

Expected patient routes:

- `/patient/dashboard`
- `/patient/profile`
- `/patient/doctors`
- `/patient/doctors/[doctorId]`
- `/patient/consultations`
- `/patient/consultations/new`
- `/patient/consultations/[consultationId]`
- `/patient/chat-history`
- `/patient/files`
- `/patient/archive`

## Doctor Workspace

Expected doctor routes:

- `/doctor/dashboard`
- `/doctor/profile`
- `/doctor/schedule`
- `/doctor/consultations`
- `/doctor/consultations/[consultationId]`
- `/doctor/patients`
- `/doctor/patients/[patientId]`
- `/doctor/templates`
- `/doctor/security`

## Admin Workspace

Expected admin routes:

- `/admin/dashboard`
- `/admin/users`
- `/admin/users/[userId]`
- `/admin/doctors`
- `/admin/doctors/new`
- `/admin/specialties`
- `/admin/consultations`
- `/admin/audit-log`
- `/admin/settings`

## Public Pages

Expected public routes:

- `/`
- `/doctors`
- `/doctors/[doctorId]`
- `/about`
- `/contacts`
- `/privacy`
- `/terms`

Public pages should include SEO metadata. Authenticated dashboards should not be indexed.

## Core MVP Domains

- Authentication and role-based access
- Patient profile
- Doctor profiles and specialties
- Doctor availability and basic schedule slots
- Consultation booking
- Consultation lifecycle
- Consultation chat
- File attachments through Supabase Storage
- Admin user, doctor, specialty, consultation, and audit log management
- Public SEO pages
- Responsive dashboard-style UI

## Authentication Direction

Use custom session-cookie authentication.

Required authentication pieces:

- Patient registration
- Login
- Logout
- Password hashing
- HTTP-only session cookie
- `Session` table in PostgreSQL
- `getCurrentUser`
- `requireUser`
- `requireRole`
- Role-based redirect after login

Do not use Auth.js unless explicitly requested later.

2FA is not part of the first implementation, but the database can be prepared for future `TwoFactorSecret` and `TwoFactorRecoveryCode` models.

## Chat Direction

Chat is attached to a consultation.

Messages are persisted in PostgreSQL through Prisma and backend APIs.
Supabase Realtime is used only for UI updates.
PostgreSQL remains the source of truth.

Message types should include:

- `TEXT`
- `FILE`
- `SYSTEM`
- `CALL_STARTED`
- `CALL_ENDED`

The call-related message types prepare the chat for future video calls.

## Future Features

- 2FA for doctors and admins
- Video calls
- Patient intake questionnaire
- Consultation archive
- AI consultation summary
- PWA and mobile improvements

## Non-Goals For MVP

- Auth.js
- Separate Express backend
- Payment system
- Complex calendar integrations
- Native mobile application
- End-to-end encryption
- AI diagnosis
- Full medical compliance implementation

## Design Direction

The UI should use light minimalism, a calm medical-service feel, clear navigation, generous spacing, and modern dashboard-style layouts.

Requirements:

- Do not use emoji in the interface.
- Use SVG/vector icons, status badges, illustrations, and text labels instead.
- Use a calm blue, teal, or green accent color.
- Avoid aggressive colors and excessive animation.
- Support desktop, tablet, and mobile.
- Include loading, empty, error, unauthorized, forbidden, and not-found states for primary screens.
