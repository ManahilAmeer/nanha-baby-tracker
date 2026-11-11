import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
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
// Firebase's React Native helper is not exported by the Firebase 12 Metro build,
// so use AsyncStorage through a small persistence adapter instead.
const reactNativePersistence = {
  type: "LOCAL" as const,
  _isAvailable: async () => true,
  _set: async (key: string, value: unknown) =>
    AsyncStorage.setItem(key, JSON.stringify(value)),
  _get: async <T,>(key: string): Promise<T | null> => {
    const value = await AsyncStorage.getItem(key);
    return value === null ? null : (JSON.parse(value) as T);
  },
  _remove: async (key: string) => AsyncStorage.removeItem(key),
  _addListener: () => {},
  _removeListener: () => {},
};

export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: reactNativePersistence,
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
