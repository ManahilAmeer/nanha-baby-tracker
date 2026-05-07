import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const categories = ["Motor", "Social", "Communication", "Cognitive"];

export default function Milestones() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Milestones</Text>
      <Text style={styles.title}>Gentle monthly checklist</Text>
      <Text style={styles.subtitle}>
        Track what baby is practicing now. If something feels delayed, consider
        discussing this with your pediatrician.
      </Text>

      {categories.map((category) => (
        <View style={styles.card} key={category}>
          <Ionicons name="sparkles-outline" size={22} color="#9B6A43" />
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>{category}</Text>
            <Text style={styles.cardText}>Age-based checklist coming next.</Text>
          </View>
        </View>
      ))}
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
    marginBottom: 10,
  },
  subtitle: {
    color: "#6F6253",
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 22,
  },
  card: {
    minHeight: 82,
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  cardCopy: { flex: 1 },
  cardTitle: { color: "#3A332A", fontSize: 17, fontWeight: "800" },
  cardText: { color: "#6F6253", fontWeight: "600", marginTop: 4 },
});
