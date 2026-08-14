import { Button } from "@/components/button";
import { Screen } from "@/components/screen";
import { Chip } from "@/components/ui";
import { colors, font, spacing, text } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useGoals } from "@/hooks/use-goals";
import { supabase } from "@/lib/supabase";
import {
  clearActiveTimer,
  loadActiveTimer,
  saveActiveTimer,
} from "@/lib/timer-storage";
import { useKeepAwake } from "expo-keep-awake";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

function formatElapsed(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function TimerScreen() {
  const { session } = useAuth();
  const { goals, refresh } = useGoals();

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [now, setNow] = useState(Date.now());
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(true);

  const isRunning = startedAt !== null;
  const elapsedSeconds = isRunning
    ? Math.max(0, Math.floor((now - startedAt.getTime()) / 1000))
    : 0;

  useKeepAwake();

  useEffect(() => {
    refresh();
    (async () => {
      const active = await loadActiveTimer();
      if (!active) {
        setRestoring(false);
        return;
      }
      const elapsedNow = Math.floor((Date.now() - active.startedAt) / 1000);
      const mins = Math.floor(elapsedNow / 60);
      Alert.alert(
        "พบการจับเวลาที่ค้างอยู่",
        `มีการจับเวลาค้างจากครั้งก่อนประมาณ ${mins} นาที ที่ยังไม่ได้บันทึก\nต้องการดำเนินการอย่างไร?`,
        [
          {
            text: "ไม่บันทึก",
            style: "destructive",
            onPress: async () => {
              await clearActiveTimer();
              setRestoring(false);
            },
          },
          {
            text: "บันทึกถึงตอนนี้",
            onPress: async () => {
              const end = new Date();
              const start = new Date(active.startedAt);
              setSelectedGoalId(active.goalId);
              await saveSessionInternal(active.goalId, start, end);
              await clearActiveTimer();
              setRestoring(false);
            },
          },
          {
            text: "นับต่อ",
            onPress: () => {
              setSelectedGoalId(active.goalId);
              setStartedAt(new Date(active.startedAt));
              setNow(Date.now());
              setRestoring(false);
            },
          },
        ],
        { cancelable: false },
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [isRunning]);

  async function handleStart() {
    if (!selectedGoalId) {
      Alert.alert("กรุณาเลือกเป้าหมาย", "โปรดเลือกเป้าหมายก่อนเริ่มจับเวลา");
      return;
    }
    const start = new Date();
    setNow(Date.now());
    setStartedAt(start);
    await saveActiveTimer({
      goalId: selectedGoalId,
      startedAt: start.getTime(),
    });
  }

  async function saveSessionInternal(goalId: string, start: Date, end: Date) {
    setSaving(true);
    const { error } = await supabase.from("sessions").insert({
      user_id: session!.user.id,
      goal_id: goalId,
      started_at: start.toISOString(),
      ended_at: end.toISOString(),
      source: "timer",
    });
    setSaving(false);
    if (error) {
      Alert.alert(
        "บันทึกไม่สำเร็จ",
        `โปรดลองใหม่อีกครั้ง\n\n(${error.message})`,
      );
      return false;
    }
    return true;
  }

  async function handleStop() {
    if (!startedAt || !selectedGoalId) return;
    const end = new Date();
    const seconds = Math.floor((end.getTime() - startedAt.getTime()) / 1000);

    if (seconds < 60) {
      Alert.alert(
        "จับเวลาไม่ถึง 1 นาที",
        "ต้องการบันทึกช่วงเวลาสั้นๆ นี้หรือไม่?",
        [
          {
            text: "ไม่บันทึก",
            style: "destructive",
            onPress: async () => {
              setStartedAt(null);
              await clearActiveTimer();
            },
          },
          {
            text: "บันทึก",
            onPress: async () => {
              const ok = await saveSessionInternal(
                selectedGoalId,
                startedAt,
                end,
              );
              if (ok) {
                await clearActiveTimer();
                setStartedAt(null);
                Alert.alert("บันทึกแล้ว", "น้องเห็นความตั้งใจของทาสแล้วนะ", [
                  { text: "กลับบ้านน้อง", onPress: () => router.back() },
                ]);
              }
            },
          },
        ],
      );
      return;
    }

    const ok = await saveSessionInternal(selectedGoalId, startedAt, end);
    if (ok) {
      await clearActiveTimer();
      setStartedAt(null);
      Alert.alert("บันทึกแล้ว", "น้องเห็นความตั้งใจของทาสแล้วนะ", [
        { text: "กลับบ้านน้อง", onPress: () => router.back() },
      ]);
    }
  }

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  if (restoring) {
    return (
      <Screen edges={["bottom"]}>
        <View style={styles.container}>
          <Text style={styles.dim}>กำลังตรวจสอบการจับเวลาที่ค้างอยู่...</Text>

        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={["bottom"]}>
      <View style={styles.container}>
        <Text style={styles.sectionLabel}>
          {isRunning ? "กำลังทำ" : "วันนี้จะทำอะไรดี?"}
        </Text>

        {goals.length === 0 ? (
          <Text style={styles.emptyText}>
            ยังไม่มีเป้าหมาย{"\n"}ปิดหน้านี้แล้วสร้างที่แท็บ &quot;เป้าหมาย&quot;
            ก่อน
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
            style={styles.chipScroll}
          >
            {goals.map((goal) => (
              <Chip
                key={goal.id}
                label={goal.name}
                color={goal.color}
                selected={selectedGoalId === goal.id}
                onPress={() => setSelectedGoalId(goal.id)}
                disabled={isRunning && selectedGoalId !== goal.id}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.clockZone}>
          <Text
            style={[
              styles.time,
              isRunning && { color: selectedGoal?.color ?? colors.primary },
            ]}
          >
            {formatElapsed(elapsedSeconds)}
          </Text>
          {isRunning && (
            <>
              <Text style={styles.runningHint}>น้องกำลังเฝ้าดูอยู่ 👀</Text>
              <Text style={styles.safeHint}>
                ปิดแอปไปได้เลย — เวลาจะนับต่อให้เมื่อกลับมา
              </Text>
            </>
          )}
        </View>

        {!isRunning ? (
          <Button label="▶  เริ่ม" onPress={handleStart} />
        ) : (
          <Button
            label={saving ? "กำลังบันทึก..." : "■  จบและบันทึก"}
            onPress={handleStop}
            disabled={saving}
            style={styles.stopButton}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: spacing.xl,
    paddingTop: spacing["2xl"],
    gap: spacing.lg,
  },
  sectionLabel: { ...text.bodyStrong, fontSize: 16 },
  emptyText: {
    ...text.small,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  chipScroll: { flexGrow: 0 },
  chipRow: { gap: spacing.sm, paddingHorizontal: spacing.xs },
  clockZone: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  time: {
    fontSize: 68,
    fontFamily: font.bold,
    fontVariant: ["tabular-nums"],
    color: colors.textPrimary,
  },
  runningHint: { ...text.small, color: colors.textMuted },
  safeHint: {
    ...text.small,
    color: colors.success,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  stopButton: { backgroundColor: colors.danger },
  dim: { ...text.small, color: colors.textMuted, marginTop: spacing.xl },
});
