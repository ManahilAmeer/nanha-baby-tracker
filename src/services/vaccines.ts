import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import { saveReminder } from "./reminders";

export type VaccineRecordSource = "manual" | "card-upload" | "ocr";

export type VaccineRecordInput = {
  babyId: string;
  name: string;
  dueDate: string;
  completedDate?: string;
  source: VaccineRecordSource;
};

export type VaccineRecord = VaccineRecordInput & {
  id: string;
  createdAt?: Date;
};

export const addVaccineRecord = async (record: VaccineRecordInput) => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("You need to be signed in before adding vaccines.");
  }

  const vaccineRecordData = removeUndefinedFields({
    ...record,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const vaccineRecord = await addDoc(collection(db, "vaccineRecords"), {
    ...vaccineRecordData,
  });

  await saveReminder({
    id: `${record.babyId}-vaccine-${vaccineRecord.id}`,
    babyId: record.babyId,
    type: "vaccine",
    title: `${record.name} vaccine`,
    timing: `Due ${record.dueDate}`,
    dueDate: record.dueDate,
    sourceId: vaccineRecord.id,
    enabled: !record.completedDate,
    completed: Boolean(record.completedDate),
  });

  return vaccineRecord;
};

export const getVaccineRecords = async (
  babyId: string
): Promise<VaccineRecord[]> => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    return [];
  }

  const vaccineQuery = query(
    collection(db, "vaccineRecords"),
    where("userId", "==", userId),
    where("babyId", "==", babyId)
  );

  const snapshot = await getDocs(vaccineQuery);

  return snapshot.docs
    .map((document) => {
      const data = document.data() as VaccineRecordInput & {
        createdAt?: Timestamp;
      };

      return {
        id: document.id,
        babyId: data.babyId,
        name: data.name,
        dueDate: data.dueDate,
        completedDate: data.completedDate,
        source: data.source,
        createdAt: data.createdAt?.toDate(),
      };
    })
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate));
};

export const updateVaccineRecord = async (
  recordId: string,
  record: Omit<VaccineRecordInput, "babyId" | "source">
) => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("You need to be signed in before updating vaccines.");
  }

  return await updateDoc(doc(db, "vaccineRecords", recordId), removeUndefinedFields({
    ...record,
    updatedAt: serverTimestamp(),
  }));
};

export const markVaccineCompleted = async (
  record: VaccineRecord,
  completedDate?: string
) => {
  const today = new Date().toISOString().slice(0, 10);
  const finalCompletedDate = completedDate ?? today;

  await updateDoc(doc(db, "vaccineRecords", record.id), {
    completedDate: finalCompletedDate,
    updatedAt: serverTimestamp(),
  });

  return await saveReminder({
    id: `${record.babyId}-vaccine-${record.id}`,
    babyId: record.babyId,
    type: "vaccine",
    title: `${record.name} vaccine`,
    timing: `Due ${record.dueDate}`,
    dueDate: record.dueDate,
    sourceId: record.id,
    enabled: false,
    completed: true,
  });
};

export const deleteVaccineRecord = async (recordId: string) => {
  return await deleteDoc(doc(db, "vaccineRecords", recordId));
};

function removeUndefinedFields<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  );
}
