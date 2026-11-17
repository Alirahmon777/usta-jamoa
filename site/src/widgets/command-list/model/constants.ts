export const COMMANDS = [
  { name: "/usta:task", arg: "<so'rov>", text: "So'rovni butun jamoa orqali o'tkazadi." },
  { name: "/usta:approve", arg: "", text: "Rejani tasdiqlaydi. Faqat siz yoza olasiz." },
  { name: "/usta:resume", arg: "[papka]", text: "Chala ishni HANDOFF.md dan davom ettiradi." },
  { name: "/usta:init", arg: "", text: "docs/ shablonlari va .claude/usta.json ni tayyorlaydi." },
  { name: "/usta:audit", arg: "[yo'l]", text: "Bug, hardcode va xavfsizlikni known-issues ga yozadi." }
] as const;
