import { Button } from "@/components/button";
import { Screen } from "@/components/screen";
import { BREEDS, BreedKey } from "@/constants/breeds";
import { colors, font, radius, shadow, spacing, text } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useCat } from "@/hooks/use-cat";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const STARTER_BREEDS = BREEDS.filter((b) => !b.locked);

export default function OnboardingScreen() {
  const { session } = useAuth();
  const { refresh: refreshCat } = useCat();
  const [breed, setBreed] = useState<BreedKey>(STARTER_BREEDS[0].key);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    if (!name.trim()) {
      Alert.alert("ยังไม่ได้ตั้งชื่อน้อง", "ตั้งชื่อให้น้องก่อนเริ่มกันนะ");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("cats").insert({
      user_id: session!.user.id,
      breed,
      name: name.trim(),
    });
    setSaving(false);
    if (error) {
      Alert.alert(
        "บันทึกไม่สำเร็จ",
        `ลองใหม่อีกครั้งนะ\n\n(${error.message})`,
      );
      return;
    }
    await refreshCat();
  }

  const selected = STARTER_BREEDS.find((b) => b.key === breed);
  const lockedCount = BREEDS.length - STARTER_BREEDS.length;

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>เลือกน้องของทาส</Text>
            <Text style={styles.subtitle}>
              เลือกได้ตอนนี้ {STARTER_BREEDS.length} พันธุ์ อีก {lockedCount}{" "}
              พันธุ์ปลดล็อกในร้านค้า
            </Text>
          </View>

          <View style={styles.breedGrid}>
            {STARTER_BREEDS.map((b) => {
              const isSelected = breed === b.key;
              return (
                <Pressable
                  key={b.key}
                  style={[
                    styles.breedCard,
                    isSelected && styles.breedCardActive,
                  ]}
                  onPress={() => setBreed(b.key)}
                >
                  <Image
                    source={b.image}
                    style={styles.breedImage}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.breedName,
                      isSelected && { color: colors.primaryDark },
                    ]}
                    numberOfLines={1}
                  >
                    {b.nameTh}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.previewCard}>
            {selected && (
              <Image
                source={selected.image}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            <Text style={styles.previewText}>
              ทาสจะเลี้ยง{" "}
              <Text
                style={{ fontFamily: font.bold, color: colors.primaryDark }}
              >
                {selected?.nameTh}
              </Text>
            </Text>
            <Text style={styles.previewDesc}>{selected?.description}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>ตั้งชื่อน้อง</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น มะม่วง, ทองคำ, ขนมปัง"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={20}
            />
          </View>

          <Button
            label={saving ? "กำลังบันทึก..." : "เริ่มต้นใช้งาน"}
            onPress={handleFinish}
            disabled={saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: { alignItems: "center", gap: spacing.xs, marginTop: spacing.md },
  title: { ...text.h1, fontSize: 26 },
  subtitle: {
    ...text.small,
    color: colors.textSecondary,
    textAlign: "center",
  },
  breedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
  },
  breedCard: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  breedCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primarySoft,
    ...shadow.sm,
  },
  breedImage: { width: 56, height: 56 },
  breedName: { ...text.small, fontFamily: font.medium },
  previewCard: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.xl,
    gap: spacing.xs,
  },
  previewImage: { width: 130, height: 130 },
  previewText: { ...text.body, textAlign: "center" },
  previewDesc: {
    ...text.small,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  form: { gap: spacing.sm },
  label: {
    ...text.bodyStrong,
    fontFamily: font.medium,
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
});
