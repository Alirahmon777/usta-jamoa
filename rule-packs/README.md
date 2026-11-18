# Qoida paketlari (rule packs)

Yadro (`plugins/usta`) faqat umumiy qoidalarni beradi. Stack va integratsiya qoidalari alohida
pluginlar bo'lib, shu marketplace'da turadi. Kim qaysi birini xohlasa, faqat o'shani o'rnatadi.

| Tur | Misollar | Qachon yuklanadi | Qanday yoqiladi |
|---|---|---|---|
| **Stack paketi** | `usta-java`, `usta-java-with-test`, `usta-react`, `usta-react-fsd` | Loyihadagi har bir taskda, har bir agentga | `.claude/usta.json` → `"skills": ["usta-java:rules"]` |
| **Integratsiya paketi** | `usta-payme`, `usta-eimzo`, `usta-oneid` | Faqat task shu integratsiyaga tegsa | Hech narsa kerak emas: analyzer (yoki `/usta:tez`, `/usta:oyla`) mos skillni topib, agentlarga yuklashni aytadi |

Ustunlik tartibi: loyiha qoidalari (`CLAUDE.md`, `.claude/rules/`) > qoida paketlari > yadro standartlari.

## Yangi stack paketi qo'shish

1. `rule-packs/_template-stack/` ni `plugins/usta-<stack>/` ga nusxalang (masalan `plugins/usta-java/`).
2. `.claude-plugin/plugin.json` da `STACK` ni almashtiring (`"name": "usta-java"`).
3. `skills/rules/SKILL.md` ni to'ldiring: qoidalar va coder, simplifier, tester, reviewer cheklistlari.
   Fayl qisqa bo'lsin (~150 qatorgacha): uni har agent har taskda o'qiydi. Uzun misollar
   `skills/rules/references/<mavzu>.md` ga, SKILL.md dan havola bilan.
4. Ustiga qurilgan paket (masalan `usta-java-with-test` = java + test qoidalari) faqat qo'shimcha
   qoidalarni yozadi; loyihada ikkalasi yoqiladi: `"skills": ["usta-java:rules", "usta-java-with-test:rules"]`.
5. Marketplace'ga qo'shing (pastda).

## Yangi integratsiya paketi qo'shish

1. `rule-packs/_template-integration/` ni `plugins/usta-<provayder>/` ga nusxalang (masalan `plugins/usta-payme/`).
2. `skills/example-integration/` papkasini va undagi `name` ni integratsiya nomiga o'zgartiring:
   `payme-merchant`, `eimzo-frontend`, `eimzo-backend`, `oneid`. Bitta provayderning bir nechta
   tomoni bo'lsa (E-imzo frontend va backend), bitta plugin ichida bir nechta skill papkasi bo'ladi.
3. **`description` eng muhim qator:** Claude skillni shu tavsif bo'yicha topadi. Provayder nomini va
   odamlar ishlatadigan so'zlarni yozing ("Payme merchant API", "to'lov callback", "E-imzo imzolash").
4. SKILL.md: oqim, majburiy tekshiruvlar, xato kodlari, har implementatsiyada bo'lishi shart testlar,
   xavfsizlik tekshiruvlari. Kod misollari `references/nestjs.md`, `references/java.md` da: agent
   faqat loyihaning stackiga mosini ochadi, shuning uchun ko'p misol token sarflamaydi.

## Marketplace'ga qo'shish

`.claude-plugin/marketplace.json` ning `plugins` ro'yxatiga:

```json
{
  "name": "usta-payme",
  "source": "./plugins/usta-payme",
  "description": "Payme merchant API rules and NestJS/Java examples for usta agents"
}
```

Tekshirish: `claude plugin validate .` (repo ildizida). O'rnatish:

```
/plugin marketplace update usta-jamoa
/plugin install usta-payme@usta-jamoa
```

Paketlar `usta` yadrosiz ham ishlaydi (oddiy skill sifatida), lekin agentlar ularni usta orqali oladi.
