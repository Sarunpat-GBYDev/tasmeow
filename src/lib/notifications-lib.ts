import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ตั้งค่าให้ notification แสดงเมื่อแอปเปิดอยู่ด้วย (default คือแสดงเฉพาะตอนแอปปิด)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ขออนุญาต — เรียกครั้งแรกก่อน schedule
// คืน true = อนุญาตแล้ว, false = ผู้ใช้ปฏิเสธ
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return false;

  // Android 8+ ต้องสร้าง channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
    });
  }
  return true;
}

// schedule notification ประจำวัน คืน id ที่ใช้ cancel ทีหลัง
export async function scheduleDailyReminder(params: {
  hour: number;
  minute: number;
  title: string;
  body: string;
}): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: params.title,
      body: params.body,
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: params.hour,
      minute: params.minute,
    },
  });
  return id;
}

export async function cancelReminder(id: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // ถ้า id ไม่มีในเครื่องแล้ว (เช่น เปลี่ยนเครื่อง reinstall แอป) ข้ามได้
  }
}
