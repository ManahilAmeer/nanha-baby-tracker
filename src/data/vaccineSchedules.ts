export type VaccineDoseTiming = {
  unit: "days" | "weeks" | "months";
  value: number;
  label: string;
};

export type VaccineScheduleDose = {
  id: string;
  country: string;
  label: string;
  vaccines: string[];
  timing: VaccineDoseTiming;
};

const pakistanSchedule: VaccineScheduleDose[] = [
  {
    id: "pk-birth",
    country: "Pakistan",
    label: "Birth vaccines",
    vaccines: ["BCG", "OPV-0", "Hepatitis B birth dose"],
    timing: { unit: "days", value: 0, label: "At birth" },
  },
  {
    id: "pk-6-weeks",
    country: "Pakistan",
    label: "6 week vaccines",
    vaccines: ["Pentavalent-1", "PCV-1", "Rota-1", "OPV-1"],
    timing: { unit: "weeks", value: 6, label: "6 weeks" },
  },
  {
    id: "pk-10-weeks",
    country: "Pakistan",
    label: "10 week vaccines",
    vaccines: ["Pentavalent-2", "PCV-2", "Rota-2", "OPV-2"],
    timing: { unit: "weeks", value: 10, label: "10 weeks" },
  },
  {
    id: "pk-14-weeks",
    country: "Pakistan",
    label: "14 week vaccines",
    vaccines: ["Pentavalent-3", "PCV-3", "IPV", "OPV-3"],
    timing: { unit: "weeks", value: 14, label: "14 weeks" },
  },
  {
    id: "pk-9-months",
    country: "Pakistan",
    label: "9 month vaccines",
    vaccines: ["MR-1", "TCV"],
    timing: { unit: "months", value: 9, label: "9 months" },
  },
  {
    id: "pk-15-months",
    country: "Pakistan",
    label: "15 month vaccines",
    vaccines: ["MR-2"],
    timing: { unit: "months", value: 15, label: "15 months" },
  },
];

export const vaccineSchedules = {
  pakistan: pakistanSchedule,
};

export function getVaccineScheduleForCountry(country?: string) {
  const normalizedCountry = normalizeCountry(country);

  return vaccineSchedules[normalizedCountry] ?? [];
}

function normalizeCountry(country?: string): keyof typeof vaccineSchedules {
  const normalized = country?.trim().toLowerCase();

  if (normalized === "pakistan" || normalized === "pk") {
    return "pakistan";
  }

  return "pakistan";
}
