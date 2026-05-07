import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signIn, signUp } from "../src/services/auth";
import { useRouter } from "expo-router";

type AuthMode = "login" | "signup";

export default function AuthScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        await signIn(email.trim(), password);
        router.replace("/");
      } else {
        await signUp(email.trim(), password);
        router.replace("/onboarding");
      }
    } catch (e) {
      console.log(e);
      setError(getAuthErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandMark}>
          <Ionicons name="leaf-outline" size={30} color="#9B6A43" />
        </View>

        <Text style={styles.kicker}>Nanha baby tracker</Text>
        <Text style={styles.title}>
          {mode === "login" ? "Welcome back, mama" : "Create your cozy space"}
        </Text>
        <Text style={styles.subtitle}>
          {mode === "login"
            ? "Keep every feed, nap, and tiny care moment tucked safely in one place."
            : "Start with your account, then add your baby's little profile."}
        </Text>

        <View style={styles.segmentedControl}>
          <Pressable
            accessibilityRole="button"
            style={[
              styles.segment,
              mode === "login" && styles.activeSegment,
            ]}
            onPress={() => {
              setMode("login");
              setError("");
            }}
          >
            <Text
              style={[
                styles.segmentText,
                mode === "login" && styles.activeSegmentText,
              ]}
            >
              Login
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={[
              styles.segment,
              mode === "signup" && styles.activeSegment,
            ]}
            onPress={() => {
              setMode("signup");
              setError("");
            }}
          >
            <Text
              style={[
                styles.segmentText,
                mode === "signup" && styles.activeSegmentText,
              ]}
            >
              Sign up
            </Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor="#A49B8F"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              autoCapitalize="none"
              placeholder="Minimum 6 characters"
              placeholderTextColor="#A49B8F"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              pressed && !loading && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
          >
            {loading ? (
              <ActivityIndicator color="#FFF9F0" />
            ) : (
              <>
                <Ionicons
                  name={mode === "login" ? "log-in-outline" : "person-add-outline"}
                  size={20}
                  color="#FFF9F0"
                />
                <Text style={styles.buttonText}>
                  {mode === "login" ? "Login" : "Create account"}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getAuthErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: string }).code)
    : "";

  if (code.includes("invalid-email")) return "That email address looks invalid.";
  if (code.includes("weak-password")) return "Use at least 6 characters for your password.";
  if (code.includes("email-already-in-use")) return "This email already has an account.";
  if (code.includes("invalid-credential") || code.includes("wrong-password")) {
    return "Email or password is incorrect.";
  }

  return "Something went wrong. Please try again.";
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: "#FBF4EA",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FBF4EA",
  },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EADBC8",
    borderWidth: 1,
    borderColor: "#D9C5A8",
    marginBottom: 22,
  },
  kicker: {
    color: "#8B7258",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "800",
    color: "#3A332A",
    marginBottom: 10,
  },
  subtitle: {
    color: "#6F6253",
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 26,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#EFE3D1",
    borderRadius: 8,
    padding: 4,
    marginBottom: 22,
  },
  segment: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  activeSegment: {
    backgroundColor: "#FFF9F0",
    shadowColor: "#4A3827",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  segmentText: {
    color: "#7D6B59",
    fontWeight: "700",
  },
  activeSegmentText: {
    color: "#3A332A",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: "#514739",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    minHeight: 52,
    backgroundColor: "#FFF9F0",
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    color: "#3A332A",
    fontSize: 16,
  },
  errorText: {
    color: "#A84D3F",
    fontWeight: "600",
    lineHeight: 20,
  },
  button: {
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: "#9B6A43",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#6D4829",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  buttonPressed: {
    transform: [{ translateY: 1 }],
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  buttonText: {
    color: "#FFF9F0",
    fontSize: 16,
    fontWeight: "800",
  },
});
