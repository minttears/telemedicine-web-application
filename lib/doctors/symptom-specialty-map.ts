export type SymptomSpecialtyMapping = {
  emergencyNotice?: boolean;
  label: string;
  slug: string;
  specialtySlugs: string[];
};

export const symptomSpecialtyMappings: SymptomSpecialtyMapping[] = [
  {
    label: "Headache",
    slug: "headache",
    specialtySlugs: ["neurology", "general-medicine"],
  },
  {
    label: "Dizziness",
    slug: "dizziness",
    specialtySlugs: ["neurology", "general-medicine"],
  },
  {
    label: "Migraine",
    slug: "migraine",
    specialtySlugs: ["neurology", "general-medicine"],
  },
  {
    label: "Fever",
    slug: "fever",
    specialtySlugs: ["general-medicine"],
  },
  {
    label: "Cough",
    slug: "cough",
    specialtySlugs: ["general-medicine", "ent"],
  },
  {
    label: "Sore throat",
    slug: "sore-throat",
    specialtySlugs: ["general-medicine", "ent"],
  },
  {
    emergencyNotice: true,
    label: "Shortness of breath",
    slug: "shortness-of-breath",
    specialtySlugs: ["cardiology", "general-medicine"],
  },
  {
    emergencyNotice: true,
    label: "Chest pain",
    slug: "chest-pain",
    specialtySlugs: ["cardiology", "general-medicine"],
  },
  {
    label: "Palpitations",
    slug: "palpitations",
    specialtySlugs: ["cardiology"],
  },
  {
    label: "High blood pressure",
    slug: "high-blood-pressure",
    specialtySlugs: ["cardiology", "general-medicine"],
  },
  {
    label: "Abdominal pain",
    slug: "abdominal-pain",
    specialtySlugs: ["gastroenterology", "general-medicine"],
  },
  {
    label: "Nausea",
    slug: "nausea",
    specialtySlugs: ["gastroenterology", "general-medicine"],
  },
  {
    label: "Vomiting",
    slug: "vomiting",
    specialtySlugs: ["gastroenterology", "general-medicine"],
  },
  {
    label: "Diarrhea",
    slug: "diarrhea",
    specialtySlugs: ["gastroenterology", "general-medicine"],
  },
  {
    label: "Constipation",
    slug: "constipation",
    specialtySlugs: ["gastroenterology", "general-medicine"],
  },
  {
    label: "Heartburn",
    slug: "heartburn",
    specialtySlugs: ["gastroenterology", "general-medicine"],
  },
  {
    label: "Back pain",
    slug: "back-pain",
    specialtySlugs: ["orthopedics", "general-medicine"],
  },
  {
    label: "Joint pain",
    slug: "joint-pain",
    specialtySlugs: ["orthopedics", "general-medicine"],
  },
  {
    label: "Muscle pain",
    slug: "muscle-pain",
    specialtySlugs: ["orthopedics", "general-medicine"],
  },
  {
    label: "Rash",
    slug: "rash",
    specialtySlugs: ["dermatology"],
  },
  {
    label: "Acne",
    slug: "acne",
    specialtySlugs: ["dermatology"],
  },
  {
    label: "Itching",
    slug: "itching",
    specialtySlugs: ["dermatology", "allergy-immunology"],
  },
  {
    label: "Hair loss",
    slug: "hair-loss",
    specialtySlugs: ["dermatology", "endocrinology"],
  },
  {
    label: "Allergy symptoms",
    slug: "allergy-symptoms",
    specialtySlugs: ["allergy-immunology", "general-medicine"],
  },
  {
    label: "Eye redness",
    slug: "eye-redness",
    specialtySlugs: ["ophthalmology"],
  },
  {
    label: "Blurry vision",
    slug: "blurry-vision",
    specialtySlugs: ["ophthalmology"],
  },
  {
    label: "Ear pain",
    slug: "ear-pain",
    specialtySlugs: ["ent", "general-medicine"],
  },
  {
    label: "Hearing issues",
    slug: "hearing-issues",
    specialtySlugs: ["ent"],
  },
  {
    label: "Urinary pain",
    slug: "urinary-pain",
    specialtySlugs: ["urology", "general-medicine"],
  },
  {
    label: "Frequent urination",
    slug: "frequent-urination",
    specialtySlugs: ["urology", "endocrinology", "general-medicine"],
  },
  {
    label: "Menstrual pain",
    slug: "menstrual-pain",
    specialtySlugs: ["gynecology"],
  },
  {
    label: "Pregnancy questions",
    slug: "pregnancy-questions",
    specialtySlugs: ["gynecology"],
  },
  {
    label: "Anxiety",
    slug: "anxiety",
    specialtySlugs: ["psychology", "general-medicine"],
  },
  {
    label: "Sleep problems",
    slug: "sleep-problems",
    specialtySlugs: ["psychology", "general-medicine"],
  },
  {
    label: "Fatigue",
    slug: "fatigue",
    specialtySlugs: ["general-medicine", "endocrinology"],
  },
  {
    label: "Weight changes",
    slug: "weight-changes",
    specialtySlugs: ["endocrinology", "nutrition", "general-medicine"],
  },
  {
    label: "Diabetes concerns",
    slug: "diabetes-concerns",
    specialtySlugs: ["endocrinology", "general-medicine"],
  },
  {
    label: "Thyroid symptoms",
    slug: "thyroid-symptoms",
    specialtySlugs: ["endocrinology"],
  },
  {
    label: "Child fever",
    slug: "child-fever",
    specialtySlugs: ["pediatrics"],
  },
  {
    label: "Child cough",
    slug: "child-cough",
    specialtySlugs: ["pediatrics"],
  },
  {
    label: "Vaccine questions",
    slug: "vaccine-questions",
    specialtySlugs: ["pediatrics", "general-medicine"],
  },
  {
    label: "Skin mole concern",
    slug: "skin-mole-concern",
    specialtySlugs: ["dermatology"],
  },
  {
    label: "Injury or sprain",
    slug: "injury-or-sprain",
    specialtySlugs: ["orthopedics", "general-medicine"],
  },
  {
    label: "Medication question",
    slug: "medication-question",
    specialtySlugs: ["general-medicine"],
  },
  {
    label: "Lab result question",
    slug: "lab-result-question",
    specialtySlugs: ["general-medicine"],
  },
  {
    label: "Follow-up consultation",
    slug: "follow-up-consultation",
    specialtySlugs: ["general-medicine"],
  },
  {
    label: "General checkup",
    slug: "general-checkup",
    specialtySlugs: ["general-medicine"],
  },
];

export const symptomSpecialtyMap = new Map(
  symptomSpecialtyMappings.map((item) => [item.slug, item]),
);
