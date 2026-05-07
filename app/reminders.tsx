import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const reminders = [
  "Vaccine due date",
  "Feeding reminder",
  "Tummy time nudge",
  "Monthly growth check",
  "Monthly milestone check",
];

export default function Reminders() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Reminders</Text>
      <Text style={styles.title}>Gentle care nudges</Text>
      <Text style={styles.subtitle}>
        Turn reminders on or off, change timing, mark completed, or snooze.
      </Text>

      {reminders.map((reminder) => (
        <View style={styles.card} key={reminder}>
          <Ionicons name="notifications-outline" size={21} color="#9B6A43" />
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>{reminder}</Text>
            <Text style={styles.cardText}>Not scheduled yet</Text>
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
    minHeight: 74,
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  cardCopy: { flex: 1 },
  cardTitle: { color: "#3A332A", fontSize: 16, fontWeight: "800" },
  cardText: { color: "#6F6253", fontWeight: "600", marginTop: 4 },
});
