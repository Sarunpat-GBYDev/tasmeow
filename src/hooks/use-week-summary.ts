import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useCallback, useState } from "react";

export type GoalSummary = {
  id: string;
  name: string;
  color: string;
  targetHours: number;
  doneHours: number;
};

// หาช่วงสัปดาห์ปัจจุบัน: จันทร์ 00:00 ถึงจันทร์หน้า 00:00 (ตามเวลาเครื่อง)
function getWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0=อาทิตย์, 1=จันทร์, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  return { start: monday, end: nextMonday };
}

export function useWeekSummary() {
  const { session } = useAuth();
  const [summaries, setSummaries] = useState<GoalSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { start, end } = getWeekRange();

    // ยิง 2 query พร้อมกันให้เร็วขึ้น
    const [goalsRes, sessionsRes] = await Promise.all([
      supabase
        .from("goals")
        .select("id, name, color, weekly_target_hours")
        .eq("user_id", session.user.id)
        .eq("is_archived", false)
        .order("created_at", { ascending: true }),
      supabase
        .from("sessions")
        .select("goal_id, started_at, ended_at")
        .eq("user_id", session.user.id)
        .gte("started_at", start.toISOString())
        .lt("started_at", end.toISOString()),
    ]);

    if (goalsRes.error || sessionsRes.error) {
      console.error(
        "week summary error:",
        goalsRes.error?.message ?? sessionsRes.error?.message,
      );
      setLoading(false);
      return;
    }

    // รวมวินาทีของแต่ละเป้าหมาย
    const secondsByGoal: Record<string, number> = {};
    for (const s of sessionsRes.data ?? []) {
      const dur =
        (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) /
        1000;
      secondsByGoal[s.goal_id] = (secondsByGoal[s.goal_id] ?? 0) + dur;
    }

    setSummaries(
      (goalsRes.data ?? []).map((g) => ({
        id: g.id,
        name: g.name,
        color: g.color,
        targetHours: Number(g.weekly_target_hours),
        doneHours: (secondsByGoal[g.id] ?? 0) / 3600,
      })),
    );
    setLoading(false);
  }, [session]);

  return { summaries, loading, refresh };
}
