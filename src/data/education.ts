export type EducationCategory =
  | "Feeding"
  | "Sleep"
  | "Diapers"
  | "Fever"
  | "Tummy time"
  | "Vaccines"
  | "Development";

export type EducationAgeRange = "0-2" | "3-4" | "5-6";

export type EducationArticle = {
  id: string;
  ageRange: EducationAgeRange;
  category: EducationCategory;
  title: string;
  points: string[];
};

export const ageRangeLabels: Record<EducationAgeRange, string> = {
  "0-2": "0-2 months",
  "3-4": "3-4 months",
  "5-6": "5-6 months",
};

export const educationArticles: EducationArticle[] = [
  {
    id: "0-2-feeding-cues",
    ageRange: "0-2",
    category: "Feeding",
    title: "Early feeding cues",
    points: [
      "Rooting, hand-to-mouth movement, and stirring can be early hunger cues.",
      "Crying can be a later cue, so calm feeding may be easier before then.",
      "Track patterns, but expect variation from day to day.",
    ],
  },
  {
    id: "0-2-sleep-basics",
    ageRange: "0-2",
    category: "Sleep",
    title: "Newborn sleep rhythm",
    points: [
      "Short sleep stretches are common in the early weeks.",
      "A simple dim-light routine can help mark night sleep.",
      "Place baby on their back for sleep unless your pediatrician advises otherwise.",
    ],
  },
  {
    id: "0-2-diapers",
    ageRange: "0-2",
    category: "Diapers",
    title: "Watching diaper patterns",
    points: [
      "Wet and soiled diaper counts are useful signals in early care.",
      "Color and frequency can change with feeding type.",
      "If diaper output suddenly drops, consider discussing this with your pediatrician.",
    ],
  },
  {
    id: "3-4-tummy",
    ageRange: "3-4",
    category: "Tummy time",
    title: "Building tummy time gently",
    points: [
      "Several short sessions can be easier than one long session.",
      "Try tummy time when baby is awake and calm.",
      "Stop and try later if baby is very upset.",
    ],
  },
  {
    id: "3-4-development",
    ageRange: "3-4",
    category: "Development",
    title: "Play for connection",
    points: [
      "Simple talking, smiling, and copying sounds supports interaction.",
      "Slow-moving toys can help visual tracking.",
      "Every baby develops at their own pace.",
    ],
  },
  {
    id: "3-4-fever",
    ageRange: "3-4",
    category: "Fever",
    title: "Fever basics",
    points: [
      "Use a reliable thermometer and write down the reading and time.",
      "Watch baby's feeding, alertness, breathing, and diaper output.",
      "For fever concerns, consider discussing this with your pediatrician.",
    ],
  },
  {
    id: "5-6-feeding",
    ageRange: "5-6",
    category: "Feeding",
    title: "Getting ready for solids",
    points: [
      "Readiness signs can include good head control and interest in food.",
      "Start slowly and keep milk feeds as the main nutrition source unless advised otherwise.",
      "Introduce new foods in calm moments.",
    ],
  },
  {
    id: "5-6-vaccines",
    ageRange: "5-6",
    category: "Vaccines",
    title: "Vaccine planning",
    points: [
      "Keep vaccine records in one place.",
      "Schedules vary by country, so follow your local health guidance.",
      "Use reminders to prepare for upcoming appointments.",
    ],
  },
  {
    id: "5-6-sleep",
    ageRange: "5-6",
    category: "Sleep",
    title: "Nap patterns",
    points: [
      "Nap timing often becomes more predictable around this age.",
      "Wake windows can still vary by baby and by day.",
      "Use logs as guidance, not pressure.",
    ],
  },
];
