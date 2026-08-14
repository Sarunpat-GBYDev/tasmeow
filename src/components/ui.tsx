import { colors, font, radius, spacing } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

// ------- Card -------
export function Card({
  children,
  style,
  variant = "default",
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "soft" | "primary";
}) {
  return (
    <View
      style={[
        styles.cardBase,
        variant === "default" && styles.cardDefault,
        variant === "soft" && styles.cardSoft,
        variant === "primary" && styles.cardPrimary,
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ------- Chip -------
export function Chip({
  label,
  selected,
  color,
  onPress,
  disabled,
}: {
  label: string;
  selected?: boolean;
  color?: string; // สีสำหรับเป้าหมาย ถ้ามีจะ override สีเลือก
  onPress?: () => void;
  disabled?: boolean;
}) {
  const bg = selected
    ? (color ?? colors.primary)
    : disabled
      ? colors.surfaceAlt
      : colors.surface;
  const border = selected ? bg : colors.border;
  const textColor = selected ? colors.textOnPrimary : colors.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: bg, borderColor: border },
        pressed && !disabled && { opacity: 0.85 },
        disabled && { opacity: 0.35 },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: textColor,
            fontFamily: selected ? font.semibold : font.medium,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Card
  cardBase: {
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  cardDefault: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSoft: {
    backgroundColor: colors.surfaceAlt,
  },
  cardPrimary: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  // Chip
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  chipText: {
    fontSize: 14,
  },
});
