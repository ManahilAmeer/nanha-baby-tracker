import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { addBaby, type FeedingType, type Sex } from "@/src/services/baby";

const sexOptions: { label: string; value: Sex }[] = [
  { label: "Girl", value: "girl" },
  { label: "Boy", value: "boy" },
  { label: "Skip", value: "not-specified" },
];

const feedingOptions: { label: string; value: FeedingType }[] = [
  { label: "Breast", value: "breast" },
  { label: "Formula", value: "formula" },
  { label: "Mixed", value: "mixed" },
  { label: "Solids", value: "solids" },
];

export default function Onboarding() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<Sex>("not-specified");
  const [feedingType, setFeedingType] = useState<FeedingType>("mixed");
  const [vaccineCountry, setVaccineCountry] = useState("Pakistan");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async (skipReminders = false) => {
    if (!name.trim() || !dob.trim()) {
      setError("Please add your baby's name and date of birth or due date.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await addBaby({
        name: name.trim(),
        dob: dob.trim(),
        sex,
        feedingType,
        vaccineCountry: vaccineCountry.trim(),
        remindersEnabled: skipReminders ? false : remindersEnabled,
      });

      router.replace("/");
    } catch (error) {
      console.log(error);
      setError(
        error instanceof Error
          ? error.message
          : "We could not save this profile. Please try again."
      );
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconBadge}>
          <Ionicons name="flower-outline" size={30} color="#9B6A43" />
        </View>

        <Text style={styles.kicker}>Baby profile</Text>
        <Text style={styles.title}>A tiny profile for tiny days</Text>
        <Text style={styles.subtitle}>
          Set up the basics once, then the app can shape trackers, reminders,
          and care guidance around your baby.
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Baby name</Text>
            <TextInput
              placeholder="e.g. Ayesha"
              placeholderTextColor="#A49B8F"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of birth / due date</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A49B8F"
              value={dob}
              onChangeText={setDob}
              style={styles.input}
            />
          </View>

          <OptionGroup
            label="Sex"
            options={sexOptions}
            value={sex}
            onChange={setSex}
          />

          <OptionGroup
            label="Feeding type"
            options={feedingOptions}
            value={feedingType}
            onChange={setFeedingType}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Country for vaccine schedule</Text>
            <TextInput
              placeholder="e.g. Pakistan"
              placeholderTextColor="#A49B8F"
              value={vaccineCountry}
              onChangeText={setVaccineCountry}
              style={styles.input}
            />
          </View>

          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: remindersEnabled }}
            style={styles.reminderRow}
            onPress={() => setRemindersEnabled((value) => !value)}
          >
            <View>
              <Text style={styles.reminderTitle}>Gentle reminders</Text>
              <Text style={styles.reminderCopy}>
                Vaccine, feeding, tummy time, growth, and milestones
              </Text>
            </View>
            <Ionicons
              name={remindersEnabled ? "toggle" : "toggle-outline"}
              size={34}
              color={remindersEnabled ? "#6F8B63" : "#8B7258"}
            />
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              pressed && !loading && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={() => handleStart(false)}
          >
            {loading ? (
              <ActivityIndicator color="#FFF9F0" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFF9F0" />
                <Text style={styles.buttonText}>Create baby profile</Text>
              </>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            style={styles.secondaryButton}
            onPress={() => handleStart(true)}
          >
            <Text style={styles.secondaryButtonText}>Skip reminders for now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              accessibilityRole="button"
              key={option.value}
              style={[styles.chip, selected && styles.selectedChip]}
              onPress={() => onChange(option.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  selected && styles.selectedChipText,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: "#FBF4EA",
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 52,
    paddingBottom: 32,
    backgroundColor: "#FBF4EA",
  },
  iconBadge: {
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
    marginBottom: 10,
    fontWeight: "800",
    color: "#3A332A",
  },
  subtitle: {
    color: "#6F6253",
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 28,
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
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    backgroundColor: "#FFF9F0",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedChip: {
    backgroundColor: "#6F8B63",
    borderColor: "#6F8B63",
  },
  chipText: {
    color: "#6F6253",
    fontWeight: "800",
  },
  selectedChipText: {
    color: "#FFF9F0",
  },
  reminderRow: {
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  reminderTitle: {
    color: "#3A332A",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  reminderCopy: {
    color: "#6F6253",
    lineHeight: 20,
  },
  errorText: {
    color: "#A84D3F",
    fontWeight: "600",
    lineHeight: 20,
  },
  button: {
    minHeight: 54,
    backgroundColor: "#9B6A43",
    borderRadius: 8,
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
  secondaryButton: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D9C5A8",
  },
  secondaryButtonText: {
    color: "#8B7258",
    fontSize: 15,
    fontWeight: "800",
  },
});
