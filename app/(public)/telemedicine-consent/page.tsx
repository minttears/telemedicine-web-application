import { LegalPage } from "@/components/legal/legal-page";

export default function TelemedicineConsentPage() {
  return (
    <LegalPage
      description="This Telemedicine Consent explains important limitations of remote consultation workflows in the MVP."
      sections={[
        {
          title: "Remote consultation limitations",
          body: "Telemedicine can help patients and doctors communicate remotely, but it has limitations compared with in-person care. A doctor may have limited ability to examine you, verify information, or assess conditions that require physical evaluation.",
        },
        {
          title: "No emergency care",
          body: "Do not use this service for emergencies, urgent symptoms, or situations that may require immediate in-person care. Contact emergency services or seek local medical help if you may be experiencing a medical emergency.",
        },
        {
          title: "Accurate information",
          body: "You are responsible for providing accurate account, profile, symptom, history, message, and file information. Incomplete or inaccurate information may affect the usefulness of a remote consultation.",
        },
        {
          title: "Recommendations and summaries",
          body: "Doctor recommendations and consultation summaries in this MVP are informational workflow outputs. They are not a full production medical record, diagnosis workflow, prescription workflow, or substitute for emergency or in-person care where needed.",
        },
        {
          title: "Prescriptions and legal medical workflows",
          body: "Prescription handling, legal medical documentation workflows, structured diagnosis fields, and production clinical compliance processes are not fully implemented in this phase.",
        },
        {
          title: "Video calls deferred",
          body: "Video calls are not implemented in the current MVP. Consultations currently rely on scheduling, text chat, file sharing, and doctor summaries.",
        },
        {
          title: "File sharing consent",
          body: "By uploading documents or images inside consultation chats, you consent to sharing those files with the assigned doctor for that consultation. File sharing has inherent privacy and security risks, and you should upload only documents relevant to the consultation.",
        },
      ]}
      title="Telemedicine Consent"
    />
  );
}
