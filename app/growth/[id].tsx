import { useCallback, useEffect, useState } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  getPrimaryBaby,
  type BabyProfile,
} from "../../src/services/baby";
import {
  deleteGrowthEntry,
  getGrowthEntryById,
  updateGrowthEntry,
  type GrowthEntry,
} from "../../src/services/growth";
import {
  formatUnitValue,
  toDisplayLength,
  toDisplayWeight,
  toStoredLength,
  toStoredWeight,
} from "../../src/utils/units";

export default function GrowthEntryDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [entry, setEntry] = useState<GrowthEntry | null>(null);
  const [measuredAt, setMeasuredAt] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [headCm, setHeadCm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const weightUnit = baby?.weightUnit ?? "kg";
  const lengthUnit = baby?.lengthUnit ?? "cm";

  const loadEntry = useCallback(async () => {
    if (!id) {
      setError("Growth entry ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const [primaryBaby, growthEntry] = await Promise.all([
        getPrimaryBaby(),
        getGrowthEntryById(id),
      ]);

      if (!growthEntry) {
        setError("This growth entry was not found.");
        return;
      }

      setBaby(primaryBaby);
      setEntry(growthEntry);
      setMeasuredAt(growthEntry.measuredAt);
      setWeightKg(
        formatInputValue(
          growthEntry.weightKg,
          (value) => toDisplayWeight(value, primaryBaby?.weightUnit ?? "kg")
        )
      );
      setHeightCm(
        formatInputValue(
          growthEntry.heightCm,
          (value) => toDisplayLength(value, primaryBaby?.lengthUnit ?? "cm")
        )
      );
      setHeadCm(
        formatInputValue(
          growthEntry.headCm,
          (value) => toDisplayLength(value, primaryBaby?.lengthUnit ?? "cm")
        )
      );
    } catch (loadError) {
      console.log(loadError);
      setError("We could not load this growth entry.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  const handleSave = async () => {
    if (!id) return;

    if (!weightKg.trim() && !heightCm.trim() && !headCm.trim()) {
      setError("Add at least one measurement.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await updateGrowthEntry(id, {
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
      router.replace("/growth");
    } catch (saveError) {
      console.log(saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "We could not save this growth entry."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      setDeleting(true);
      setError("");
      await deleteGrowthEntry(id);
      router.replace("/growth");
    } catch (deleteError) {
      console.log(deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "We could not delete this growth entry."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={20} color="#9B6A43" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <Text style={styles.kicker}>Growth entry</Text>
      <Text style={styles.title}>Edit measurements</Text>

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#9B6A43" />
          <Text style={styles.stateText}>Loading growth entry...</Text>
        </View>
      ) : error && !entry ? (
        <View style={styles.stateCard}>
          <Ionicons name="alert-circle-outline" size={30} color="#A84D3F" />
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : (
        <>
          <View style={styles.formCard}>
            <GrowthInput
              label="Measurement date"
              placeholder="YYYY-MM-DD"
              value={measuredAt}
              onChangeText={setMeasuredAt}
            />
            <GrowthInput
              label="Weight"
              placeholder={weightUnit}
              value={weightKg}
              onChangeText={setWeightKg}
            />
            <GrowthInput
              label="Height"
              placeholder={lengthUnit}
              value={heightCm}
              onChangeText={setHeightCm}
            />
            <GrowthInput
              label="Head circumference"
              placeholder={lengthUnit}
              value={headCm}
              onChangeText={setHeadCm}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={saving || deleting}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && !saving && !deleting && styles.buttonPressed,
              (saving || deleting) && styles.buttonDisabled,
            ]}
            onPress={handleSave}
          >
            {saving ? (
              <ActivityIndicator color="#FFF9F0" />
            ) : (
              <>
                <Ionicons name="checkmark" size={22} color="#FFF9F0" />
                <Text style={styles.saveText}>Save changes</Text>
              </>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={saving || deleting}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && !saving && !deleting && styles.buttonPressed,
              (saving || deleting) && styles.buttonDisabled,
            ]}
            onPress={handleDelete}
          >
            {deleting ? (
              <ActivityIndicator color="#A84D3F" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={22} color="#A84D3F" />
                <Text style={styles.deleteText}>Delete entry</Text>
              </>
            )}
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

function GrowthInput({
  label,
  placeholder,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardType={placeholder === "YYYY-MM-DD" ? "default" : "decimal-pad"}
        placeholder={placeholder}
        placeholderTextColor="#A8957D"
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
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

function formatInputValue(
  value: number | undefined,
  transform: (value: number) => number = (numberValue) => numberValue
) {
  return typeof value === "number" ? formatUnitValue(transform(value)) : "";
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FBF4EA" },
  container: { padding: 24, paddingTop: 58, paddingBottom: 32 },
  backButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    paddingRight: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 18,
  },
  backText: { color: "#9B6A43", fontWeight: "800" },
  kicker: {
    color: "#8B7258",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    color: "#3A332A",
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "800",
    marginBottom: 22,
  },
  formCard: {
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    padding: 18,
    gap: 16,
  },
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
  errorText: {
    color: "#A84D3F",
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 14,
  },
  saveButton: {
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: "#9B6A43",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  saveText: { color: "#FFF9F0", fontSize: 16, fontWeight: "800" },
  deleteButton: {
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDB8AA",
    backgroundColor: "#FFF9F0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  deleteText: { color: "#A84D3F", fontSize: 16, fontWeight: "800" },
  buttonPressed: { transform: [{ translateY: 1 }] },
  buttonDisabled: { opacity: 0.72 },
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
