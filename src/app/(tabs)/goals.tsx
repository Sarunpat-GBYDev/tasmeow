import { Icon } from "@/components/icon";
import { Screen } from "@/components/screen";
import { colors, radius, shadow, spacing, text } from "@/constants/theme";
import { Goal, useGoals } from "@/hooks/use-goals";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function GoalsScreen() {
  const { goals, loading, refresh } = useGoals();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  function confirmDelete(goal: Goal) {
    Alert.alert(
      "ยืนยันการลบเป้าหมาย",
      `ต้องการลบ "${goal.name}" หรือไม่?\nเวลาที่บันทึกไว้ของเป้าหมายนี้จะถูกลบทั้งหมดและไม่สามารถกู้คืนได้`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบ",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("goals")
              .delete()
              .eq("id", goal.id);
            if (error)
              Alert.alert(
                "ลบไม่สำเร็จ",
                `โปรดลองใหม่อีกครั้ง\n\n(${error.message})`,
              );
            else refresh();
          },
        },
      ],
    );
  }

  return (
    <Screen edges={["left", "right"]}>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Icon
                name="target"
                size={72}
                style={{ marginBottom: spacing.sm }}
              />
              <Text style={styles.emptyTitle}>ยังไม่มีเป้าหมาย</Text>
              <Text style={styles.emptyText}>
                กดปุ่ม + เพื่อสร้างเป้าหมายแรก{"\n"}น้องรออยู่แล้ว 🐾
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() =>
              router.push({ pathname: "/goal/[id]", params: { id: item.id } })
            }
          >
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <View style={styles.cardBody}>
              <Text style={styles.goalName}>{item.name}</Text>
              <Text style={styles.goalTarget}>
                เป้า {item.weekly_target_hours} ชม./สัปดาห์
              </Text>
            </View>
            <Pressable
              hitSlop={12}
              onPress={() => confirmDelete(item)}
              style={styles.trashHit}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          </Pressable>
        )}
      />

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push("/goal-form")}
      >
        <Ionicons name="add" size={30} color={colors.textOnPrimary} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  emptyTitle: { ...text.h3 },
  emptyText: {
    ...text.small,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
  colorDot: { width: 16, height: 16, borderRadius: 8 },
  cardBody: { flex: 1, gap: 2 },
  goalName: { ...text.bodyStrong, fontSize: 16 },
  goalTarget: { ...text.small, color: colors.textSecondary },
  trashHit: { padding: spacing.xs },
  fab: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.md,
  },
  fabPressed: { transform: [{ scale: 0.94 }], opacity: 0.9 },
});
