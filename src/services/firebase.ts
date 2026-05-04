import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4_z6hP4IpNo1KgvC1YRrBJm94J2SqKnY",
  authDomain: "nanha-baby-trac.firebaseapp.com",
  projectId: "nanha-baby-trac",
  storageBucket: "nanha-baby-trac.appspot.com",
  messagingSenderId: "1051445987644",
  appId: "1:1051445987644:web:1234567890abcdef",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);