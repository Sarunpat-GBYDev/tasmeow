import { Button } from "@/components/button";
import { Screen } from "@/components/screen";
import { Card } from "@/components/ui";
import { colors, font, spacing, text } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

export default function SettingsScreen() {
  const { session } = useAuth();

  function handleLogout() {
    Alert.alert("ออกจากระบบ", "ต้องการออกจากระบบหรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  }

  return (
    <Screen edges={["left", "right"]}>
      <View style={styles.container}>
        <Card>
          <Text style={styles.label}>บัญชีผู้ใช้</Text>
          <Text style={styles.email}>{session?.user.email}</Text>
        </Card>

        <Button
          label="ออกจากระบบ"
          variant="secondary"
          onPress={handleLogout}
          style={styles.logoutBtn}
        />

        <View style={styles.footer}>
          <Image
            source={require("@/assets/logo.png")}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Tasmeow</Text>
          <Text style={styles.version}>v1.0.0</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  label: { ...text.small, color: colors.textMuted },
  email: { ...text.bodyStrong, fontSize: 16, marginTop: spacing.xs },
  logoutBtn: { borderColor: colors.danger },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  footerLogo: { width: 56, height: 56 },
  appName: {
    ...text.body,
    fontFamily: font.semibold,
    color: colors.textSecondary,
  },
  version: { ...text.muted },
});
