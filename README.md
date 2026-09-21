# Tasmeow (ทาสเหมียว) 🐾

> **แอปตั้งเป้าหมายชีวิต + เลี้ยงแมวเสมือน** — Portfolio project 
![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)

<!--
📸 เพิ่ม screenshot 2-3 รูปตรงนี้ วิธี:
1) ถ่ายจอมือถือ (บ้านน้อง, timer, กราฟ Effort vs Outcome)
2) upload ที่ imgur.com
3) copy URL มาแทนตัวอย่างล่าง

<p align="center">
  <img src="URL_1" width="240" />
  <img src="URL_2" width="240" />
  <img src="URL_3" width="240" />
</p>
-->

---

## 🐱 What & Why

Tasmeow เกิดจากปัญหาจริงของผู้สร้าง — **มีเป้าหมายหลายอย่างในชีวิต (เรียนภาษา, coding, อ่านหนังสือสอบ, ออกกำลังกาย) แต่แบ่งเวลาไม่ลงตัว** แอปนี้แก้ปัญหานั้นโดย:

- ตั้งเป้าหมายพร้อม**ชั่วโมง/สัปดาห์**ที่ตั้งใจจะทำ + **ตัวชี้วัดผลลัพธ์**ปลายทาง (เช่นน้ำหนัก, คะแนน TOEIC)
- **จับเวลาทำจริง**ด้วย timer แล้วดูสรุปว่าเวลาไหลไปที่ไหน อันไหนถูกละเลย
- **กราฟคู่ Effort vs Outcome** เห็นทันทีว่าเวลาที่ลงไปแปลงเป็นผลจริงไหม
- ทำได้เหรียญ → **เลี้ยงแมวเสมือน 5 พันธุ์** → มี streak, ร้านค้า, แต่งตัว, ปลดล็อกพันธุ์

**ชื่อ Tasmeow** = ทาส (ทาสแมว) + Task (ภารกิจ) + meow — ผู้ใช้คือ**ทาส**ที่ทำ**ภารกิจ**เพื่อปรนนิบัติ**น้อง**

---

## 🎯 Highlights ที่อยากให้ดู

จุดที่ผมภูมิใจและอยากเชิญคุณเข้าไปดูโค้ดจริง:

| Highlight                                                                                     | ที่อยู่ในโค้ด                            |
| --------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Business logic บน database** (Postgres triggers + RPC) — เหรียญ/โบนัส/โควตาปลอมไม่ได้      | Supabase (`purchase_item`, `equip_item`) |
| **Auth gate เป็น state machine** — โค้ดหน้า login/signup ไม่มี `router.push` เลย              | `app/_layout.tsx`                        |
| **Timer resilient** — จับเวลาต่อได้แม้แอปถูกฆ่า (persist ที่ AsyncStorage)                    | `app/timer.tsx` + `lib/timer-storage.ts` |
| **กราฟ Effort vs Outcome** — SVG chart custom ตอบคำถามหัวใจของแอป                             | `components/effort-outcome-chart.tsx`    |
| **Bar chart 30 วัน stacked ตามเป้าหมาย** — ไม่พึ่ง library กราฟ                               | `app/(tabs)/stats.tsx`                   |
| **Daily reminder per goal** — schedule/cancel local notification เมื่อเปิด/ปิด/แก้เวลา        | `lib/notifications.ts`                   |
| **Design system กลาง + component ใช้ซ้ำ** — theme กลาง 1 ไฟล์คุมทั้งแอป                       | `constants/theme.ts` + `components/`     |
| **Safe area handling** — จอ edge-to-edge, gesture bar, notch — จัดครบทุกหน้า                  | `components/screen.tsx`                  |
| **1 form เป็น 2 modes** (create/edit) จาก URL param เดียว                                     | `app/goal-form.tsx`                      |
| **Row Level Security ครบทุกตาราง** — ผู้ใช้เห็นเฉพาะข้อมูลตัวเอง                              | Supabase Dashboard                       |
| **แมวแต่งตัวได้จริง** — รูป bake แมว+ผ้าพันคอ 15 แบบ, หมวก layer ซ้อน, ลองใส่ก่อนซื้อในร้าน   | `components/cat-display.tsx` + `app/shop.tsx` |
| **Voice guide ของแอป** — คุมโทนข้อความทุกจุดด้วยเอกสารเดียว ไม่ปล่อยให้แต่ละหน้าเขียนกันเอง   | [`COPY.md`](./COPY.md)                   |
| **แปล error ของ Supabase เป็นภาษาคน** — ผู้ใช้ไม่เจอ "Invalid login credentials" ดิบๆ         | `lib/auth-errors.ts`                     |

---

## 🛠 Tech Stack

**Frontend**

- Expo SDK 54 (managed) + TypeScript
- expo-router (file-based routing, typed routes)
- Supabase JS + AsyncStorage (persist session + timer state)
- react-native-svg (custom charts)
- expo-notifications + expo-keep-awake
- react-native-safe-area-context
- @expo-google-fonts/prompt (Thai + English)

**Backend (Supabase)**

- PostgreSQL + Row Level Security
- Auth (email/password)
- Database triggers + RPC functions สำหรับ business logic

---

## ✨ Features

### 🎯 การติดตามเป้าหมาย

- CRUD เป้าหมาย พร้อมสี + เป้าชั่วโมง/สัปดาห์
- ตัวชี้วัดผลลัพธ์ (metric) เช่น น้ำหนัก, คะแนน TOEIC
- Dashboard สรุปสัปดาห์นี้ (จันทร์–อาทิตย์)

### ⏱ Timer + Session

- จับเวลาแบบ resilient — ล็อกจอ/ปิดแอปแล้วเวลานับต่อ
- Keep-awake ระหว่างจับเวลา
- Manual log ย้อนหลัง (มีเพดานรายวัน 3 ครั้ง/60 นาที)
- แจ้งเตือนรายวันต่อเป้าหมาย

### 📊 Stats & Analysis

- กราฟแท่ง 30 วัน stacked ตามเป้าหมาย
- สรุปเวลารวม / วันที่ทำ / เฉลี่ยต่อวัน / longest streak
- **กราฟคู่ Effort vs Outcome 12 สัปดาห์** — เห็นว่าเวลาที่ลงไปแปลงเป็นผลจริงไหม

### 🐾 ระบบเกม

- แมว 5 พันธุ์ (วิเชียรมาศ, ส้ม, โคราช, ทักซิโด้, สกอตติชโฟลด์) — ภาพ kawaii สไตล์เดียวกันทั้งแอป
- แต่งตัวน้อง: หมวก 4 แบบ (layer ซ้อน) + ผ้าพันคอ 3 แบบ (รูป bake แมว+ผ้าพันคอ 15 combos เพื่อให้ดูเป็นธรรมชาติ)
- ร้านค้ามี **ลองใส่ก่อนซื้อ** — แตะ item แล้วเห็นน้อง preview ทันที
- อารมณ์น้อง 4 สถานะ ตามพฤติกรรมผู้ใช้ (ไม่ลงโทษ) — แสดงเป็น badge หน้าน้องบนตัวแมว
- เหรียญ (server-side calculation — ปลอมไม่ได้)
- Streak + โบนัสเหรียญวันแรกของวัน (สูตร: 5 + streak, ตัน 30)
- ร้านค้า: หมวก, ผ้าพันคอ, ปลดล็อกพันธุ์

### ✍️ Voice & Tone

- ข้อความทั้งแอปคุมโทนเดียวกัน — **อบอุ่นแต่สุภาพ** คงคำว่า "ทาส/น้อง" เป็นคาแรกเตอร์
- Alert ทุกอันมีทั้งหัวข้อ (เกิดอะไรขึ้น) และคำอธิบาย (ต้องทำอะไรต่อ)
- แปล error ของ Supabase เป็นไทยที่ผู้ใช้เข้าใจ — ไม่โยน "Invalid login credentials" ใส่หน้าผู้ใช้
- ข้อความทุกจุดรวมไว้ที่ [COPY.md](./COPY.md) พร้อมกติกาการเขียน

### 🎨 Design System

- Theme กลาง 1 ไฟล์คุมทั้งแอป — สี, spacing, radius, typography
- 4pt grid + warm neutrals (พื้นครีม `#FFFDF9` + accent ส้ม `#F59E0B`)
- Component ใช้ซ้ำ: `<Button>`, `<Card>`, `<Chip>`, `<Screen>`, `<Icon>`, `<CatDisplay>`
- Icon sticker ชุดเดียวกับ art ของแมว (เหรียญ, ไฟ streak, ร้านค้า, เป้าหมาย ฯลฯ) แทน emoji
- Logo + app icon ครบชุด (iOS, Android adaptive + monochrome, favicon, splash)
- **Voice & tone guide** — ข้อความทุกจุดในแอปคุมโทนเดียวกัน ดูได้ที่ [COPY.md](./COPY.md)
- Font Prompt (Google Font) รองรับไทย + อังกฤษในตัวเดียว
- Safe area handling — จัด edge-to-edge, gesture bar, notch ครบทุกหน้า

---

## 🚀 Getting Started

```bash
# 1) Clone
git clone https://github.com/YOUR_USERNAME/tasmeow.git
cd tasmeow

# 2) ติดตั้ง dependencies
npm install

# 3) สร้าง .env
cp .env.example .env
# แล้วใส่:
# EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# 4) รัน dev server
npx expo start
```

สแกน QR ด้วย Expo Go บนมือถือ (ต้องเป็นเวอร์ชันที่รองรับ SDK 54)

**Backend setup:** สร้างโปรเจกต์ Supabase แล้วตั้งค่า tables + triggers + RPC functions (`purchase_item`, `equip_item`, `unequip_slot`) + RLS ผ่าน SQL Editor ใน Supabase Dashboard

---

## 📦 Build (Android APK)

Build ผ่าน EAS cloud — config อยู่ใน `eas.json` แล้ว:

```bash
npm install -g eas-cli
eas login
eas init                              # ครั้งแรกครั้งเดียว
eas env:push preview --path .env      # ส่ง env vars ขึ้น EAS (เพราะ .env ถูก gitignore)
eas build --platform android --profile preview
```

เสร็จแล้วได้ลิงก์ดาวน์โหลด `.apk` ติดตั้งบน Android ได้เลย

---

## 🧠 หลักการออกแบบที่ใช้

1. **ฟังก์ชันหลักก่อน แล้วค่อยทำให้ดี** — MVP ก่อน แล้วค่อยโพลิช
2. **แก้ปัญหาที่มีคนเจอจริง** อย่าแก้ปัญหาที่จินตนาการ
3. **Server เป็นแหล่งความจริง** — business logic ที่แตะข้อมูลอยู่ที่ database
4. **ไม่ลงโทษผู้ใช้ที่ไม่สมบูรณ์แบบ** — streak หายก็เริ่มใหม่ ไม่มีการหักเหรียญ
5. **ความเรียบง่ายที่ผู้ใช้เข้าใจได้ ทรงพลังกว่าความแม่นยำที่ซับซ้อน**
6. **Nudge ดีกว่า Force** — ลด rate + จำกัดโควตาแทนการปิดฟีเจอร์
7. **เขียนเองดีกว่าพึ่ง library ที่คุมไม่ได้** — bar chart กับ effort/outcome chart เขียนด้วย SVG ล้วน ไม่มี dependency กราฟที่มีปัญหาเวอร์ชันชนบ่อย
8. **สม่ำเสมอด้วย design system** — สี/spacing/component แก้ที่เดียวทั้งแอปเปลี่ยนตาม ไม่ใช่ hardcode ทีละหน้า
9. **ข้อความคือส่วนหนึ่งของ UI** — ทุกข้อความบอกว่า *ต้องทำอะไรต่อ* ไม่ใช่แค่ *อะไรพัง* และคุมโทนด้วย [COPY.md](./COPY.md) ไม่ปล่อยให้แต่ละหน้าเขียนกันเอง

---

## 📅 Status & Roadmap

**เฟส 1 (แกน productivity):** ✅ Auth, Goals, Timer, Manual log, Dashboard, Metrics
**เฟส 2 (ระบบเกม):** ✅ เหรียญ, อารมณ์น้อง, Streak, ร้านค้า, ปลดล็อกพันธุ์
**เฟส 3 (โพลิช):**

- ✅ Timer resilience + keep-awake
- ✅ Push notification รายวัน
- ✅ Stats screen + กราฟแท่ง 30 วัน
- ✅ Effort vs Outcome chart
- ✅ Design system กลาง + component ใช้ซ้ำ (theme, Button, Card, Chip)
- ✅ Font ภาษาไทย (Prompt) + typography preset
- ✅ Safe area handling ทุกหน้า
- ✅ Asset จริงของแมว + ของแต่งตัว (รูป bake 15 combos + ลองใส่ก่อนซื้อ)
- ✅ Mood หน้าน้อง 4 อารมณ์ + icon sticker แทน emoji
- ✅ Logo + app icon ครบชุด + splash screen + EAS build config
- ✅ Voice & tone pass ทั้งแอป + แปล error ของ Supabase เป็นภาษาไทย ([COPY.md](./COPY.md))
- ✅ ยืนยันรหัสผ่านตอนสมัคร + แก้คีย์บอร์ดบังช่องกรอกบน Android edge-to-edge
- ⏳ Design pass รอบสอง — ปรับ art แมว/หมวก/ผ้าพันคอให้คุมโทนเดียวกับ icon
- ⏳ Micro-interactions + animation

---

## 👤 About

**ผู้พัฒนา:** Sarunpat Promthong
**Email:** sarunpat.2544@gmail.com

หากสนใจพูดคุยเรื่องงาน ยินดีมากครับ 🙌
