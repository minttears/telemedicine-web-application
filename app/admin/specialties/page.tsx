import Link from "next/link";

import { prisma } from "@/lib/prisma";

function getStatusClassName(isActive: boolean) {
  return isActive
    ? "border-teal-200 bg-teal-50 text-teal-700"
    : "border-slate-200 bg-slate-100 text-slate-600";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
  }).format(value);
}

export default async function AdminSpecialtiesPage() {
  const specialties = await prisma.specialty.findMany({
    include: {
      _count: {
        select: {
          doctors: true,
        },
      },
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  const activeCount = specialties.filter((specialty) => specialty.isActive).length;
  const inactiveCount = specialties.length - activeCount;
  const assignedDoctorCount = specialties.reduce(
    (total, specialty) => total + specialty._count.doctors,
    0,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">
              Управление специальностями
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
              Медицинские специальности
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Управляйте списком специальностей для профилей врачей и фильтров
              каталога. Деактивация скрывает специальность из новых назначений
              и фильтров, не удаляя существующие записи.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800"
            href="/admin/specialties/new"
          >
            Добавить специальность
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Всего</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {specialties.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Активные</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {activeCount}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Неактивные</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {inactiveCount}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Назначения врачам
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {assignedDoctorCount}
          </p>
        </div>
      </section>

      {specialties.length > 0 ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Специальность</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">Статус</th>
                  <th className="px-4 py-3 font-semibold">Врачи</th>
                  <th className="px-4 py-3 font-semibold">Обновлено</th>
                  <th className="px-4 py-3 font-semibold">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {specialties.map((specialty) => (
                  <tr key={specialty.id}>
                    <td className="px-4 py-4 align-top">
                      <p className="font-medium text-slate-950">
                        {specialty.name}
                      </p>
                      {specialty.description ? (
                        <p className="mt-1 max-w-md text-slate-600">
                          {specialty.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 align-top text-slate-700">
                      {specialty.slug}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClassName(
                          specialty.isActive,
                        )}`}
                      >
                        {specialty.isActive ? "Активна" : "Неактивна"}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-700">
                      {specialty._count.doctors}
                    </td>
                    <td className="px-4 py-4 align-top text-slate-600">
                      {formatDate(specialty.updatedAt)}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <Link
                        className="font-medium text-teal-700 hover:text-teal-800"
                        href={`/admin/specialties/${specialty.id}`}
                      >
                        Подробнее
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">
            Специальности ещё не добавлены
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Добавьте первую специальность перед созданием профилей врачей.
          </p>
          <Link
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800"
            href="/admin/specialties/new"
          >
            Добавить специальность
          </Link>
        </section>
      )}
    </div>
  );
}
