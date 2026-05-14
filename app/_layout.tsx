import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../src/services/firebase";
import { useEffect } from "react";
import { configureNotificationHandler } from "../src/services/notifications";

configureNotificationHandler();

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/auth");
      }
    });

    return unsubscribe;
  }, [router]);

  return <Stack />;
}
