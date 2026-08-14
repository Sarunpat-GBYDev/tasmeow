import { Button } from "@/components/button";
import { CatDisplay } from "@/components/cat-display";
import { Icon } from "@/components/icon";
import { Screen } from "@/components/screen";
import { Card } from "@/components/ui";
import { BREEDS } from "@/constants/breeds";
import { colors, font, radius, spacing, text } from "@/constants/theme";
import { useCat } from "@/hooks/use-cat";
import { useCatMood } from "@/hooks/use-cat-mood";
import { useProfile } from "@/hooks/use-profile";
import { useStreak } from "@/hooks/use-streak";
import { GoalSummary, useWeekSummary } from "@/hooks/use-week-summary";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

function GoalProgressRow({ goal }: { goal: GoalSummary }) {
  const percent = Math.min(100, (goal.doneHours / goal.targetHours) * 100);
  const reached = goal.doneHours >= goal.targetHours;
  const fmt = (n: number) => (Math.round(n * 10) / 10).toString();
  return (
    <View style={styles.goalRow}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalName} numberOfLines={1}>
          {goal.name} {reached ? "✅" : ""}
        </Text>
        <Text style={styles.goalHours}>
          {fmt(goal.doneHours)} / {fmt(goal.targetHours)} ชม.
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${percent}%`, backgroundColor: goal.color },
          ]}
        />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { cat } = useCat();
  const { coins, refresh: refreshCoins } = useProfile();
  const {
    image: moodImage,
    message: moodMessage,
    refresh: refreshMood,
  } = useCatMood();
  const { streak, refresh: refreshStreak } = useStreak();
  const { summaries, loading, refresh: refreshSummary } = useWeekSummary();
  const breed = BREEDS.find((b) => b.key === cat?.breed);

  useFocusEffect(
    useCallback(() => {
      refreshCoins();
      refreshMood();
      refreshStreak();
      refreshSummary();
    }, [refreshCoins, refreshMood, refreshStreak, refreshSummary]),
  );

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.coinPill}>
          <Icon name="coin" size={20} />
          <Text style={styles.coinAmount}>{coins.toLocaleString()}</Text>
        </View>

        <Card variant="primary" style={styles.catHome}>
          {cat && (
            <CatDisplay
              breed={cat.breed}
              equipped={cat.equippedImages}
              moodImage={moodImage}
              size={220}
            />
          )}
          <Text style={styles.catName}>{cat?.name}</Text>
          <Text style={styles.catBreed}>{breed?.nameTh}</Text>
          <Text style={styles.moodMessage}>{moodMessage}</Text>

          <Button
            label="ร้านของน้อง"
            icon="shop"
            variant="secondary"
            size="md"
            onPress={() => router.push("/shop")}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        <Card style={styles.streakCard}>
          <Icon name="fire" size={40} />
          <View style={{ flex: 1 }}>
            <Text style={styles.streakNumber}>
              {streak > 0 ? `${streak} วัน` : "ยังไม่มี streak"}
            </Text>
            <Text style={styles.streakHint}>
              {streak === 0
                ? "บันทึกเวลาสักครั้งวันนี้ เริ่มนับ streak ได้เลย"
                : streak === 1
                  ? "วันแรกแล้ว พรุ่งนี้มาต่อกันนะ"
                  : `ต่อเนื่องมา ${streak} วันแล้ว เก่งมาก รักษาไว้นะ`}
            </Text>
          </View>
        </Card>

        <Card variant="soft">
          <Text style={styles.summaryTitle}>สัปดาห์นี้ (จันทร์–อาทิตย์)</Text>
          <View style={{ height: spacing.md }} />
          {summaries.length === 0 && !loading ? (
            <Text style={styles.emptyText}>
              ยังไม่มีเป้าหมาย — สร้างได้ที่แท็บ &quot;เป้าหมาย&quot; เลยนะ
            </Text>
          ) : (
            <View style={{ gap: spacing.md }}>
              {summaries.map((g) => (
                <GoalProgressRow key={g.id} goal={g} />
              ))}
            </View>
          )}
        </Card>

        <Button label="▶  เริ่มจับเวลา" onPress={() => router.push("/timer")} />

        <Pressable onPress={() => router.push("/manual-log")}>
          <Text style={styles.manualLink}>ลืมจับเวลา? บันทึกย้อนหลังได้</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  coinPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: spacing.xs + 2,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  coinAmount: {
    fontFamily: font.bold,
    color: colors.primaryDark,
    fontSize: 16,
  },
  catHome: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  catName: { ...text.h2, marginTop: spacing.sm },
  catBreed: { ...text.muted },
  moodMessage: {
    ...text.small,
    marginTop: spacing.sm,
    fontFamily: font.regular,
    fontStyle: "italic",
    textAlign: "center",
    color: colors.textSecondary,
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.streakBg,
    borderColor: "#FCA5A5",
  },
  streakNumber: { ...text.h3, color: colors.streak, fontFamily: font.bold },
  streakHint: { ...text.small, color: "#991B1B", marginTop: 2 },
  summaryTitle: { ...text.bodyStrong },
  emptyText: { ...text.small, color: colors.textMuted, lineHeight: 22 },
  goalRow: { gap: spacing.xs + 2 },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  goalName: { ...text.bodyStrong, flex: 1 },
  goalHours: { ...text.small },
  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.divider,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 5 },
  manualLink: {
    ...text.small,
    textAlign: "center",
    color: colors.textMuted,
    padding: spacing.sm,
  },
});
