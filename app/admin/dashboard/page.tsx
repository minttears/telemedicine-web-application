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
  await requireRole("ADMIN");

  const [
    totalUsers,
    patientProfiles,
    doctorProfiles,
    availableDoctors,
    specialties,
    consultations,
    activeConsultations,
    auditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.patientProfile.count(),
    prisma.doctorProfile.count(),
    prisma.doctorProfile.count({ where: { isAvailable: true } }),
    prisma.specialty.count(),
    prisma.consultation.count(),
    prisma.consultation.count({ where: { status: "IN_PROGRESS" } }),
    prisma.auditLog.count(),
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">
          Панель администратора
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Обзор работы системы
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Просматривайте сводное состояние системы. Дополнительные инструменты
          управления и подробные операционные экраны будут добавлены позднее.
        </p>
      </section>

      <section
        aria-label="Сводка для администратора"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <StatCard
          detail="Все активные и неактивные учётные записи."
          label="Пользователи"
          value={totalUsers}
        />
        <StatCard
          detail="Профили пациентов."
          label="Пациенты"
          value={patientProfiles}
        />
        <StatCard
          detail={`${availableDoctors} доступны для записи пациентов.`}
          label="Врачи"
          value={doctorProfiles}
        />
        <StatCard
          detail="Настроенные медицинские специальности."
          label="Специальности"
          value={specialties}
        />
        <StatCard
          detail={`${activeConsultations} сейчас отмечены как текущие.`}
          label="Консультации"
          value={consultations}
        />
        <StatCard
          detail="Зарегистрированные события аудита. Содержимое здесь не показывается."
          label="Журнал аудита"
          value={auditLogs}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-950">
          Разделы управления
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AdminLink
            description="Инструменты управления пользователями будут добавлены позднее."
            href="/admin/users"
            label="Пользователи"
          />
          <AdminLink
            description="Создавайте учётные записи врачей и управляйте видимостью их профилей."
            href="/admin/doctors"
            label="Врачи"
          />
          <AdminLink
            description="Создавайте специальности и управляйте их видимостью в фильтрах для пациентов."
            href="/admin/specialties"
            label="Специальности"
          />
          <AdminLink
            description="Экраны управления сведениями о консультациях будут добавлены позднее."
            href="/admin/consultations"
            label="Консультации"
          />
          <AdminLink
            description="Подробный просмотр журнала аудита будет добавлен позднее."
            href="/admin/audit-log"
            label="Журнал аудита"
          />
          <AdminLink
            description="Дополнительные настройки системы будут добавлены позднее."
            href="/admin/settings"
            label="Настройки"
          />
        </div>
      </section>
    </div>
  );
}
