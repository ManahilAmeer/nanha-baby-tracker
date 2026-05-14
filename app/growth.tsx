import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { getPrimaryBaby, type BabyProfile } from "../src/services/baby";
import {
  addGrowthEntry,
  getGrowthEntries,
  type GrowthEntry,
} from "../src/services/growth";
import {
  formatUnitValue,
  toDisplayLength,
  toDisplayWeight,
  toStoredLength,
  toStoredWeight,
} from "../src/utils/units";

export default function GrowthDashboard() {
  const router = useRouter();
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [entries, setEntries] = useState<GrowthEntry[]>([]);
  const [measuredAt, setMeasuredAt] = useState(new Date().toISOString().slice(0, 10));
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [headCm, setHeadCm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadGrowth();
  }, []);

  const latestEntry = entries[0] ?? null;
  const weightUnit = baby?.weightUnit ?? "kg";
  const lengthUnit = baby?.lengthUnit ?? "cm";

  const loadGrowth = async () => {
    try {
      setLoading(true);
      setMessage("");
      const primaryBaby = await getPrimaryBaby();

      setBaby(primaryBaby);

      if (primaryBaby) {
        setEntries(await getGrowthEntries(primaryBaby.id));
      }
    } catch (error) {
      console.log(error);
      setMessage("We could not load growth data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!baby) {
      setMessage("Add a baby profile before adding growth data.");
      return;
    }

    if (!weightKg.trim() && !heightCm.trim() && !headCm.trim()) {
      setMessage("Add at least one measurement.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await addGrowthEntry({
        babyId: baby.id,
        measuredAt: measuredAt.trim(),
        weightKg: parseOptionalNumber(weightKg, (value) =>
          toStoredWeight(value, weightUnit)
        ),
        heightCm: parseOptionalNumber(heightCm, (value) =>
          toStoredLength(value, lengthUnit)
        ),
        headCm: parseOptionalNumber(headCm, (value) =>
          toStoredLength(value, lengthUnit)
        ),
      });

      setWeightKg("");
      setHeightCm("");
      setHeadCm("");
      setEntries(await getGrowthEntries(baby.id));
      setMessage("Growth entry saved.");
    } catch (error) {
      console.log(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not save this growth entry."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.kicker}>Growth dashboard</Text>
      <Text style={styles.title}>Measurements over time</Text>
      <Text style={styles.subtitle}>
        Start by storing measurements. Percentile charts can be added once the
        WHO dataset is ready.
      </Text>

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#9B6A43" />
          <Text style={styles.stateText}>Loading growth data...</Text>
        </View>
      ) : (
        <>
          <View style={styles.grid}>
            <GrowthCard
              label="Weight"
              value={formatWeight(latestEntry?.weightKg, weightUnit)}
            />
            <GrowthCard
              label="Height"
              value={formatLength(latestEntry?.heightCm, lengthUnit)}
            />
            <GrowthCard
              label="Head"
              value={formatLength(latestEntry?.headCm, lengthUnit)}
            />
            <GrowthCard
              label="Latest date"
              value={latestEntry?.measuredAt ?? "No entry"}
            />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add growth entry</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Measurement date</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#A8957D"
                value={measuredAt}
                onChangeText={setMeasuredAt}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight</Text>
              <TextInput
                keyboardType="decimal-pad"
                placeholder={weightUnit}
                placeholderTextColor="#A8957D"
                value={weightKg}
                onChangeText={setWeightKg}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Height</Text>
              <TextInput
                keyboardType="decimal-pad"
                placeholder={lengthUnit}
                placeholderTextColor="#A8957D"
                value={heightCm}
                onChangeText={setHeightCm}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Head circumference</Text>
              <TextInput
                keyboardType="decimal-pad"
                placeholder={lengthUnit}
                placeholderTextColor="#A8957D"
                value={headCm}
                onChangeText={setHeadCm}
                style={styles.input}
              />
            </View>

            {message ? <Text style={styles.messageText}>{message}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={saving}
              style={({ pressed }) => [
                styles.button,
                pressed && !saving && styles.buttonPressed,
                saving && styles.buttonDisabled,
              ]}
              onPress={handleSave}
            >
              {saving ? (
                <ActivityIndicator color="#FFF9F0" />
              ) : (
                <>
                  <Ionicons name="add" size={22} color="#FFF9F0" />
                  <Text style={styles.buttonText}>Save growth entry</Text>
                </>
              )}
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>History</Text>
          {entries.length ? (
            entries.map((entry) => (
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.historyRow,
                  pressed && styles.buttonPressed,
                ]}
                key={entry.id}
                onPress={() =>
                  router.push({
                    pathname: "/growth/[id]",
                    params: { id: entry.id },
                  })
                }
              >
                <Text style={styles.historyDate}>{entry.measuredAt}</Text>
                <Text style={styles.historyText}>
                  {formatHistoryEntry(entry, weightUnit, lengthUnit)}
                </Text>
              </Pressable>
            ))
          ) : (
            <View style={styles.stateCard}>
              <Ionicons name="analytics-outline" size={26} color="#9B6A43" />
              <Text style={styles.stateText}>No growth entries yet.</Text>
            </View>
          )}
        </>
      )}
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

function parseOptionalNumber(
  value: string,
  transform: (value: number) => number = (numberValue) => numberValue
) {
  const parsedValue = Number.parseFloat(value);

  return Number.isNaN(parsedValue) ? undefined : transform(parsedValue);
}

function formatWeight(valueKg: number | undefined, unit: "kg" | "lb") {
  return typeof valueKg === "number"
    ? `${formatUnitValue(toDisplayWeight(valueKg, unit))} ${unit}`
    : "No entry";
}

function formatLength(valueCm: number | undefined, unit: "cm" | "in") {
  return typeof valueCm === "number"
    ? `${formatUnitValue(toDisplayLength(valueCm, unit))} ${unit}`
    : "No entry";
}

function formatHistoryEntry(
  entry: GrowthEntry,
  weightUnit: "kg" | "lb",
  lengthUnit: "cm" | "in"
) {
  return [
    formatWeight(entry.weightKg, weightUnit),
    formatLength(entry.heightCm, lengthUnit),
    formatLength(entry.headCm, lengthUnit),
  ]
    .filter((value) => value !== "No entry")
    .join(" | ");
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
  formCard: {
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    padding: 18,
    marginTop: 10,
    gap: 16,
  },
  formTitle: { color: "#3A332A", fontSize: 20, fontWeight: "800" },
  inputGroup: { gap: 8 },
  label: { color: "#514739", fontSize: 14, fontWeight: "700" },
  input: {
    minHeight: 52,
    backgroundColor: "#FBF4EA",
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    color: "#3A332A",
    fontSize: 16,
  },
  messageText: {
    color: "#6F6253",
    fontWeight: "700",
    lineHeight: 20,
  },
  button: {
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: "#9B6A43",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonPressed: { transform: [{ translateY: 1 }] },
  buttonDisabled: { opacity: 0.72 },
  buttonText: { color: "#FFF9F0", fontSize: 16, fontWeight: "800" },
  sectionTitle: {
    color: "#3A332A",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 24,
    marginBottom: 12,
  },
  historyRow: {
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    padding: 16,
    marginBottom: 10,
  },
  historyDate: {
    color: "#8B7258",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  historyText: { color: "#3A332A", fontSize: 16, fontWeight: "800" },
  stateCard: {
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCCBB5",
  },
  stateText: {
    color: "#6F6253",
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
});
