import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "tasmeow:active_timer";

export type ActiveTimer = {
  goalId: string;
  startedAt: number; // Unix ms
};

export async function saveActiveTimer(t: ActiveTimer) {
  await AsyncStorage.setItem(KEY, JSON.stringify(t));
}

export async function loadActiveTimer(): Promise<ActiveTimer | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ActiveTimer;
  } catch {
    return null;
  }
}

export async function clearActiveTimer() {
  await AsyncStorage.removeItem(KEY);
}
