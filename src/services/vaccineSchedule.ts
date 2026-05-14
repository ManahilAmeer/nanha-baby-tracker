import { type BabyProfile } from "./baby";
import {
  getVaccineRecords,
  type VaccineRecord,
} from "./vaccines";
import { type Reminder } from "./reminders";
import {
  getVaccineScheduleForCountry,
  type VaccineScheduleDose,
} from "../data/vaccineSchedules";

export async function getVaccineScheduleReminders(
  baby: BabyProfile
): Promise<Reminder[]> {
  const records = await getVaccineRecords(baby.id);

  return getVaccineScheduleRemindersFromRecords(baby, records);
}

export function getVaccineScheduleRemindersFromRecords(
  baby: BabyProfile,
  records: VaccineRecord[]
): Reminder[] {
  const schedule = getVaccineScheduleForCountry(baby.vaccineCountry);
  const today = getDateOnly(new Date());

  return schedule
    .map((dose) => buildScheduleReminder(baby, dose))
    .filter((reminder) => {
      const dueDate = getDateOnly(new Date(reminder.dueDate ?? ""));

      return (
        !Number.isNaN(dueDate.getTime()) &&
        dueDate >= today &&
        !hasMatchingVaccineRecord(reminder, records)
      );
    });
}

function buildScheduleReminder(
  baby: BabyProfile,
  dose: VaccineScheduleDose
): Reminder {
  const dueDate = getDoseDueDate(baby.dob, dose);
  const country = baby.vaccineCountry?.trim() || dose.country;

  return {
    id: `${baby.id}-schedule-${dose.id}`,
    babyId: baby.id,
    type: "vaccine",
    title: `${dose.label}: ${dose.vaccines.join(", ")}`,
    timing: `${country} schedule - ${dose.timing.label}`,
    dueDate,
    sourceId: `schedule-${dose.id}`,
    enabled: baby.remindersEnabled ?? true,
    completed: false,
  };
}

function getDoseDueDate(dob: string, dose: VaccineScheduleDose) {
  const dueDate = new Date(dob);

  if (dose.timing.unit === "days") {
    dueDate.setDate(dueDate.getDate() + dose.timing.value);
  }

  if (dose.timing.unit === "weeks") {
    dueDate.setDate(dueDate.getDate() + dose.timing.value * 7);
  }

  if (dose.timing.unit === "months") {
    dueDate.setMonth(dueDate.getMonth() + dose.timing.value);
  }

  return dueDate.toISOString().slice(0, 10);
}

function hasMatchingVaccineRecord(
  reminder: Reminder,
  records: VaccineRecord[]
) {
  const reminderVaccines = normalizeVaccineText(reminder.title);

  return records.some((record) => {
    const recordName = normalizeVaccineText(record.name);
    const hasSimilarName =
      reminderVaccines.includes(recordName) || recordName.includes(reminderVaccines);
    const hasSameDueDate = record.dueDate === reminder.dueDate;

    return hasSameDueDate || hasSimilarName;
  });
}

function normalizeVaccineText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getDateOnly(date: Date) {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  return dateOnly;
}
