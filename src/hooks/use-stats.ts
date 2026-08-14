import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useCallback, useState } from "react";

const DAYS = 30;

export type DailyBar = {
  date: Date;
  key: string; // "YYYY-MM-DD" สำหรับ debug/lookup
  segments: { goalId: string; color: string; hours: number }[];
  totalHours: number;
};

export type Stats = {
  days: DailyBar[]; // 30 วันเรียงเก่า→ใหม่
  totalHours: number; // รวมทั้งเดือน
  avgDailyHours: number; // เฉลี่ยต่อวันที่มี session (ไม่รวมวันว่าง)
  activeDays: number; // จำนวนวันที่มี session
  longestStreak: number; // streak ยาวที่สุดใน 30 วัน
};

function toKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function useStats() {
  const { session } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) return;
    setLoading(true);

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - (DAYS - 1));
    startDate.setHours(0, 0, 0, 0);

    // ดึงพร้อมกัน 2 ตาราง
    const [goalsRes, sessionsRes] = await Promise.all([
      supabase.from("goals").select("id, color").eq("user_id", session.user.id),
      supabase
        .from("sessions")
        .select("goal_id, started_at, ended_at")
        .eq("user_id", session.user.id)
        .gte("started_at", startDate.toISOString()),
    ]);

    if (goalsRes.error || sessionsRes.error) {
      console.error("stats fetch error");
      setLoading(false);
      return;
    }

    // map สีของแต่ละ goal
    const colorByGoal: Record<string, string> = {};
    for (const g of goalsRes.data ?? []) {
      colorByGoal[g.id] = g.color;
    }

    // สร้าง 30 ช่องวันเรียงเก่า→ใหม่ (ไล่จากอดีตมาปัจจุบัน)
    const days: DailyBar[] = [];
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push({
        date: d,
        key: toKey(d),
        segments: [],
        totalHours: 0,
      });
    }
    const byKey: Record<string, DailyBar> = {};
    for (const d of days) byKey[d.key] = d;

    // รวมชั่วโมงลงในช่องวันที่ตรงกัน + แยกตาม goal
    for (const s of sessionsRes.data ?? []) {
      const start = new Date(s.started_at);
      const end = new Date(s.ended_at);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const key = toKey(start);
      const day = byKey[key];
      if (!day) continue;

      // segment เดิมของ goal นี้ (ถ้ามี) → บวกเข้าไป
      const existing = day.segments.find((seg) => seg.goalId === s.goal_id);
      if (existing) {
        existing.hours += hours;
      } else {
        day.segments.push({
          goalId: s.goal_id,
          color: colorByGoal[s.goal_id] ?? "#9CA3AF",
          hours,
        });
      }
      day.totalHours += hours;
    }

    // สรุปเป็นตัวเลข
    const totalHours = days.reduce((sum, d) => sum + d.totalHours, 0);
    const activeDays = days.filter((d) => d.totalHours > 0).length;
    const avgDailyHours = activeDays > 0 ? totalHours / activeDays : 0;

    // longest streak ใน window นี้ (ไม่ใช่ streak ปัจจุบัน)
    let longestStreak = 0;
    let cur = 0;
    for (const d of days) {
      if (d.totalHours > 0) {
        cur += 1;
        if (cur > longestStreak) longestStreak = cur;
      } else {
        cur = 0;
      }
    }

    setStats({
      days,
      totalHours,
      avgDailyHours,
      activeDays,
      longestStreak,
    });
    setLoading(false);
  }, [session]);

  return { stats, loading, refresh };
}
