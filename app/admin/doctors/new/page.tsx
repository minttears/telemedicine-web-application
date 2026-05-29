import Link from "next/link";

import { DoctorForm } from "@/components/admin/doctor-form";
import { prisma } from "@/lib/prisma";

export default async function AdminNewDoctorPage() {
  const specialties = await prisma.specialty.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
        href="/admin/doctors"
      >
        Back to doctors
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">New doctor</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Create a doctor account
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Enter account and profile details. Invite link setup is recommended;
          temporary passwords remain available as a fallback.
        </p>
      </section>

      <DoctorForm mode="create" specialties={specialties} />
    </div>
  );
}
