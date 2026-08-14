import { Button } from "@/components/button";
import { EffortOutcomeChart } from "@/components/effort-outcome-chart";
import { Icon } from "@/components/icon";
import { Card } from "@/components/ui";
import { colors, font, radius, spacing, text } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useEffortOutcome } from "@/hooks/use-effort-outcome";
import {
  cancelReminder,
  requestNotificationPermission,
  scheduleDailyReminder,
} from "@/lib/notifications-lib";

import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

type Goal = {
  id: string;
  name: string;
  color: string;
  weekly_target_hours: number;
  reminder_time: string | null;
  reminder_enabled: boolean;
  notification_id: string | null;
};
type Metric = {
  id: string;
  name: string;
  unit: string | null;
  start_value: number;
  target_value: number;
  direction: "increase" | "decrease";
};
type MetricLog = { id: string; value: number; logged_at: string };

function parseTimeString(s: string | null): Date {
  const d = new Date();
  if (s) {
    const [h, m] = s.split(":").map((n) => parseInt(n, 10));
    d.setHours(h, m, 0, 0);
  } else {
    d.setHours(19, 0, 0, 0);
  }
  return d;
}
function formatTimeString(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [metric, setMetric] = useState<Metric | null>(null);
  const [logs, setLogs] = useState<MetricLog[]>([]);
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);

  const { points, refresh: refreshChart } = useEffortOutcome(
    goal?.id,
    metric?.id,
  );

  const load = useCallback(async () => {
    if (!id) return;
    const { data: g } = await supabase
      .from("goals")
      .select(
        "id, name, color, weekly_target_hours, reminder_time, reminder_enabled, notification_id",
      )
      .eq("id", id)
      .single();
    setGoal(g as Goal);

    const { data: m } = await supabase
      .from("goal_metrics")
      .select("id, name, unit, start_value, target_value, direction")
      .eq("goal_id", id)
      .maybeSingle();
    setMetric(m as Metric | null);

    if (m) {
      const { data: l } = await supabase
        .from("metric_logs")
        .select("id, value, logged_at")
        .eq("metric_id", m.id)
        .order("logged_at", { ascending: false })
        .limit(10);
      setLogs((l as MetricLog[]) ?? []);
    } else {
      setLogs([]);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useFocusEffect(
    useCallback(() => {
      refreshChart();
    }, [refreshChart]),
  );

  async function handleLogValue() {
    const v = parseFloat(newValue);
    if (!metric) return;
    if (isNaN(v)) {
      Alert.alert("ค่าไม่ถูกต้อง", "โปรดระบุเป็นตัวเลข เช่น 72.5");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("metric_logs").insert({
      user_id: session!.user.id,
      metric_id: metric.id,
      value: v,
    });
    setSaving(false);
    if (error) {
      Alert.alert(
        "บันทึกไม่สำเร็จ",
        `โปรดลองใหม่อีกครั้ง\n\n(${error.message})`,
      );
      return;
    }
    setNewValue("");
    load();
    refreshChart();
  }

  async function updateReminder(nextEnabled: boolean, nextTime: string) {
    if (!goal) return;
    setSavingReminder(true);

    if (goal.notification_id) {
      await cancelReminder(goal.notification_id);
    }

    let newId: string | null = null;

    if (nextEnabled) {
      const ok = await requestNotificationPermission();
      if (!ok) {
        Alert.alert(
          "ไม่ได้รับอนุญาตให้แจ้งเตือน",
          "กรุณาเปิดสิทธิ์การแจ้งเตือนของ Tasmeow ในการตั้งค่าเครื่อง เพื่อใช้งานการเตือนรายวัน",
        );
        setSavingReminder(false);
        return;
      }
      const [h, m] = nextTime.split(":").map((n) => parseInt(n, 10));
      newId = await scheduleDailyReminder({
        hour: h,
        minute: m,
        title: "🐱 น้องเรียกทาสแล้ว",
        body: `ถึงเวลาทำ "${goal.name}" แล้วนะ`,
      });
    }

    const { error } = await supabase
      .from("goals")
      .update({
        reminder_enabled: nextEnabled,
        reminder_time: nextTime,
        notification_id: newId,
      })
      .eq("id", goal.id);

    setSavingReminder(false);
    if (error) {
      Alert.alert(
        "บันทึกไม่สำเร็จ",
        `โปรดลองใหม่อีกครั้ง\n\n(${error.message})`,
      );
      return;
    }
    load();
  }

  if (!goal) return null;

  const latest = logs[0]?.value ?? metric?.start_value;
  const progress =
    metric && latest !== undefined && metric.target_value !== metric.start_value
      ? Math.max(
          0,
          Math.min(
            1,
            (latest - metric.start_value) /
              (metric.target_value - metric.start_value),
          ),
        )
      : 0;
  const fmt = (n: number) => (Math.round(n * 10) / 10).toString();
  const reminderTime = goal.reminder_time ?? "19:00";

  return (
    <>
      <Stack.Screen options={{ title: goal.name }} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.headerCard, { borderLeftColor: goal.color }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.goalName}>{goal.name}</Text>
            <Text style={styles.goalTarget}>
              เป้าเวลา {goal.weekly_target_hours} ชม./สัปดาห์
            </Text>
          </View>
          <Pressable
            hitSlop={8}
            onPress={() =>
              router.push({ pathname: "/goal-form", params: { id: goal.id } })
            }
          >
            <Text style={styles.editLink}>แก้ไข</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>การแจ้งเตือน</Text>
        <Card>
          <View style={styles.reminderRow}>
            <Text style={styles.reminderLabel}>เตือนทุกวันเวลา</Text>
            <Pressable
              onPress={() => setShowTimePicker(true)}
              disabled={savingReminder}
              hitSlop={8}
            >
              <Text style={styles.reminderTime}>{reminderTime}</Text>
            </Pressable>
          </View>
          <View style={styles.divider} />
          <View style={styles.reminderRow}>
            <Text style={styles.reminderLabel}>เปิดการแจ้งเตือน</Text>
            <Switch
              value={goal.reminder_enabled}
              onValueChange={(v) => updateReminder(v, reminderTime)}
              disabled={savingReminder}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.surface}
            />
          </View>
        </Card>

        {showTimePicker && (
          <DateTimePicker
            value={parseTimeString(goal.reminder_time)}
            mode="time"
            is24Hour
            onChange={(_, selected) => {
              setShowTimePicker(Platform.OS === "ios");
              if (selected) {
                const newTime = formatTimeString(selected);
                updateReminder(goal.reminder_enabled, newTime);
              }
            }}
          />
        )}

        <Text style={styles.sectionTitle}>ตัวชี้วัดผลลัพธ์</Text>
        {!metric ? (
          <Card
            variant="soft"
            style={{ alignItems: "center", gap: spacing.md }}
          >
            <Icon name="chart" size={44} />
            <Text style={styles.emptyText}>
              ยังไม่มีตัวชี้วัด{"\n"}ตั้งไว้จะได้เห็นว่าเวลาที่ลงไปได้ผลจริงไหม
            </Text>
            <Button
              label="+ เพิ่มตัวชี้วัด"
              variant="secondary"
              size="md"
              onPress={() =>
                router.push({
                  pathname: "/metric-form",
                  params: { goalId: goal.id },
                })
              }
            />
          </Card>
        ) : (
          <>
            <Card>
              <Text style={styles.metricName}>
                {metric.name}
                {metric.unit ? ` (${metric.unit})` : ""}
              </Text>
              <Text style={styles.metricValues}>
                เริ่ม {fmt(metric.start_value)} → ล่าสุด{" "}
                <Text style={{ fontFamily: font.bold, color: goal.color }}>
                  {fmt(latest!)}
                </Text>{" "}
                → เป้า {fmt(metric.target_value)}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${progress * 100}%`,
                      backgroundColor: goal.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.percentText}>
                {Math.round(progress * 100)}% ของเป้าหมาย
              </Text>

              <View style={styles.logRow}>
                <TextInput
                  style={styles.logInput}
                  placeholder={`ค่าปัจจุบัน เช่น ${fmt(latest!)}`}
                  placeholderTextColor={colors.textMuted}
                  value={newValue}
                  onChangeText={setNewValue}
                  keyboardType="numeric"
                />
                <Button
                  label="บันทึก"
                  size="md"
                  onPress={handleLogValue}
                  disabled={saving}
                />
              </View>

              {logs.length > 0 && (
                <View style={styles.history}>
                  <Text style={styles.historyTitle}>ประวัติล่าสุด</Text>
                  {logs.map((l) => (
                    <View key={l.id} style={styles.historyRow}>
                      <Text style={styles.historyValue}>{fmt(l.value)}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(l.logged_at).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                        })}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>

            <Text style={styles.sectionTitle}>
              Effort vs Outcome (12 สัปดาห์)
            </Text>
            <Card>
              {points && (
                <EffortOutcomeChart
                  points={points}
                  color={goal.color}
                  metricName={metric.name}
                  metricUnit={metric.unit}
                />
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.bg,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderLeftWidth: 6,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalName: { ...text.h3 },
  goalTarget: { ...text.small, marginTop: 2 },
  editLink: {
    ...text.small,
    fontFamily: font.semibold,
    color: colors.primaryDark,
  },
  sectionTitle: { ...text.bodyStrong, marginTop: spacing.sm },
  reminderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  reminderLabel: { ...text.body },
  reminderTime: {
    ...text.h3,
    fontSize: 20,
    color: colors.primary,
    paddingHorizontal: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  emptyText: {
    ...text.small,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  metricName: { ...text.h3, fontSize: 16, marginBottom: spacing.xs },
  metricValues: { ...text.body, marginBottom: spacing.sm },
  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.divider,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 5 },
  percentText: { ...text.muted, marginTop: spacing.xs },
  logRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
    alignItems: "center",
  },
  logInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    fontFamily: font.regular,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  history: { marginTop: spacing.md, gap: spacing.xs + 2 },
  historyTitle: {
    ...text.small,
    fontFamily: font.semibold,
    color: colors.textSecondary,
  },
  historyRow: { flexDirection: "row", justifyContent: "space-between" },
  historyValue: { ...text.body, fontFamily: font.medium },
  historyDate: { ...text.small },
});
