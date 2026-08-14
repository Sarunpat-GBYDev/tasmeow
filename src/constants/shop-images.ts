import { ImageSourcePropType } from "react-native";

export const SHOP_IMAGES: Record<string, ImageSourcePropType> = {
  // หมวก
  hat_straw: require("@/assets/hats/hat_straw.png"),
  hat_party: require("@/assets/hats/hat_party.png"),
  hat_beanie: require("@/assets/hats/hat_beanie.png"),
  hat_crown: require("@/assets/hats/hat_crown.png"),

  // ผ้าพันคอ
  scarf_red: require("@/assets/scarves/scarf_red.png"),
  scarf_dot: require("@/assets/scarves/scarf_dot.png"),
  scarf_bowtie: require("@/assets/scarves/scarf_bowtie.png"),

  // ปลดล็อกพันธุ์ — ใช้ภาพแมวเป็น preview
  unlock_tuxedo: require("@/assets/cats/tuxedo.png"),
  unlock_scottish: require("@/assets/cats/scottish_fold.png"),
};

export function getShopImage(key: string | null | undefined) {
  if (!key) return null;
  return SHOP_IMAGES[key] ?? null;
}
