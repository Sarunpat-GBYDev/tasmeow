import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useCallback, useState } from "react";
import { ImageSourcePropType } from "react-native";

export type CatMood = "happy" | "idle" | "lonely" | "sleeping";

export type MoodInfo = {
  mood: CatMood;
  emoji: string;
  image: ImageSourcePropType;
  message: string;
};

const MOOD_MAP: Record<
  CatMood,
  { emoji: string; image: ImageSourcePropType; message: string }
> = {
  happy: {
    emoji: "😻",
    image: require("@/assets/moods/mood_happy.png"),
    message: "น้องดีใจที่เห็นทาสตั้งใจ",
  },
  idle: {
    emoji: "😺",
    image: require("@/assets/moods/mood_idle.png"),
    message: "น้องรอทาสอยู่",
  },
  lonely: {
    emoji: "🥺",
    image: require("@/assets/moods/mood_lonely.png"),
    message: "น้องเหงา ทาสหายไปนาน",
  },
  sleeping: {
    emoji: "😴",
    image: require("@/assets/moods/mood_sleeping.png"),
    message: "น้องหลับแล้ว ทาสพักผ่อนด้วย",
  },
};

function computeMood(lastSessionAt: Date | null, now: Date): CatMood {
  const hour = now.getHours();
  if (hour >= 22 || hour < 6) return "sleeping";

  if (!lastSessionAt) return "lonely";
  const hoursSince =
    (now.getTime() - lastSessionAt.getTime()) / (1000 * 60 * 60);
  if (hoursSince <= 6) return "happy";
  if (hoursSince <= 24) return "idle";
  return "lonely";
}

export function useCatMood(): MoodInfo & { refresh: () => Promise<void> } {
  const { session } = useAuth();
  const [mood, setMood] = useState<CatMood>("idle");

  const refresh = useCallback(async () => {
    if (!session) return;
    // ดึง session ล่าสุด 1 แถว เพื่อดูว่าเราทำอะไรครั้งสุดท้ายเมื่อไหร่
    const { data } = await supabase
      .from("sessions")
      .select("ended_at")
      .eq("user_id", session.user.id)
      .order("ended_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const last = data ? new Date(data.ended_at) : null;
    setMood(computeMood(last, new Date()));
  }, [session]);

  return { mood, ...MOOD_MAP[mood], refresh };
}
