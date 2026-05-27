import Link from "next/link";

import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

function AdminLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-600"
      href={href}
    >
      <span className="text-base font-semibold text-slate-950">{label}</span>
      <span className="mt-2 block text-sm leading-6 text-slate-600">
        {description}
      </span>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const user = await requireRole("ADMIN");

  const [
    totalUsers,
    patientProfiles,
    doctorProfiles,
    specialties,
    consultations,
    auditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.patientProfile.count(),
    prisma.doctorProfile.count(),
    prisma.specialty.count(),
    prisma.consultation.count(),
    prisma.auditLog.count(),
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">Admin dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Operational overview{user.name ? ` for ${user.name}` : ""}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Review aggregate system status. Management actions and detailed
          operational screens will be connected in later phases.
        </p>
      </section>

      <section
        aria-label="Admin overview"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <StatCard
          detail="All active and inactive user accounts."
          label="Users"
          value={totalUsers}
        />
        <StatCard
          detail="Patient profile records."
          label="Patients"
          value={patientProfiles}
        />
        <StatCard
          detail="Doctor profile records."
          label="Doctors"
          value={doctorProfiles}
        />
        <StatCard
          detail="Configured specialty records."
          label="Specialties"
          value={specialties}
        />
        <StatCard
          detail="Consultation records across all statuses."
          label="Consultations"
          value={consultations}
        />
        <StatCard
          detail="Audit events recorded. Contents are not shown here."
          label="Audit logs"
          value={auditLogs}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-950">
          Management areas
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AdminLink
            description="User management screens will be implemented later."
            href="/admin/users"
            label="Users"
          />
          <AdminLink
            description="Doctor creation and editing will be implemented later."
            href="/admin/doctors"
            label="Doctors"
          />
          <AdminLink
            description="Specialty management will be implemented later."
            href="/admin/specialties"
            label="Specialties"
          />
          <AdminLink
            description="Consultation metadata screens will be implemented later."
            href="/admin/consultations"
            label="Consultations"
          />
          <AdminLink
            description="Audit log details will be implemented later."
            href="/admin/audit-log"
            label="Audit Log"
          />
          <AdminLink
            description="System settings will be implemented later."
            href="/admin/settings"
            label="Settings"
          />
        </div>
      </section>
    </div>
  );
}
