import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const addBaby = async (baby: {
  name: string;
  dob: string;
}) => {
  return await addDoc(collection(db, "babies"), {
    ...baby,
    createdAt: serverTimestamp(),
  });
};