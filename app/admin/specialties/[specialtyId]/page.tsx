import Link from "next/link";
import { notFound } from "next/navigation";

import { SpecialtyForm } from "@/components/admin/specialty-form";
import { prisma } from "@/lib/prisma";

type AdminSpecialtyDetailPageProps = {
  params: Promise<{
    specialtyId: string;
  }>;
  searchParams: Promise<{
    created?: string;
    updated?: string;
  }>;
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getStatusClassName(isActive: boolean) {
  return isActive
    ? "border-teal-200 bg-teal-50 text-teal-700"
    : "border-slate-200 bg-slate-100 text-slate-600";
}

export default async function AdminSpecialtyDetailPage({
  params,
  searchParams,
}: AdminSpecialtyDetailPageProps) {
  const { specialtyId } = await params;
  const { created, updated } = await searchParams;

  const specialty = await prisma.specialty.findUnique({
    where: {
      id: specialtyId,
    },
    include: {
      _count: {
        select: {
          doctors: true,
        },
      },
    },
  });

  if (!specialty) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
        href="/admin/specialties"
      >
        Back to specialties
      </Link>

      {created ? (
        <p className="rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          Specialty created.
        </p>
      ) : null}

      {updated ? (
        <p className="rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          Specialty updated.
        </p>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">
              Specialty details
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
              {specialty.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">{specialty.slug}</p>
          </div>
          <span
            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${getStatusClassName(
              specialty.isActive,
            )}`}
          >
            {specialty.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        {specialty.description ? (
          <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600">
            {specialty.description}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Linked doctors</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {specialty._count.doctors}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Created</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatDateTime(specialty.createdAt)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Updated</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatDateTime(specialty.updatedAt)}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">
          Edit specialty
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Update taxonomy details. Deactivation hides this specialty from new
          doctor assignments and patient filters without unlinking existing
          doctors.
        </p>
        <div className="mt-5">
          <SpecialtyForm
            initialValues={{
              description: specialty.description ?? "",
              isActive: specialty.isActive,
              name: specialty.name,
              slug: specialty.slug,
            }}
            mode="edit"
            specialtyId={specialty.id}
          />
        </div>
      </section>
    </div>
  );
}
