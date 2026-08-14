import { colors } from "@/constants/theme";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { CatProvider, useCat } from "@/hooks/use-cat";
import { useAppFonts } from "@/hooks/use-fonts";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { session, loading: authLoading } = useAuth();
  const { cat, loading: catLoading } = useCat();
  const segments = useSegments();
  const router = useRouter();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!navState?.key) return;
    if (authLoading) return;
    if (session && catLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && !cat && !inOnboarding) {
      router.replace("/onboarding");
    } else if (session && cat && (inAuthGroup || inOnboarding)) {
      router.replace("/(tabs)");
    }
  }, [navState?.key, session, cat, authLoading, catLoading, segments, router]);

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.bg },
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { fontFamily: "Prompt_600SemiBold" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="timer"
        options={{ presentation: "modal", title: "จับเวลา" }}
      />
      <Stack.Screen
        name="goal-form"
        options={{ presentation: "modal", title: "เป้าหมาย" }}
      />
      <Stack.Screen
        name="manual-log"
        options={{ presentation: "modal", title: "บันทึกย้อนหลัง" }}
      />
      <Stack.Screen
        name="metric-form"
        options={{ presentation: "modal", title: "ตัวชี้วัด" }}
      />
      <Stack.Screen
        name="shop"
        options={{ presentation: "modal", title: "ร้านของน้อง" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={colors.bg} />
      <AuthProvider>
        <CatProvider>
          <RootNavigator />
        </CatProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
