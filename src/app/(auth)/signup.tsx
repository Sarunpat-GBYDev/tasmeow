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

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // เตือนแบบ inline ทันทีที่พิมพ์ครบ ไม่ต้องรอกดปุ่มถึงจะรู้
  const mismatch = confirm.length > 0 && password !== confirm;

  async function handleSignup() {
    if (!email.trim()) {
      Alert.alert("กรุณากรอกอีเมล", "โปรดระบุอีเมลที่ใช้งานได้จริง");
      return;
    }
    if (!email.includes("@")) {
      Alert.alert("รูปแบบอีเมลไม่ถูกต้อง", "กรุณาตรวจสอบอีเมลอีกครั้ง");
      return;
    }
    if (password.length < 6) {
      Alert.alert("รหัสผ่านสั้นเกินไป", "กรุณาตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (!confirm) {
      Alert.alert(
        "กรุณายืนยันรหัสผ่าน",
        "โปรดกรอกรหัสผ่านอีกครั้งเพื่อยืนยัน",
      );
      return;
    }
    if (password !== confirm) {
      Alert.alert(
        "รหัสผ่านไม่ตรงกัน",
        "กรุณาตรวจสอบว่ากรอกรหัสผ่านตรงกันทั้งสองช่อง",
      );
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert("สมัครไม่สำเร็จ", authErrorMessage(error.message));
      return;
    }
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
            <Text style={styles.title}>สมัครสมาชิก</Text>
            <Text style={styles.subtitle}>มาเริ่มเลี้ยงน้องของทาสกัน</Text>
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
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
            <TextInput
              style={[styles.input, mismatch && styles.inputError]}
              placeholder="พิมพ์รหัสผ่านอีกครั้ง"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              value={confirm}
              onChangeText={setConfirm}
            />
            {mismatch && (
              <Text style={styles.errorText}>รหัสผ่านไม่ตรงกัน</Text>
            )}

            <Button
              label={loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
              onPress={handleSignup}
              disabled={loading}
              style={{ marginTop: spacing.md }}
            />

            <View style={styles.linkRow}>
              <Text style={styles.linkText}>มีบัญชีอยู่แล้ว? </Text>
              <Link href="/(auth)/login" style={styles.linkAction}>
                เข้าสู่ระบบ
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
  title: { ...text.h1, fontFamily: font.bold, fontSize: 32 },
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
  inputError: { borderColor: colors.danger },
  errorText: {
    ...text.small,
    color: colors.danger,
    marginTop: spacing.xs,
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
