import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useCallback, useState } from "react";

export type Goal = {
  id: string;
  name: string;
  color: string;
  weekly_target_hours: number;
};

export function useGoals() {
  const { session } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("goals")
      .select("id, name, color, weekly_target_hours")
      .eq("user_id", session.user.id)
      .eq("is_archived", false)
      .order("created_at", { ascending: true });

    if (error) console.error("fetch goals error:", error.message);
    setGoals((data as Goal[]) ?? []);
    setLoading(false);
  }, [session]);

  return { goals, loading, refresh };
}
