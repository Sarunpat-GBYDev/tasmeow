import { Button } from "@/components/button";
import { Screen } from "@/components/screen";
import { colors, font, radius, shadow, spacing, text } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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

const PALETTE = [
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

export default function GoalFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session } = useAuth();
  const isEdit = !!id;

  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[1]);
  const [hours, setHours] = useState("5");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from("goals")
        .select("name, color, weekly_target_hours")
        .eq("id", id)
        .single();
      if (data) {
        setName(data.name);
        setColor(data.color);
        setHours(String(data.weekly_target_hours));
      }
      setLoading(false);
    })();
  }, [id]);

  async function handleSave() {
    const h = parseFloat(hours);
    if (!name.trim()) {
      Alert.alert(
        "กรุณาตั้งชื่อเป้าหมาย",
        "โปรดระบุชื่อเป้าหมาย เช่น อ่านหนังสือสอบ, ออกกำลังกาย",
      );
      return;
    }
    if (isNaN(h) || h <= 0 || h > 168) {
      Alert.alert(
        "ชั่วโมงต่อสัปดาห์ไม่ถูกต้อง",
        "โปรดระบุตัวเลขระหว่าง 0.5 ถึง 168 ชั่วโมง",
      );
      return;
    }
    setSaving(true);
    if (isEdit) {
      const { error } = await supabase
        .from("goals")
        .update({ name: name.trim(), color, weekly_target_hours: h })
        .eq("id", id);
      setSaving(false);
      if (error)
        Alert.alert(
          "บันทึกไม่สำเร็จ",
          `โปรดลองใหม่อีกครั้ง\n\n(${error.message})`,
        );
      else router.back();
    } else {
      const { error } = await supabase.from("goals").insert({
        user_id: session!.user.id,
        name: name.trim(),
        color,
        weekly_target_hours: h,
      });
      setSaving(false);
      if (error)
        Alert.alert(
          "สร้างเป้าหมายไม่สำเร็จ",
          `โปรดลองใหม่อีกครั้ง\n\n(${error.message})`,
        );
      else router.back();
    }
  }

  if (loading) {
    return (
      <Screen edges={["bottom"]}>
        <View style={styles.centered}>
          <Text style={styles.dim}>กำลังโหลด...</Text>
        </View>
      </Screen>
    );
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
          <Text style={styles.label}>ชื่อเป้าหมาย</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น อ่านหนังสือสอบ, ออกกำลังกาย"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={40}
          />

          <Text style={styles.label}>สีประจำเป้าหมาย</Text>
          <View style={styles.palette}>
            {PALETTE.map((c) => {
              const isSelected = color === c;
              return (
                <Pressable
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    isSelected && styles.colorDotSelected,
                  ]}
                  onPress={() => setColor(c)}
                />
              );
            })}
          </View>

          <Text style={styles.label}>เป้าเวลา (ชั่วโมง/สัปดาห์)</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น 5"
            placeholderTextColor={colors.textMuted}
            value={hours}
            onChangeText={setHours}
            keyboardType="numeric"
          />
          <Text style={styles.hint}>
            หน้าบ้านน้องจะแสดงความคืบหน้าเทียบกับ {hours || "?"}{" "}
            ชั่วโมงต่อสัปดาห์ให้เห็นทุกวัน
          </Text>

          <Button
            label={
              saving
                ? "กำลังบันทึก..."
                : isEdit
                  ? "บันทึกการแก้ไข"
                  : "สร้างเป้าหมาย"
            }
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dim: { ...text.small, color: colors.textMuted },
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
  palette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorDotSelected: { borderColor: colors.textPrimary, ...shadow.sm },
  hint: { ...text.muted, marginTop: spacing.xs },
});
