import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const doctorTranslations = [
  ["Development Doctor", "Иванов Алексей Сергеевич", "general-medicine", "Врач общей практики", "Консультирует по общим вопросам здоровья, профилактике, распространённым симптомам и дальнейшему наблюдению.", "Медицинский учебный центр «Медлайн»"],
  ["Dr. Elena Morris", "Смирнова Елена Андреевна", "general-medicine", "Врач семейной медицины", "Помогает с вопросами профилактики, распространёнными симптомами и наблюдением за состоянием здоровья.", "Академия семейной медицины «Нортбридж»"],
  ["Dr. Marcus Hale", "Петров Пётр Петрович", "cardiology", "Врач-кардиолог", "Консультирует по вопросам артериального давления, учащённого сердцебиения и сердечно-сосудистых рисков.", "Кардиологический институт «Лейксайд»"],
  ["Dr. Amina Patel", "Соколова Мария Викторовна", "neurology", "Врач-невролог", "Консультирует по вопросам головной боли, головокружения, мигрени и других неврологических симптомов.", "Неврологический центр «Вестпорт»"],
  ["Dr. Sofia Kim", "Орлова Анна Михайловна", "dermatology", "Врач-дерматолог", "Консультирует по вопросам сыпи, акне, зуда, выпадения волос и изменений родинок.", "Клинический центр дерматологии «Ривер-Сити»"],
  ["Dr. Noah Reed", "Кузнецов Дмитрий Олегович", "pediatrics", "Врач-педиатр", "Консультирует по вопросам температуры и кашля у детей, вакцинации и дальнейшего педиатрического наблюдения.", "Учебный центр детской больницы «Гринфилд»"],
  ["Dr. Lucia Fernandez", "Васильева Ольга Романовна", "gastroenterology", "Врач-гастроэнтеролог", "Помогает с вопросами пищеварения, включая боль в животе, тошноту, диарею, запор и изжогу.", "Гастроэнтерологический центр «Харбор»"],
  ["Dr. Owen Clark", "Морозов Сергей Николаевич", "endocrinology", "Врач-эндокринолог", "Консультирует по вопросам гормонального здоровья, щитовидной железы, диабета, обмена веществ и изменения веса.", "Институт эндокринологии «Саммит»"],
  ["Dr. Maya Stone", "Волкова Наталья Игоревна", "orthopedics", "Врач-ортопед", "Консультирует по вопросам боли в спине, суставах и мышцах, а также травм и растяжений.", "Центральная академия ортопедии"],
  ["Dr. Ethan Brooks", "Фёдоров Андрей Павлович", "ent", "Врач-оториноларинголог", "Консультирует по вопросам боли в ухе, снижения слуха, боли в горле и других ЛОР-симптомов.", "Учебный центр оториноларингологии «Истсайд»"],
  ["Dr. Nadia Hassan", "Белова Ирина Сергеевна", "ophthalmology", "Врач-офтальмолог", "Консультирует по вопросам покраснения глаз, нечёткого зрения и дальнейшего обследования зрения.", "Офтальмологический институт «Брайтвью»"],
  ["Dr. Julian Price", "Никитин Артём Александрович", "urology", "Врач-уролог", "Консультирует по вопросам боли и дискомфорта при мочеиспускании, частого мочеиспускания и других урологических симптомов.", "Центр подготовки по урологии «Стоунбридж»"],
  ["Dr. Ines Romero", "Комарова Екатерина Дмитриевна", "gynecology", "Врач-гинеколог", "Консультирует по вопросам женского здоровья, профилактики и планирования дальнейшего обследования.", "Центр женского здоровья «Роузвуд»"],
  ["Dr. Aaron Lee", "Захаров Михаил Евгеньевич", "allergy-immunology", "Врач аллерголог-иммунолог", "Консультирует по вопросам аллергии, иммунных реакций, сезонных симптомов и подбора дальнейшего обследования.", "Центр аллергологии и иммунологии «Норт-Кост»"],
  ["Dr. Hannah Nguyen", "Громова Татьяна Владимировна", "psychology", "Клинический психолог", "Помогает с тревожностью, стрессом, эмоциональным состоянием, нарушениями сна и вопросами психологической поддержки.", "Институт клинической психологии «Сидар»"],
  ["Dr. Peter Walsh", "Данилин Даниил Данилович", "nutrition", "Врач-диетолог", "Помогает с вопросами питания, изменения веса, планирования рациона и образа жизни.", "Центр диетологии «Эвергрин»"],
].map(([sourceName, name, specialtySlug, title, bio, education]) => ({
  sourceName,
  name,
  specialtySlug,
  title,
  bio,
  education,
}));

class SafeScriptError extends Error {}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Database configuration is required.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const doctorSelect = {
  id: true,
  specialtyId: true,
  title: true,
  bio: true,
  education: true,
  experienceYears: true,
  avatarUrl: true,
  photoStoragePath: true,
  isAvailable: true,
  specialty: { select: { slug: true } },
  user: {
    select: {
      id: true,
      name: true,
      twoFactorSecret: { select: { id: true } },
      _count: {
        select: {
          sessions: true,
          accountAccessTokens: true,
          twoFactorRecoveryCodes: true,
          twoFactorChallenges: true,
        },
      },
    },
  },
  _count: {
    select: {
      scheduleSlots: true,
      consultations: true,
      doctorReviews: true,
    },
  },
};

function createInvariantSnapshot(doctor) {
  return {
    doctorProfileId: doctor.id,
    userId: doctor.user.id,
    specialtyId: doctor.specialtyId,
    specialtySlug: doctor.specialty?.slug ?? null,
    experienceYears: doctor.experienceYears,
    isAvailable: doctor.isAvailable,
    avatarUrl: doctor.avatarUrl,
    photoStoragePath: doctor.photoStoragePath,
    scheduleSlots: doctor._count.scheduleSlots,
    consultations: doctor._count.consultations,
    doctorReviews: doctor._count.doctorReviews,
    sessions: doctor.user._count.sessions,
    accountAccessTokens: doctor.user._count.accountAccessTokens,
    twoFactorRecoveryCodes: doctor.user._count.twoFactorRecoveryCodes,
    twoFactorChallenges: doctor.user._count.twoFactorChallenges,
    hasTwoFactorSecret: doctor.user.twoFactorSecret !== null,
  };
}

async function main() {
  const candidates = await prisma.doctorProfile.findMany({
    where: {
      OR: doctorTranslations.map((translation) => ({
        specialty: { slug: translation.specialtySlug },
        user: {
          role: "DOCTOR",
          name: { in: [translation.sourceName, translation.name] },
        },
      })),
    },
    select: doctorSelect,
  });

  const matches = doctorTranslations.map((translation) => {
    const matchingDoctors = candidates.filter(
      (doctor) =>
        doctor.specialty?.slug === translation.specialtySlug &&
        (doctor.user.name === translation.sourceName ||
          doctor.user.name === translation.name),
    );

    if (matchingDoctors.length > 1) {
      throw new SafeScriptError(
        "Doctor translation stopped because a demo mapping matched more than one profile.",
      );
    }

    return { translation, doctor: matchingDoctors[0] ?? null };
  });
  const matchedDoctors = matches.filter((match) => match.doctor !== null);
  const matchedIds = matchedDoctors.map((match) => match.doctor.id);

  if (new Set(matchedIds).size !== matchedIds.length) {
    throw new SafeScriptError(
      "Doctor translation stopped because one profile matched multiple demo mappings.",
    );
  }

  const invariantsBefore = new Map(
    matchedDoctors.map(({ doctor }) => [
      doctor.id,
      createInvariantSnapshot(doctor),
    ]),
  );
  const pendingUpdates = matchedDoctors.filter(({ doctor, translation }) =>
    doctor.user.name !== translation.name ||
    doctor.title !== translation.title ||
    doctor.bio !== translation.bio ||
    doctor.education !== translation.education
  );

  await prisma.$transaction(
    async (transaction) => {
      for (const { doctor, translation } of pendingUpdates) {
        await transaction.user.update({
        where: { id: doctor.user.id },
        data: {
          name: translation.name,
          doctorProfile: {
            update: {
              title: translation.title,
              bio: translation.bio,
              education: translation.education,
            },
          },
        },
        select: { id: true },
        });
      }
    },
    {
      maxWait: 10_000,
      timeout: 60_000,
    },
  );

  const doctorsAfter = matchedIds.length
    ? await prisma.doctorProfile.findMany({
        where: { id: { in: matchedIds } },
        select: doctorSelect,
      })
    : [];

  for (const doctor of doctorsAfter) {
    const before = invariantsBefore.get(doctor.id);
    const after = createInvariantSnapshot(doctor);

    if (!before || JSON.stringify(before) !== JSON.stringify(after)) {
      throw new SafeScriptError(
        "Doctor translation stopped because protected profile relationships or fields changed unexpectedly.",
      );
    }
  }

  const translatedDoctors = doctorsAfter.filter((doctor) => {
    const translation = doctorTranslations.find(
      (item) =>
        item.specialtySlug === doctor.specialty?.slug &&
        item.name === doctor.user.name,
    );

    return (
      translation &&
      doctor.title === translation.title &&
      doctor.bio === translation.bio &&
      doctor.education === translation.education
    );
  });

  if (translatedDoctors.length !== matchedDoctors.length) {
    throw new SafeScriptError(
      "Doctor translation verification failed after the transaction.",
    );
  }

  console.log(`Doctor demo mappings: ${doctorTranslations.length}`);
  console.log(`Doctor demo profiles matched: ${matchedDoctors.length}`);
  console.log(`Doctor demo profiles updated: ${pendingUpdates.length}`);
  console.log(
    `Doctor demo profiles unchanged: ${matchedDoctors.length - pendingUpdates.length}`,
  );
  console.log(
    `Doctor demo profiles missing: ${doctorTranslations.length - matchedDoctors.length}`,
  );
  console.log(`Doctor demo profiles verified: ${translatedDoctors.length}`);
  console.log("Protected doctor relationships and fields preserved: yes");
}

main()
  .catch((error) => {
    const safeErrorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? ` (${error.code})`
        : "";

    console.error(
      error instanceof SafeScriptError
        ? error.message
        : `Doctor demo translation failed${safeErrorCode}. No sensitive error details were printed.`,
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
