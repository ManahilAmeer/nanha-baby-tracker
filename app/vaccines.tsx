import { useEffect, useMemo, useState } from "react";
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

import { getPrimaryBaby, type BabyProfile } from "../src/services/baby";
import {
  addVaccineRecord,
  getVaccineRecords,
  markVaccineCompleted,
  type VaccineRecord,
} from "../src/services/vaccines";

export default function VaccinesScreen() {
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [records, setRecords] = useState<VaccineRecord[]>([]);
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [completedDate, setCompletedDate] = useState("");
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadVaccines();
  }, []);

  const upcomingRecords = useMemo(
    () => records.filter((record) => !record.completedDate),
    [records]
  );

  const completedRecords = useMemo(
    () => records.filter((record) => record.completedDate),
    [records]
  );

  const loadVaccines = async () => {
    try {
      setLoading(true);
      setMessage("");
      const primaryBaby = await getPrimaryBaby();

      setBaby(primaryBaby);

      if (primaryBaby) {
        setRecords(await getVaccineRecords(primaryBaby.id));
      }
    } catch (error) {
      console.log(error);
      setMessage("We could not load vaccine records.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!baby) {
      setMessage("Add a baby profile before adding vaccines.");
      return;
    }

    if (!name.trim() || !dueDate.trim()) {
      setMessage("Add vaccine name and due date.");
      return;
    }

    if (isAlreadyCompleted && !completedDate.trim()) {
      setMessage("Add completed date or turn off completed status.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await addVaccineRecord({
        babyId: baby.id,
        name: name.trim(),
        dueDate: dueDate.trim(),
        completedDate: isAlreadyCompleted ? completedDate.trim() : undefined,
        source: "manual",
      });

      setName("");
      setDueDate("");
      setCompletedDate("");
      setIsAlreadyCompleted(false);
      setRecords(await getVaccineRecords(baby.id));
      setMessage("Vaccine record saved.");
    } catch (error) {
      console.log(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not save this vaccine record."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleMarkCompleted = async (record: VaccineRecord) => {
    if (!baby) return;

    setSavingId(record.id);
    setMessage("");

    try {
      await markVaccineCompleted(record);
      setRecords(await getVaccineRecords(baby.id));
    } catch (error) {
      console.log(error);
      setMessage("We could not mark this vaccine completed.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.kicker}>Vaccines</Text>
      <Text style={styles.title}>Vaccination card and reminders</Text>
      <Text style={styles.subtitle}>
        Add vaccine records manually now. Card scan and OCR review will build
        on this same record list.
      </Text>

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#9B6A43" />
          <Text style={styles.stateText}>Loading vaccine records...</Text>
        </View>
      ) : (
        <>
          <View style={styles.privacyCard}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#6F8B63" />
            <View style={styles.privacyCopy}>
              <Text style={styles.privacyTitle}>Card scan coming next</Text>
              <Text style={styles.privacyText}>
                Vaccination cards can include sensitive health information. The
                app will ask you to review extracted dates before saving.
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add vaccine record</Text>

            <VaccineInput
              label="Vaccine name"
              placeholder="e.g. BCG, OPV, Hepatitis B"
              value={name}
              onChangeText={setName}
            />
            <VaccineInput
              label="Due date"
              placeholder="YYYY-MM-DD"
              value={dueDate}
              onChangeText={setDueDate}
            />
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isAlreadyCompleted }}
              style={styles.completedToggle}
              onPress={() => {
                setIsAlreadyCompleted((value) => !value);
                setCompletedDate("");
              }}
            >
              <Ionicons
                name={isAlreadyCompleted ? "checkmark-circle" : "ellipse-outline"}
                size={23}
                color={isAlreadyCompleted ? "#6F8B63" : "#9B6A43"}
              />
              <Text style={styles.completedToggleText}>
                This vaccine is already completed
              </Text>
            </Pressable>
            {isAlreadyCompleted ? (
              <VaccineInput
                label="Completed date"
                placeholder="YYYY-MM-DD"
                value={completedDate}
                onChangeText={setCompletedDate}
              />
            ) : null}

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
                  <Text style={styles.buttonText}>Save vaccine</Text>
                </>
              )}
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Upcoming</Text>
          {upcomingRecords.length ? (
            upcomingRecords.map((record) => (
              <VaccineRow
                key={record.id}
                record={record}
                saving={savingId === record.id}
                onMarkCompleted={() => handleMarkCompleted(record)}
              />
            ))
          ) : (
            <EmptyState text="No upcoming vaccine records yet." />
          )}

          <Text style={styles.sectionTitle}>Completed</Text>
          {completedRecords.length ? (
            completedRecords.map((record) => (
              <VaccineRow key={record.id} record={record} />
            ))
          ) : (
            <EmptyState text="No completed vaccine records yet." />
          )}
        </>
      )}
    </ScrollView>
  );
}

function VaccineInput({
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

function VaccineRow({
  record,
  saving = false,
  onMarkCompleted,
}: {
  record: VaccineRecord;
  saving?: boolean;
  onMarkCompleted?: () => void;
}) {
  return (
    <View style={styles.recordCard}>
      <View style={styles.recordIcon}>
        {saving ? (
          <ActivityIndicator color="#9B6A43" />
        ) : (
          <Ionicons
            name={record.completedDate ? "checkmark-circle-outline" : "medical-outline"}
            size={24}
            color={record.completedDate ? "#6F8B63" : "#9B6A43"}
          />
        )}
      </View>
      <View style={styles.recordCopy}>
        <Text style={styles.recordTitle}>{record.name}</Text>
        <Text style={styles.recordText}>Due: {record.dueDate}</Text>
        {record.completedDate ? (
          <Text style={styles.recordText}>Completed: {record.completedDate}</Text>
        ) : null}
      </View>
      {onMarkCompleted ? (
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          style={styles.markButton}
          onPress={onMarkCompleted}
        >
          <Text style={styles.markButtonText}>Done</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.stateCard}>
      <Ionicons name="medical-outline" size={26} color="#9B6A43" />
      <Text style={styles.stateText}>{text}</Text>
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
  privacyCard: {
    backgroundColor: "#F5F0E2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9C5A8",
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  privacyCopy: { flex: 1 },
  privacyTitle: { color: "#3A332A", fontSize: 16, fontWeight: "800" },
  privacyText: { color: "#6F6253", lineHeight: 20, marginTop: 5 },
  formCard: {
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    padding: 18,
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
  completedToggle: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    backgroundColor: "#FBF4EA",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  completedToggleText: {
    color: "#3A332A",
    fontWeight: "800",
    flex: 1,
  },
  messageText: { color: "#A84D3F", fontWeight: "700", lineHeight: 20 },
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
  recordCard: {
    minHeight: 82,
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EADBC8",
    alignItems: "center",
    justifyContent: "center",
  },
  recordCopy: { flex: 1 },
  recordTitle: { color: "#3A332A", fontSize: 16, fontWeight: "800" },
  recordText: { color: "#6F6253", fontWeight: "600", marginTop: 4 },
  markButton: {
    minHeight: 36,
    borderRadius: 8,
    backgroundColor: "#6F8B63",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  markButtonText: { color: "#FFF9F0", fontWeight: "800" },
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
