# Reja: <vazifa nomi>

- Sana: YYYY-MM-DD
- Daraja: trivial | simple | moderate | complex | critical
- Holat: draft | approved | in-progress | done | blocked
- Brainstorming: [brainstorm.md](brainstorm.md)

## 1. Xulosa
Nima o'zgaradi va nega, ko'pi bilan uch qator.

## 2. Yondashuv
Tanlangan yechim. Rad etilgan muqobil va sababi, bir qatorda.
Yangi abstraksiya, fayl yoki dependency bo'lsa, har biri nega kerakligi.

## 3. Bosqichlar
1. <fayllar> - <nima o'zgaradi> - tekshiruv: `<buyruq>`
2. ...

## 4. Parallel xarita
Har bir qism uchun bitta qator. Qism boshqasiga bog'liq bo'lsa yoki fayllari kesishsa, worktree'da
ishlamaydi. Holat har qism tugagandan keyin yangilanadi.

| Qism | Bosqichlar | Fayllar | Bog'liq | Worktree | Holat |
|---|---|---|---|---|---|
| A | 1, 2 | `src/a/**` | - | ha | kutilmoqda |
| B | 3 | `src/b/**` | - | ha | kutilmoqda |
| C | 4 | `src/routes.ts` | A, B | yo'q (umumiy fayl) | kutilmoqda |

Holat qiymatlari: kutilmoqda · ishlanmoqda · tayyor · merge qilindi · xato (sabab)

## 5. Ma'lumot / API o'zgarishlari
(bo'lmasa olib tashlang)

## 6. Tekshirish rejasi
Qabul mezonlari va har birini nima isbotlaydi.

## 7. Rollback
