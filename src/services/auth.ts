import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export const signUp = async (
  email: string,
  password: string
) => {
  return await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
};