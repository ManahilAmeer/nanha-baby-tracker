import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";

import { getPrimaryBaby, type BabyProfile } from "../src/services/baby";
import {
  getTodayActivitySummary,
  type ActivityType,
  type TodayActivitySummary,
} from "../src/services/activities";

const quickActions: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: ActivityType;
}[] = [
  { label: "Log Feed", icon: "water-outline", type: "feed" },
  { label: "Log Diaper", icon: "invert-mode-outline", type: "diaper" },
  { label: "Start Sleep", icon: "moon-outline", type: "sleep" },
  { label: "Log Tummy Time", icon: "timer-outline", type: "tummy" },
];

const appSections: {
  label: string;
  route: Href;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { label: "Growth", route: "/growth", icon: "analytics-outline" },
  { label: "Milestones", route: "/milestones", icon: "sparkles-outline" },
  { label: "Education", route: "/education", icon: "book-outline" },
  { label: "Reminders", route: "/reminders", icon: "notifications-outline" },
  { label: "Settings", route: "/settings", icon: "settings-outline" },
];

export default function Home() {
  const router = useRouter();

  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [summary, setSummary] = useState<TodayActivitySummary>({
    feeds: 0,
    diapers: 0,
    sleepMinutes: 0,
    tummyMinutes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const primaryBaby = await getPrimaryBaby();

      setBaby(primaryBaby);

      if (primaryBaby) {
        setSummary(await getTodayActivitySummary(primaryBaby.id));
      }
    } catch (e) {
      console.log(e);
      setError("We could not load your baby profile right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Home dashboard</Text>
          <Text style={styles.greeting}>Assalam o Alaikum</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="leaf-outline" size={24} color="#9B6A43" />
        </View>
      </View>

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#9B6A43" />
          <Text style={styles.stateText}>Loading your dashboard...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Ionicons name="alert-circle-outline" size={30} color="#A84D3F" />
          <Text style={styles.stateText}>{error}</Text>
          <Pressable style={styles.secondaryButton} onPress={fetchDashboard}>
            <Ionicons name="refresh" size={18} color="#9B6A43" />
            <Text style={styles.secondaryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : baby ? (
        <>
          <View style={styles.profileCard}>
            <View style={styles.profileIcon}>
              <MaterialCommunityIcons
                name="baby-face-outline"
                size={32}
                color="#9B6A43"
              />
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.profileLabel}>Baby age</Text>
              <Text style={styles.babyName}>{baby.name}</Text>
              <Text style={styles.babyDob}>{formatBabyAge(baby.dob)}</Text>
            </View>
          </View>

          <View style={styles.statusGrid}>
            <StatusCard
              icon="water-outline"
              label="Last feed"
              value={formatLastEvent(summary.lastFeed)}
            />
            <StatusCard
              icon="invert-mode-outline"
              label="Last diaper"
              value={formatLastEvent(summary.lastDiaper)}
            />
            <StatusCard
              icon="moon-outline"
              label="Last sleep"
              value={formatLastEvent(summary.lastSleep)}
            />
            <StatusCard
              icon="bed-outline"
              label="Total sleep"
              value={formatDuration(summary.sleepMinutes)}
            />
            <StatusCard
              icon="timer-outline"
              label="Wake window"
              value={formatWakeWindow(summary.lastSleep)}
            />
            <StatusCard
              icon="accessibility-outline"
              label="Tummy time"
              value={formatDuration(summary.tummyMinutes)}
            />
          </View>

          <View style={styles.reminderCard}>
            <View>
              <Text style={styles.profileLabel}>Next reminder</Text>
              <Text style={styles.reminderTitle}>Tummy time nudge</Text>
              <Text style={styles.reminderCopy}>A gentle 5 minute session later today</Text>
            </View>
            <Ionicons name="notifications-outline" size={24} color="#6F8B63" />
          </View>

          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action) => (
              <Pressable
                accessibilityRole="button"
                key={action.type}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/log",
                    params: { type: action.type },
                  })
                }
              >
                <Ionicons name={action.icon} size={22} color="#FFF9F0" />
                <Text style={styles.actionButtonText}>{action.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Explore</Text>
          <View style={styles.sectionList}>
            {appSections.map((section) => (
              <Pressable
                accessibilityRole="button"
                key={section.label}
                style={styles.sectionRow}
                onPress={() => router.push(section.route)}
              >
                <View style={styles.sectionIcon}>
                  <Ionicons name={section.icon} size={20} color="#9B6A43" />
                </View>
                <Text style={styles.sectionLabel}>{section.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#8B7258" />
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.stateCard}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons
              name="baby-face-outline"
              size={38}
              color="#9B6A43"
            />
          </View>
          <Text style={styles.emptyTitle}>Add your baby profile</Text>
          <Text style={styles.emptyCopy}>
            Create the first profile to unlock tracking, growth, milestones,
            education, and reminders.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push("/onboarding")}
          >
            <Ionicons name="add" size={22} color="#FFF9F0" />
            <Text style={styles.primaryButtonText}>Add baby</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function StatusCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statusCard}>
      <Ionicons name={icon} size={21} color="#9B6A43" />
      <Text style={styles.statusValue}>{value}</Text>
      <Text style={styles.statusLabel}>{label}</Text>
    </View>
  );
}

function formatBabyAge(dob: string) {
  const birthDate = new Date(dob);

  if (Number.isNaN(birthDate.getTime())) {
    return "Age will appear after a valid date";
  }

  const today = new Date();
  const diffMs = today.getTime() - birthDate.getTime();
  const days = Math.max(0, Math.floor(diffMs / 86400000));

  if (days < 7) return `${days} days old`;
  if (days < 56) return `${Math.floor(days / 7)} weeks old`;

  return `${Math.floor(days / 30.44)} months old`;
}

function formatLastEvent(date?: Date) {
  if (!date) return "Not yet";

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatWakeWindow(lastSleep?: Date) {
  if (!lastSleep) return "Start sleep";

  const minutes = Math.max(
    0,
    Math.floor((Date.now() - lastSleep.getTime()) / 60000)
  );

  return formatDuration(minutes);
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EADBC8",
    borderWidth: 1,
    borderColor: "#D9C5A8",
  },
  kicker: {
    color: "#8B7258",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  greeting: {
    fontSize: 30,
    lineHeight: 36,
    color: "#3A332A",
    fontWeight: "800",
  },
  profileCard: {
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    padding: 18,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    shadowColor: "#4A3827",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  profileIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EADBC8",
    borderWidth: 1,
    borderColor: "#D9C5A8",
  },
  profileCopy: {
    flex: 1,
  },
  profileLabel: {
    color: "#8B7258",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  babyName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#3A332A",
  },
  babyDob: {
    marginTop: 4,
    color: "#6F6253",
    fontWeight: "600",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statusCard: {
    backgroundColor: "#FFF9F0",
    width: "48%",
    minHeight: 118,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#DCCBB5",
  },
  statusValue: {
    fontSize: 23,
    fontWeight: "800",
    color: "#3A332A",
  },
  statusLabel: {
    color: "#6F6253",
    fontWeight: "700",
  },
  reminderCard: {
    backgroundColor: "#F5F0E2",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D9C5A8",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 4,
  },
  reminderTitle: {
    color: "#3A332A",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4,
  },
  reminderCopy: {
    color: "#6F6253",
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#3A332A",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 24,
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%",
    minHeight: 56,
    borderRadius: 8,
    backgroundColor: "#9B6A43",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    color: "#FFF9F0",
    fontWeight: "800",
  },
  sectionList: {
    gap: 10,
  },
  sectionRow: {
    minHeight: 58,
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 12,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EADBC8",
  },
  sectionLabel: {
    flex: 1,
    color: "#3A332A",
    fontWeight: "800",
    fontSize: 16,
  },
  primaryButton: {
    minHeight: 54,
    backgroundColor: "#9B6A43",
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFF9F0",
    fontWeight: "800",
    fontSize: 16,
  },
  buttonPressed: {
    transform: [{ translateY: 1 }],
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
  secondaryButton: {
    minHeight: 42,
    marginTop: 16,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9C5A8",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#9B6A43",
    fontWeight: "800",
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EADBC8",
    borderWidth: 1,
    borderColor: "#D9C5A8",
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#3A332A",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyCopy: {
    color: "#6F6253",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
});
