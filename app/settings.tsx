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

import { logOut } from "../src/services/auth";
import { auth } from "../src/services/firebase";
import {
  getPrimaryBaby,
  updateBaby,
  type BabyProfile,
  type FeedingType,
  type LengthUnit,
  type Sex,
  type WeightUnit,
} from "../src/services/baby";

const settings = [
  "Reminder settings",
  "Data export placeholder",
  "Privacy and data controls",
];

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

const weightUnitOptions: { label: string; value: WeightUnit }[] = [
  { label: "kg", value: "kg" },
  { label: "lb", value: "lb" },
];

const lengthUnitOptions: { label: string; value: LengthUnit }[] = [
  { label: "cm", value: "cm" },
  { label: "in", value: "in" },
];

export default function Settings() {
  const router = useRouter();
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<Sex>("not-specified");
  const [feedingType, setFeedingType] = useState<FeedingType>("mixed");
  const [vaccineCountry, setVaccineCountry] = useState("Pakistan");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>("cm");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    loadBabyProfile();
  }, []);

  const loadBabyProfile = async () => {
    try {
      setLoadingProfile(true);
      setError("");

      const primaryBaby = await getPrimaryBaby();

      setBaby(primaryBaby);

      if (primaryBaby) {
        setName(primaryBaby.name);
        setDob(primaryBaby.dob);
        setSex(primaryBaby.sex ?? "not-specified");
        setFeedingType(primaryBaby.feedingType ?? "mixed");
        setVaccineCountry(primaryBaby.vaccineCountry ?? "Pakistan");
        setRemindersEnabled(primaryBaby.remindersEnabled ?? true);
        setWeightUnit(primaryBaby.weightUnit ?? "kg");
        setLengthUnit(primaryBaby.lengthUnit ?? "cm");
      }
    } catch (loadError) {
      console.log(loadError);
      setError("We could not load your baby profile.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!baby) {
      setProfileMessage("Add a baby profile before editing settings.");
      return;
    }

    if (!name.trim()) {
      setProfileMessage("Baby name is required.");
      return;
    }

    if (!isValidDate(dob.trim())) {
      setProfileMessage("Use a valid date in YYYY-MM-DD format.");
      return;
    }

    setSavingProfile(true);
    setProfileMessage("");

    try {
      await updateBaby(baby.id, {
        name: name.trim(),
        dob: dob.trim(),
        sex,
        feedingType,
        vaccineCountry: vaccineCountry.trim() || "Pakistan",
        remindersEnabled,
        weightUnit,
        lengthUnit,
      });

      setBaby({
        ...baby,
        name: name.trim(),
        dob: dob.trim(),
        sex,
        feedingType,
        vaccineCountry: vaccineCountry.trim() || "Pakistan",
        remindersEnabled,
        weightUnit,
        lengthUnit,
      });
      setProfileMessage("Baby profile updated.");
    } catch (saveError) {
      console.log(saveError);
      setProfileMessage(
        saveError instanceof Error
          ? saveError.message
          : "We could not update this profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    setSigningOut(true);
    setError("");

    try {
      await logOut();
      router.replace("/auth");
    } catch (logoutError) {
      console.log(logoutError);
      setError("We could not sign you out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Settings</Text>
      <Text style={styles.title}>Profile and preferences</Text>

      <View style={styles.accountCard}>
        <View style={styles.accountIcon}>
          <Ionicons name="person-outline" size={22} color="#9B6A43" />
        </View>
        <View style={styles.accountCopy}>
          <Text style={styles.accountLabel}>Signed in as</Text>
          <Text style={styles.accountEmail}>
            {auth.currentUser?.email ?? "Parent account"}
          </Text>
        </View>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>Baby profile</Text>
            <Text style={styles.sectionTitle}>Care basics</Text>
          </View>
          {loadingProfile ? <ActivityIndicator color="#9B6A43" /> : null}
        </View>

        {loadingProfile ? (
          <Text style={styles.helperText}>Loading baby profile...</Text>
        ) : baby ? (
          <>
            <SettingsInput
              label="Baby name"
              placeholder="e.g. Ayesha"
              value={name}
              onChangeText={setName}
            />
            <SettingsInput
              label="Date of birth / due date"
              placeholder="YYYY-MM-DD"
              value={dob}
              onChangeText={setDob}
            />

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

            <View style={styles.unitsGrid}>
              <View style={styles.unitGroup}>
                <OptionGroup
                  label="Weight unit"
                  options={weightUnitOptions}
                  value={weightUnit}
                  onChange={setWeightUnit}
                />
              </View>
              <View style={styles.unitGroup}>
                <OptionGroup
                  label="Length unit"
                  options={lengthUnitOptions}
                  value={lengthUnit}
                  onChange={setLengthUnit}
                />
              </View>
            </View>

            <SettingsInput
              label="Country for vaccine schedule"
              placeholder="e.g. Pakistan"
              value={vaccineCountry}
              onChangeText={setVaccineCountry}
            />

            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: remindersEnabled }}
              style={styles.reminderRow}
              onPress={() => setRemindersEnabled((value) => !value)}
            >
              <View style={styles.reminderCopy}>
                <Text style={styles.reminderTitle}>Gentle reminders</Text>
                <Text style={styles.helperText}>
                  Vaccine, feeding, growth, and milestone nudges
                </Text>
              </View>
              <Ionicons
                name={remindersEnabled ? "toggle" : "toggle-outline"}
                size={34}
                color={remindersEnabled ? "#6F8B63" : "#8B7258"}
              />
            </Pressable>

            {profileMessage ? (
              <Text
                style={[
                  styles.profileMessage,
                  profileMessage.includes("updated") && styles.successText,
                ]}
              >
                {profileMessage}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={savingProfile}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && !savingProfile && styles.buttonPressed,
                savingProfile && styles.buttonDisabled,
              ]}
              onPress={handleSaveProfile}
            >
              {savingProfile ? (
                <ActivityIndicator color="#FFF9F0" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#FFF9F0" />
                  <Text style={styles.saveButtonText}>Save profile</Text>
                </>
              )}
            </Pressable>
          </>
        ) : (
          <View>
            <Text style={styles.helperText}>
              No baby profile found. Create one to unlock personalized tracking.
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.saveButton}
              onPress={() => router.push("/onboarding")}
            >
              <Ionicons name="add" size={20} color="#FFF9F0" />
              <Text style={styles.saveButtonText}>Add baby profile</Text>
            </Pressable>
          </View>
        )}
      </View>

      {settings.map((setting) => (
        <View style={styles.card} key={setting}>
          <Ionicons name="settings-outline" size={21} color="#9B6A43" />
          <Text style={styles.cardText}>{setting}</Text>
        </View>
      ))}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={signingOut}
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && !signingOut && styles.buttonPressed,
          signingOut && styles.buttonDisabled,
        ]}
        onPress={handleLogout}
      >
        {signingOut ? (
          <ActivityIndicator color="#A84D3F" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={22} color="#A84D3F" />
            <Text style={styles.logoutText}>Log out</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

function SettingsInput({
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
        placeholder={placeholder}
        placeholderTextColor="#A8957D"
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
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

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
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
  accountCard: {
    minHeight: 74,
    backgroundColor: "#F5F0E2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9C5A8",
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 18,
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EADBC8",
    borderWidth: 1,
    borderColor: "#D9C5A8",
    alignItems: "center",
    justifyContent: "center",
  },
  accountCopy: {
    flex: 1,
  },
  accountLabel: {
    color: "#8B7258",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  accountEmail: {
    color: "#3A332A",
    fontSize: 16,
    fontWeight: "800",
  },
  profileCard: {
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    padding: 18,
    gap: 16,
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  sectionKicker: {
    color: "#8B7258",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: "#3A332A",
    fontSize: 20,
    fontWeight: "800",
  },
  inputGroup: { gap: 8 },
  label: {
    color: "#514739",
    fontSize: 14,
    fontWeight: "700",
  },
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
    backgroundColor: "#FBF4EA",
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
  unitsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  unitGroup: {
    flex: 1,
  },
  reminderRow: {
    minHeight: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    backgroundColor: "#FBF4EA",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  reminderCopy: { flex: 1 },
  reminderTitle: {
    color: "#3A332A",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 3,
  },
  helperText: {
    color: "#6F6253",
    lineHeight: 20,
    fontWeight: "600",
  },
  profileMessage: {
    color: "#A84D3F",
    fontWeight: "700",
    lineHeight: 20,
  },
  successText: {
    color: "#6F8B63",
  },
  saveButton: {
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: "#9B6A43",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveButtonText: {
    color: "#FFF9F0",
    fontSize: 16,
    fontWeight: "800",
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
  errorText: {
    color: "#A84D3F",
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 10,
  },
  logoutButton: {
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDB8AA",
    backgroundColor: "#FFF9F0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 22,
  },
  logoutText: {
    color: "#A84D3F",
    fontSize: 16,
    fontWeight: "800",
  },
  buttonPressed: {
    transform: [{ translateY: 1 }],
  },
  buttonDisabled: {
    opacity: 0.72,
  },
});
