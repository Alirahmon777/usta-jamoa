<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="site/public/logo.svg">
    <img src="site/public/logo-light.svg" alt="usta" width="320">
  </picture>
</p>

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
| `/usta:tez <so'rov>` | Tezkor rejim: savol yoki kichik, xavfsiz o'zgarish. Triage, reja va agentlarsiz, bitta Sonnet. Auth, to'lov, migratsiyaga tegsa yoki 3 tadan ko'p fayl kerak bo'lsa, to'xtab `/usta:task` ni taklif qiladi |
| `/usta:oyla <so'rov>` | Faqat reja: kodni o'qiydi, risklarni topadi, qarorlarni sizdan so'raydi, reviewer rejani tanqid qiladi. Natija `docs/plans/` da. Kod yozmaydi, auto mode'da ham. Keyin `/usta:resume <papka>` quradi |
| `/usta:approve` | Rejani tasdiqlaydi. **Faqat siz** yoza olasiz: Claude bu buyruqni chaqira olmaydi, tasdiqni hook yozadi |
| `/usta:budget` | Task daraja byudjetiga yetib to'xtaganda yana bitta daraja byudjetiga ruxsat beradi. Bu ham **faqat siz** uchun |
| `/usta:resume [docs/plans/<papka>]` | Chala qolgan ishni yangi sessiyada HANDOFF.md dan davom ettiradi |
| `/usta:audit [yo'l]` | Tayyor loyihani tekshiradi: buglar, hardcode'lar, xavfsizlik va yaxshilanishlarni `docs/known-issues/` ga yozadi. Kodni o'zgartirmaydi |
| `/usta:dashboard` | Jonli dashboardni brauzerda ochadi: agentlar, bosqichlar, modellar, token va narx |

Oddiy prompt (slash buyruqsiz): `requireTask: true` bo'lgan loyihada har promptga qisqa eslatma
qo'shiladi va Claude mos rejimni (`tez`, `oyla` yoki `task`) o'zi tanlaydi. Savolga rejim kerak emas.
`requireTask` yo'q loyihada plugin oddiy promptga aralashmaydi.

Orkestrator `/task` davomida Opus'da ishlaydi. Har bir loyihada `init` qilish shart emas: u
qilinmasa ham plugin shablonlari va standart routing bilan ishlaydi.

## Daraja qanday tanlanadi

Triage (sonnet) birinchi baho beradi, keyin `task-state.mjs` uni `routing.json` dagi chegaralar bilan
tekshiradi. Daraja faqat ko'tariladi, hech qachon tushmaydi:

- **Xavf hududi** (`risk_floor`): auth, payments, security va boshqalar kamida `complex`.
- **Vazifa turi** (`task_type_floor`): migratsiya (masalan Vue'dan React'ga) kamida `moderate`.
  Triage'ga butun ilova yoki bir nechta sahifa migratsiyasi `complex` ekani aytilgan.
- **Reja hajmi** (`plan_floor`): reja tuzilgach parallel xarita o'lchanadi. 2+ qism yoki 8+ fayl
  bo'lsa kamida `moderate`, 4+ qism yoki 20+ fayl bo'lsa kamida `complex`. Worktree'li qism bo'lsa,
  daraja parallel ruxsat etilgan darajagacha ko'tariladi. Daraja ko'tarilsa, yangi darajaning tasdiq
  bosqichi, modellari va byudjeti o'sha zahoti amal qiladi.

Ikkita cheklovni hook majburlaydi: parallel worktree agentlari faqat `parallel.levels` dagi
darajalarda ishlaydi, task agentlarining taxminiy narxi `max_budget_usd` ga yetganda yangi agent
ishga tushmaydi va orkestrator sizdan `/usta:budget` yoki to'xtashni so'raydi.

`complex` va `critical` da reja tasdiqqa chiqishidan oldin reviewer uni tanqid qiladi (`plan_critique`).

Soddalashtirish (simplifier) `trivial` dan boshqa hamma darajada ishlaydi; `simple` da sonnet bilan.
Reviewer `simple` da sonnet, `moderate` dan boshlab opus.

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

## Agentlar bir-biriga ishonmaydi

Har agentning gapi boshqasi uchun dalil emas, da'vo (`engineering-standards`, 6-bo'lim):
- **Tester** kodni buzishga urinadi (`simple` da kamida 1, `moderate` dan kamida 3 urinish: bo'sh
  input, chegara qiymati, ikki marta so'rov, parallel so'rov, yarmida xato...). Topgan xatoni
  yiqiladigan test bilan isbotlaydi.
- **Reviewer** coder va tester hisobotini qayta tekshiradi, "bu qanday buziladi?" deb so'raydi va
  `complex`/`critical` da approvaldan oldin rejaning o'zini tanqid qiladi.
- **Security** har topilmaga aniq hujum yo'lini yozadi; hujum yo'li bo'lmasa, topilma ko'pi bilan LOW.
- **Simplifier** har yangi abstraksiya uchun "olib tashlansa nima buziladi?" deb so'raydi.
- Topganlar aytadi, coder tuzatadi, topganlar qayta tekshiradi. Hakam o'zi baholayotgan kodni tuzatmaydi.

## Qoida paketlari (Java, React, FSD, Payme, E-imzo, OneID...)

Stack va integratsiya qoidalari yadroga qo'shilmaydi: har biri shu marketplace'dagi alohida plugin
(`usta-java`, `usta-react-fsd`, `usta-payme`, `usta-eimzo`...), kim xohlasa o'rnatadi. Stack paketlari
`.claude/usta.json` orqali doim yoqiladi, integratsiya paketlari faqat task ularga tegsa yuklanadi.
Shablonlar va qo'llanma: [rule-packs/README.md](rule-packs/README.md).

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
| `require-approved-plan` | `.claude/state`, `settings`, `routing.json`, `usta.json` va plugin fayllarini agent o'zgartira olmaydi | Reja tasdiqlanmaguncha `Edit/Write` bloklanadi (`docs/` papkalaridan tashqari). `/usta:oyla` da `docs/` dan tashqari hech narsa, `/usta:tez` da ko'pi bilan 3 fayl |
| `prompt-reminder` | `requireTask: true` loyihada oddiy promptga usta rejimlari haqida eslatma qo'shadi | |
| `guard-bash` | `rm -rf /`, `reset --hard`, `DROP TABLE`, deploy, `.env` o'qish, `curl \| sh`, tasdiqni aylanib o'tish, workflow fayllarini o'zgartirish (`ls`, `cat`, `grep` kabi o'qish va dashboard serveri ruxsat) | `git push`, `npm publish`; `/usta:oyla` da faqat o'qish buyruqlari |
| `lint-on-edit` | JS/TS fayl tahriridan keyin Biome yoki ESLint xatolarini agentga qaytaradi (loyihada bo'lsa) | |
| `approve-hook` | Siz `/usta:approve` yoki `/usta:budget` yozganingizda tasdiq yoki yangi byudjetni yozadi | |
| `agent-gate` | | Daraja ruxsat bermasa parallel worktree agentini, byudjet tugaganda yangi `usta:*` agentni bloklaydi. `/usta:oyla` da faqat triage, analyzer, planner, reviewer, security; `/usta:tez` da birorta ham usta agent yo'q |

Agar `requireTask` ni hamma loyihada majburiy qilmoqchi bo'lmasangiz, uni faqat kerakli loyihalarda yoqing.

Har bir Claude sessiyasining o'z task holati bor (`.claude/state/tasks/<sessiya>.json`): bir sessiyada
tasdiq kutayotgan task boshqa sessiyaning tahrirlarini to'xtatmaydi. Bir papkada bir nechta repo bo'lsa,
`docs/` va `.claude/usta.json` tahrir qilinayotgan faylga eng yaqin repo (`.git` yoki `.claude/usta.json`
turgan papka) bo'yicha olinadi.

## Jonli dashboard

Agentlar ishini brauzerda kuzatish uchun Claude Code'da bir marta yozing:

```
/usta:dashboard
```

Brauzer o'zi ochiladi (`http://localhost:4517/dashboard`), keyin shu sessiyada yoki boshqa terminalda
odatdagidek `/usta:task <so'rov>` ishlating. Sahifa har 2 soniyada yangilanadi. Hech narsa o'rnatish
shart emas: dashboard plugin ichida tayyor holda keladi, uni Node'ning o'zi serve qiladi
(faqat `127.0.0.1` da, tashqaridan ko'rinmaydi).

Qanday ishlaydi:
- `SubagentStart`/`SubagentStop` hooklari har `usta:*` agent boshlanishi va tugashini
  `.claude/state/usta-events.jsonl` ga yozadi: model, effort, token va taxminiy narx (agent transkriptidan).
  Task yo'q paytda hech narsa yozilmaydi.
- `task-state.mjs` task boshlanishi, tasdiq kutilishi/berilishi va tugashini yozadi.
- Reja qismlari, test natijalari va review topilmalarini orkestrator `task-state.mjs event` bilan qo'shadi.
- Yangi task boshlanganda log yangidan boshlanadi: dashboard oxirgi taskni ko'rsatadi.

Narx API narxlari bo'yicha taxmin (obuna bilan ishlasangiz ham shu hisoblanadi), hisob-faktura emas.

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
  skills/          task, tez, oyla, resume, approve, budget, audit, init, dashboard (buyruqlar)
                   engineering-standards, project-docs (agentlarga avtomatik yuklanadi)
                   react-standards (ixtiyoriy)
  hooks/hooks.json
  scripts/         hook, task holati, hodisalar logi va dashboard serveri (Node.js, bog'liqliksiz)
  dashboard/       site/ dan yig'ilgan tayyor dashboard (npm run build:plugin)
  routing.json     standart daraja -> model/effort/bosqichlar
  templates/docs/  plans/_TEMPLATE/, memory, adr, simplification, known-issues va migratsiya shablonlari
rule-packs/                         stack va integratsiya qoida paketlari uchun shablonlar va qo'llanma
examples/eslint.config.js           murakkablik chegaralari bilan ESLint namunasi
tests/                              node --test tests/*.test.mjs
site/                               landing va dashboard manbasi (React + Vite)
```
