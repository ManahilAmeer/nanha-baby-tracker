import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { getPrimaryBaby, type BabyProfile } from "../src/services/baby";
import {
  getReminders,
  saveReminder,
  type Reminder,
} from "../src/services/reminders";
import { getVaccineScheduleReminders } from "../src/services/vaccineSchedule";
import { syncReminderNotifications } from "../src/services/notifications";

export default function Reminders() {
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      setMessage("");
      setNotificationMessage("");
      const primaryBaby = await getPrimaryBaby();

      setBaby(primaryBaby);

      if (primaryBaby) {
        const [savedReminders, scheduleReminders] = await Promise.all([
          getReminders(primaryBaby.id),
          getVaccineScheduleReminders(primaryBaby),
        ]);
        const savedSourceIds = new Set(
          savedReminders
            .map((reminder) => reminder.sourceId)
            .filter((sourceId): sourceId is string => Boolean(sourceId))
        );
        const activeScheduleReminders = scheduleReminders.filter(
          (reminder) =>
            !reminder.sourceId || !savedSourceIds.has(reminder.sourceId)
        );

        const loadedReminders = [...activeScheduleReminders, ...savedReminders];
        const syncResult = await syncReminderNotifications(loadedReminders);

        setReminders(loadedReminders);
        setNotificationMessage(getNotificationMessage(syncResult));
      }
    } catch (error) {
      console.log(error);
      setMessage("We could not load reminders.");
    } finally {
      setLoading(false);
    }
  };

  const updateReminder = async (
    reminder: Reminder,
    updates: Partial<Pick<Reminder, "enabled" | "completed">>
  ) => {
    if (!baby) {
      setMessage("Add a baby profile before managing reminders.");
      return;
    }

    const nextReminder = {
      ...reminder,
      ...updates,
    };
    const updatedReminders = reminders.map((item) =>
      item.id === reminder.id ? nextReminder : item
    );

    setSavingId(reminder.id);
    setReminders(updatedReminders);

    try {
      await saveReminder(nextReminder);
      const syncResult = await syncReminderNotifications(updatedReminders);

      setNotificationMessage(getNotificationMessage(syncResult));
    } catch (error) {
      console.log(error);
      setReminders((current) =>
        current.map((item) => (item.id === reminder.id ? reminder : item))
      );
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not update this reminder."
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
      <Text style={styles.kicker}>Reminders</Text>
      <Text style={styles.title}>Gentle care nudges</Text>
      <Text style={styles.subtitle}>
        Turn reminders on or off and mark care tasks completed. Device
        notifications can use this setup next.
      </Text>

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#9B6A43" />
          <Text style={styles.stateText}>Loading reminders...</Text>
        </View>
      ) : (
        <>
          {message ? <Text style={styles.messageText}>{message}</Text> : null}
          {notificationMessage ? (
            <Text style={styles.notificationText}>{notificationMessage}</Text>
          ) : null}

          {reminders.map((reminder) => {
            const isSaving = savingId === reminder.id;

            return (
              <View style={styles.card} key={reminder.id}>
                <View style={styles.cardIcon}>
                  {isSaving ? (
                    <ActivityIndicator color="#9B6A43" />
                  ) : (
                    <Ionicons
                      name={
                        reminder.completed
                          ? "checkmark-circle-outline"
                          : "notifications-outline"
                      }
                      size={24}
                      color={reminder.completed ? "#6F8B63" : "#9B6A43"}
                    />
                  )}
                </View>

                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{reminder.title}</Text>
                  <Text style={styles.cardText}>{reminder.timing}</Text>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: reminder.enabled }}
                    disabled={isSaving}
                    onPress={() =>
                      updateReminder(reminder, {
                        enabled: !reminder.enabled,
                      })
                    }
                  >
                    <Ionicons
                      name={reminder.enabled ? "toggle" : "toggle-outline"}
                      size={34}
                      color={reminder.enabled ? "#6F8B63" : "#8B7258"}
                    />
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    disabled={isSaving}
                    style={[
                      styles.completeButton,
                      reminder.completed && styles.completedButton,
                    ]}
                    onPress={() =>
                      updateReminder(reminder, {
                        completed: !reminder.completed,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.completeButtonText,
                        reminder.completed && styles.completedButtonText,
                      ]}
                    >
                      {reminder.completed ? "Done" : "Mark"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

function getNotificationMessage({
  scheduled,
  permissionStatus,
}: Awaited<ReturnType<typeof syncReminderNotifications>>) {
  if (permissionStatus === "unsupported") {
    return "Phone notifications are available on iOS and Android builds.";
  }

  if (permissionStatus === "denied") {
    return "Notification permission is off. Reminders are saved in the app only.";
  }

  if (scheduled === 0) {
    return "No dated phone notifications are scheduled right now.";
  }

  return `${scheduled} phone notification${scheduled === 1 ? "" : "s"} scheduled.`;
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
    minHeight: 92,
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
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EADBC8",
    alignItems: "center",
    justifyContent: "center",
  },
  cardCopy: { flex: 1 },
  cardTitle: { color: "#3A332A", fontSize: 16, fontWeight: "800" },
  cardText: { color: "#6F6253", fontWeight: "600", marginTop: 4 },
  actions: {
    alignItems: "center",
    gap: 8,
  },
  completeButton: {
    minHeight: 34,
    minWidth: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9C5A8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  completedButton: {
    backgroundColor: "#6F8B63",
    borderColor: "#6F8B63",
  },
  completeButtonText: {
    color: "#8B7258",
    fontWeight: "800",
  },
  completedButtonText: {
    color: "#FFF9F0",
  },
  messageText: {
    color: "#A84D3F",
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationText: {
    color: "#6F6253",
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
