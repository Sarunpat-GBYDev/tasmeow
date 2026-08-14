import { Button } from "@/components/button";
import { Screen } from "@/components/screen";
import { Chip } from "@/components/ui";
import { colors, font, radius, spacing, text } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useGoals } from "@/hooks/use-goals";
import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Quota = {
  used_count: number;
  used_minutes: number;
  max_count: number;
  max_minutes: number;
  remaining_count: number;
  remaining_minutes: number;
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function ManualLogScreen() {
  const { session } = useAuth();
  const { goals, refresh } = useGoals();

  const [goalId, setGoalId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [minutes, setMinutes] = useState("");
  const [saving, setSaving] = useState(false);
  const [quota, setQuota] = useState<Quota | null>(null);

  const loadQuota = useCallback(async () => {
    const { data } = await supabase.rpc("get_manual_quota_today");
    if (data) setQuota(data as Quota);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
      loadQuota();
    }, [refresh, loadQuota]),
  );

  async function handleSave() {
    const mins = parseInt(minutes, 10);
    if (!goalId) {
      Alert.alert("กรุณาเลือกเป้าหมาย", "โปรดเลือกว่าเวลานี้ใช้ทำเป้าหมายใด");
      return;
    }
    if (isNaN(mins) || mins <= 0 || mins > 1440) {
      Alert.alert(
        "จำนวนนาทีไม่ถูกต้อง",
        "โปรดระบุตัวเลขระหว่าง 1 ถึง 1440 นาที",
      );
      return;
    }

    if (quota) {
      if (quota.remaining_count <= 0) {
        Alert.alert(
          "ใช้สิทธิ์บันทึกย้อนหลังครบแล้ว",
          `วันนี้บันทึกย้อนหลังได้ ${quota.max_count} ครั้ง และใช้ครบแล้ว\nโควตาจะรีเซ็ตในวันถัดไป หรือใช้การจับเวลาแทนได้`,
        );
        return;
      }
      if (mins > quota.remaining_minutes) {
        Alert.alert(
          "เกินเวลาที่บันทึกย้อนหลังได้",
          `วันนี้บันทึกย้อนหลังได้อีก ${quota.remaining_minutes} นาที จากโควตาวันละ ${quota.max_minutes} นาที`,
        );
        return;
      }
    }

    const now = new Date();
    let end: Date;
    if (isSameDay(date, now)) {
      end = now;
    } else {
      end = new Date(date);
      end.setHours(12, 0, 0, 0);
    }
    const start = new Date(end.getTime() - mins * 60 * 1000);

    setSaving(true);
    const { error } = await supabase.from("sessions").insert({
      user_id: session!.user.id,
      goal_id: goalId,
      started_at: start.toISOString(),
      ended_at: end.toISOString(),
      source: "manual",
    });
    setSaving(false);
    if (error) {
      Alert.alert(
        "บันทึกไม่สำเร็จ",
        `โปรดลองใหม่อีกครั้ง\n\n(${error.message})`,
      );
      return;
    }
    router.back();
  }

  const quotaColor =
    !quota || quota.remaining_count === 0 || quota.remaining_minutes === 0
      ? colors.danger
      : quota.remaining_minutes < 20
        ? colors.warning
        : colors.success;

  return (
    <Screen edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {quota && (
            <View style={[styles.quotaBar, { borderColor: quotaColor }]}>
              <Text style={[styles.quotaText, { color: quotaColor }]}>
                โควตาวันนี้: เหลือ {quota.remaining_count} ครั้ง /{" "}
                {quota.remaining_minutes} นาที
              </Text>
              <Text style={styles.quotaHint}>
                บันทึกย้อนหลังได้เหรียญ 25% ของการจับเวลาจริง
              </Text>
            </View>
          )}

          <Text style={styles.label}>เป้าหมาย</Text>
          <View style={styles.chipWrap}>
            {goals.map((g) => (
              <Chip
                key={g.id}
                label={g.name}
                color={g.color}
                selected={goalId === g.id}
                onPress={() => setGoalId(g.id)}
              />
            ))}
          </View>

          <Text style={styles.label}>วันที่ทำ</Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.dateText}>
              {date.toLocaleDateString("th-TH", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </Text>
          </Pressable>
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              maximumDate={new Date()}
              onChange={(_, selected) => {
                setShowPicker(Platform.OS === "ios");
                if (selected) setDate(selected);
              }}
            />
          )}

          <Text style={styles.label}>ใช้เวลาไปกี่นาที</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น 45"
            placeholderTextColor={colors.textMuted}
            value={minutes}
            onChangeText={setMinutes}
            keyboardType="number-pad"
            maxLength={4}
          />

          <Button
            label={saving ? "กำลังบันทึก..." : "บันทึกย้อนหลัง"}
            onPress={handleSave}
            disabled={saving}
            style={{ marginTop: spacing.xl }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, gap: spacing.sm },
  quotaBar: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  quotaText: { ...text.bodyStrong, fontSize: 14 },
  quotaHint: { ...text.muted, marginTop: spacing.xs },
  label: {
    ...text.bodyStrong,
    fontFamily: font.medium,
    marginTop: spacing.md,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md + 2,
    backgroundColor: colors.surface,
  },
  dateText: { ...text.body, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md + 2,
    fontSize: 16,
    fontFamily: font.regular,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
});
