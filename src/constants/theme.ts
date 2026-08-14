export const colors = {
  // brand
  primary: "#F59E0B", // ส้มหลัก
  primaryDark: "#B45309", // ส้มเข้ม (text on light)
  primaryLight: "#FEF3C7", // ส้มพื้นหลัง (pill, tag)
  primarySoft: "#FFFBEB", // ส้มอ่อนสุด (card bg)

  // semantic
  success: "#10B981",
  danger: "#EF4444",
  warning: "#D97706",
  streak: "#B91C1C",
  streakBg: "#FEF2F2",

  // neutrals (warm — เอียง yellow นิดๆ ให้เข้ากับส้ม)
  bg: "#FFFDF9", // พื้นแอป (ครีมอ่อนมาก)
  surface: "#FFFFFF", // card, modal
  surfaceAlt: "#FAF7F2", // card แบบเน้นเบาๆ
  border: "#EEE8DC", // เส้นขอบเบา
  divider: "#F3EDE1",

  // text
  textPrimary: "#1F1B15", // เกือบดำ warm
  textSecondary: "#6B6558",
  textMuted: "#A39B8B",
  textOnPrimary: "#FFFFFF",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  pill: 999,
};

export const font = {
  regular: "Prompt_400Regular",
  medium: "Prompt_500Medium",
  semibold: "Prompt_600SemiBold",
  bold: "Prompt_700Bold",
};

export const text = {
  h1: { fontFamily: font.bold, fontSize: 28, color: colors.textPrimary },
  h2: { fontFamily: font.bold, fontSize: 22, color: colors.textPrimary },
  h3: { fontFamily: font.semibold, fontSize: 18, color: colors.textPrimary },
  body: { fontFamily: font.regular, fontSize: 15, color: colors.textPrimary },
  bodyStrong: {
    fontFamily: font.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  small: {
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  muted: { fontFamily: font.regular, fontSize: 12, color: colors.textMuted },
  // ตัวเลขใหญ่ (เหรียญ, timer, sum)
  numeric: { fontFamily: font.bold, fontVariant: ["tabular-nums" as const] },
};

// shadow preset (ใช้ใน style ธรรมดา + elevation สำหรับ Android)
export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};
