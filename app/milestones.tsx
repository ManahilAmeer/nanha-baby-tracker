import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { milestoneItems } from "../src/data/milestones";
import { getPrimaryBaby, type BabyProfile } from "../src/services/baby";
import {
  getMilestoneCompletions,
  setMilestoneCompletion,
  type MilestoneCompletionMap,
} from "../src/services/milestones";

export default function Milestones() {
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [completed, setCompleted] = useState<MilestoneCompletionMap>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMilestones();
  }, []);

  const monthItems = useMemo(
    () => milestoneItems.filter((item) => item.month === selectedMonth),
    [selectedMonth]
  );

  const completedCount = monthItems.filter((item) => completed[item.id]).length;

  const loadMilestones = async () => {
    try {
      setLoading(true);
      setMessage("");
      const primaryBaby = await getPrimaryBaby();

      setBaby(primaryBaby);

      if (primaryBaby) {
        setSelectedMonth(getBabyAgeMonth(primaryBaby.dob));
        setCompleted(await getMilestoneCompletions(primaryBaby.id));
      }
    } catch (error) {
      console.log(error);
      setMessage("We could not load milestones.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (milestoneId: string) => {
    if (!baby) {
      setMessage("Add a baby profile before tracking milestones.");
      return;
    }

    const nextValue = !completed[milestoneId];

    setSavingId(milestoneId);
    setCompleted((current) => ({
      ...current,
      [milestoneId]: nextValue,
    }));

    try {
      await setMilestoneCompletion(baby.id, milestoneId, nextValue);
    } catch (error) {
      console.log(error);
      setCompleted((current) => ({
        ...current,
        [milestoneId]: !nextValue,
      }));
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not update this milestone."
      );
    } finally {
      setSavingId("");
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.kicker}>Milestones</Text>
      <Text style={styles.title}>Gentle monthly checklist</Text>
      <Text style={styles.subtitle}>
        Track what baby is practicing now. If something feels delayed, consider
        discussing this with your pediatrician.
      </Text>

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#9B6A43" />
          <Text style={styles.stateText}>Loading milestones...</Text>
        </View>
      ) : (
        <>
          <View style={styles.monthCard}>
            <View>
              <Text style={styles.monthLabel}>Current checklist</Text>
              <Text style={styles.monthTitle}>Month {selectedMonth}</Text>
              <Text style={styles.monthCopy}>
                {completedCount} of {monthItems.length} completed
              </Text>
            </View>
            <Ionicons name="sparkles-outline" size={26} color="#6F8B63" />
          </View>

          <View style={styles.monthSelector}>
            {[1, 2, 3, 4, 5, 6].map((month) => {
              const selected = month === selectedMonth;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={month}
                  style={[
                    styles.monthButton,
                    selected && styles.selectedMonthButton,
                  ]}
                  onPress={() => setSelectedMonth(month)}
                >
                  <Text
                    style={[
                      styles.monthButtonText,
                      selected && styles.selectedMonthButtonText,
                    ]}
                  >
                    {month}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {message ? <Text style={styles.messageText}>{message}</Text> : null}

          {monthItems.map((item) => {
            const isCompleted = Boolean(completed[item.id]);
            const isSaving = savingId === item.id;

            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isCompleted }}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.card,
                  isCompleted && styles.completedCard,
                  pressed && !isSaving && styles.cardPressed,
                ]}
                key={item.id}
                onPress={() => handleToggle(item.id)}
              >
                <View
                  style={[
                    styles.checkIcon,
                    isCompleted && styles.completedCheckIcon,
                  ]}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFF9F0" />
                  ) : (
                    <Ionicons
                      name={isCompleted ? "checkmark" : "ellipse-outline"}
                      size={22}
                      color={isCompleted ? "#FFF9F0" : "#9B6A43"}
                    />
                  )}
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardCategory}>{item.category}</Text>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardText}>{item.guidance}</Text>
                </View>
              </Pressable>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

function getBabyAgeMonth(dob: string) {
  const birthDate = new Date(dob);

  if (Number.isNaN(birthDate.getTime())) {
    return 1;
  }

  const days = Math.max(
    0,
    Math.floor((Date.now() - birthDate.getTime()) / 86400000)
  );

  return Math.min(6, Math.max(1, Math.floor(days / 30.44) + 1));
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
  monthCard: {
    backgroundColor: "#F5F0E2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9C5A8",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  monthLabel: {
    color: "#8B7258",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  monthTitle: { color: "#3A332A", fontSize: 24, fontWeight: "800" },
  monthCopy: { color: "#6F6253", fontWeight: "700", marginTop: 4 },
  monthSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  monthButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    backgroundColor: "#FFF9F0",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedMonthButton: {
    backgroundColor: "#6F8B63",
    borderColor: "#6F8B63",
  },
  monthButtonText: { color: "#6F6253", fontWeight: "800" },
  selectedMonthButtonText: { color: "#FFF9F0" },
  card: {
    minHeight: 104,
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
  completedCard: {
    backgroundColor: "#F5F0E2",
    borderColor: "#9DB18F",
  },
  cardPressed: { transform: [{ translateY: 1 }] },
  checkIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EADBC8",
    alignItems: "center",
    justifyContent: "center",
  },
  completedCheckIcon: {
    backgroundColor: "#6F8B63",
  },
  cardCopy: { flex: 1 },
  cardCategory: {
    color: "#8B7258",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cardTitle: { color: "#3A332A", fontSize: 17, fontWeight: "800" },
  cardText: {
    color: "#6F6253",
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 5,
  },
  messageText: {
    color: "#A84D3F",
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 12,
  },
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
