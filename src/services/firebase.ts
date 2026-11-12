import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4_z6hP4IpNo1KgvC1YRrBJm94J2SqKnY",
  authDomain: "nanha-baby-trac.firebaseapp.com",
  projectId: "nanha-baby-trac",
  storageBucket: "nanha-baby-trac.appspot.com",
  messagingSenderId: "1051445987644",
  appId: "1:1056844417172:web:743f85a07cc08f157ecc81",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
