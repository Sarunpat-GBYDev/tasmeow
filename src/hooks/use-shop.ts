import { BreedKey } from "@/constants/breeds";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useCallback, useState } from "react";

export type ShopItemCategory = "hat" | "scarf" | "breed_unlock";

export type ShopItem = {
  id: string;
  name: string;
  category: ShopItemCategory;
  price: number;
  image_key: string | null;
  unlock_breed: BreedKey | null;
  owned: boolean;
};

export function useShop() {
  const { session } = useAuth();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("shop_items_with_status")
      .select("*")
      .order("category", { ascending: true })
      .order("price", { ascending: true });

    if (error) console.error("shop fetch error:", error.message);
    setItems((data as ShopItem[]) ?? []);
    setLoading(false);
  }, [session]);

  return { items, loading, refresh };
}
