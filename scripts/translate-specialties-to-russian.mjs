import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const specialtyTranslations = [
  {
    slug: "general-medicine",
    name: "Терапия",
    description:
      "Первичная помощь и консультации по общим вопросам здоровья.",
  },
  {
    slug: "cardiology",
    name: "Кардиология",
    description:
      "Консультации по вопросам сердца и сердечно-сосудистой системы.",
  },
  {
    slug: "dermatology",
    name: "Дерматология",
    description: "Консультации по вопросам кожи, волос и ногтей.",
  },
  {
    slug: "pediatrics",
    name: "Педиатрия",
    description: "Медицинские консультации для детей и подростков.",
  },
  {
    slug: "neurology",
    name: "Неврология",
    description:
      "Консультации по вопросам нервной системы, головной боли, головокружения и мигрени.",
  },
  {
    slug: "gastroenterology",
    name: "Гастроэнтерология",
    description:
      "Консультации по вопросам пищеварительной системы и симптомов в области живота.",
  },
  {
    slug: "endocrinology",
    name: "Эндокринология",
    description:
      "Консультации по вопросам гормонов, щитовидной железы, диабета и обмена веществ.",
  },
  {
    slug: "orthopedics",
    name: "Ортопедия",
    description:
      "Консультации по вопросам костей, суставов, боли в спине, травм и растяжений.",
  },
  {
    slug: "ent",
    name: "Оториноларингология",
    description:
      "Консультации по вопросам уха, горла, носа, слуха и связанных симптомов.",
  },
  {
    slug: "ophthalmology",
    name: "Офтальмология",
    description:
      "Консультации по вопросам зрения, покраснения и здоровья глаз.",
  },
  {
    slug: "urology",
    name: "Урология",
    description:
      "Консультации по вопросам мочевыделительной системы и урологических симптомов.",
  },
  {
    slug: "gynecology",
    name: "Гинекология",
    description:
      "Консультации по вопросам менструального цикла, беременности и женского здоровья.",
  },
  {
    slug: "allergy-immunology",
    name: "Аллергология и иммунология",
    description: "Консультации по вопросам аллергии и иммунной системы.",
  },
  {
    slug: "psychology",
    name: "Психология",
    description:
      "Консультации по вопросам тревожности, сна, стресса и психологического благополучия.",
  },
  {
    slug: "nutrition",
    name: "Диетология",
    description: "Консультации по вопросам питания, веса и рациона.",
  },
  {
    slug: "phase-10b-other-inactive-mpq2vbwq",
    name: "Дополнительная неактивная тестовая специальность",
    description:
      "Неактивная тестовая специальность для проверки административного управления.",
  },
  {
    slug: "phase-10b-smoke-updated-mpq2vbwq",
    name: "Тестовая специальность этапа 10Б",
    description:
      "Тестовая специальность для безопасной проверки административного интерфейса.",
  },
];

class SafeScriptError extends Error {}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Database configuration is required.");
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const targetSlugs = specialtyTranslations.map((item) => item.slug);
  const targetNames = specialtyTranslations.map((item) => item.name);

  const [currentSpecialties, conflictingNames, doctorLinksBefore] =
    await Promise.all([
      prisma.specialty.findMany({
        where: {
          slug: {
            in: targetSlugs,
          },
        },
        select: {
          description: true,
          name: true,
          slug: true,
        },
      }),
      prisma.specialty.count({
        where: {
          name: {
            in: targetNames,
          },
          slug: {
            notIn: targetSlugs,
          },
        },
      }),
      prisma.doctorProfile.count({
        where: {
          specialtyId: {
            not: null,
          },
        },
      }),
    ]);

  if (conflictingNames > 0) {
    throw new SafeScriptError(
      "Specialty translation stopped because a target display name is already used by another slug.",
    );
  }

  const currentBySlug = new Map(
    currentSpecialties.map((specialty) => [specialty.slug, specialty]),
  );
  const pendingUpdates = specialtyTranslations.filter((translation) => {
    const current = currentBySlug.get(translation.slug);

    return (
      current &&
      (current.name !== translation.name ||
        current.description !== translation.description)
    );
  });

  await prisma.$transaction(
    pendingUpdates.map((translation) =>
      prisma.specialty.update({
        where: {
          slug: translation.slug,
        },
        data: {
          description: translation.description,
          name: translation.name,
        },
        select: {
          id: true,
        },
      }),
    ),
  );

  const doctorLinksAfter = await prisma.doctorProfile.count({
    where: {
      specialtyId: {
        not: null,
      },
    },
  });

  if (doctorLinksAfter !== doctorLinksBefore) {
    throw new SafeScriptError(
      "Specialty translation stopped because the doctor link count changed unexpectedly.",
    );
  }

  console.log(`Specialty mappings: ${specialtyTranslations.length}`);
  console.log(`Specialties matched: ${currentSpecialties.length}`);
  console.log(`Specialties updated: ${pendingUpdates.length}`);
  console.log(
    `Specialties unchanged: ${currentSpecialties.length - pendingUpdates.length}`,
  );
  console.log(
    `Specialties missing from current database: ${
      specialtyTranslations.length - currentSpecialties.length
    }`,
  );
  console.log(`Doctor specialty links preserved: ${doctorLinksAfter}`);
}

main()
  .catch((error) => {
    console.error(
      error instanceof SafeScriptError
        ? error.message
        : "Specialty translation failed. No sensitive error details were printed.",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
