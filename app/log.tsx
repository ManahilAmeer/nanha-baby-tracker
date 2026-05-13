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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { addActivity, type ActivityType } from "../src/services/activities";
import { getPrimaryBaby, type BabyProfile } from "../src/services/baby";

const activityTypes: {
  icon: keyof typeof Ionicons.glyphMap;
  type: ActivityType;
  title: string;
  subtitle: string;
}[] = [
  {
    icon: "water-outline",
    type: "feed",
    title: "Feed",
    subtitle: "Milk, formula, or solids",
  },
  {
    icon: "invert-mode-outline",
    type: "diaper",
    title: "Diaper",
    subtitle: "Wet, dirty, or both",
  },
  {
    icon: "moon-outline",
    type: "sleep",
    title: "Sleep",
    subtitle: "Nap and bedtime sessions",
  },
  {
    icon: "timer-outline",
    type: "tummy",
    title: "Tummy Time",
    subtitle: "Timer or manual entry",
  },
];

const diaperOptions = ["Wet", "Dirty", "Both"];
const feedTypes = ["Breast", "Formula", "Solid"];
const sleepTypes = ["Day nap", "Night sleep"];

function getDefaultDetail(activityType: ActivityType) {
  if (activityType === "feed") return "Breast";
  if (activityType === "diaper") return "Wet";
  if (activityType === "sleep") return "Day nap";
  return "";
}

export default function LogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: ActivityType }>();
  const initialType = params.type ?? "feed";

  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [type, setType] = useState<ActivityType>(initialType);
  const [detail, setDetail] = useState(getDefaultDetail(initialType));
  const [secondaryDetail, setSecondaryDetail] = useState("");
  const [notes, setNotes] = useState("");
  const [sleepStartedAt, setSleepStartedAt] = useState<Date | null>(null);
  const [tummyStartedAt, setTummyStartedAt] = useState<Date | null>(null);
  const [timerNow, setTimerNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadBaby();
  }, []);

  useEffect(() => {
    if (!sleepStartedAt && !tummyStartedAt) return;

    const interval = setInterval(() => {
      setTimerNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepStartedAt, tummyStartedAt]);

  const selectedActivity = useMemo(
    () => activityTypes.find((activity) => activity.type === type),
    [type]
  );

  const elapsedSleepMinutes = useMemo(() => {
    if (!sleepStartedAt) return 0;

    return Math.max(
      1,
      Math.ceil((timerNow.getTime() - sleepStartedAt.getTime()) / 60000)
    );
  }, [sleepStartedAt, timerNow]);

  const elapsedTummyMinutes = useMemo(() => {
    if (!tummyStartedAt) return 0;

    return Math.max(
      1,
      Math.ceil((timerNow.getTime() - tummyStartedAt.getTime()) / 60000)
    );
  }, [tummyStartedAt, timerNow]);

  const loadBaby = async () => {
    try {
      setLoading(true);
      setBaby(await getPrimaryBaby());
    } catch (error) {
      console.log(error);
      setMessage("We could not load your baby profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectType = (nextType: ActivityType) => {
    setType(nextType);
    setDetail(getDefaultDetail(nextType));
    setSecondaryDetail("");
    setSleepStartedAt(null);
    setTummyStartedAt(null);
    setMessage("");
  };

  const handleSave = async () => {
    if (!baby) {
      setMessage("Add a baby profile before logging activity.");
      return;
    }

    if (type === "sleep" || type === "tummy") {
      const minutes = Number.parseInt(secondaryDetail, 10);

      if (!secondaryDetail.trim() || Number.isNaN(minutes) || minutes <= 0) {
        setMessage(
          type === "sleep"
            ? "Add sleep duration in minutes."
            : "Add tummy time duration in minutes."
        );
        return;
      }
    }

    setSaving(true);
    setMessage("");

    try {
      await addActivity({
        babyId: baby.id,
        type,
        detail: getActivityDetailForSave(type, detail, secondaryDetail),
        notes: notes.trim(),
        metadata: getActivityMetadataForSave(type, detail, secondaryDetail),
      });

      setDetail(type === "diaper" ? "Wet" : type === "feed" ? "Breast" : "");
      setSecondaryDetail("");
      setSleepStartedAt(null);
      setTummyStartedAt(null);
      setNotes("");
      router.replace("/");
    } catch (error) {
      console.log(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not save this activity. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStartSleepTimer = () => {
    setSleepStartedAt(new Date());
    setTummyStartedAt(null);
    setTimerNow(new Date());
    setSecondaryDetail("");
    setMessage("");
  };

  const handleStopSleepTimer = async () => {
    if (!baby || !sleepStartedAt) return;

    const endedAt = new Date();
    const durationMinutes = Math.max(
      1,
      Math.ceil((endedAt.getTime() - sleepStartedAt.getTime()) / 60000)
    );

    setSaving(true);
    setMessage("");

    try {
      await addActivity({
        babyId: baby.id,
        type: "sleep",
        detail: String(durationMinutes),
        notes: notes.trim(),
        startedAt: sleepStartedAt,
        endedAt,
        metadata: {
          sleepType: detail,
          durationMinutes,
        },
      });

      setSleepStartedAt(null);
      setSecondaryDetail("");
      setNotes("");
      router.replace("/");
    } catch (error) {
      console.log(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not save this sleep session."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStartTummyTimer = () => {
    setTummyStartedAt(new Date());
    setSleepStartedAt(null);
    setTimerNow(new Date());
    setSecondaryDetail("");
    setMessage("");
  };

  const handleStopTummyTimer = async () => {
    if (!baby || !tummyStartedAt) return;

    const endedAt = new Date();
    const durationMinutes = Math.max(
      1,
      Math.ceil((endedAt.getTime() - tummyStartedAt.getTime()) / 60000)
    );

    setSaving(true);
    setMessage("");

    try {
      await addActivity({
        babyId: baby.id,
        type: "tummy",
        detail: String(durationMinutes),
        notes: notes.trim(),
        startedAt: tummyStartedAt,
        endedAt,
        metadata: {
          durationMinutes,
        },
      });

      setTummyStartedAt(null);
      setSecondaryDetail("");
      setNotes("");
      router.replace("/");
    } catch (error) {
      console.log(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not save this tummy time session."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>Daily tracker</Text>
        <Text style={styles.title}>What are we noting down?</Text>
        {baby ? <Text style={styles.subtitle}>For {baby.name}</Text> : null}
      </View>

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#9B6A43" />
          <Text style={styles.stateText}>Loading baby profile...</Text>
        </View>
      ) : (
        <>
          <View style={styles.list}>
            {activityTypes.map((activity) => {
              const isSelected = activity.type === type;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={activity.type}
                  style={({ pressed }) => [
                    styles.card,
                    isSelected && styles.selectedCard,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() => handleSelectType(activity.type)}
                >
                  <View
                    style={[
                      styles.cardIcon,
                      isSelected && styles.selectedCardIcon,
                    ]}
                  >
                    <Ionicons
                      name={activity.icon}
                      size={24}
                      color={isSelected ? "#FFF9F0" : "#9B6A43"}
                    />
                  </View>
                  <View style={styles.cardCopy}>
                    <Text style={styles.cardTitle}>{activity.title}</Text>
                    <Text style={styles.cardSubtitle}>{activity.subtitle}</Text>
                  </View>
                  <MaterialCommunityIcons
                    name={isSelected ? "check-circle" : "circle-outline"}
                    size={24}
                    color={isSelected ? "#6F8B63" : "#8B7258"}
                  />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{selectedActivity?.title} details</Text>

            {type === "feed" ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.optionRow}>
                  {feedTypes.map((option) => {
                    const isSelected = detail === option;

                    return (
                      <Pressable
                        accessibilityRole="button"
                        key={option}
                        style={[
                          styles.optionButton,
                          isSelected && styles.selectedOptionButton,
                        ]}
                        onPress={() => setDetail(option)}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            isSelected && styles.selectedOptionButtonText,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.label}>Amount / side</Text>
                <TextInput
                  placeholder="e.g. 90 ml, left side, right side"
                  placeholderTextColor="#A8957D"
                  value={secondaryDetail}
                  onChangeText={setSecondaryDetail}
                  style={styles.input}
                />
              </View>
            ) : null}

            {type === "diaper" ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Diaper type</Text>
                <View style={styles.optionRow}>
                  {diaperOptions.map((option) => {
                    const isSelected = detail === option;

                    return (
                      <Pressable
                        accessibilityRole="button"
                        key={option}
                        style={[
                          styles.optionButton,
                          isSelected && styles.selectedOptionButton,
                        ]}
                        onPress={() => setDetail(option)}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            isSelected && styles.selectedOptionButtonText,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {type === "sleep" ? (
              <>
                <View style={styles.timerCard}>
                  <View>
                    <Text style={styles.timerLabel}>Sleep timer</Text>
                    <Text style={styles.timerValue}>
                      {sleepStartedAt
                        ? `${elapsedSleepMinutes} min`
                        : "Ready to start"}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    disabled={saving}
                    style={[
                      styles.timerButton,
                      sleepStartedAt && styles.stopTimerButton,
                    ]}
                    onPress={
                      sleepStartedAt
                        ? handleStopSleepTimer
                        : handleStartSleepTimer
                    }
                  >
                    {saving && sleepStartedAt ? (
                      <ActivityIndicator color="#FFF9F0" />
                    ) : (
                      <Text style={styles.timerButtonText}>
                        {sleepStartedAt ? "Stop & save" : "Start"}
                      </Text>
                    )}
                  </Pressable>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Sleep type</Text>
                  <View style={styles.optionRow}>
                    {sleepTypes.map((option) => {
                      const isSelected = detail === option;

                      return (
                        <Pressable
                          accessibilityRole="button"
                          key={option}
                          style={[
                            styles.optionButton,
                            isSelected && styles.selectedOptionButton,
                          ]}
                          onPress={() => setDetail(option)}
                        >
                          <Text
                            style={[
                              styles.optionButtonText,
                              isSelected && styles.selectedOptionButtonText,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Manual duration</Text>
                  <TextInput
                    keyboardType="number-pad"
                    placeholder="Minutes slept"
                    placeholderTextColor="#A8957D"
                    value={secondaryDetail}
                    onChangeText={setSecondaryDetail}
                    style={styles.input}
                  />
                </View>
              </>
            ) : null}

            {type === "tummy" ? (
              <>
                <View style={styles.timerCard}>
                  <View>
                    <Text style={styles.timerLabel}>Tummy time timer</Text>
                    <Text style={styles.timerValue}>
                      {tummyStartedAt
                        ? `${elapsedTummyMinutes} min`
                        : "Ready to start"}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    disabled={saving}
                    style={[
                      styles.timerButton,
                      tummyStartedAt && styles.stopTimerButton,
                    ]}
                    onPress={
                      tummyStartedAt
                        ? handleStopTummyTimer
                        : handleStartTummyTimer
                    }
                  >
                    {saving && tummyStartedAt ? (
                      <ActivityIndicator color="#FFF9F0" />
                    ) : (
                      <Text style={styles.timerButtonText}>
                        {tummyStartedAt ? "Stop & save" : "Start"}
                      </Text>
                    )}
                  </Pressable>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Manual tummy time</Text>
                  <TextInput
                    keyboardType="number-pad"
                    placeholder="Minutes"
                    placeholderTextColor="#A8957D"
                    value={secondaryDetail}
                    onChangeText={setSecondaryDetail}
                    style={styles.input}
                  />
                </View>
              </>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                multiline
                placeholder="Optional little note"
                placeholderTextColor="#A8957D"
                value={notes}
                onChangeText={setNotes}
                style={[styles.input, styles.notesInput]}
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
                  <Ionicons name="checkmark" size={22} color="#FFF9F0" />
                  <Text style={styles.buttonText}>Save log</Text>
                </>
              )}
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function getActivityDetailForSave(
  type: ActivityType,
  detail: string,
  secondaryDetail: string
) {
  const cleanDetail = detail.trim();
  const cleanSecondaryDetail = secondaryDetail.trim();

  if (type === "sleep" || type === "tummy") {
    return cleanSecondaryDetail;
  }

  if (type === "feed" && cleanSecondaryDetail) {
    return `${cleanDetail} - ${cleanSecondaryDetail}`;
  }

  return cleanDetail;
}

function getActivityMetadataForSave(
  type: ActivityType,
  detail: string,
  secondaryDetail: string
): Record<string, string | number | boolean> {
  const cleanDetail = detail.trim();
  const cleanSecondaryDetail = secondaryDetail.trim();

  if (type === "feed") {
    return {
      feedingType: cleanDetail,
      amountOrSide: cleanSecondaryDetail,
    };
  }

  if (type === "diaper") {
    return {
      diaperType: cleanDetail,
      wet: cleanDetail === "Wet" || cleanDetail === "Both",
      soiled: cleanDetail === "Dirty" || cleanDetail === "Both",
    };
  }

  if (type === "sleep" || type === "tummy") {
    return {
      durationMinutes: Number.parseInt(cleanSecondaryDetail || "0", 10),
    };
  }

  return {};
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FBF4EA",
  },
  container: {
    padding: 24,
    paddingTop: 58,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  kicker: {
    color: "#8B7258",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    color: "#3A332A",
    fontWeight: "800",
  },
  subtitle: {
    color: "#6F6253",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  list: {
    gap: 14,
  },
  card: {
    minHeight: 88,
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#DCCBB5",
  },
  selectedCard: {
    borderColor: "#9DB18F",
    backgroundColor: "#F5F0E2",
  },
  cardPressed: {
    transform: [{ translateY: 1 }],
    borderColor: "#D9C5A8",
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EADBC8",
    borderWidth: 1,
    borderColor: "#D9C5A8",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCardIcon: {
    backgroundColor: "#6F8B63",
    borderColor: "#6F8B63",
  },
  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    color: "#3A332A",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: "#6F6253",
    fontSize: 14,
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    marginTop: 18,
    gap: 16,
  },
  formTitle: {
    color: "#3A332A",
    fontSize: 20,
    fontWeight: "800",
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
    backgroundColor: "#FBF4EA",
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    color: "#3A332A",
    fontSize: 16,
  },
  notesInput: {
    minHeight: 90,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  optionRow: {
    flexDirection: "row",
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FBF4EA",
  },
  selectedOptionButton: {
    backgroundColor: "#6F8B63",
    borderColor: "#6F8B63",
  },
  optionButtonText: {
    color: "#6F6253",
    fontWeight: "800",
  },
  selectedOptionButtonText: {
    color: "#FFF9F0",
  },
  timerCard: {
    minHeight: 82,
    backgroundColor: "#F5F0E2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9C5A8",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  timerLabel: {
    color: "#8B7258",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  timerValue: {
    color: "#3A332A",
    fontSize: 24,
    fontWeight: "800",
  },
  timerButton: {
    minHeight: 44,
    minWidth: 100,
    borderRadius: 8,
    backgroundColor: "#6F8B63",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  stopTimerButton: {
    backgroundColor: "#9B6A43",
  },
  timerButtonText: {
    color: "#FFF9F0",
    fontWeight: "800",
  },
  messageText: {
    color: "#A84D3F",
    fontWeight: "700",
    lineHeight: 20,
  },
  button: {
    minHeight: 54,
    backgroundColor: "#9B6A43",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
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
    fontWeight: "800",
    fontSize: 16,
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
