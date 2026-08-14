import { Icon, IconName } from "@/components/icon";
import { colors, font, radius, shadow, spacing } from "@/constants/theme";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  disabled,
  loading,
  style,
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: IconName;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {icon && !loading && <Icon name={icon} size={22} />}
      <Text style={[styles.text, styles[`${variant}Text` as const]]}>
        {loading ? "กำลังโหลด..." : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  md: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  lg: {
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing.lg,
  },
  // variants
  primary: {
    backgroundColor: colors.primary,
    ...shadow.sm,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  // state
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  // text
  text: {
    fontFamily: font.bold,
    fontSize: 16,
  },
  primaryText: { color: colors.textOnPrimary },
  secondaryText: { color: colors.primaryDark },
  ghostText: { color: colors.primaryDark },
});
