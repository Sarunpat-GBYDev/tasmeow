import { ImageSourcePropType } from "react-native";

export type BreedKey =
  | "siamese"
  | "orange_tabby"
  | "korat"
  | "tuxedo"
  | "scottish_fold";

export type Breed = {
  key: BreedKey;
  nameTh: string;
  emoji: string;
  image: ImageSourcePropType;
  description: string;
  locked: boolean;
};

export const BREEDS: Breed[] = [
  {
    key: "siamese",
    nameTh: "วิเชียรมาศ",
    emoji: "😺",
    image: require("@/assets/cats/siamese.png"),
    description: "แมวไทยระดับโลก ตาฟ้า หน้าเข้ม",
    locked: false,
  },
  {
    key: "orange_tabby",
    nameTh: "แมวส้ม",
    emoji: "🐱",
    image: require("@/assets/cats/orange_tabby.png"),
    description: "จอมป่วนประจำบ้าน พลังงานล้น",
    locked: false,
  },
  {
    key: "korat",
    nameTh: "โคราช (สีสวาด)",
    emoji: "🐈‍⬛",
    image: require("@/assets/cats/korat.png"),
    description: "แมวไทยมงคล ขนเทาเงินทั้งตัว",
    locked: false,
  },
  {
    key: "tuxedo",
    nameTh: "ทักซิโด้",
    emoji: "🤵",
    image: require("@/assets/cats/tuxedo.png"),
    description: "ใส่สูทมาแต่เกิด สุภาพบุรุษเหมียว",
    locked: true,
  },
  {
    key: "scottish_fold",
    nameTh: "สกอตติชโฟลด์",
    emoji: "😽",
    image: require("@/assets/cats/scottish_fold.png"),
    description: "ตัวกลม หูพับ นุ่มนิ่มสุดในบ้าน",
    locked: true,
  },
];
