import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GrowthDashboard() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Growth dashboard</Text>
      <Text style={styles.title}>Measurements over time</Text>
      <Text style={styles.subtitle}>
        Store weight, height, and head circumference first. Percentile charts
        can be layered in once the WHO dataset is ready.
      </Text>

      <View style={styles.grid}>
        <GrowthCard label="Weight" value="No entry" />
        <GrowthCard label="Height" value="No entry" />
        <GrowthCard label="Head" value="No entry" />
        <GrowthCard label="Percentile" value="Later" />
      </View>

      <Pressable style={styles.button}>
        <Ionicons name="add" size={22} color="#FFF9F0" />
        <Text style={styles.buttonText}>Add growth entry</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>View history</Text>
      </Pressable>
    </ScrollView>
  );
}

function GrowthCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
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
    marginBottom: 10,
  },
  subtitle: {
    color: "#6F6253",
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    minHeight: 118,
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    padding: 16,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  cardValue: { color: "#3A332A", fontSize: 22, fontWeight: "800" },
  cardLabel: { color: "#6F6253", fontWeight: "700" },
  button: {
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: "#9B6A43",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  buttonText: { color: "#FFF9F0", fontSize: 16, fontWeight: "800" },
  secondaryButton: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9C5A8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  secondaryButtonText: { color: "#8B7258", fontWeight: "800" },
});
