const developmentPasswordHash =
  "DEV_ONLY_PLACEHOLDER_PASSWORD_HASH_REPLACE_BEFORE_RUNNING_SEED";

export const seedUsers = [
  {
    email: "admin@example.local",
    passwordHash: developmentPasswordHash,
    role: "ADMIN",
    name: "Development Admin",
  },
  {
    email: "doctor@example.local",
    passwordHash: developmentPasswordHash,
    role: "DOCTOR",
    name: "Development Doctor",
  },
  {
    email: "patient@example.local",
    passwordHash: developmentPasswordHash,
    role: "PATIENT",
    name: "Development Patient",
  },
] as const;

export const seedSpecialties = [
  {
    name: "General Medicine",
    slug: "general-medicine",
  },
  {
    name: "Cardiology",
    slug: "cardiology",
  },
  {
    name: "Dermatology",
    slug: "dermatology",
  },
  {
    name: "Pediatrics",
    slug: "pediatrics",
  },
] as const;

export const seedDoctorProfile = {
  userEmail: "doctor@example.local",
  specialtySlug: "general-medicine",
  title: "General Practitioner",
  bio: "Development-only doctor profile placeholder.",
  education: "Development Medical University",
  experienceYears: 8,
  isAvailable: true,
} as const;

export const seedScheduleSlots = [
  {
    doctorEmail: "doctor@example.local",
    startsAt: "2030-01-07T09:00:00.000Z",
    endsAt: "2030-01-07T09:30:00.000Z",
    status: "AVAILABLE",
  },
  {
    doctorEmail: "doctor@example.local",
    startsAt: "2030-01-07T10:00:00.000Z",
    endsAt: "2030-01-07T10:30:00.000Z",
    status: "AVAILABLE",
  },
] as const;
