import { Icon } from "@/components/icon";
import { Screen } from "@/components/screen";
import { Card } from "@/components/ui";
import { colors, font, radius, spacing, text } from "@/constants/theme";
import { DailyBar, useStats } from "@/hooks/use-stats";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

const CHART_HEIGHT = 160;
const CHART_PADDING = 16;

export default function StatsScreen() {
  const { stats, loading, refresh } = useStats();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  if (loading || !stats) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.dim}>กำลังโหลด...</Text>
        </View>
      </Screen>
    );
  }

  const fmt = (n: number) => (Math.round(n * 10) / 10).toString();
  const maxHours = Math.max(1, ...stats.days.map((d) => d.totalHours));

  return (
    <Screen edges={["left", "right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.statsRow}>
          <StatBlock
            label="เวลารวม"
            value={fmt(stats.totalHours)}
            suffix="ชม."
          />
          <StatBlock
            label="วันที่ทำ"
            value={String(stats.activeDays)}
            suffix="/30"
          />
          <StatBlock
            label="เฉลี่ย/วัน"
            value={fmt(stats.avgDailyHours)}
            suffix="ชม."
          />
        </View>

        <Card style={styles.streakCard}>
          <Icon name="fire" size={36} />
          <View style={{ flex: 1 }}>
            <Text style={styles.streakLabel}>ทำต่อเนื่องยาวที่สุดใน 30 วัน</Text>
            <Text style={styles.streakNumber}>{stats.longestStreak} วัน</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.chartTitle}>30 วันย้อนหลัง</Text>
          <View style={{ height: spacing.md }} />
          <BarChart days={stats.days} maxHours={maxHours} />
          <View style={styles.axisLabels}>
            <Text style={styles.axisText}>30 วันก่อน</Text>
            <Text style={styles.axisText}>วันนี้</Text>
          </View>
        </Card>

        <Text style={styles.note}>
          แต่ละแท่งคือ 1 วัน สีแสดงว่ามาจากเป้าหมายใด
        </Text>
      </ScrollView>
    </Screen>
  );
}

function StatBlock({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statSuffix}>{suffix}</Text>
      </View>
    </View>
  );
}

function BarChart({ days, maxHours }: { days: DailyBar[]; maxHours: number }) {
  const chartWidth = Dimensions.get("window").width - 40 - CHART_PADDING * 2;
  const gap = 2;
  const barWidth = (chartWidth - gap * (days.length - 1)) / days.length;

  return (
    <View style={[styles.chart, { height: CHART_HEIGHT }]}>
      {days.map((day, i) => (
        <View
          key={day.key}
          style={{
            width: barWidth,
            height: CHART_HEIGHT,
            marginLeft: i === 0 ? 0 : gap,
            justifyContent: "flex-end",
          }}
        >
          {day.totalHours === 0 ? (
            <View
              style={{
                height: 3,
                backgroundColor: colors.divider,
                borderRadius: 2,
              }}
            />
          ) : (
            day.segments.map((seg, j) => {
              const h = (seg.hours / maxHours) * CHART_HEIGHT;
              return (
                <View
                  key={j}
                  style={{
                    height: h,
                    backgroundColor: seg.color,
                    borderTopLeftRadius: j === day.segments.length - 1 ? 3 : 0,
                    borderTopRightRadius: j === day.segments.length - 1 ? 3 : 0,
                  }}
                />
              );
            })
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dim: { ...text.small, color: colors.textMuted },
  statsRow: { flexDirection: "row", gap: spacing.sm + 2 },
  statBlock: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  statLabel: { ...text.muted, fontSize: 12 },
  statValueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  statValue: { ...text.h2, fontSize: 22 },
  statSuffix: { ...text.muted, fontSize: 12 },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.streakBg,
    borderColor: "#FCA5A5",
  },
  streakLabel: { ...text.small, color: "#7F1D1D" },
  streakNumber: {
    ...text.h3,
    fontSize: 22,
    color: colors.streak,
    fontFamily: font.bold,
    marginTop: 2,
  },
  chartTitle: { ...text.bodyStrong },
  chart: { flexDirection: "row", alignItems: "flex-end" },
  axisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  axisText: { ...text.muted, fontSize: 11 },
  note: { ...text.muted, textAlign: "center", marginTop: spacing.xs },
});
