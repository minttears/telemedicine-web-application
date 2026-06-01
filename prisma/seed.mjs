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
  {
    name: "Neurology",
    slug: "neurology",
    description: "Brain, nerve, headache, dizziness, and migraine consultations.",
  },
  {
    name: "Gastroenterology",
    slug: "gastroenterology",
    description: "Digestive system and abdominal symptom consultations.",
  },
  {
    name: "Endocrinology",
    slug: "endocrinology",
    description: "Hormone, thyroid, diabetes, and metabolism consultations.",
  },
  {
    name: "Orthopedics",
    slug: "orthopedics",
    description: "Bone, joint, back pain, injury, and sprain consultations.",
  },
  {
    name: "ENT",
    slug: "ent",
    description: "Ear, nose, throat, hearing, and related symptom consultations.",
  },
  {
    name: "Ophthalmology",
    slug: "ophthalmology",
    description: "Eye redness, vision, and eye health consultations.",
  },
  {
    name: "Urology",
    slug: "urology",
    description: "Urinary and urologic symptom consultations.",
  },
  {
    name: "Gynecology",
    slug: "gynecology",
    description: "Menstrual, pregnancy, and women's health consultations.",
  },
  {
    name: "Allergy and Immunology",
    slug: "allergy-immunology",
    description: "Allergy and immune-system symptom consultations.",
  },
  {
    name: "Psychology",
    slug: "psychology",
    description: "Anxiety, sleep, stress, and mental health consultations.",
  },
  {
    name: "Nutrition",
    slug: "nutrition",
    description: "Nutrition, weight, and diet-related consultations.",
  },
];

const seedDoctors = [
  {
    bio: "Development-only general medicine profile for primary care and follow-up consultations.",
    education: "Development Medical University",
    email: "doctor@example.local",
    experienceYears: 8,
    name: "Development Doctor",
    specialtySlug: "general-medicine",
    title: "General Practitioner",
  },
  {
    bio: "Helps patients with preventive care, common symptoms, and ongoing health questions.",
    education: "Northbridge School of Medicine",
    email: "dr.elena.morris@example.local",
    experienceYears: 11,
    name: "Dr. Elena Morris",
    specialtySlug: "general-medicine",
    title: "Family Medicine Physician",
  },
  {
    bio: "Focuses on blood pressure, palpitations, and cardiovascular risk conversations.",
    education: "Lakeside Cardiology Institute",
    email: "dr.marcus.hale@example.local",
    experienceYears: 14,
    name: "Dr. Marcus Hale",
    specialtySlug: "cardiology",
    title: "Cardiologist",
  },
  {
    bio: "Supports patients with headaches, dizziness, migraines, and neurological symptom questions.",
    education: "Westport Neurology College",
    email: "dr.amina.patel@example.local",
    experienceYears: 10,
    name: "Dr. Amina Patel",
    specialtySlug: "neurology",
    title: "Neurologist",
  },
  {
    bio: "Provides dermatology consultations for rashes, acne, itching, hair loss, and mole concerns.",
    education: "River City Dermatology Program",
    email: "dr.sofia.kim@example.local",
    experienceYears: 9,
    name: "Dr. Sofia Kim",
    specialtySlug: "dermatology",
    title: "Dermatologist",
  },
  {
    bio: "Works with families on child fever, cough, vaccine questions, and pediatric follow-up care.",
    education: "Greenfield Children's Hospital Fellowship",
    email: "dr.noah.reed@example.local",
    experienceYears: 12,
    name: "Dr. Noah Reed",
    specialtySlug: "pediatrics",
    title: "Pediatrician",
  },
  {
    bio: "Helps with digestive symptoms including abdominal pain, nausea, diarrhea, constipation, and heartburn.",
    education: "Harbor Gastroenterology Center",
    email: "dr.lucia.fernandez@example.local",
    experienceYears: 13,
    name: "Dr. Lucia Fernandez",
    specialtySlug: "gastroenterology",
    title: "Gastroenterologist",
  },
  {
    bio: "Supports hormone, thyroid, diabetes, metabolism, and weight-related health questions.",
    education: "Summit Endocrine Institute",
    email: "dr.owen.clark@example.local",
    experienceYears: 15,
    name: "Dr. Owen Clark",
    specialtySlug: "endocrinology",
    title: "Endocrinologist",
  },
  {
    bio: "Consults on back pain, joint pain, muscle pain, injuries, and sprains.",
    education: "Central Orthopedic Academy",
    email: "dr.maya.stone@example.local",
    experienceYears: 16,
    name: "Dr. Maya Stone",
    specialtySlug: "orthopedics",
    title: "Orthopedic Specialist",
  },
  {
    bio: "Provides care guidance for ear pain, hearing issues, sore throat, cough, and ENT symptoms.",
    education: "Eastside ENT Residency",
    email: "dr.ethan.brooks@example.local",
    experienceYears: 7,
    name: "Dr. Ethan Brooks",
    specialtySlug: "ent",
    title: "ENT Specialist",
  },
  {
    bio: "Supports patients with eye redness, blurry vision, and eye health questions.",
    education: "Brightview Ophthalmology Institute",
    email: "dr.nadia.hassan@example.local",
    experienceYears: 10,
    name: "Dr. Nadia Hassan",
    specialtySlug: "ophthalmology",
    title: "Ophthalmologist",
  },
  {
    bio: "Consults on urinary pain, frequent urination, and urologic symptom questions.",
    education: "Stonebridge Urology Fellowship",
    email: "dr.julian.price@example.local",
    experienceYears: 12,
    name: "Dr. Julian Price",
    specialtySlug: "urology",
    title: "Urologist",
  },
  {
    bio: "Supports menstrual pain, pregnancy questions, and women's health follow-up consultations.",
    education: "Rosewood Women's Health Program",
    email: "dr.ines.romero@example.local",
    experienceYears: 11,
    name: "Dr. Ines Romero",
    specialtySlug: "gynecology",
    title: "Gynecologist",
  },
  {
    bio: "Helps patients discuss allergy symptoms, itching, and immune-related care questions.",
    education: "North Coast Immunology Center",
    email: "dr.aaron.lee@example.local",
    experienceYears: 9,
    name: "Dr. Aaron Lee",
    specialtySlug: "allergy-immunology",
    title: "Allergy and Immunology Specialist",
  },
  {
    bio: "Provides supportive consultations for anxiety, sleep problems, stress, and mental health concerns.",
    education: "Cedar Psychology Institute",
    email: "dr.hannah.nguyen@example.local",
    experienceYears: 8,
    name: "Dr. Hannah Nguyen",
    specialtySlug: "psychology",
    title: "Clinical Psychologist",
  },
  {
    bio: "Supports nutrition, weight changes, diet planning, and lifestyle questions.",
    education: "Evergreen Nutrition Science Center",
    email: "dr.peter.walsh@example.local",
    experienceYears: 6,
    name: "Dr. Peter Walsh",
    specialtySlug: "nutrition",
    title: "Nutrition Specialist",
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
