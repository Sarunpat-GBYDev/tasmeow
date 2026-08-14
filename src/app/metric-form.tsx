import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { Screen } from "@/components/screen";
import { colors, font, radius, spacing, text } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
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

export default function MetricFormScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const { session } = useAuth();

  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [startValue, setStartValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [direction, setDirection] = useState<"increase" | "decrease">(
    "increase",
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const start = parseFloat(startValue);
    const target = parseFloat(targetValue);
    if (!name.trim()) {
      Alert.alert(
        "กรุณาตั้งชื่อตัวชี้วัด",
        "โปรดระบุสิ่งที่ต้องการวัดผล เช่น น้ำหนัก, คะแนน TOEIC",
      );
      return;
    }
    if (isNaN(start) || isNaN(target)) {
      Alert.alert(
        "ค่าไม่ถูกต้อง",
        "ค่าเริ่มต้นและค่าเป้าหมายต้องเป็นตัวเลขเท่านั้น เช่น 72.5",
      );
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("goal_metrics").insert({
      user_id: session!.user.id,
      goal_id: goalId,
      name: name.trim(),
      unit: unit.trim() || null,
      start_value: start,
      target_value: target,
      direction,
    });
    setSaving(false);
    if (error)
      Alert.alert(
        "บันทึกไม่สำเร็จ",
        `โปรดลองใหม่อีกครั้ง\n\n(${error.message})`,
      );
    else router.back();
  }

  return (
    <Screen edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.intro}>
            <Icon name="chart" size={40} />
            <Text style={styles.introText}>
              ตัวชี้วัดผลลัพธ์ช่วยให้เห็นว่าเวลาที่ลงไปได้ผลจริงไหม
            </Text>
          </View>

          <Text style={styles.label}>ชื่อตัวชี้วัด</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น น้ำหนัก, คะแนน TOEIC"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={30}
          />

          <Text style={styles.label}>หน่วย (ไม่บังคับ)</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น kg, คะแนน, บท"
            placeholderTextColor={colors.textMuted}
            value={unit}
            onChangeText={setUnit}
            maxLength={10}
          />

          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <View style={{ flex: 1, gap: spacing.sm }}>
              <Text style={styles.label}>ค่าเริ่มต้น</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น 75"
                placeholderTextColor={colors.textMuted}
                value={startValue}
                onChangeText={setStartValue}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, gap: spacing.sm }}>
              <Text style={styles.label}>ค่าเป้าหมาย</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น 68"
                placeholderTextColor={colors.textMuted}
                value={targetValue}
                onChangeText={setTargetValue}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>ทิศทาง</Text>
          <View style={styles.directionRow}>
            {[
              {
                key: "increase",
                label: "📈 เพิ่มขึ้นดี",
                hint: "คะแนน, จำนวนบท",
              },
              {
                key: "decrease",
                label: "📉 ลดลงดี",
                hint: "น้ำหนัก, เวลาวิ่ง",
              },
            ].map((d) => {
              const isSelected = direction === d.key;
              return (
                <Pressable
                  key={d.key}
                  style={[
                    styles.directionCard,
                    isSelected && styles.directionCardActive,
                  ]}
                  onPress={() => setDirection(d.key as "increase" | "decrease")}
                >
                  <Text
                    style={[
                      styles.directionLabel,
                      isSelected && { color: colors.primaryDark },
                    ]}
                  >
                    {d.label}
                  </Text>
                  <Text style={styles.directionHint}>{d.hint}</Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            label={saving ? "กำลังบันทึก..." : "สร้างตัวชี้วัด"}
            onPress={handleSave}
            disabled={saving}
            style={{ marginTop: spacing.lg }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, gap: spacing.sm },
  intro: {
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.xl,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  introText: { ...text.small, textAlign: "center" },
  label: {
    ...text.bodyStrong,
    fontFamily: font.medium,
    marginTop: spacing.md,
  },
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
  directionRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  directionCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  directionCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primarySoft,
  },
  directionLabel: { ...text.bodyStrong, fontSize: 14 },
  directionHint: { ...text.muted },
});
