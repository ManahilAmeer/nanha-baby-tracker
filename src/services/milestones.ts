import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export type MilestoneCompletionMap = Record<string, boolean>;

export const getMilestoneCompletions = async (
  babyId: string
): Promise<MilestoneCompletionMap> => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    return {};
  }

  const snapshot = await getDoc(doc(db, "milestoneProgress", babyId));

  if (!snapshot.exists()) {
    return {};
  }

  const data = snapshot.data() as {
    userId?: string;
    completed?: MilestoneCompletionMap;
  };

  if (data.userId !== userId) {
    return {};
  }

  return data.completed ?? {};
};

export const setMilestoneCompletion = async (
  babyId: string,
  milestoneId: string,
  completed: boolean
) => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("You need to be signed in before updating milestones.");
  }

  const existingCompletions = await getMilestoneCompletions(babyId);

  return await setDoc(
    doc(db, "milestoneProgress", babyId),
    {
      babyId,
      userId,
      completed: {
        ...existingCompletions,
        [milestoneId]: completed,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
