import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useCallback, useState } from "react";

export function useProfile() {
  const { session } = useAuth();
  const [coins, setCoins] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("coins")
      .eq("id", session.user.id)
      .maybeSingle();
    setCoins(data?.coins ?? 0);
    setLoading(false);
  }, [session]);

  return { coins, loading, refresh };
}
