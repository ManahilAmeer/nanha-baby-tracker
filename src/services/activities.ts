import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export type ActivityType = "feed" | "diaper" | "sleep" | "tummy";

export type ActivityInput = {
  babyId: string;
  type: ActivityType;
  detail?: string;
  notes?: string;
};

export type TodayActivitySummary = {
  feeds: number;
  diapers: number;
  sleepMinutes: number;
  tummyMinutes: number;
  lastFeed?: Date;
  lastDiaper?: Date;
  lastSleep?: Date;
};

export const addActivity = async (activity: ActivityInput) => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("You need to be signed in before logging activity.");
  }

  return await addDoc(collection(db, "activities"), {
    ...activity,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getTodayActivitySummary = async (
  babyId: string
): Promise<TodayActivitySummary> => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    return { feeds: 0, diapers: 0, sleepMinutes: 0, tummyMinutes: 0 };
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const activityQuery = query(
    collection(db, "activities"),
    where("userId", "==", userId),
    where("babyId", "==", babyId)
  );

  const snapshot = await getDocs(activityQuery);

  return snapshot.docs.reduce<TodayActivitySummary>(
    (summary, doc) => {
      const data = doc.data() as {
        type?: ActivityType;
        detail?: string;
        createdAt?: Timestamp;
      };

      if (!data.createdAt) {
        return summary;
      }

      const createdAt = data.createdAt.toDate();

      if (data.type === "feed" && isLater(createdAt, summary.lastFeed)) {
        summary.lastFeed = createdAt;
      }

      if (data.type === "diaper" && isLater(createdAt, summary.lastDiaper)) {
        summary.lastDiaper = createdAt;
      }

      if (data.type === "sleep" && isLater(createdAt, summary.lastSleep)) {
        summary.lastSleep = createdAt;
      }

      if (createdAt < startOfToday) {
        return summary;
      }

      if (data.type === "feed") {
        summary.feeds += 1;
      }

      if (data.type === "diaper") {
        summary.diapers += 1;
      }

      if (data.type === "sleep") {
        const minutes = Number.parseInt(data.detail ?? "0", 10);
        summary.sleepMinutes += Number.isNaN(minutes) ? 0 : minutes;
      }

      if (data.type === "tummy") {
        const minutes = Number.parseInt(data.detail ?? "0", 10);
        summary.tummyMinutes += Number.isNaN(minutes) ? 0 : minutes;
      }

      return summary;
    },
    { feeds: 0, diapers: 0, sleepMinutes: 0, tummyMinutes: 0 }
  );
};

function isLater(date: Date, current?: Date) {
  return !current || date > current;
}
