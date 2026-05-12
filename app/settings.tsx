import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { logOut } from "../src/services/auth";
import { auth } from "../src/services/firebase";

const settings = [
  "Baby profile",
  "Units: kg/lb, cm/in",
  "Reminder settings",
  "Data export placeholder",
  "Privacy and data controls",
];

export default function Settings() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setSigningOut(true);
    setError("");

    try {
      await logOut();
      router.replace("/auth");
    } catch (logoutError) {
      console.log(logoutError);
      setError("We could not sign you out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Settings</Text>
      <Text style={styles.title}>Profile and preferences</Text>

      <View style={styles.accountCard}>
        <View style={styles.accountIcon}>
          <Ionicons name="person-outline" size={22} color="#9B6A43" />
        </View>
        <View style={styles.accountCopy}>
          <Text style={styles.accountLabel}>Signed in as</Text>
          <Text style={styles.accountEmail}>
            {auth.currentUser?.email ?? "Parent account"}
          </Text>
        </View>
      </View>

      {settings.map((setting) => (
        <View style={styles.card} key={setting}>
          <Ionicons name="settings-outline" size={21} color="#9B6A43" />
          <Text style={styles.cardText}>{setting}</Text>
        </View>
      ))}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={signingOut}
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && !signingOut && styles.buttonPressed,
          signingOut && styles.buttonDisabled,
        ]}
        onPress={handleLogout}
      >
        {signingOut ? (
          <ActivityIndicator color="#A84D3F" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={22} color="#A84D3F" />
            <Text style={styles.logoutText}>Log out</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FBF4EA" },
  container: { padding: 24, paddingTop: 58, paddingBottom: 32 },
  kicker: {
    color: "#8B7258",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    color: "#3A332A",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    marginBottom: 22,
  },
  accountCard: {
    minHeight: 74,
    backgroundColor: "#F5F0E2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9C5A8",
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 18,
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EADBC8",
    borderWidth: 1,
    borderColor: "#D9C5A8",
    alignItems: "center",
    justifyContent: "center",
  },
  accountCopy: {
    flex: 1,
  },
  accountLabel: {
    color: "#8B7258",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  accountEmail: {
    color: "#3A332A",
    fontSize: 16,
    fontWeight: "800",
  },
  card: {
    minHeight: 58,
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  cardText: { color: "#3A332A", fontSize: 16, fontWeight: "800" },
  errorText: {
    color: "#A84D3F",
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 10,
  },
  logoutButton: {
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDB8AA",
    backgroundColor: "#FFF9F0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 22,
  },
  logoutText: {
    color: "#A84D3F",
    fontSize: 16,
    fontWeight: "800",
  },
  buttonPressed: {
    transform: [{ translateY: 1 }],
  },
  buttonDisabled: {
    opacity: 0.72,
  },
});
