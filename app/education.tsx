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

import {
  ageRangeLabels,
  educationArticles,
  type EducationAgeRange,
} from "../src/data/education";
import { getPrimaryBaby, type BabyProfile } from "../src/services/baby";

const ageRanges: EducationAgeRange[] = ["0-2", "3-4", "5-6"];

export default function EducationHub() {
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [selectedAgeRange, setSelectedAgeRange] =
    useState<EducationAgeRange>("0-2");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadEducation();
  }, []);

  const articles = useMemo(
    () =>
      educationArticles.filter(
        (article) => article.ageRange === selectedAgeRange
      ),
    [selectedAgeRange]
  );

  const loadEducation = async () => {
    try {
      setLoading(true);
      setMessage("");
      const primaryBaby = await getPrimaryBaby();

      setBaby(primaryBaby);

      if (primaryBaby) {
        setSelectedAgeRange(getAgeRange(primaryBaby.dob));
      }
    } catch (error) {
      console.log(error);
      setMessage("We could not load education content.");
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
      <Text style={styles.kicker}>Educational hub</Text>
      <Text style={styles.title}>Short, practical baby care guides</Text>
      <Text style={styles.subtitle}>
        Content is filtered by baby age, with room to browse other age ranges.
      </Text>

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#9B6A43" />
          <Text style={styles.stateText}>Loading guides...</Text>
        </View>
      ) : (
        <>
          <View style={styles.contextCard}>
            <View>
              <Text style={styles.contextLabel}>Showing guides for</Text>
              <Text style={styles.contextTitle}>
                {ageRangeLabels[selectedAgeRange]}
              </Text>
              {baby ? (
                <Text style={styles.contextCopy}>Personalized for {baby.name}</Text>
              ) : (
                <Text style={styles.contextCopy}>Add a baby profile for auto-filtering</Text>
              )}
            </View>
            <Ionicons name="book-outline" size={26} color="#6F8B63" />
          </View>

          <View style={styles.ageSelector}>
            {ageRanges.map((ageRange) => {
              const selected = ageRange === selectedAgeRange;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={ageRange}
                  style={[
                    styles.ageButton,
                    selected && styles.selectedAgeButton,
                  ]}
                  onPress={() => setSelectedAgeRange(ageRange)}
                >
                  <Text
                    style={[
                      styles.ageButtonText,
                      selected && styles.selectedAgeButtonText,
                    ]}
                  >
                    {ageRangeLabels[ageRange]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {message ? <Text style={styles.messageText}>{message}</Text> : null}

          {articles.map((article) => (
            <View style={styles.card} key={article.id}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Ionicons name="leaf-outline" size={20} color="#9B6A43" />
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardCategory}>{article.category}</Text>
                  <Text style={styles.cardTitle}>{article.title}</Text>
                </View>
              </View>

              {article.points.map((point) => (
                <View style={styles.pointRow} key={point}>
                  <View style={styles.pointDot} />
                  <Text style={styles.pointText}>{point}</Text>
                </View>
              ))}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

function getAgeRange(dob: string): EducationAgeRange {
  const birthDate = new Date(dob);

  if (Number.isNaN(birthDate.getTime())) {
    return "0-2";
  }

  const days = Math.max(
    0,
    Math.floor((Date.now() - birthDate.getTime()) / 86400000)
  );
  const month = Math.floor(days / 30.44) + 1;

  if (month <= 2) return "0-2";
  if (month <= 4) return "3-4";
  return "5-6";
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
  contextCard: {
    backgroundColor: "#F5F0E2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9C5A8",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  contextLabel: {
    color: "#8B7258",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  contextTitle: { color: "#3A332A", fontSize: 22, fontWeight: "800" },
  contextCopy: { color: "#6F6253", fontWeight: "700", marginTop: 4 },
  ageSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  ageButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    backgroundColor: "#FFF9F0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  selectedAgeButton: {
    backgroundColor: "#6F8B63",
    borderColor: "#6F8B63",
  },
  ageButtonText: {
    color: "#6F6253",
    fontWeight: "800",
    textAlign: "center",
    fontSize: 12,
  },
  selectedAgeButtonText: { color: "#FFF9F0" },
  card: {
    backgroundColor: "#FFF9F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCCBB5",
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EADBC8",
    alignItems: "center",
    justifyContent: "center",
  },
  cardCopy: { flex: 1 },
  cardCategory: {
    color: "#8B7258",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cardTitle: { color: "#3A332A", fontSize: 18, fontWeight: "800" },
  pointRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 9,
  },
  pointDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#9B6A43",
    marginTop: 7,
  },
  pointText: {
    flex: 1,
    color: "#6F6253",
    fontWeight: "600",
    lineHeight: 21,
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
