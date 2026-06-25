import { FileArchiveList } from "@/components/files/file-archive-list";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

function getPatientLabel(name: string | null) {
  return name ?? "Профиль пациента";
}

export default async function DoctorFilesPage() {
  const user = await requireRole("DOCTOR");

  const attachments = await prisma.attachment.findMany({
    where: {
      consultation: {
        doctor: {
          userId: user.id,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      consultation: {
        select: {
          id: true,
          patient: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          scheduledAt: true,
          status: true,
        },
      },
      createdAt: true,
      fileName: true,
      fileSize: true,
      fileType: true,
      id: true,
      uploadedBy: {
        select: {
          name: true,
          role: true,
        },
      },
    },
  });

  const files = attachments.map((attachment) => ({
    consultation: {
      href: `/doctor/consultations/${attachment.consultation.id}`,
      personLabel: getPatientLabel(attachment.consultation.patient.user.name),
      scheduledAt: attachment.consultation.scheduledAt,
      status: attachment.consultation.status,
    },
    createdAt: attachment.createdAt,
    fileName: attachment.fileName,
    fileSize: attachment.fileSize,
    fileType: attachment.fileType,
    id: attachment.id,
    uploadedBy: attachment.uploadedBy,
  }));

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">Файлы</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Файлы назначенных консультаций
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Файлы отправляются в чатах консультаций. Здесь они собраны для
          быстрого доступа по всем назначенным консультациям.
        </p>
        <p className="mt-4 text-sm font-medium text-slate-700">
          Доступно файлов: {files.length}
        </p>
      </section>

      <FileArchiveList
        emptyActionHref="/doctor/consultations"
        emptyActionLabel="Открыть консультации"
        emptyBody="Файлы из назначенных консультаций появятся здесь. Добавляйте доступное время в расписание, чтобы пациенты могли записываться."
        emptyTitle="Файлов пока нет"
        files={files}
        personHeader="Пациент"
      />
    </div>
  );
}
