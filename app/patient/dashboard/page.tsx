import Link from "next/link";

import { ProfileImage } from "@/components/profile/profile-image";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

function getInitials(name: string | null, email: string) {
  const source = name?.trim() || email;
  return source.slice(0, 2).toUpperCase();
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

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

function ActionLink({
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

export default async function PatientDashboardPage() {
  const user = await requireRole("PATIENT");
  const now = new Date();

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: user.id },
  });

  const [
    upcomingConsultations,
    activeConsultations,
    totalConsultations,
    nextConsultation,
  ] = patientProfile
    ? await Promise.all([
          prisma.consultation.count({
            where: {
              patientId: patientProfile.id,
              scheduledAt: { gte: now },
              status: { in: ["REQUESTED", "SCHEDULED"] },
            },
          }),
          prisma.consultation.count({
            where: {
              patientId: patientProfile.id,
              status: "IN_PROGRESS",
            },
          }),
          prisma.consultation.count({
            where: {
              patientId: patientProfile.id,
            },
          }),
          prisma.consultation.findFirst({
            where: {
              patientId: patientProfile.id,
              scheduledAt: { gte: now },
              status: { in: ["REQUESTED", "SCHEDULED", "IN_PROGRESS"] },
            },
            orderBy: { scheduledAt: "asc" },
            select: {
              id: true,
              scheduledAt: true,
              status: true,
              doctor: {
                select: {
                  specialty: {
                    select: {
                      name: true,
                    },
                  },
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          }),
        ])
    : [0, 0, 0, null];

  const profileFields = [
    Boolean(user.name),
    Boolean(user.email),
    Boolean(patientProfile?.dateOfBirth),
    Boolean(patientProfile?.gender),
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <ProfileImage
            alt="Аватар пациента"
            className="h-20 w-20 shrink-0"
            initials={getInitials(user.name, user.email)}
            src={
              user.avatarStoragePath
                ? `/api/profile-images/patient/${user.id}`
                : undefined
            }
          />
          <div>
            <p className="text-sm font-medium text-teal-700">Кабинет пациента</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
              Добро пожаловать{user.name ? `, ${user.name}` : ""}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Управляйте консультациями, сообщениями, файлами, записями к
              врачам и историей обращений в защищённом кабинете.
            </p>
          </div>
        </div>
      </section>

      <section
        aria-label="Обзор кабинета пациента"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          detail="Запланированные или ожидающие консультации на будущее время."
          label="Предстоящие"
          value={upcomingConsultations}
        />
        <StatCard
          detail="Консультации, которые сейчас проходят."
          label="Активные"
          value={activeConsultations}
        />
        <StatCard
          detail="Все консультации, связанные с вашим профилем пациента."
          label="Всего консультаций"
          value={totalConsultations}
        />
        <StatCard
          detail="Рассчитывается по имени, email, дате рождения и полу."
          label="Заполнение профиля"
          value={`${profileCompletion}%`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Ближайшая консультация
          </h2>
          {nextConsultation ? (
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p className="font-medium text-slate-900">
                {formatDateTime(nextConsultation.scheduledAt)}
              </p>
              <p>
                {nextConsultation.doctor.user.name ?? "Профиль врача"}
                {nextConsultation.doctor.specialty?.name
                  ? `, ${nextConsultation.doctor.specialty.name}`
                  : ""}
              </p>
              <Link
                className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-600 hover:text-teal-700"
                href={`/patient/consultations/${nextConsultation.id}`}
              >
                Открыть консультацию
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              У вас нет предстоящих консультаций. Выберите врача и доступное
              время, чтобы записаться на консультацию.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Следующие действия
          </h2>
          <div className="mt-4 grid gap-3">
            <ActionLink
              description="Проверьте и заполните основные данные пациента."
              href="/patient/profile"
              label="Заполнить профиль"
            />
            <ActionLink
              description="Найдите врача по имени или специальности и выберите доступное время."
              href="/patient/doctors"
              label="Найти врача"
            />
            <ActionLink
              description="Просмотрите предстоящие и завершённые консультации."
              href="/patient/consultations"
              label="Открыть консультации"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
