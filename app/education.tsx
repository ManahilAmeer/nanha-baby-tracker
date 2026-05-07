import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const sections = [
  "Feeding",
  "Sleep",
  "Diapers",
  "Fever and illness basics",
  "Tummy time",
  "Vaccines",
  "Development by age",
];

export default function EducationHub() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Educational hub</Text>
      <Text style={styles.title}>Short, practical baby care guides</Text>
      <Text style={styles.subtitle}>
        These sections will filter by baby age, while still allowing browsing
        other age ranges.
      </Text>

      {sections.map((section) => (
        <View style={styles.card} key={section}>
          <Ionicons name="book-outline" size={21} color="#9B6A43" />
          <Text style={styles.cardText}>{section}</Text>
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
});
