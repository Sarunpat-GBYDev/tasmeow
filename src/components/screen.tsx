// วางที่: components/screen.tsx
// Wrapper component สำหรับหน้าจอทุกหน้า — จัด safe area + สีพื้นให้อัตโนมัติ
// การใช้:
//   <Screen>            = SafeArea ทุกด้าน (default หน้าปกติ)
//   <Screen edges={['top']}> = เฉพาะบน (สำหรับ modal ที่ไม่มี tab bar)
//   <Screen edges={[]}>  = ไม่ใช้ safe area เลย (สำหรับหน้าใน tab ที่ tab bar handle bottom เอง)

import { colors } from "@/constants/theme";
import { StyleSheet, ViewStyle } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

const DEFAULT_EDGES: Edge[] = ["top", "left", "right", "bottom"];

export function Screen({
  children,
  edges = DEFAULT_EDGES,
  style,
}: {
  children: React.ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
}) {
  return (
    <SafeAreaView style={[styles.base, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
