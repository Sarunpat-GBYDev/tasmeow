// icon sticker แทน emoji — PNG โปร่งใส (src/assets/icons/)
import { Image, ImageStyle, StyleProp } from "react-native";

const ICONS = {
  coin: require("@/assets/icons/icon_coin.png"),
  fire: require("@/assets/icons/icon_fire.png"),
  shop: require("@/assets/icons/icon_shop.png"),
  hat: require("@/assets/icons/icon_hat.png"),
  scarf: require("@/assets/icons/icon_scarf.png"),
  unlock: require("@/assets/icons/icon_unlock.png"),
  chart: require("@/assets/icons/icon_chart.png"),
  target: require("@/assets/icons/icon_target.png"),
  paw: require("@/assets/icons/icon_paw.png"),
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  style,
}: {
  name: IconName;
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={ICONS[name]}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}
