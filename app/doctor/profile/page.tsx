import { DoctorProfileForm } from "@/components/doctor/doctor-profile-form";
import { ProfileImageUploadForm } from "@/components/profile/profile-image-upload-form";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma";

function getInitials(name: string | null, email: string) {
  const source = name?.trim() || email;
  return source.slice(0, 2).toUpperCase();
}

function FieldValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-700">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-600">{value}</dd>
    </div>
  );
}

function formatReviewDate(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
  }).format(value);
}

function formatReviewSummary(averageRating: number | null, reviewCount: number) {
  if (reviewCount === 0 || averageRating === null) {
    return "Отзывов пока нет";
  }

  return `${averageRating.toLocaleString("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} из 5 (${reviewCount} отзывов)`;
}

export default async function DoctorProfilePage() {
  const user = await requireWorkspaceRole("DOCTOR");

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      bio: true,
      education: true,
      experienceYears: true,
      id: true,
      isAvailable: true,
      photoStoragePath: true,
      specialty: {
        select: {
          name: true,
        },
      },
      title: true,
      doctorReviews: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          comment: true,
          createdAt: true,
          id: true,
          rating: true,
        },
        take: 5,
      },
    },
  });

  const reviewAggregate = doctorProfile
    ? await prisma.doctorReview.aggregate({
        where: {
          doctorProfileId: doctorProfile.id,
        },
        _avg: {
          rating: true,
        },
        _count: {
          _all: true,
        },
      })
    : null;

  const reviewAverageRating = reviewAggregate?._avg.rating ?? null;
  const reviewCount = reviewAggregate?._count._all ?? 0;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">Профиль врача</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Настройки профиля
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Проверьте данные аккаунта и публичного профиля. Настройки аккаунта,
          специальность, стаж и доступность для записи управляются
          администратором и доступны только для просмотра.
        </p>
      </section>

      {!doctorProfile ? (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">
            Требуется профиль врача
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Администратор должен настроить профиль врача, прежде чем вы сможете
            изменять его данные.
          </p>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-700">Аккаунт</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">
                    Данные только для просмотра
                  </h2>
                </div>
                <span className="inline-flex w-fit rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                  {user.isActive ? "Активен" : "Неактивен"}
                </span>
              </div>

              <dl className="mt-5 grid gap-4">
                <FieldValue label="Email" value={user.email} />
                <FieldValue label="Роль" value="Врач" />
                <FieldValue label="Имя" value={user.name ?? "Не указано"} />
                <FieldValue
                  label="Специальность"
                  value={doctorProfile.specialty?.name ?? "Не назначено"}
                />
                <FieldValue
                  label="Стаж"
                  value={
                    doctorProfile.experienceYears === null
                      ? "Не указано"
                      : `${doctorProfile.experienceYears} лет`
                  }
                />
                <FieldValue
                  label="Статус аккаунта"
                  value={user.isActive ? "Активен" : "Неактивен"}
                />
                <FieldValue
                  label="Доступность для записи"
                  value={
                    doctorProfile.isAvailable
                      ? "Доступен для записи"
                      : "Недоступен для записи"
                  }
                />
              </dl>
            </div>

            <ProfileImageUploadForm
              description="Эта профессиональная фотография отображается пациентам в каталоге и на странице вашего профиля."
              endpoint="/api/doctor/photo"
              imageAlt="Фотография профиля врача"
              imageSrc={
                doctorProfile.photoStoragePath
                  ? `/api/profile-images/doctor/${doctorProfile.id}`
                  : undefined
              }
              initials={getInitials(user.name, user.email)}
              title="Профессиональная фотография"
            />

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-teal-700">
                Отзывы пациентов
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                {formatReviewSummary(reviewAverageRating, reviewCount)}
              </h2>
              {doctorProfile.doctorReviews.length > 0 ? (
                <ul className="mt-5 divide-y divide-slate-100">
                  {doctorProfile.doctorReviews.map((review) => (
                    <li className="py-3" key={review.id}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-semibold text-slate-950">
                          Подтверждённый пациент
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatReviewDate(review.createdAt)}
                        </p>
                      </div>
                      <p className="mt-2 text-sm font-medium text-teal-800">
                        {review.rating.toLocaleString("ru-RU", {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}{" "}
                        из 5
                      </p>
                      {review.comment ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {review.comment}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Отзывов пока нет.
                </p>
              )}
            </div>
          </div>

          <DoctorProfileForm
            initialValues={{
              bio: doctorProfile.bio ?? "",
              education: doctorProfile.education ?? "",
              title: doctorProfile.title ?? "",
            }}
          />
        </section>
      )}
    </div>
  );
}
