import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const settings = [
  "Baby profile",
  "Units: kg/lb, cm/in",
  "Reminder settings",
  "Data export placeholder",
  "Privacy and data controls",
];

export default function Settings() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Settings</Text>
      <Text style={styles.title}>Profile and preferences</Text>

      {settings.map((setting) => (
        <View style={styles.card} key={setting}>
          <Ionicons name="settings-outline" size={21} color="#9B6A43" />
          <Text style={styles.cardText}>{setting}</Text>
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
