import { supabase } from "@/lib/supabase";
import { useCallback, useState } from "react";

const WEEKS = 12;

export type WeekPoint = {
  weekStart: Date;
  label: string; // เช่น "3 มี.ค."
  effortHours: number;
  outcomeValue: number | null;
};

// จันทร์ 00:00 ของสัปดาห์ที่ date อยู่
function mondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function useEffortOutcome(
  goalId: string | undefined,
  metricId: string | undefined,
) {
  const [points, setPoints] = useState<WeekPoint[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!goalId) return;
    setLoading(true);

    const now = new Date();
    const currentMonday = mondayOf(now);
    const startMonday = new Date(currentMonday);
    startMonday.setDate(currentMonday.getDate() - 7 * (WEEKS - 1));

    // เตรียม 12 กล่องสัปดาห์
    const weeks: WeekPoint[] = [];
    for (let i = 0; i < WEEKS; i++) {
      const d = new Date(startMonday);
      d.setDate(startMonday.getDate() + 7 * i);
      weeks.push({
        weekStart: d,
        label: d.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        }),
        effortHours: 0,
        outcomeValue: null,
      });
    }

    // ดึง sessions + metric logs พร้อมกัน
    const sessionsPromise = supabase
      .from("sessions")
      .select("started_at, ended_at")
      .eq("goal_id", goalId)
      .gte("started_at", startMonday.toISOString());

    const logsPromise = metricId
      ? supabase
          .from("metric_logs")
          .select("value, logged_at")
          .eq("metric_id", metricId)
          .order("logged_at", { ascending: true })
      : Promise.resolve({ data: [], error: null });

    const [sessionsRes, logsRes] = await Promise.all([
      sessionsPromise,
      logsPromise,
    ]);

    // รวมชั่วโมงลงในสัปดาห์ที่ตรงกัน
    for (const s of sessionsRes.data ?? []) {
      const wStart = mondayOf(new Date(s.started_at));
      const idx = weeks.findIndex(
        (w) => w.weekStart.getTime() === wStart.getTime(),
      );
      if (idx < 0) continue;
      const hrs =
        (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) /
        (1000 * 60 * 60);
      weeks[idx].effortHours += hrs;
    }

    // Outcome = ค่า metric ล่าสุดในสัปดาห์นั้น + carry forward จากสัปดาห์ก่อน
    const logs = (logsRes.data ?? []) as { value: number; logged_at: string }[];
    let lastKnown: number | null = null;
    // ก่อน 12 สัปดาห์: หาค่าล่าสุดก่อน startMonday เพื่อเริ่มต้น
    for (const l of logs) {
      if (new Date(l.logged_at) < startMonday) lastKnown = l.value;
    }
    for (const w of weeks) {
      const weekEnd = new Date(w.weekStart);
      weekEnd.setDate(w.weekStart.getDate() + 7);
      // logs ในสัปดาห์นี้ → เอาค่าล่าสุด
      const inWeek = logs.filter((l) => {
        const t = new Date(l.logged_at);
        return t >= w.weekStart && t < weekEnd;
      });
      if (inWeek.length > 0) {
        lastKnown = inWeek[inWeek.length - 1].value;
      }
      w.outcomeValue = lastKnown;
    }

    setPoints(weeks);
    setLoading(false);
  }, [goalId, metricId]);

  return { points, loading, refresh };
}
