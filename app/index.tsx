import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../src/services/firebase";

export default function Home() {
  const router = useRouter();
  const [babies, setBabies] = useState<any[]>([]);

  useEffect(() => {
    const fetchBabies = async () => {
      const snapshot = await getDocs(collection(db, "babies"));
      const babiesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBabies(babiesData);
    };

    fetchBabies();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nanha Baby Tracker 👶</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/onboarding")}
      >
        <Text style={styles.buttonText}>Add Baby</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/onboarding")}
      >
        <Text style={styles.buttonText}>Add Baby</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDE7D9",
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    color: "#6B705C",
  },
  button: {
    backgroundColor: "#C1A57B",
    padding: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
  },
});