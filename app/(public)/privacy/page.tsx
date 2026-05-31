import { LegalPage } from "@/components/legal/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage
      description="This Privacy Policy explains how the MVP handles account, consultation, chat, and file information."
      sections={[
        {
          title: "Data collected",
          body: "The MVP may collect account information such as email, name, role, account status, registration consent timestamps, and profile details. Patient profiles may include date of birth and gender. Doctor profiles may include title, specialty, bio, education, experience, and availability settings.",
        },
        {
          title: "Consultations, chats, and files",
          body: "The service stores consultation records, schedule information, chat messages, file metadata, and uploaded consultation documents. File bytes are stored in private Supabase Storage, while PostgreSQL stores metadata needed for authorization and display.",
        },
        {
          title: "How data is used",
          body: "Data is used to create accounts, authenticate users, book consultations, show role-specific workspaces, support secure messaging and file downloads, send password reset messages, and maintain operational audit records for selected actions.",
        },
        {
          title: "Email messages",
          body: "The MVP may send transactional email for password recovery. Reset links contain sensitive one-time tokens and should not be shared. Raw reset tokens are not stored by the application.",
        },
        {
          title: "Role-based access",
          body: "Patients can access only their own profiles, consultations, messages, and files. Doctors can access only assigned consultations and related patient information. Admins manage operational records, but they do not access chat or file contents unless a future audited break-glass feature is explicitly implemented.",
        },
        {
          title: "Storage and security basics",
          body: "The application uses server-side authorization checks, custom session cookies, password hashing, PostgreSQL for source-of-truth records, and private storage for uploaded files. Direct public Supabase Storage URLs are not used for consultation attachments.",
        },
        {
          title: "Retention and deletion",
          body: "Retention, deletion, account export, and formal medical-record policies are future production policy items. They are not fully implemented in this MVP phase.",
        },
      ]}
      title="Privacy Policy"
    />
  );
}
