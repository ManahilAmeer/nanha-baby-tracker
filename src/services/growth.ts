import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
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

export const getGrowthEntryById = async (
  entryId: string
): Promise<GrowthEntry | null> => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    return null;
  }

  const snapshot = await getDoc(doc(db, "growthEntries", entryId));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as GrowthEntryInput & {
    userId?: string;
    createdAt?: Timestamp;
  };

  if (data.userId !== userId) {
    return null;
  }

  return {
    id: snapshot.id,
    babyId: data.babyId,
    measuredAt: data.measuredAt,
    weightKg: data.weightKg,
    heightCm: data.heightCm,
    headCm: data.headCm,
    createdAt: data.createdAt?.toDate(),
  };
};

export const updateGrowthEntry = async (
  entryId: string,
  entry: Omit<GrowthEntryInput, "babyId">
) => {
  const existingEntry = await getGrowthEntryById(entryId);

  if (!existingEntry) {
    throw new Error("This growth entry was not found or you cannot update it.");
  }

  return await updateDoc(doc(db, "growthEntries", entryId), {
    ...entry,
    updatedAt: serverTimestamp(),
  });
};

export const deleteGrowthEntry = async (entryId: string) => {
  const existingEntry = await getGrowthEntryById(entryId);

  if (!existingEntry) {
    throw new Error("This growth entry was not found or you cannot delete it.");
  }

  return await deleteDoc(doc(db, "growthEntries", entryId));
};

export const getLatestGrowthEntry = async (
  babyId: string
): Promise<GrowthEntry | null> => {
  const entries = await getGrowthEntries(babyId);

  return entries[0] ?? null;
};
