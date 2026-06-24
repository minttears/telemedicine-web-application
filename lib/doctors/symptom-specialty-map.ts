export type SymptomSpecialtyMapping = {
  emergencyNotice?: boolean;
  label: string;
  slug: string;
  specialtySlugs: string[];
};

export const symptomSpecialtyMappings: SymptomSpecialtyMapping[] = [
  {
    label: "Головная боль",
    slug: "headache",
    specialtySlugs: ["neurology", "general-medicine"],
  },
  {
    label: "Головокружение",
    slug: "dizziness",
    specialtySlugs: ["neurology", "general-medicine"],
  },
  {
    label: "Мигрень",
    slug: "migraine",
    specialtySlugs: ["neurology", "general-medicine"],
  },
  {
    label: "Повышенная температура",
    slug: "fever",
    specialtySlugs: ["general-medicine"],
  },
  {
    label: "Кашель",
    slug: "cough",
    specialtySlugs: ["general-medicine", "ent"],
  },
  {
    label: "Боль в горле",
    slug: "sore-throat",
    specialtySlugs: ["general-medicine", "ent"],
  },
  {
    emergencyNotice: true,
    label: "Одышка",
    slug: "shortness-of-breath",
    specialtySlugs: ["cardiology", "general-medicine"],
  },
  {
    emergencyNotice: true,
    label: "Боль в груди",
    slug: "chest-pain",
    specialtySlugs: ["cardiology", "general-medicine"],
  },
  {
    label: "Учащённое сердцебиение",
    slug: "palpitations",
    specialtySlugs: ["cardiology"],
  },
  {
    label: "Повышенное давление",
    slug: "high-blood-pressure",
    specialtySlugs: ["cardiology", "general-medicine"],
  },
  {
    label: "Боль в животе",
    slug: "abdominal-pain",
    specialtySlugs: ["gastroenterology", "general-medicine"],
  },
  {
    label: "Тошнота",
    slug: "nausea",
    specialtySlugs: ["gastroenterology", "general-medicine"],
  },
  {
    label: "Рвота",
    slug: "vomiting",
    specialtySlugs: ["gastroenterology", "general-medicine"],
  },
  {
    label: "Диарея",
    slug: "diarrhea",
    specialtySlugs: ["gastroenterology", "general-medicine"],
  },
  {
    label: "Запор",
    slug: "constipation",
    specialtySlugs: ["gastroenterology", "general-medicine"],
  },
  {
    label: "Изжога",
    slug: "heartburn",
    specialtySlugs: ["gastroenterology", "general-medicine"],
  },
  {
    label: "Боль в спине",
    slug: "back-pain",
    specialtySlugs: ["orthopedics", "general-medicine"],
  },
  {
    label: "Боль в суставах",
    slug: "joint-pain",
    specialtySlugs: ["orthopedics", "general-medicine"],
  },
  {
    label: "Боль в мышцах",
    slug: "muscle-pain",
    specialtySlugs: ["orthopedics", "general-medicine"],
  },
  {
    label: "Сыпь",
    slug: "rash",
    specialtySlugs: ["dermatology"],
  },
  {
    label: "Акне",
    slug: "acne",
    specialtySlugs: ["dermatology"],
  },
  {
    label: "Зуд",
    slug: "itching",
    specialtySlugs: ["dermatology", "allergy-immunology"],
  },
  {
    label: "Выпадение волос",
    slug: "hair-loss",
    specialtySlugs: ["dermatology", "endocrinology"],
  },
  {
    label: "Симптомы аллергии",
    slug: "allergy-symptoms",
    specialtySlugs: ["allergy-immunology", "general-medicine"],
  },
  {
    label: "Покраснение глаз",
    slug: "eye-redness",
    specialtySlugs: ["ophthalmology"],
  },
  {
    label: "Нечёткое зрение",
    slug: "blurry-vision",
    specialtySlugs: ["ophthalmology"],
  },
  {
    label: "Боль в ухе",
    slug: "ear-pain",
    specialtySlugs: ["ent", "general-medicine"],
  },
  {
    label: "Проблемы со слухом",
    slug: "hearing-issues",
    specialtySlugs: ["ent"],
  },
  {
    label: "Боль при мочеиспускании",
    slug: "urinary-pain",
    specialtySlugs: ["urology", "general-medicine"],
  },
  {
    label: "Частое мочеиспускание",
    slug: "frequent-urination",
    specialtySlugs: ["urology", "endocrinology", "general-medicine"],
  },
  {
    label: "Боль во время менструации",
    slug: "menstrual-pain",
    specialtySlugs: ["gynecology"],
  },
  {
    label: "Вопросы о беременности",
    slug: "pregnancy-questions",
    specialtySlugs: ["gynecology"],
  },
  {
    label: "Тревожность",
    slug: "anxiety",
    specialtySlugs: ["psychology", "general-medicine"],
  },
  {
    label: "Проблемы со сном",
    slug: "sleep-problems",
    specialtySlugs: ["psychology", "general-medicine"],
  },
  {
    label: "Утомляемость",
    slug: "fatigue",
    specialtySlugs: ["general-medicine", "endocrinology"],
  },
  {
    label: "Изменение веса",
    slug: "weight-changes",
    specialtySlugs: ["endocrinology", "nutrition", "general-medicine"],
  },
  {
    label: "Вопросы о диабете",
    slug: "diabetes-concerns",
    specialtySlugs: ["endocrinology", "general-medicine"],
  },
  {
    label: "Симптомы заболеваний щитовидной железы",
    slug: "thyroid-symptoms",
    specialtySlugs: ["endocrinology"],
  },
  {
    label: "Температура у ребёнка",
    slug: "child-fever",
    specialtySlugs: ["pediatrics"],
  },
  {
    label: "Кашель у ребёнка",
    slug: "child-cough",
    specialtySlugs: ["pediatrics"],
  },
  {
    label: "Вопросы о вакцинации",
    slug: "vaccine-questions",
    specialtySlugs: ["pediatrics", "general-medicine"],
  },
  {
    label: "Изменение родинки",
    slug: "skin-mole-concern",
    specialtySlugs: ["dermatology"],
  },
  {
    label: "Травма или растяжение",
    slug: "injury-or-sprain",
    specialtySlugs: ["orthopedics", "general-medicine"],
  },
  {
    label: "Вопрос о лекарствах",
    slug: "medication-question",
    specialtySlugs: ["general-medicine"],
  },
  {
    label: "Вопрос о результатах анализов",
    slug: "lab-result-question",
    specialtySlugs: ["general-medicine"],
  },
  {
    label: "Повторная консультация",
    slug: "follow-up-consultation",
    specialtySlugs: ["general-medicine"],
  },
  {
    label: "Общий осмотр",
    slug: "general-checkup",
    specialtySlugs: ["general-medicine"],
  },
];

export const symptomSpecialtyMap = new Map(
  symptomSpecialtyMappings.map((item) => [item.slug, item]),
);
