export const COMMANDS = [
  { name: "/usta:task", arg: "<so'rov>", text: "So'rovni butun jamoa orqali o'tkazadi." },
  { name: "/usta:tez", arg: "<so'rov>", text: "Kichik o'zgarish yoki savolga tez javob, agentlarsiz." },
  { name: "/usta:oyla", arg: "<so'rov>", text: "Faqat reja: risklar, savollar, docs/plans. Kod yozmaydi." },
  { name: "/usta:approve", arg: "", text: "Rejani tasdiqlaydi. Faqat siz yoza olasiz." },
  { name: "/usta:resume", arg: "[papka]", text: "Chala ishni HANDOFF.md dan davom ettiradi." },
  { name: "/usta:init", arg: "", text: "docs/ shablonlari va .claude/usta.json ni tayyorlaydi." },
  { name: "/usta:audit", arg: "[yo'l]", text: "Bug, hardcode va xavfsizlikni known-issues ga yozadi." }
] as const;
