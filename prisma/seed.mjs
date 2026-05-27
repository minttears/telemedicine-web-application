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
    name: "General Medicine",
    slug: "general-medicine",
    description: "Primary care and general medical consultations.",
  },
  {
    name: "Cardiology",
    slug: "cardiology",
    description: "Heart and cardiovascular consultations.",
  },
  {
    name: "Dermatology",
    slug: "dermatology",
    description: "Skin, hair, and nail consultations.",
  },
  {
    name: "Pediatrics",
    slug: "pediatrics",
    description: "Medical consultations for children and adolescents.",
  },
];

const scheduleSlots = [
  ["2030-01-07T09:00:00.000Z", "2030-01-07T09:30:00.000Z"],
  ["2030-01-07T10:00:00.000Z", "2030-01-07T10:30:00.000Z"],
  ["2030-01-08T09:00:00.000Z", "2030-01-08T09:30:00.000Z"],
  ["2030-01-08T10:00:00.000Z", "2030-01-08T10:30:00.000Z"],
  ["2030-01-09T09:00:00.000Z", "2030-01-09T09:30:00.000Z"],
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

async function main() {
  const seededUsers = await upsertUsers();
  const seededSpecialties = await upsertSpecialties();

  const generalMedicine = seededSpecialties.find(
    (specialty) => specialty.slug === "general-medicine",
  );

  if (!generalMedicine) {
    throw new Error("General Medicine specialty was not seeded.");
  }

  const doctorProfile = await prisma.doctorProfile.upsert({
    where: { userId: seededUsers.DOCTOR.id },
    update: {
      specialtyId: generalMedicine.id,
      title: "General Practitioner",
      bio: "Development-only doctor profile placeholder.",
      education: "Development Medical University",
      experienceYears: 8,
      isAvailable: true,
    },
    create: {
      userId: seededUsers.DOCTOR.id,
      specialtyId: generalMedicine.id,
      title: "General Practitioner",
      bio: "Development-only doctor profile placeholder.",
      education: "Development Medical University",
      experienceYears: 8,
      isAvailable: true,
    },
  });

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

  for (const [startsAt, endsAt] of scheduleSlots) {
    await prisma.doctorScheduleSlot.upsert({
      where: {
        doctorId_startsAt_endsAt: {
          doctorId: doctorProfile.id,
          startsAt: new Date(startsAt),
          endsAt: new Date(endsAt),
        },
      },
      update: {
        status: "AVAILABLE",
      },
      create: {
        doctorId: doctorProfile.id,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        status: "AVAILABLE",
      },
    });
  }

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
