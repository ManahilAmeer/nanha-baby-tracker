import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  deleteActivity,
  getActivityById,
  type ActivityLog,
} from "../../src/services/activities";

export default function ActivityDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [activity, setActivity] = useState<ActivityLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const meta = useMemo(
    () => (activity ? getActivityMeta(activity) : null),
    [activity]
  );

  const loadActivity = useCallback(async () => {
    if (!id) {
      setError("Activity ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const activityLog = await getActivityById(id);

      if (!activityLog) {
        setError("This activity was not found.");
        return;
      }

      setActivity(activityLog);
    } catch (loadError) {
      console.log(loadError);
      setError("We could not load this activity.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setDeleting(true);
      setError("");
      await deleteActivity(id);
      router.replace("/");
    } catch (deleteError) {
      console.log(deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "We could not delete this activity."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Pressable
        accessibilityRole="button"
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={20} color="#9B6A43" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <Text style={styles.kicker}>Activity detail</Text>
      <Text style={styles.title}>{meta?.title ?? "Activity"}</Text>

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#9B6A43" />
          <Text style={styles.stateText}>Loading activity...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Ionicons name="alert-circle-outline" size={30} color="#A84D3F" />
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : activity && meta ? (
        <>
          <View style={styles.detailCard}>
            <View style={[styles.iconBadge, { backgroundColor: meta.background }]}>
              <Ionicons name={meta.icon} size={28} color={meta.color} />
            </View>

            <DetailRow label="Type" value={meta.title} />
            <DetailRow label="Details" value={meta.detail} />
            <DetailRow
              label="Logged at"
              value={formatActivityDate(activity.createdAt)}
            />
            <DetailRow label="Notes" value={activity.notes || "No notes"} />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={deleting}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && !deleting && styles.buttonPressed,
              deleting && styles.buttonDisabled,
            ]}
            onPress={handleDelete}
          >
            {deleting ? (
              <ActivityIndicator color="#A84D3F" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={22} color="#A84D3F" />
                <Text style={styles.deleteText}>Delete activity</Text>
              </>
            )}
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function getActivityMeta(activity: ActivityLog): {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  color: string;
  background: string;
} {
  if (activity.type === "feed") {
    return {
      icon: "water-outline",
      title: "Feed",
      detail: activity.detail || "Logged feeding",
      color: "#6F8B63",
      background: "#E8EEDC",
    };
  }

  if (activity.type === "diaper") {
    return {
      icon: "invert-mode-outline",
      title: "Diaper",
      detail: activity.detail || "Diaper change",
      color: "#9B6A43",
      background: "#EADBC8",
    };
  }

  if (activity.type === "sleep") {
    return {
      icon: "moon-outline",
      title: "Sleep",
      detail: activity.detail ? `${activity.detail} minutes` : "Sleep logged",
      color: "#6E7895",
      background: "#E4E5DD",
    };
  }

  return {
    icon: "timer-outline",
    title: "Tummy time",
    detail: activity.detail ? `${activity.detail} minutes` : "Tummy time",
    color: "#A06B54",
    background: "#F0DED2",
  };
}

function formatActivityDate(date?: Date) {
  if (!date) return "Not available";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
  detailCard: {
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    padding: 18,
    gap: 16,
  },
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  detailRow: {
    borderTopWidth: 1,
    borderTopColor: "#E6D8C8",
    paddingTop: 14,
    gap: 5,
  },
  detailLabel: {
    color: "#8B7258",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  detailValue: {
    color: "#3A332A",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
  },
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
    marginTop: 18,
  },
  deleteText: {
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
