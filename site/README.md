# usta-site: landing va jonli dashboard

`usta` plugini uchun sayt: `/` landing, `/dashboard` task jarayonini ko'rsatuvchi panel.

Stack: React 19 + TypeScript, Vite, react-router 7 (`route.lazy`), FSD, CSS Modules,
GSAP (ScrollTrigger, SplitText) + Lenis smooth scroll. Biome qoidalari `your-rules-v2` dagi
`biome-config` dan olingan.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build -> dist/
npm run lint       # biome check
```

## Animatsiyalar

Hamma animatsiya `gsap.matchMedia()` ichida `(prefers-reduced-motion: no-preference)` sharti bilan
ro'yxatdan o'tadi. Harakat o'chirilgan foydalanuvchiga sahifa statik, to'liq ko'rinadi (Lenis ham yoqilmaydi).

| Bo'lim          | Effekt                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| Hero            | Sarlavha harflari maskadan chiqadi, scroll'da kichrayib so'nadi; terminal qatorlari ketma-ket chiqadi |
| So'zlar marquee | Ikki qator katta so'z scroll bilan qarama-qarshi tomonga suriladi                                     |
| Jarayon         | Bo'lim pin qilinadi, scroll 9 qadamni birma-bir yoqadi, hisoblagich 01→09                             |
| Bento           | Sarlavha so'zlari ko'tariladi, kartalar kirib keladi, kursor ortidan yorug'lik                        |
| Statement       | Katta gap so'zlari scroll bilan birma-bir yonadi                                                      |
| Final           | Ekran kengligidagi `usta` harflari pastdan ko'tariladi                                                |

## Dashboard va hodisalar fayli

Dashboard JSONL faylni o'qiydi: har qatorda bitta hodisa. Turlari
`src/entities/agent-event/model/types.ts` da (`task.started`, `phase.started|finished`,
`agent.started|finished`, `plan.part`, `approval.waiting|granted`, `tests`, `finding`, `task.finished`).

- **Demo** (standart): `public/mock/events.jsonl` ni real vaqt ritmida qayta ijro etadi.
- **Jonli**: `VITE_EVENTS_URL=/events.jsonl npm run dev`. Fayl har 2 soniyada qayta o'qiladi,
  yarim yozilgan oxirgi qator o'tkazib yuboriladi.

Real agentlar uchun bu faylni plugin yozadi (`<loyiha>/.claude/state/usta-events.jsonl`), `/usta:dashboard`
esa uni `/events.jsonl` sifatida serve qiladi. Dashboard'ni o'zgartirgandan keyin plugin ichidagi
nusxasini yangilang:

```bash
npm run build:plugin   # VITE_EVENTS_URL=/events.jsonl bilan -> ../plugins/usta/dashboard/
```

## Ofis ko'rinishi

Dashboard'dagi "Ofis" tabi o'sha hodisalarni jonli xona sifatida ko'rsatadi: har bir agent o'z personaji
bilan (`public/office/`, Higgsfield'da chizilgan). Xona jihozlari ham shu uslubda (`public/office/props/`). Holat hodisalardan olinadi, qo'shimcha token sarflanmaydi.

| Holat           | Qachon                                       | Ko'rinish                                                                     |
| --------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| Kod yozmoqda    | coder, simplifier, tester ishlayotganda      | Stolga borib kompyuterda o'tiradi                                             |
| Reja yozmoqda   | planner ishlayotganda                        | Daftarga yozadi                                                               |
| O'ylamoqda      | triage, analyzer, reviewer'lar, orchestrator | Joyida turib tepaga qaraydi, 💭 pufakcha                                      |
| Gaplashmoqda    | agent ishini tugatib natijani topshirganda   | Orchestrator yoniga borib gaplashadi, 💬                                      |
| Dam olmoqda     | ish yo'q                                     | Pastki zonada aylanib yuradi                                                  |
| Tasdiq kutmoqda | reja tasdiqingizni kutayotganda              | Orchestrator oldinga chiqadi, "!" belgisi, xona xiralashadi va banner chiqadi |

Rol sozlamalari (rang, stol joyi, ish holati): `src/widgets/agent-office/model/constants.ts`.

## Tuzilma

```
src/
  app/        router (route.lazy), global stillar, shriftlar
  pages/      landing, dashboard, not-found
  widgets/    landing: site-header, hero, word-marquee, pipeline-steps, feature-bento,
              statement, command-list, final-cta
              dashboard: task-overview, agent-runs, plan-map, model-usage, test-summary,
              review-findings, event-log, agent-office
  entities/   agent-event (turlar, buildSnapshot, useEventStream, ModelChip)
  shared/     config (routes, sections), lib (gsap, lenis, format), ui (Logo, Panel, StatusPill, CopyCommand)
```
