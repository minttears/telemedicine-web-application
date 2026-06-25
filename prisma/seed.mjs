import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const seedPasswords = {
  admin: "DevOnly_Admin_ChangeMe_123!",
  doctor: "DevOnly_Doctor_ChangeMe_123!",
  patient: "DevOnly_Patient_ChangeMe_123!",
};

const users = [
  {
    email: "admin@example.local",
    password: seedPasswords.admin,
    role: "ADMIN",
    name: "Development Admin",
  },
  {
    email: "doctor@example.local",
    password: seedPasswords.doctor,
    role: "DOCTOR",
    name: "Development Doctor",
  },
  {
    email: "patient@example.local",
    password: seedPasswords.patient,
    role: "PATIENT",
    name: "Development Patient",
  },
];

const specialties = [
  {
    name: "Общая медицина",
    slug: "general-medicine",
    description: "Первичная помощь и общие медицинские консультации.",
  },
  {
    name: "Кардиология",
    slug: "cardiology",
    description: "Консультации по вопросам сердца и сердечно-сосудистой системы.",
  },
  {
    name: "Дерматология",
    slug: "dermatology",
    description: "Консультации по вопросам кожи, волос и ногтей.",
  },
  {
    name: "Педиатрия",
    slug: "pediatrics",
    description: "Медицинские консультации для детей и подростков.",
  },
  {
    name: "Неврология",
    slug: "neurology",
    description: "Консультации по вопросам нервной системы, головной боли, головокружения и мигрени.",
  },
  {
    name: "Гастроэнтерология",
    slug: "gastroenterology",
    description: "Консультации по вопросам пищеварительной системы и симптомов в области живота.",
  },
  {
    name: "Эндокринология",
    slug: "endocrinology",
    description: "Консультации по вопросам гормонов, щитовидной железы, диабета и обмена веществ.",
  },
  {
    name: "Ортопедия",
    slug: "orthopedics",
    description: "Консультации по вопросам костей, суставов, боли в спине, травм и растяжений.",
  },
  {
    name: "Оториноларингология",
    slug: "ent",
    description: "Консультации по вопросам уха, горла, носа, слуха и связанных симптомов.",
  },
  {
    name: "Офтальмология",
    slug: "ophthalmology",
    description: "Консультации по вопросам зрения, покраснения и здоровья глаз.",
  },
  {
    name: "Урология",
    slug: "urology",
    description: "Консультации по вопросам мочевыделительной системы и урологических симптомов.",
  },
  {
    name: "Гинекология",
    slug: "gynecology",
    description: "Консультации по вопросам менструального цикла, беременности и женского здоровья.",
  },
  {
    name: "Аллергология и иммунология",
    slug: "allergy-immunology",
    description: "Консультации по вопросам аллергии и иммунной системы.",
  },
  {
    name: "Психология",
    slug: "psychology",
    description: "Консультации по вопросам тревожности, сна, стресса и психологического благополучия.",
  },
  {
    name: "Диетология",
    slug: "nutrition",
    description: "Консультации по вопросам питания, веса и рациона.",
  },
];

const seedDoctors = [
  {
    bio: "Демонстрационный профиль врача общей практики для первичных и повторных консультаций.",
    education: "Демонстрационный медицинский университет",
    email: "doctor@example.local",
    experienceYears: 8,
    name: "Development Doctor",
    specialtySlug: "general-medicine",
    title: "Врач общей практики",
  },
  {
    bio: "Помогает пациентам с вопросами профилактики, распространёнными симптомами и наблюдением за состоянием здоровья.",
    education: "Медицинская школа Нортбриджа",
    email: "dr.elena.morris@example.local",
    experienceYears: 11,
    name: "Dr. Elena Morris",
    specialtySlug: "general-medicine",
    title: "Врач семейной медицины",
  },
  {
    bio: "Консультирует по вопросам артериального давления, учащённого сердцебиения и сердечно-сосудистых рисков.",
    education: "Кардиологический институт Лейксайд",
    email: "dr.marcus.hale@example.local",
    experienceYears: 14,
    name: "Dr. Marcus Hale",
    specialtySlug: "cardiology",
    title: "Врач-кардиолог",
  },
  {
    bio: "Консультирует пациентов по вопросам головной боли, головокружения, мигрени и неврологических симптомов.",
    education: "Неврологический колледж Вестпорта",
    email: "dr.amina.patel@example.local",
    experienceYears: 10,
    name: "Dr. Amina Patel",
    specialtySlug: "neurology",
    title: "Врач-невролог",
  },
  {
    bio: "Проводит консультации по вопросам сыпи, акне, зуда, выпадения волос и изменений родинок.",
    education: "Дерматологическая программа Ривер-Сити",
    email: "dr.sofia.kim@example.local",
    experienceYears: 9,
    name: "Dr. Sofia Kim",
    specialtySlug: "dermatology",
    title: "Врач-дерматолог",
  },
  {
    bio: "Консультирует семьи по вопросам температуры и кашля у детей, вакцинации и повторного педиатрического наблюдения.",
    education: "Программа подготовки Детской больницы Гринфилда",
    email: "dr.noah.reed@example.local",
    experienceYears: 12,
    name: "Dr. Noah Reed",
    specialtySlug: "pediatrics",
    title: "Врач-педиатр",
  },
  {
    bio: "Помогает при симптомах со стороны пищеварительной системы, включая боль в животе, тошноту, диарею, запор и изжогу.",
    education: "Гастроэнтерологический центр Харбор",
    email: "dr.lucia.fernandez@example.local",
    experienceYears: 13,
    name: "Dr. Lucia Fernandez",
    specialtySlug: "gastroenterology",
    title: "Врач-гастроэнтеролог",
  },
  {
    bio: "Консультирует по вопросам гормонов, щитовидной железы, диабета, обмена веществ и изменения веса.",
    education: "Эндокринологический институт Саммит",
    email: "dr.owen.clark@example.local",
    experienceYears: 15,
    name: "Dr. Owen Clark",
    specialtySlug: "endocrinology",
    title: "Врач-эндокринолог",
  },
  {
    bio: "Консультирует по вопросам боли в спине, суставах и мышцах, травм и растяжений.",
    education: "Центральная ортопедическая академия",
    email: "dr.maya.stone@example.local",
    experienceYears: 16,
    name: "Dr. Maya Stone",
    specialtySlug: "orthopedics",
    title: "Врач-ортопед",
  },
  {
    bio: "Консультирует по вопросам боли в ухе, проблем со слухом, боли в горле, кашля и других ЛОР-симптомов.",
    education: "Ординатура по оториноларингологии Истсайд",
    email: "dr.ethan.brooks@example.local",
    experienceYears: 7,
    name: "Dr. Ethan Brooks",
    specialtySlug: "ent",
    title: "Врач-оториноларинголог",
  },
  {
    bio: "Консультирует пациентов по вопросам покраснения глаз, нечёткого зрения и здоровья глаз.",
    education: "Офтальмологический институт Брайтвью",
    email: "dr.nadia.hassan@example.local",
    experienceYears: 10,
    name: "Dr. Nadia Hassan",
    specialtySlug: "ophthalmology",
    title: "Врач-офтальмолог",
  },
  {
    bio: "Консультирует по вопросам боли при мочеиспускании, частого мочеиспускания и урологических симптомов.",
    education: "Программа подготовки по урологии Стоунбриджа",
    email: "dr.julian.price@example.local",
    experienceYears: 12,
    name: "Dr. Julian Price",
    specialtySlug: "urology",
    title: "Врач-уролог",
  },
  {
    bio: "Консультирует по вопросам боли во время менструации, беременности и женского здоровья.",
    education: "Программа женского здоровья Роузвуд",
    email: "dr.ines.romero@example.local",
    experienceYears: 11,
    name: "Dr. Ines Romero",
    specialtySlug: "gynecology",
    title: "Врач-гинеколог",
  },
  {
    bio: "Помогает пациентам разобраться с симптомами аллергии, зудом и вопросами, связанными с иммунной системой.",
    education: "Иммунологический центр Норт-Кост",
    email: "dr.aaron.lee@example.local",
    experienceYears: 9,
    name: "Dr. Aaron Lee",
    specialtySlug: "allergy-immunology",
    title: "Врач аллерголог-иммунолог",
  },
  {
    bio: "Проводит поддерживающие консультации по вопросам тревожности, проблем со сном, стресса и психологического состояния.",
    education: "Институт психологии Сидар",
    email: "dr.hannah.nguyen@example.local",
    experienceYears: 8,
    name: "Dr. Hannah Nguyen",
    specialtySlug: "psychology",
    title: "Клинический психолог",
  },
  {
    bio: "Консультирует по вопросам питания, изменения веса, планирования рациона и образа жизни.",
    education: "Центр науки о питании Эвергрин",
    email: "dr.peter.walsh@example.local",
    experienceYears: 6,
    name: "Dr. Peter Walsh",
    specialtySlug: "nutrition",
    title: "Врач-диетолог",
  },
];

const scheduleSlotTimes = [
  [9, 0],
  [10, 30],
  [13, 0],
  [15, 30],
];

async function upsertUsers() {
  const result = {};

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 12);

    result[user.role] = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        isActive: true,
      },
      create: {
        email: user.email,
        passwordHash,
        role: user.role,
        name: user.name,
        isActive: true,
      },
    });
  }

  return result;
}

async function upsertSpecialties() {
  const result = [];

  for (const specialty of specialties) {
    result.push(
      await prisma.specialty.upsert({
        where: { slug: specialty.slug },
        update: {
          name: specialty.name,
          description: specialty.description,
          isActive: true,
        },
        create: {
          ...specialty,
          isActive: true,
        },
      }),
    );
  }

  return result;
}

async function upsertSeedDoctors(specialtiesBySlug) {
  const result = [];

  for (const doctor of seedDoctors) {
    const specialty = specialtiesBySlug.get(doctor.specialtySlug);

    if (!specialty) {
      throw new Error(`Missing seeded specialty: ${doctor.specialtySlug}`);
    }

    const passwordHash = await bcrypt.hash(seedPasswords.doctor, 12);
    const user = await prisma.user.upsert({
      where: { email: doctor.email },
      update: {
        isActive: true,
        name: doctor.name,
        role: "DOCTOR",
      },
      create: {
        email: doctor.email,
        isActive: true,
        name: doctor.name,
        passwordHash,
        role: "DOCTOR",
      },
    });

    const doctorProfile = await prisma.doctorProfile.upsert({
      where: { userId: user.id },
      update: {
        bio: doctor.bio,
        education: doctor.education,
        experienceYears: doctor.experienceYears,
        isAvailable: true,
        specialtyId: specialty.id,
        title: doctor.title,
      },
      create: {
        bio: doctor.bio,
        education: doctor.education,
        experienceYears: doctor.experienceYears,
        isAvailable: true,
        specialtyId: specialty.id,
        title: doctor.title,
        userId: user.id,
      },
    });

    result.push(doctorProfile);
  }

  return result;
}

async function upsertScheduleSlots(doctorProfiles) {
  const baseDate = new Date("2030-02-04T00:00:00.000Z");

  for (const [doctorIndex, doctorProfile] of doctorProfiles.entries()) {
    for (const [slotIndex, [hour, minute]] of scheduleSlotTimes.entries()) {
      const startsAt = new Date(baseDate);
      startsAt.setUTCDate(baseDate.getUTCDate() + doctorIndex + slotIndex);
      startsAt.setUTCHours(hour, minute, 0, 0);

      const endsAt = new Date(startsAt);
      endsAt.setUTCMinutes(startsAt.getUTCMinutes() + 30);

      await prisma.doctorScheduleSlot.upsert({
        where: {
          doctorId_startsAt_endsAt: {
            doctorId: doctorProfile.id,
            endsAt,
            startsAt,
          },
        },
        update: {},
        create: {
          doctorId: doctorProfile.id,
          endsAt,
          startsAt,
          status: "AVAILABLE",
        },
      });
    }
  }
}

async function main() {
  const seededUsers = await upsertUsers();
  const seededSpecialties = await upsertSpecialties();
  const specialtiesBySlug = new Map(
    seededSpecialties.map((specialty) => [specialty.slug, specialty]),
  );

  await upsertSeedDoctors(specialtiesBySlug);

  await prisma.patientProfile.upsert({
    where: { userId: seededUsers.PATIENT.id },
    update: {
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      gender: "Not specified",
    },
    create: {
      userId: seededUsers.PATIENT.id,
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      gender: "Not specified",
    },
  });

  const availableDoctorProfiles = await prisma.doctorProfile.findMany({
    where: {
      user: {
        email: {
          in: seedDoctors.map((doctor) => doctor.email),
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  await upsertScheduleSlots(availableDoctorProfiles);

  const counts = {
    users: await prisma.user.count(),
    specialties: await prisma.specialty.count(),
    doctorProfiles: await prisma.doctorProfile.count(),
    patientProfiles: await prisma.patientProfile.count(),
    scheduleSlots: await prisma.doctorScheduleSlot.count(),
  };

  console.log("Development seed completed.");
  console.log("Development account emails:");
  for (const user of users) {
    console.log(`- ${user.email}`);
  }
  console.log("Record counts:");
  for (const [name, count] of Object.entries(counts)) {
    console.log(`- ${name}: ${count}`);
  }
}

main()
  .catch((error) => {
    console.error("Development seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
