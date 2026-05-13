import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export type GrowthEntryInput = {
  babyId: string;
  measuredAt: string;
  weightKg?: number;
  heightCm?: number;
  headCm?: number;
};

export type GrowthEntry = GrowthEntryInput & {
  id: string;
  createdAt?: Date;
};

export const addGrowthEntry = async (entry: GrowthEntryInput) => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("You need to be signed in before adding growth data.");
  }

  return await addDoc(collection(db, "growthEntries"), {
    ...entry,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getGrowthEntries = async (
  babyId: string
): Promise<GrowthEntry[]> => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    return [];
  }

  const growthQuery = query(
    collection(db, "growthEntries"),
    where("userId", "==", userId),
    where("babyId", "==", babyId),
    orderBy("measuredAt", "desc")
  );

  const snapshot = await getDocs(growthQuery);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as GrowthEntryInput & {
      createdAt?: Timestamp;
    };

    return {
      id: doc.id,
      babyId: data.babyId,
      measuredAt: data.measuredAt,
      weightKg: data.weightKg,
      heightCm: data.heightCm,
      headCm: data.headCm,
      createdAt: data.createdAt?.toDate(),
    };
  });
};

export const getLatestGrowthEntry = async (
  babyId: string
): Promise<GrowthEntry | null> => {
  const entries = await getGrowthEntries(babyId);

  return entries[0] ?? null;
};
