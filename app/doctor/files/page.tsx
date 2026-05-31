import { FileArchiveList } from "@/components/files/file-archive-list";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

function getPatientLabel(name: string | null) {
  return name ?? "Patient profile";
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
        <p className="text-sm font-medium text-teal-700">Files</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Assigned consultation files
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Files are uploaded inside consultation chats. This page collects them
          for quick access across your assigned consultations.
        </p>
        <p className="mt-4 text-sm font-medium text-slate-700">
          {files.length} {files.length === 1 ? "file" : "files"} available
        </p>
      </section>

      <FileArchiveList
        emptyActionHref="/doctor/consultations"
        emptyActionLabel="View consultations"
        emptyBody="Files shared during assigned consultations will appear here. You can also manage your schedule so patients can reserve future times."
        emptyTitle="No files shared yet"
        files={files}
        personHeader="Patient"
      />
    </div>
  );
}
