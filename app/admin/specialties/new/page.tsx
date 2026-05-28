import Link from "next/link";

import { SpecialtyForm } from "@/components/admin/specialty-form";

export default function AdminNewSpecialtyPage() {
  return (
    <div className="space-y-6">
      <Link
        className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
        href="/admin/specialties"
      >
        Back to specialties
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">New specialty</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Create a medical specialty
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Specialties are used for doctor assignments and patient directory
          filters. Active specialties can be assigned to doctors.
        </p>
      </section>

      <SpecialtyForm mode="create" />
    </div>
  );
}
