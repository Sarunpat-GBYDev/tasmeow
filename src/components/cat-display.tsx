// วางที่: components/cat-display.tsx (ใหม่)
// แสดงน้องเป็นรูปจริง + layer หมวก + ผ้าพันคอ + emoji อารมณ์ที่มุมบนขวา
//
// โครงสร้าง 4 ชั้น (จากล่างขึ้นบน):
// 1) ตัวน้อง (breed image)
// 2) ผ้าพันคอ (ถ้าใส่)  — วางแถวคอ
// 3) หมวก    (ถ้าใส่)  — วางบนหัว
// 4) mood emoji badge  — มุมบนขวา
//
// การใช้:
//   <CatDisplay breed={cat.breed} equipped={cat.equipped} moodEmoji="😻" size={220} />
//   <CatDisplay breed="siamese" size={120} />                    // ตัวอย่างในหน้าเลือกพันธุ์
//   <CatDisplay breed="siamese" previewHat="hat_crown" size={120} /> // preview ในร้าน

import { BREEDS, BreedKey } from "@/constants/breeds";
import { getCatScarfImage } from "@/constants/cat-scarf-images";
import { getShopImage } from "@/constants/shop-images";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";

type EquippedMap = Record<string, string> | null;

export function CatDisplay({
  breed,
  equipped,
  moodEmoji,
  moodImage,
  size = 220,
  previewHat,
  previewScarf,
}: {
  breed: BreedKey;
  equipped?: EquippedMap;
  moodEmoji?: string;
  // ถ้าส่ง moodImage มาจะใช้รูปแทน emoji
  moodImage?: ImageSourcePropType;
  size?: number;
  // ใช้ตอน preview ในร้าน (แสดงของที่จะซื้อ ไม่ต้อง save)
  previewHat?: string | null;
  previewScarf?: string | null;
}) {
  const breedData = BREEDS.find((b) => b.key === breed);
  if (!breedData) return null;

  const hatKey = previewHat ?? equipped?.hat;
  const scarfKey = previewScarf ?? equipped?.scarf;
  const hatImage = getShopImage(hatKey);

  // ถ้ามีรูป bake (แมว+ผ้าพันคอในรูปเดียว) ใช้เป็นรูปตัวน้องเลย ไม่ต้อง layer
  const bakedImage = getCatScarfImage(breed, scarfKey);
  const scarfImage = bakedImage ? null : getShopImage(scarfKey);
  const baseImage = bakedImage ?? breedData.image;

  // ใช้รูปหน้าน้อง → ขยาย badge ให้เห็นสีหน้าชัด (emoji ใช้ขนาดเดิม)
  const moodSize = moodImage
    ? Math.max(44, size * 0.28)
    : Math.max(28, size * 0.18);

  return (
    <View style={{ width: size, height: size }}>
      {/* 1) ตัวน้อง — เต็มกล่อง (ถ้าใส่ผ้าพันคอจะเป็นรูป bake แมว+ผ้าพันคอ) */}
      <Image source={baseImage} style={styles.layer} resizeMode="contain" />

      {/* 2) ผ้าพันคอ — วางแถวคอ (รูป scarf ถูกตัดขอบบนเว้ารับคางไว้แล้ว) */}
      {scarfImage && (
        <Image
          source={scarfImage}
          style={[
            styles.layer,
            {
              top: size * 0.44,
              left: size * 0.31,
              width: size * 0.38,
              height: size * 0.28,
            },
          ]}
          resizeMode="contain"
        />
      )}

      {/* 3) หมวก — วางบนหัวระหว่างหู */}
      {hatImage && (
        <Image
          source={hatImage}
          style={[
            styles.layer,
            {
              top: size * 0.02,
              left: size * 0.31,
              width: size * 0.38,
              height: size * 0.3,
            },
          ]}
          resizeMode="contain"
        />
      )}

      {/* 4) mood badge — มุมบนขวา (รูปหน้าน้อง หรือ fallback เป็น emoji) */}
      {(moodImage || moodEmoji) && (
        <View
          style={[
            styles.moodBadge,
            {
              width: moodSize,
              height: moodSize,
              borderRadius: moodSize / 2,
              right: -size * 0.02,
              top: size * 0.02,
            },
          ]}
        >
          {moodImage ? (
            <Image
              source={moodImage}
              style={{ width: moodSize * 0.94, height: moodSize * 0.94 }}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ fontSize: moodSize * 0.65 }}>{moodEmoji}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  moodBadge: {
    position: "absolute",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
  },
});
