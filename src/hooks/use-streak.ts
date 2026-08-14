import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useCallback, useState } from "react";

// แปลง Date เป็น "YYYY-MM-DD" ตามเขตเวลาเครื่อง
function localDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function useStreak() {
  const { session } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) return;
    setLoading(true);

    // ดึง session ย้อนหลัง 60 วัน (เพียงพอสำหรับคำนวณ streak ทั่วไป)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data } = await supabase
      .from("sessions")
      .select("ended_at")
      .eq("user_id", session.user.id)
      .gte("ended_at", sixtyDaysAgo.toISOString());

    // สร้าง set ของวันที่มี session
    const daysWithSession = new Set<string>();
    for (const row of data ?? []) {
      daysWithSession.add(localDateKey(new Date(row.ended_at)));
    }

    // ไล่ย้อนจากวันนี้: ถ้ามี session ในวันนั้น +1 ถ้าไม่มี หยุด
    // ยกเว้นวันนี้ที่ยังไม่มี → เริ่มนับจากเมื่อวาน (คนอาจยังไม่ได้ทำวันนี้)
    let count = 0;
    const cursor = new Date();
    const today = localDateKey(cursor);
    if (!daysWithSession.has(today)) {
      cursor.setDate(cursor.getDate() - 1);
    }
    for (let i = 0; i < 60; i++) {
      const key = localDateKey(cursor);
      if (daysWithSession.has(key)) {
        count += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    setStreak(count);
    setLoading(false);
  }, [session]);

  return { streak, loading, refresh };
}
