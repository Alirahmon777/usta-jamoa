---
name: project-docs
description: Rules for the docs/ project memory used by the usta workflow (plan folders with brainstorm/plan/progress/HANDOFF, memory, adr, simplification, known-issues). Load before writing anything under docs/.
user-invocable: false
---
## Hujjatlar (`docs/`)

`docs/` loyihaning xotirasi. Sessiya tugaydi, `docs/` qoladi. Ish davomida yoziladi, oxirida emas:
sessiya to'satdan uzilsa ham hujjatlar haqiqiy holatni ko'rsatishi kerak.

Shablonlar: loyihada `docs/<papka>/_TEMPLATE*` bo'lsa o'shani, bo'lmasa
`${CLAUDE_PLUGIN_ROOT}/templates/docs/<papka>/` dagisini ishlat. Loyihaning o'z docs qoidalari
(CLAUDE.md yoki `.claude/rules/`) bo'lsa, ular ustun.

| Papka | Nima yoziladi | Kim yozadi |
|---|---|---|
| `docs/plans/<YYYY-MM-DD>-<slug>/` | Bitta vazifaning hamma hujjati (pastda) | orkestrator, planner, coder |
| `docs/memory/` | Loyiha bo'yicha doimiy faktlar va afzalliklar | orkestrator |
| `docs/adr/` | Qaytarish qiyin bo'lgan muhim qarorlar | orkestrator (planner taklifi bilan) |
| `docs/simplification/` | Simplifier nimani soddalashtirgani, qisqa | simplifier |
| `docs/known-issues/` | Topilgan, lekin shu vazifada tuzatilmagan narsalar | ishlayotgan har bir agent, audit |
| `docs/difference/`, `docs/migration-reports/` | Faqat migratsiya loyihalarida | analyzer, coder, orkestrator |

### `docs/plans/<YYYY-MM-DD>-<slug>/`
| Fayl | Mazmuni | Qachon yangilanadi |
|---|---|---|
| `brainstorm.md` | Variantlar, tavsiya, savollar va foydalanuvchi javoblari | rejadan oldin; javob kelganda |
| `plan.md` | Yondashuv, bosqichlar, **parallel xarita**, tekshirish, rollback | reja yozilganda; parallel xaritaning "Holat" ustuni har qism tugaganda |
| `progress.md` | Bosqichlar checkbox'i va jurnal | har bosqich yoki qism tugaganda |
| `HANDOFF.md` | Holat, aniq keyingi qadam, ochiq savollar | har bosqichdan keyin va sessiya oxirida |

- Parallel xarita har rejada bor, hatto hamma ish ketma-ket bo'lsa ham: har qism uchun fayllar,
  nimaga bog'liqligi, worktree'da ishlay oladimi va holati. Boshqa qismga bog'liq yoki fayllari
  kesishadigan qism worktree'da ishlamaydi.
- Vazifa tugaguncha `progress.md`, `HANDOFF.md` va parallel xarita holati doim yangilab boriladi.

### `docs/memory/`
- `MEMORY.md` indeks: har fakt bitta qator. Mavzu kattalashsa `docs/memory/<mavzu>.md` ga chiqariladi.
- Faqat vazifadan tashqarida ham amal qiladigan narsa yoziladi: stack, kelishuv, foydalanuvchi
  afzalligi, brainstormingdagi doimiy javob ("hamma formalarda zod ishlatamiz"). Vazifaga xos
  tafsilot `docs/plans/` da qoladi.
- Yangi fakt eskisiga zid bo'lsa, eskisi yangilanadi; dublikat yozilmaydi.

### `docs/adr/`
- Fayl: `NNNN-<slug>.md`, raqam ketma-ket. Faqat qaytarish qiyin qarorlar: arxitektura, ma'lumot
  sxemasi, public API, yangi asosiy dependency, xavfsizlik modeli. Oddiy tanlov `plan.md` da qoladi.
- Qaror almashsa, eski ADR o'chirilmaydi: "almashtirildi (ADR-NNNN bilan)" deb belgilanadi.

### `docs/simplification/`
- Fayl: `<YYYY-MM-DD>-<slug>.md`, vazifa papkasi bilan bir xil nom. Faqat jadval: fayl, nima
  soddalashdi, qaysi prinsip. Hech narsa o'zgarmagan bo'lsa fayl ochilmaydi.

### `docs/known-issues/`
| Fayl | ID | Mazmuni |
|---|---|---|
| `<repo>-bugs.md` | `BG-n` | Topilgan, hali tuzatilmagan xatolar |
| `<repo>-hardcodes.md` | `HC-n` | Qattiq yozilgan qiymatlar. Kalitning qiymati yozilmaydi, faqat joyi |
| `<repo>-security.md` | `SC-n` | Xavfsizlik topilmalari |
| `<repo>-legacy-bugs.md` | `LB-n` | Eski tizim buglari (migratsiyada 1:1 ko'chirilganlari ham) |
| `future-improvements.md` | `FI-n` | Bug emas, kelajakda yaxshilanadigan joylar |

- `<repo>`: repo nomi, monorepo'da app yoki paket nomi (`admin-bugs.md`).
- Agent topilmani ish paytida darhol yozadi, vazifa oxirini kutmaydi. Faqat o'qiy oladigan agentlar
  (reviewer, security-reviewer) topilmani hisobotda beradi, orkestrator yozadi.
- Fayl kerak bo'lgandagina ochiladi. ID qayta ishlatilmaydi, tuzatilgan yozuv o'chirilmaydi:
  `Holat: tuzatildi (<commit yoki sana>)` deb belgilanadi. Avval mavjud yozuvni qidir, dublikat yozma.

### `docs/difference/` va `docs/migration-reports/` (faqat migratsiya)
- Yo'l: `docs/<papka>/<app>/<modul>.md`, umumiy paketlar uchun `docs/<papka>/packages/<paket>.md`.
- Har bir hisobotda eski tizimning qaysi commit'i asos bo'lgani yoziladi.
