import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export type FeedingType = "breast" | "formula" | "mixed" | "solids";
export type Sex = "girl" | "boy" | "not-specified";
export type WeightUnit = "kg" | "lb";
export type LengthUnit = "cm" | "in";

export type BabyProfile = {
  id: string;
  name: string;
  dob: string;
  sex?: Sex;
  feedingType?: FeedingType;
  vaccineCountry?: string;
  remindersEnabled?: boolean;
  weightUnit?: WeightUnit;
  lengthUnit?: LengthUnit;
};

export type BabyInput = {
  name: string;
  dob: string;
  sex?: Sex;
  feedingType?: FeedingType;
  vaccineCountry?: string;
  remindersEnabled?: boolean;
  weightUnit?: WeightUnit;
  lengthUnit?: LengthUnit;
};

export const addBaby = async (baby: BabyInput) => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("You need to be signed in before adding a baby profile.");
  }

  return await addDoc(collection(db, "babies"), {
    ...baby,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateBaby = async (babyId: string, baby: BabyInput) => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("You need to be signed in before updating a baby profile.");
  }

  return await updateDoc(doc(db, "babies", babyId), {
    ...baby,
    userId,
    updatedAt: serverTimestamp(),
  });
};

export const getPrimaryBaby = async (
  userId = auth.currentUser?.uid
): Promise<BabyProfile | null> => {

  if (!userId) {
    return null;
  }

  const babyQuery = query(
    collection(db, "babies"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(babyQuery);

  if (snapshot.empty) {
    return null;
  }

  const firstBaby = snapshot.docs[0];
  const data = firstBaby.data() as Omit<BabyProfile, "id">;

  return {
    id: firstBaby.id,
    name: data.name,
    dob: data.dob,
    sex: data.sex,
    feedingType: data.feedingType,
    vaccineCountry: data.vaccineCountry,
    remindersEnabled: data.remindersEnabled,
    weightUnit: data.weightUnit,
    lengthUnit: data.lengthUnit,
  };
};
