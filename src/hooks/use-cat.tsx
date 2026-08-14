import { BreedKey } from "@/constants/breeds";
import { SHOP_IMAGES } from "@/constants/shop-images";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Cat = {
  id: string;
  breed: BreedKey;
  name: string;
  equipped: Record<string, string>;
  // equipped แปลงเป็น image_key แล้ว — ใช้กับ CatDisplay ได้เลย
  equippedImages: Record<string, string>;
};

// equipped ใน DB อาจเก็บเป็น item id (uuid) — แปลงเป็น image_key ให้ CatDisplay ใช้
// ถ้า value เป็น key ที่รู้จักอยู่แล้ว (เช่น "hat_crown") ใช้ได้เลย ไม่ต้อง query
async function resolveEquippedImages(
  equipped: Record<string, string> | null,
): Promise<Record<string, string>> {
  if (!equipped) return {};
  const out: Record<string, string> = {};
  const unknownIds: string[] = [];
  for (const [slot, value] of Object.entries(equipped)) {
    if (SHOP_IMAGES[value]) out[slot] = value;
    else unknownIds.push(value);
  }
  if (unknownIds.length > 0) {
    const { data } = await supabase
      .from("shop_items")
      .select("id, image_key")
      .in("id", unknownIds);
    const idToKey = new Map(
      (data ?? []).map((r) => [r.id as string, r.image_key as string | null]),
    );
    for (const [slot, value] of Object.entries(equipped)) {
      if (!out[slot]) {
        const key = idToKey.get(value);
        if (key) out[slot] = key;
      }
    }
  }
  return out;
}

type CatContextType = {
  cat: Cat | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const CatContext = createContext<CatContextType>({
  cat: null,
  loading: true,
  refresh: async () => {},
});

export function CatProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [cat, setCat] = useState<Cat | null>(null);
  // เก็บว่าข้อมูลแมวล่าสุดเป็นของ user คนไหน — กัน gate เห็นข้อมูลเก่าค้าง
  // ตอน login เสร็จใหม่ๆ (session มีแต่ยังไม่ได้ fetch) loading จะเป็น true ทันที
  const [fetchedFor, setFetchedFor] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    // ยังไม่ login = ไม่มีแมวแน่นอน ไม่ต้อง query
    if (!session) {
      setCat(null);
      setFetchedFor(null);
      return;
    }
    // maybeSingle = ถ้าไม่เจอแถวจะได้ null เฉยๆ ไม่โยน error
    const { data, error } = await supabase
      .from("cats")
      .select("id, breed, name, equipped")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error) console.error("fetch cat error:", error.message);
    if (data) {
      const equippedImages = await resolveEquippedImages(
        data.equipped as Record<string, string> | null,
      );
      setCat({ ...(data as Omit<Cat, "equippedImages">), equippedImages });
    } else {
      setCat(null);
    }
    setFetchedFor(session.user.id);
  }, [session]);

  // ดึงใหม่ทุกครั้งที่สถานะ login เปลี่ยน (login/logout/สลับบัญชี)
  useEffect(() => {
    refresh();
  }, [refresh]);

  // loading = มี session แต่ข้อมูลในมือยังไม่ใช่ของ user คนนี้
  const loading = !!session && fetchedFor !== session.user.id;

  return (
    <CatContext.Provider value={{ cat, loading, refresh }}>
      {children}
    </CatContext.Provider>
  );
}

export const useCat = () => useContext(CatContext);
