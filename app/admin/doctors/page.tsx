import Link from "next/link";

import { ProfileImage } from "@/components/profile/profile-image";
import { prisma } from "@/lib/prisma";

function getStatusClassName(isEnabled: boolean) {
  return isEnabled
    ? "border-teal-200 bg-teal-50 text-teal-700"
    : "border-slate-200 bg-slate-100 text-slate-600";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
  }).format(value);
}

function getInitials(name: string | null) {
  return (name ?? "DR").slice(0, 2).toUpperCase();
}

export default async function AdminDoctorsPage() {
  const doctors = await prisma.doctorProfile.findMany({
    include: {
      specialty: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          email: true,
          isActive: true,
          name: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  const activeCount = doctors.filter((doctor) => doctor.user.isActive).length;
  const bookableCount = doctors.filter(
    (doctor) => doctor.user.isActive && doctor.isAvailable,
  ).length;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">
              Управление врачами
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
              Учётные записи врачей
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Создавайте учётные записи врачей, обновляйте сведения профиля и
              управляйте доступом к аккаунту отдельно от доступности для записи.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800"
            href="/admin/doctors/new"
          >
            Добавить врача
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Всего врачей</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {doctors.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Активные учётные записи
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {activeCount}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Доступны для записи
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {bookableCount}
          </p>
        </div>
      </section>

      {doctors.length > 0 ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Врач</th>
                  <th className="px-4 py-3 font-semibold">Специальность</th>
                  <th className="px-4 py-3 font-semibold">Статус</th>
                  <th className="px-4 py-3 font-semibold">Запись</th>
                  <th className="px-4 py-3 font-semibold">Обновлено</th>
                  <th className="px-4 py-3 font-semibold">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <ProfileImage
                          alt={`Фото врача ${doctor.user.name ?? ""}`.trim()}
                          className="h-12 w-12 shrink-0"
                          initials={getInitials(doctor.user.name)}
                          src={
                            doctor.photoStoragePath
                              ? `/api/profile-images/doctor/${doctor.id}`
                              : undefined
                          }
                        />
                        <div>
                          <p className="font-medium text-slate-950">
                            {doctor.user.name ?? "Профиль врача"}
                          </p>
                          <p className="mt-1 text-slate-600">{doctor.user.email}</p>
                          {doctor.title ? (
                            <p className="mt-1 text-slate-500">{doctor.title}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-700">
                      {doctor.specialty?.name ?? "Не назначено"}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClassName(
                          doctor.user.isActive,
                        )}`}
                      >
                        {doctor.user.isActive ? "Активен" : "Неактивен"}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClassName(
                          doctor.isAvailable,
                        )}`}
                      >
                        {doctor.isAvailable ? "Доступен" : "Недоступен"}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-600">
                      {formatDate(doctor.updatedAt)}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <Link
                        className="font-medium text-teal-700 hover:text-teal-800"
                        href={`/admin/doctors/${doctor.id}`}
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
            Врачи ещё не добавлены
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Добавьте первого врача и назначьте активную специальность, чтобы
            пациенты могли найти врача и записаться на консультацию.
          </p>
          <Link
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800"
            href="/admin/doctors/new"
          >
            Добавить врача
          </Link>
        </section>
      )}
    </div>
  );
}
