import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { addBaby } from "@/src/services/baby";

export default function Onboarding() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");

  const handleStart = async () => {
  if (!name || !dob) return;

  try {
    await addBaby({ name, dob });

    router.replace("/"); // go home
  } catch (error) {
    console.log(error);
  }};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Baby Profile</Text>

      <TextInput
        placeholder="Baby Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={dob}
        onChangeText={setDob}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Start Tracking</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#EDE7D9",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "600",
    color: "#6B705C",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#B56E46",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});