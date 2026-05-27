# Requirements Specification: Telemedicine Web Application

## 1. What Is This Website?

Build a web application for remote medical consultations.

The main idea: a patient can register, choose a doctor, book a consultation time, create a consultation, and communicate with the doctor through chat. A doctor can manage consultations, schedule, patients, messages, and attached files. An administrator can manage users, doctors, specialties, consultations, audit logs, and basic system settings.

The first release must be a working MVP, not a full production medical platform.

## 2. MVP User Flow

1. Patient registers and signs in.
2. Patient completes their profile.
3. Patient opens the doctor list.
4. Patient filters doctors by specialty, availability, and other criteria.
5. Patient opens a doctor profile.
6. Patient chooses an available consultation time.
7. Patient creates a consultation.
8. Doctor sees the consultation in their workspace.
9. Patient and doctor communicate in the consultation chat.
10. Users can attach files to messages.
11. Chat messages update in real time.
12. Admin manages doctors, patients, specialties, consultations, and audit logs.

## 3. Technology Stack

Use:

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

Backend must be implemented through Next.js Route Handlers. Do not add a separate Express backend for the MVP.

## 4. User Roles

### `PATIENT`

A patient can:

- register;
- sign in;
- sign out;
- edit profile;
- browse doctors;
- filter doctors by specialty, availability, experience, and other criteria;
- open doctor profiles;
- view doctor schedules;
- book consultation time;
- create consultations;
- view their consultations;
- open consultation chat;
- send messages to the doctor;
- attach files;
- view consultation history;
- later download consultation archive.

### `DOCTOR`

A doctor can:

- sign in;
- view dashboard;
- edit doctor profile;
- set specialty, description, experience, and availability;
- manage schedule;
- view booked consultations;
- view patients;
- open consultation chats;
- reply to patients;
- view patient attachments;
- close consultations;
- later use 2FA;
- later start video calls.

### `ADMIN`

An admin can:

- sign in;
- view admin dashboard;
- manage patients;
- manage doctors;
- create and edit doctors;
- manage specialties;
- view consultation metadata;
- view audit logs;
- block or deactivate users;
- manage basic site settings.

## 5. Site Structure

### Public Pages

- `/`
- `/doctors`
- `/doctors/[doctorId]`
- `/about`
- `/contacts`
- `/privacy`
- `/terms`

### Auth Pages

- `/login`
- `/register`
- `/forgot-password` later
- `/security` later

### Patient Pages

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

### Doctor Pages

- `/doctor/dashboard`
- `/doctor/profile`
- `/doctor/schedule`
- `/doctor/consultations`
- `/doctor/consultations/[consultationId]`
- `/doctor/patients`
- `/doctor/patients/[patientId]`
- `/doctor/templates`
- `/doctor/security`

### Admin Pages

- `/admin/dashboard`
- `/admin/users`
- `/admin/users/[userId]`
- `/admin/doctors`
- `/admin/doctors/new`
- `/admin/specialties`
- `/admin/consultations`
- `/admin/audit-log`
- `/admin/settings`

## 6. Authentication Requirements

Use custom session-cookie authentication.

Implement:

- patient registration;
- login;
- logout;
- password hashing;
- HTTP-only session cookie;
- `Session` table in PostgreSQL;
- `getCurrentUser` helper;
- `requireUser` helper;
- `requireRole` helper;
- role-based redirects after login.

Do not use Auth.js in the MVP.

2FA should not be implemented in the first iteration, but the database may include future `TwoFactorSecret` and `TwoFactorRecoveryCode` models.

## 7. Doctor, Schedule, And Booking Requirements

Implement:

- doctor list;
- doctor profile;
- specialties;
- filters;
- doctor availability;
- basic schedule slots;
- consultation booking.

Booking MVP:

- a doctor has available time slots;
- a patient selects a slot;
- a consultation is created;
- the selected slot becomes reserved;
- the doctor sees the consultation in the schedule.

Do not implement complex recurring scheduling or external calendar integrations in the MVP.

## 8. Consultation Requirements

A consultation connects:

- patient;
- doctor;
- scheduled time;
- status;
- chat;
- files.

Consultation statuses:

- `REQUESTED`
- `SCHEDULED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

## 9. Chat Requirements

Chat is attached to a consultation.

Requirements:

- messages are stored in PostgreSQL;
- messages are created through backend APIs;
- Prisma is used for message reads/writes;
- Supabase Realtime is used for UI updates;
- PostgreSQL remains the source of truth;
- patients see only their own chats;
- doctors see only their own assigned consultations;
- admin private chat access should not be implemented unless explicitly requested and audited.

Message types:

- `TEXT`
- `FILE`
- `SYSTEM`
- `CALL_STARTED`
- `CALL_ENDED`

`CALL_STARTED` and `CALL_ENDED` prepare the chat for future video calls.

## 10. File Attachment Requirements

Use Supabase Storage for file blobs.

Store metadata in PostgreSQL:

- `id`
- `consultationId`
- `messageId`
- `uploadedById`
- `fileName`
- `fileType`
- `fileSize`
- `storagePath`
- `createdAt`

MVP allowed file types:

- PDF
- JPG
- PNG
- DOC/DOCX if convenient

## 11. Database Plan

Use Prisma schema.

Core models:

- `User`
- `Session`
- `PatientProfile`
- `DoctorProfile`
- `Specialty`
- `DoctorScheduleSlot`
- `Consultation`
- `Message`
- `Attachment`
- `AuditLog`
- `TwoFactorSecret`
- `TwoFactorRecoveryCode`

2FA models may be added early, but 2FA behavior is deferred.

## 12. UI Style

Style: light minimalism.

Requirements:

- no emoji in UI;
- clean medical-service look;
- calm interface;
- generous spacing;
- high-quality typography;
- clear navigation;
- modern dashboard layouts;
- smooth and restrained animations;
- no aggressive colors;
- consistent buttons, forms, cards, tables, and badges;
- responsive desktop/tablet/mobile behavior.

Use instead of emoji:

- SVG icons;
- vector icons;
- status badges;
- simple illustrations;
- text labels.

Possible libraries after approval:

- Tailwind CSS;
- `lucide-react`;
- Framer Motion only if needed.

## 13. Responsiveness And Quality

The site must work correctly on:

- desktop;
- tablet;
- mobile.

Requirements:

- responsive layouts;
- usable mobile navigation;
- usable mobile chat;
- tables do not break pages on mobile;
- forms do not overflow the screen;
- buttons have practical touch size;
- text is readable;
- no accidental horizontal scroll;
- main screens include loading, empty, error, unauthorized, forbidden, and not-found states.

## 14. SEO And Technical Quality

Public pages need SEO:

- `/`
- `/doctors`
- `/doctors/[doctorId]`
- `/about`
- `/contacts`
- `/privacy`
- `/terms`

Requirements:

- title;
- description;
- Open Graph metadata;
- favicon;
- `robots.txt`;
- `sitemap.xml`;
- canonical URL where appropriate;
- clean meta tags.

Use Next.js:

- Metadata API;
- `app/sitemap.ts`;
- `app/robots.ts`;
- `app/icon.tsx` or `app/favicon.ico`.

Authenticated patient, doctor, and admin dashboards should not be indexed.

## 15. Deployment And Publication

The project must be ready for Vercel.

Requirements:

- code stored in GitHub;
- Vercel connected to GitHub repository;
- push to `main` triggers deployment only after user-approved workflow;
- environment variables configured in Vercel;
- Supabase used for database, realtime, and storage;
- Prisma Client generated during build;
- `.env.local` is not committed;
- `.env.example` lists required variables without real secrets.

Required environment variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `APP_URL`

Suggested `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "postinstall": "prisma generate",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "prisma:studio": "prisma studio",
    "prisma:migrate": "prisma migrate dev"
  }
}
```

## 16. MVP Security Requirements

Security should be basic but mandatory:

- passwords stored only as hashes;
- sessions use HTTP-only cookies;
- secrets stored only in environment variables;
- Supabase service role key never exposed to frontend;
- protected routes check roles;
- patient sees only own consultations;
- doctor sees only assigned consultations;
- admin pages require `ADMIN` role;
- do not log passwords, tokens, 2FA secrets, or file contents.

Full medical compliance, end-to-end encryption, and advanced security audit are not part of the MVP.

## 17. Future Features

### 2FA

- TOTP 2FA;
- mandatory for doctors and admins;
- QR code;
- recovery codes.

### Video Calls

- button in consultation chat;
- Telegram Web-style overlay or separate call page;
- Jitsi can be used first;
- custom WebRTC only later if needed.

### Patient Intake Questionnaire

- symptoms;
- complaint duration;
- attachments;
- structured summary for doctor.

### Consultation Archive

- export chat;
- files;
- final doctor note;
- prescriptions/recommendations if implemented.

### AI Summary

- summarize consultation;
- not a diagnosis;
- final decision always belongs to the doctor.

## 18. Non-Goals For MVP

Do not implement in MVP:

- payments;
- complex calendar integrations;
- custom WebRTC;
- end-to-end encryption;
- AI diagnosis;
- native mobile app;
- complex CRM;
- full medical compliance system.

## 19. MVP Completion Criteria

MVP is considered ready when:

1. Patient can register.
2. Patient can sign in.
3. Doctor can sign in through a seeded or admin-created account.
4. Admin can sign in through a seeded account.
5. Patient can choose a doctor.
6. Patient can choose a consultation time.
7. Patient can create a consultation.
8. Doctor sees the consultation.
9. Patient and doctor can exchange messages.
10. Messages update in real time.
11. Patient and doctor can attach files.
12. Admin can manage doctors, users, specialties, consultations, and audit logs.
13. Site works on desktop and mobile.
14. Site can be deployed to Vercel.
15. Public pages have basic SEO.
