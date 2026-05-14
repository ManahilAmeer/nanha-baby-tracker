import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export type ReminderType =
  | "vaccine"
  | "feeding"
  | "tummy"
  | "growth"
  | "milestone";

export type Reminder = {
  id: string;
  babyId: string;
  type: ReminderType;
  title: string;
  timing: string;
  enabled: boolean;
  completed: boolean;
  dueDate?: string;
  sourceId?: string;
};

export type ReminderInput = Omit<Reminder, "id">;

export const defaultReminders: Omit<Reminder, "id" | "babyId">[] = [
  {
    type: "vaccine",
    title: "Vaccine due date",
    timing: "Based on country schedule",
    enabled: true,
    completed: false,
  },
  {
    type: "feeding",
    title: "Feeding reminder",
    timing: "Every 3 hours",
    enabled: false,
    completed: false,
  },
  {
    type: "tummy",
    title: "Tummy time nudge",
    timing: "Once daily",
    enabled: true,
    completed: false,
  },
  {
    type: "growth",
    title: "Monthly growth check",
    timing: "Every month",
    enabled: true,
    completed: false,
  },
  {
    type: "milestone",
    title: "Monthly milestone check",
    timing: "Every month",
    enabled: true,
    completed: false,
  },
];

export const getReminders = async (babyId: string): Promise<Reminder[]> => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    return [];
  }

  const remindersQuery = query(
    collection(db, "reminders"),
    where("userId", "==", userId),
    where("babyId", "==", babyId)
  );

  const snapshot = await getDocs(remindersQuery);
  const savedReminders = snapshot.docs.map((document) => ({
    id: document.id,
    ...(document.data() as ReminderInput),
  }));
  const sourceReminders = savedReminders.filter((reminder) =>
    Boolean(reminder.sourceId)
  );

  const defaultReminderRows = defaultReminders.map((defaultReminder) => {
    const savedDefaultReminder = savedReminders.find(
      (reminder) =>
        reminder.type === defaultReminder.type && !reminder.sourceId
    );

    return (
      savedDefaultReminder ?? {
        id: `${babyId}-${defaultReminder.type}`,
        babyId,
        ...defaultReminder,
      }
    );
  });

  return [...sourceReminders, ...defaultReminderRows];
};

export const saveReminder = async (reminder: Reminder) => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("You need to be signed in before updating reminders.");
  }

  const reminderId = reminder.sourceId
    ? `${reminder.babyId}-${reminder.type}-${reminder.sourceId}`
    : `${reminder.babyId}-${reminder.type}`;

  const reminderData = removeUndefinedFields({
    babyId: reminder.babyId,
    userId,
    type: reminder.type,
    title: reminder.title,
    timing: reminder.timing,
    enabled: reminder.enabled,
    completed: reminder.completed,
    dueDate: reminder.dueDate,
    sourceId: reminder.sourceId,
    updatedAt: serverTimestamp(),
  });

  return await setDoc(doc(db, "reminders", reminderId), reminderData, {
    merge: true,
  });
};

function removeUndefinedFields<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  ) as T;
}
