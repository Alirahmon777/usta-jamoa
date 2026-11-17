# usta: Claude Code uchun multi-agent dasturlash jamoasi (plugin)

Bir marta o'rnatiladi va hamma loyihada ishlaydi. Har bir so'rov shu yo'ldan o'tadi:

```
triage -> analyzer -> brainstorming [SIZ javob berasiz] -> planner -> [SIZ tasdiqlaysiz]
       -> coder (kerak bo'lsa parallel worktree'larda) -> simplifier -> tester -> reviewer ∥ security
```

Har bir qadam ish davomida `docs/` ga yozib boriladi, shuning uchun sessiya uzilsa ham ish yo'qolmaydi.

Triage so'rovni 5 darajadan biriga ajratadi (`trivial ... critical`), har bir agent qaysi model va
effort bilan ishlashini esa `routing.json` belgilaydi. Reja tasdiqlanmaguncha kod yozilmaydi va buni
prompt emas, hook majburlaydi. Plugin texnologiyaga bog'lanmagan: React/FSD kabi qoidalar loyihaning
o'zidan keladi.

## O'rnatish

Talab: Claude Code va Node.js 20+ (hooklar uchun).

1. Shu papkani GitHub'ga alohida repo qilib joylang, masalan `Alirahmon777/usta-jamoa`.
2. Claude Code ichida:
   ```
   /plugin marketplace add Alirahmon777/usta-jamoa
   /plugin install usta@usta-jamoa
   ```
   Odatiy holatda u **user scope** ga o'rnatiladi, ya'ni barcha loyihalaringizda yoqiladi.
3. Yangilash: repoga push qiling, `plugin.json` dagi `version` ni oshiring va
   `/plugin marketplace update usta-jamoa` ni ishga tushiring.

GitHub'siz sinab ko'rish: `claude --plugin-dir ./plugins/usta`.

## Ishlatish

| Buyruq | Nima qiladi |
|---|---|
| `/usta:init` | Loyihani tayyorlaydi: `docs/` shablonlari, `.claude/usta.json`, `.gitignore`, `CLAUDE.md` bo'limi. Mavjud faylni ustidan yozmaydi |
| `/usta:task <so'rov>` | So'rovni butun jamoa orqali o'tkazadi |
| `/usta:approve` | Rejani tasdiqlaydi. **Faqat siz** yoza olasiz: Claude bu buyruqni chaqira olmaydi, tasdiqni hook yozadi |
| `/usta:resume [docs/plans/<papka>]` | Chala qolgan ishni yangi sessiyada HANDOFF.md dan davom ettiradi |
| `/usta:audit [yo'l]` | Tayyor loyihani tekshiradi: buglar, hardcode'lar, xavfsizlik va yaxshilanishlarni `docs/known-issues/` ga yozadi. Kodni o'zgartirmaydi |

Orkestrator `/task` davomida Opus'da ishlaydi. Har bir loyihada `init` qilish shart emas: u
qilinmasa ham plugin shablonlari va standart routing bilan ishlaydi.

## Brainstorming

Reja yozilishidan oldin orkestrator kamida ikki yondashuvni solishtiradi va tavsiyasini aytadi.
Keyin faqat rejani o'zgartiradigan savollarni **bitta xabarda** beradi, har biriga o'z tavsiyasi
bilan. Koddan topsa bo'ladigan narsani so'ramaydi, uni taxmin sifatida yozib qo'yadi. Siz javob
berasiz yoki "tavsiyalar ma'qul" deysiz. Javoblar `brainstorm.md` ga, uzoq muddat amal qiladiganlari
`docs/memory/` ga yoziladi. `simple` darajada bunday savol bo'lmasa, so'ramasdan davom etadi;
`trivial` da bu bosqich yo'q.

## Kod yozish prinsiplari

`engineering-standards` skilli har bir agentga yuklanadi: soddalik, KISS, YAGNI, DRY va SOLID.
Ular zid kelsa, **KISS va YAGNI ustun**: masalan, "SOLID uchun" qo'shilgan, bitta implementatsiyali
interfeys xato hisoblanadi. DRY kodga emas, bilimga qo'llanadi: uchinchi nusxagacha takror kod
mumkin. Reviewer har topilmada qaysi prinsip buzilganini aytadi, simplifier esa nimani
soddalashtirganini `docs/simplification/` ga yozadi.

## `docs/` tuzilmasi

```
docs/
  plans/2026-11-17-savat-chegirma/
    brainstorm.md      variantlar, savollar, javoblaringiz
    plan.md            bosqichlar va parallel xarita
    progress.md        checkbox'lar va jurnal (har bosqichdan keyin)
    HANDOFF.md         holat va aniq keyingi qadam
  memory/MEMORY.md     doimiy faktlar: stack, kelishuvlar, afzalliklaringiz
  adr/0001-....md      faqat qaytarish qiyin qarorlar
  simplification/      simplifier nimani soddalashtirgani, qisqa
  known-issues/        <repo>-bugs.md, <repo>-hardcodes.md, <repo>-security.md,
                       <repo>-legacy-bugs.md, future-improvements.md
  difference/, migration-reports/   faqat migratsiya loyihalarida
```

**Parallel xarita** (`plan.md` da har doim bor): har qism uchun fayllar, nimaga bog'liqligi,
worktree'da ishlay oladimi va holati. Boshqa qismga bog'liq yoki fayllari kesishadigan qism
worktree'da ishlamaydi. Har qism tugagach holat, `progress.md` va `HANDOFF.md` yangilanadi.

Agentlar topilmalarni ish paytida darhol `known-issues` ga yozadi. Faqat o'qiy oladigan reviewer va
security-reviewer topilmalarini esa orkestrator yozadi. `init` `CLAUDE.md` ga
`@docs/memory/MEMORY.md` ni qo'shadi, shu sababli loyiha xotirasi har bir agentga o'zi yetib boradi.

## O'z qoidalaringiz va skilllaringizni qo'shish

Plugin faqat umumiy qoidalarni beradi. Loyihaga xos hamma narsa loyihaning o'zida turadi va
**pluginnikidan ustun** turadi:

| Qatlam | Qayerda | Agentlarga qanday yetadi |
|---|---|---|
| Loyiha qoidalari | `CLAUDE.md`, `.claude/rules/*.md` | Claude Code ularni har bir agentga o'zi yuklaydi |
| Loyiha skilllari | `.claude/skills/<nom>/SKILL.md` | `.claude/usta.json` ning `skills` ro'yxatiga yozing: orkestrator har agentga ularni yuklashni buyuradi |
| Shaxsiy skilllar (hamma loyiha uchun) | `~/.claude/skills/<nom>/SKILL.md` | Xuddi shunday, `skills` ro'yxati orqali |
| Tayyor React qoidalari | plugin ichidagi `usta:react-standards` | Ixtiyoriy: `skills` ro'yxatiga qo'shsangiz yoqiladi |
| Model va bosqichlar | `.claude/routing.json` | Plugin'dagi `routing.json` dan nusxa olib o'zgartirasiz, shu loyiha uchun u ishlatiladi |

`.claude/usta.json` misoli (React + FSD loyiha):

```json
{
  "requireTask": true,
  "skills": ["usta:react-standards", "fsd-rules"]
}
```

- `requireTask: true`: `/usta:task` siz manba fayllarni o'zgartirib bo'lmaydi.
  Yo'q yoki `false` bo'lsa, plugin faqat task ishlayotganda aralashadi, qolgan paytda oddiy Claude Code.
- `skills`: har bir agent ishni boshlashdan oldin yuklaydigan skilllar.

Masalan, `your-rules-v2/` dagi qoidalaringizni ulash uchun uning `CLAUDE.md` va `.claude/rules/`
papkasini loyihaga ko'chirasiz, boshqa hech narsa kerak emas. Biome konfiguratsiyangiz
(`packages/biome-config`) ham loyihada qoladi: `lint-on-edit` hooki uni o'zi topadi.

Qoidalar ziddiyatga kelsa, ustunlik tartibi: loyiha qoidalari va skilllari, keyin plugin'ning
`engineering-standards` skilli.

## Himoya (hooklar)

| Hook | Doim | Faqat task davomida |
|---|---|---|
| `require-approved-plan` | `.claude/state`, `settings`, `routing.json`, `usta.json` va plugin fayllarini agent o'zgartira olmaydi | Reja tasdiqlanmaguncha `Edit/Write` bloklanadi (`docs/` papkalaridan tashqari) |
| `guard-bash` | `rm -rf /`, `reset --hard`, `DROP TABLE`, deploy, `.env` o'qish, `curl \| sh`, tasdiqni aylanib o'tish | `git push`, `npm publish` |
| `lint-on-edit` | JS/TS fayl tahriridan keyin Biome yoki ESLint xatolarini agentga qaytaradi (loyihada bo'lsa) | |
| `approve-hook` | Siz `/usta:approve` yozganingizda tasdiqni yozadi | |

Agar `requireTask` ni hamma loyihada majburiy qilmoqchi bo'lmasangiz, uni faqat kerakli loyihalarda yoqing.

## Python orkestrator haqida

Plugin ichiga kiritilmadi: interaktiv ishni plugin to'liq qoplaydi. CI yoki skript uchun ikki yo'l bor:
- `claude -p "/usta:task <so'rov>"` (shu plugin bilan, tasdiq bosqichida to'xtaydi);
- `ai-dev-team/` papkasidagi Agent SDK dasturi (`ai-team`), o'zgarmasdan qoldi.

## Tuzilma

```
.claude-plugin/marketplace.json     marketplace (GitHub'dan o'rnatish uchun)
plugins/usta/
  .claude-plugin/plugin.json
  agents/          8 ta agent: triage, analyzer, planner, coder, simplifier, tester, reviewer, security-reviewer
  skills/          task, resume, approve, audit, init (buyruqlar)
                   engineering-standards, project-docs (agentlarga avtomatik yuklanadi)
                   react-standards (ixtiyoriy)
  hooks/hooks.json
  scripts/         hook va task holati skriptlari (Node.js)
  routing.json     standart daraja -> model/effort/bosqichlar
  templates/docs/  plans/_TEMPLATE/, memory, adr, simplification, known-issues va migratsiya shablonlari
examples/eslint.config.js           murakkablik chegaralari bilan ESLint namunasi
tests/hooks.test.mjs                node --test tests/hooks.test.mjs
```
