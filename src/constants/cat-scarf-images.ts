import { ImageSourcePropType } from "react-native";
import { BreedKey } from "./breeds";

// รูปแมวใส่ผ้าพันคอแบบ bake มาจากต้นทาง (สวยกว่า layer ซ้อน)
// key = `${breed}_${scarfKey}` — ถ้าไม่มีคู่ไหน CatDisplay จะ fallback ไป layer แบบเดิม
const CAT_SCARF_IMAGES: Record<string, ImageSourcePropType> = {
  siamese_scarf_red: require("@/assets/cats/siamese_scarf_red.png"),
  siamese_scarf_dot: require("@/assets/cats/siamese_scarf_dot.png"),
  siamese_scarf_bowtie: require("@/assets/cats/siamese_scarf_bowtie.png"),

  orange_tabby_scarf_red: require("@/assets/cats/orange_tabby_scarf_red.png"),
  orange_tabby_scarf_dot: require("@/assets/cats/orange_tabby_scarf_dot.png"),
  orange_tabby_scarf_bowtie: require("@/assets/cats/orange_tabby_scarf_bowtie.png"),

  korat_scarf_red: require("@/assets/cats/korat_scarf_red.png"),
  korat_scarf_dot: require("@/assets/cats/korat_scarf_dot.png"),
  korat_scarf_bowtie: require("@/assets/cats/korat_scarf_bowtie.png"),

  tuxedo_scarf_red: require("@/assets/cats/tuxedo_scarf_red.png"),
  tuxedo_scarf_dot: require("@/assets/cats/tuxedo_scarf_dot.png"),
  tuxedo_scarf_bowtie: require("@/assets/cats/tuxedo_scarf_bowtie.png"),

  scottish_fold_scarf_red: require("@/assets/cats/scottish_fold_scarf_red.png"),
  scottish_fold_scarf_dot: require("@/assets/cats/scottish_fold_scarf_dot.png"),
  scottish_fold_scarf_bowtie: require("@/assets/cats/scottish_fold_scarf_bowtie.png"),
};

export function getCatScarfImage(
  breed: BreedKey,
  scarfKey: string | null | undefined,
): ImageSourcePropType | null {
  if (!scarfKey) return null;
  return CAT_SCARF_IMAGES[`${breed}_${scarfKey}`] ?? null;
}
