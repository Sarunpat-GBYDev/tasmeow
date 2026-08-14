import { Button } from "@/components/button";
import { Screen } from "@/components/screen";
import { colors, font, radius, spacing, text } from "@/constants/theme";
import { authErrorMessage } from "@/lib/auth-errors";
import { supabase } from "@/lib/supabase";
import { Link } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim()) {
      Alert.alert("กรุณากรอกอีเมล", "โปรดระบุอีเมลที่ใช้สมัครสมาชิก");
      return;
    }
    if (!password) {
      Alert.alert("กรุณากรอกรหัสผ่าน", "โปรดระบุรหัสผ่านของคุณ");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error)
      Alert.alert("เข้าสู่ระบบไม่สำเร็จ", authErrorMessage(error.message));
  }

  return (
    <Screen>
      {/* padding ทั้ง 2 platform — Android edge-to-edge ไม่ resize ให้เอง */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Image
              source={require("@/assets/logo.png")}
              style={styles.heroLogo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Tasmeow</Text>
            <Text style={styles.subtitle}>
              ทาสเหมียว — ตั้งเป้าหมาย เลี้ยงน้องไปด้วยกัน
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>อีเมล</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>รหัสผ่าน</Text>
            <TextInput
              style={styles.input}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Button
              label={loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              onPress={handleLogin}
              disabled={loading}
              style={{ marginTop: spacing.md }}
            />

            <View style={styles.linkRow}>
              <Text style={styles.linkText}>ยังไม่มีบัญชี? </Text>
              <Link href="/(auth)/signup" style={styles.linkAction}>
                สมัครสมาชิก
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: "center",
    gap: spacing["2xl"],
  },
  hero: { alignItems: "center", gap: spacing.xs },
  heroLogo: { width: 120, height: 120, marginBottom: spacing.sm },
  title: { ...text.h1, fontFamily: font.bold, fontSize: 36 },
  subtitle: { ...text.small, color: colors.textSecondary },
  form: { gap: spacing.sm },
  label: {
    ...text.bodyStrong,
    fontFamily: font.medium,
    marginTop: spacing.sm,
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
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  linkText: { ...text.small, color: colors.textSecondary },
  linkAction: {
    ...text.small,
    fontFamily: font.semibold,
    color: colors.primaryDark,
  },
});
