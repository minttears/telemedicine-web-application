import { LegalPage } from "@/components/legal/legal-page";

export default function TermsPage() {
  return (
    <LegalPage
      description="These Terms of Use describe the basic MVP rules for using the telemedicine web application."
      sections={[
        {
          title: "Use of the service",
          body: "The service is an MVP for remote consultation workflows, including patient registration, doctor discovery, booking, messaging, files, and consultation summaries. You agree to use it only for lawful, appropriate healthcare communication and product validation purposes.",
        },
        {
          title: "Account responsibility",
          body: "You are responsible for keeping your account credentials secure and for providing accurate information when registering, booking consultations, sending messages, and sharing documents. Notify the operator if you suspect unauthorized account use.",
        },
        {
          title: "Registration and managed accounts",
          body: "Public registration is available for patients only. Doctor and administrator accounts are created and managed internally by authorized administrators. Public users cannot create doctor or administrator accounts through the registration form.",
        },
        {
          title: "Prohibited misuse",
          body: "Do not attempt to access another user's account, consultations, messages, files, or administrative functions. Do not upload malicious files, interfere with the service, scrape private data, or use the MVP for abusive, fraudulent, or unlawful activity.",
        },
        {
          title: "No emergency use",
          body: "This service is not for emergencies or urgent medical situations. If you may be experiencing a medical emergency, contact local emergency services or seek immediate in-person care.",
        },
        {
          title: "Availability",
          body: "The MVP may be unavailable, incomplete, or changed without notice during development and testing. Features such as video calls, prescriptions, deletion workflows, and production retention policies are not fully implemented in this phase.",
        },
        {
          title: "MVP limitation",
          body: "The service is provided as an MVP demonstration without production legal, clinical, compliance, or availability guarantees. To the maximum extent allowed by law, liability is limited for testing and demonstration use.",
        },
      ]}
      title="Terms of Use"
    />
  );
}
