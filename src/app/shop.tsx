import { Button } from "@/components/button";
import { CatDisplay } from "@/components/cat-display";
import { Icon, IconName } from "@/components/icon";
import { Screen } from "@/components/screen";
import { BREEDS } from "@/constants/breeds";
import { getShopImage } from "@/constants/shop-images";
import { colors, font, radius, spacing, text } from "@/constants/theme";
import { useCat } from "@/hooks/use-cat";
import { useProfile } from "@/hooks/use-profile";
import { ShopItem, ShopItemCategory, useShop } from "@/hooks/use-shop";
import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const CATEGORY_LABEL: Record<ShopItemCategory, string> = {
  hat: "หมวก",
  scarf: "ผ้าพันคอ",
  breed_unlock: "ปลดล็อกพันธุ์",
};

const CATEGORY_ICON: Record<ShopItemCategory, IconName> = {
  hat: "hat",
  scarf: "scarf",
  breed_unlock: "unlock",
};

export default function ShopScreen() {
  const { items, refresh: refreshShop } = useShop();
  const { coins, refresh: refreshCoins } = useProfile();
  const { cat, refresh: refreshCat } = useCat();
  const [busyId, setBusyId] = useState<string | null>(null);
  // แตะ item เพื่อลองใส่ดูก่อนซื้อ/ใส่จริง (ไม่ save) — แตะซ้ำเพื่อเลิกลอง
  const [previewHat, setPreviewHat] = useState<string | null>(null);
  const [previewScarf, setPreviewScarf] = useState<string | null>(null);

  function handlePreview(item: ShopItem) {
    if (!item.image_key) return;
    if (item.category === "hat") {
      setPreviewHat((k) => (k === item.image_key ? null : item.image_key));
    } else if (item.category === "scarf") {
      setPreviewScarf((k) => (k === item.image_key ? null : item.image_key));
    }
  }

  useFocusEffect(
    useCallback(() => {
      refreshShop();
      refreshCoins();
      refreshCat();
    }, [refreshShop, refreshCoins, refreshCat]),
  );

  function isEquipped(item: ShopItem): boolean {
    if (!cat?.equipped) return false;
    const equipped = cat.equipped as Record<string, string>;
    return equipped[item.category] === item.id;
  }

  async function handleBuy(item: ShopItem) {
    if (coins < item.price) {
      Alert.alert(
        "เหรียญไม่เพียงพอ",
        `"${item.name}" ราคา ${item.price} เหรียญ\nคุณมี ${coins} เหรียญ ยังขาดอีก ${item.price - coins} เหรียญ`,
      );
      return;
    }
    Alert.alert(
      "ยืนยันการซื้อ",
      `ต้องการซื้อ "${item.name}" ราคา ${item.price} เหรียญหรือไม่?\nคงเหลือหลังซื้อ ${coins - item.price} เหรียญ`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ซื้อ",
          onPress: async () => {
            setBusyId(item.id);
            const { error } = await supabase.rpc("purchase_item", {
              p_item_id: item.id,
            });
            setBusyId(null);
            if (error) {
              Alert.alert(
                "ซื้อไม่สำเร็จ",
                `โปรดลองใหม่อีกครั้ง\n\n(${error.message})`,
              );
              return;
            }
            await Promise.all([refreshShop(), refreshCoins()]);
          },
        },
      ],
    );
  }

  async function handleEquip(item: ShopItem) {
    setBusyId(item.id);
    const { error } = await supabase.rpc("equip_item", { p_item_id: item.id });
    setBusyId(null);
    if (error) {
      Alert.alert(
        "สวมใส่ไม่สำเร็จ",
        `โปรดลองใหม่อีกครั้ง\n\n(${error.message})`,
      );
      return;
    }
    await refreshCat();
  }

  async function handleUnequip(category: ShopItemCategory) {
    setBusyId(`unequip-${category}`);
    const { error } = await supabase.rpc("unequip_slot", {
      p_category: category,
    });
    setBusyId(null);
    if (error) {
      Alert.alert(
        "ถอดออกไม่สำเร็จ",
        `โปรดลองใหม่อีกครั้ง\n\n(${error.message})`,
      );
      return;
    }
    await refreshCat();
  }

  async function handleUseBreed(item: ShopItem) {
    if (!item.unlock_breed) return;
    Alert.alert(
      "ยืนยันการเปลี่ยนพันธุ์",
      `ต้องการเปลี่ยนน้องเป็นพันธุ์ "${
        BREEDS.find((b) => b.key === item.unlock_breed)?.nameTh
      }" หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "เปลี่ยน",
          onPress: async () => {
            setBusyId(item.id);
            const { error } = await supabase
              .from("cats")
              .update({ breed: item.unlock_breed })
              .eq("id", cat!.id);
            setBusyId(null);
            if (error) {
              Alert.alert(
                "เปลี่ยนพันธุ์ไม่สำเร็จ",
                `โปรดลองใหม่อีกครั้ง\n\n(${error.message})`,
              );
              return;
            }
            await refreshCat();
          },
        },
      ],
    );
  }

  const grouped: Record<ShopItemCategory, ShopItem[]> = {
    hat: [],
    scarf: [],
    breed_unlock: [],
  };
  for (const it of items) grouped[it.category].push(it);

  return (
    <Screen edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.coinPill}>
            <Icon name="coin" size={20} />
            <Text style={styles.coinAmount}>{coins.toLocaleString()}</Text>
          </View>
        </View>

        {/* preview น้อง — แตะ item ด้านล่างเพื่อลองใส่ */}
        {cat && (
          <View style={styles.previewCard}>
            <CatDisplay
              breed={cat.breed}
              equipped={cat.equippedImages}
              previewHat={previewHat}
              previewScarf={previewScarf}
              size={150}
            />
            <Text style={styles.previewHint}>
              {previewHat || previewScarf
                ? "กำลังลองสวมใส่ — แตะรายการเดิมอีกครั้งเพื่อถอด"
                : "แตะรายการเพื่อลองสวมใส่ให้น้องดูก่อน"}
            </Text>
          </View>
        )}

        {(Object.keys(grouped) as ShopItemCategory[]).map((catKey) => (
          <View key={catKey} style={{ gap: spacing.sm }}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Icon name={CATEGORY_ICON[catKey]} size={24} />
                <Text style={styles.sectionTitle}>{CATEGORY_LABEL[catKey]}</Text>
              </View>
              {catKey !== "breed_unlock" &&
                cat?.equipped &&
                (cat.equipped as Record<string, string>)[catKey] && (
                  <Pressable hitSlop={8} onPress={() => handleUnequip(catKey)}>
                    <Text style={styles.unequipText}>ถอดทั้งหมด</Text>
                  </Pressable>
                )}
            </View>

            {grouped[catKey].map((item) => {
              const busy = busyId === item.id;
              const equipped = isEquipped(item);

              const itemImage = getShopImage(item.image_key);
              const previewing =
                item.image_key !== null &&
                (previewHat === item.image_key ||
                  previewScarf === item.image_key);

              return (
                <Pressable
                  key={item.id}
                  onPress={() => handlePreview(item)}
                  style={[
                    styles.card,
                    equipped && styles.cardEquipped,
                    previewing && styles.cardPreviewing,
                  ]}
                >
                  {itemImage && (
                    <Image
                      source={itemImage}
                      style={styles.itemImage}
                      resizeMode="contain"
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.itemPrice}>{item.price}</Text>
                      <Icon name="coin" size={14} />
                    </View>
                  </View>

                  {!item.owned ? (
                    <Button
                      label="ซื้อ"
                      size="md"
                      onPress={() => handleBuy(item)}
                      disabled={busy}
                    />
                  ) : item.category === "breed_unlock" ? (
                    <Button
                      label="ใช้"
                      variant="secondary"
                      size="md"
                      onPress={() => handleUseBreed(item)}
                      disabled={busy}
                    />
                  ) : equipped ? (
                    <Text style={styles.equippedTag}>✓ สวมใส่อยู่</Text>
                  ) : (
                    <Button
                      label="สวมใส่"
                      variant="secondary"
                      size="md"
                      onPress={() => handleEquip(item)}
                      disabled={busy}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}

        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>ปิดร้าน</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, gap: spacing.lg },
  header: { flexDirection: "row", justifyContent: "flex-end" },
  coinPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  coinAmount: {
    fontFamily: font.bold,
    color: colors.primaryDark,
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  sectionTitle: { ...text.bodyStrong },
  unequipText: { ...text.small, color: colors.textMuted },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardEquipped: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  cardPreviewing: {
    borderColor: colors.primaryDark,
  },
  itemImage: {
    width: 44,
    height: 44,
  },
  previewCard: {
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  previewHint: { ...text.small, color: colors.textMuted },
  itemName: { ...text.bodyStrong },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  itemPrice: { ...text.small },
  equippedTag: {
    ...text.bodyStrong,
    color: colors.success,
    paddingHorizontal: spacing.md,
  },
  closeBtn: {
    alignItems: "center",
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  closeText: { ...text.small, color: colors.textMuted },
});
