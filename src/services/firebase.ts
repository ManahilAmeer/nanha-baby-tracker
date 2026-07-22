import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
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

// Firebase web auth only keeps the session in memory on React Native unless a
// persistence adapter is provided. AsyncStorage preserves it across app restarts.
export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // Fast Refresh can re-run this module after Auth has already been created.
    if ((error as { code?: string }).code === "auth/already-initialized") {
      return getAuth(app);
    }

    throw error;
  }
})();
export const db = getFirestore(app);
