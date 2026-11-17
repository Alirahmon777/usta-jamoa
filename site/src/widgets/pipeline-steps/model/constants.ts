export const STEPS = [
  {
    name: "Triage",
    agent: "triage",
    model: "sonnet",
    text: "So'rovni trivial…critical darajaga ajratadi va xavf sohalarini belgilaydi."
  },
  {
    name: "Tahlil",
    agent: "analyzer",
    model: "haiku",
    text: "Kodni o'qiydi: tegishli fayllar, mavjud patternlar, bog'liqliklar."
  },
  {
    name: "Brainstorm",
    agent: "orchestrator",
    model: "opus",
    text: "Kamida ikki yondashuvni solishtiradi, savollarni tavsiyasi bilan beradi."
  },
  {
    name: "Reja",
    agent: "planner",
    model: "opus",
    text: "Bosqichlar va parallel xarita: qaysi qism worktree'da ishlay oladi."
  },
  { name: "Tasdiq", agent: "siz", model: "human", text: "Reja tasdiqlanmaguncha Edit/Write ni hook bloklaydi." },
  {
    name: "Kod",
    agent: "coder",
    model: "sonnet",
    text: "Mustaqil qismlar alohida git worktree'larda parallel yoziladi."
  },
  {
    name: "Soddalashtirish",
    agent: "simplifier",
    model: "sonnet",
    text: "Ortiqcha abstraksiyani olib tashlaydi, nimani qisqartirganini yozadi."
  },
  {
    name: "Test",
    agent: "tester",
    model: "sonnet",
    text: "Test yozadi va ishga tushiradi. Qizil bo'lsa, coder'ga qaytaradi."
  },
  {
    name: "Review",
    agent: "reviewer ∥ security",
    model: "opus",
    text: "Har topilmada qaysi prinsip buzilganini aytadi."
  }
] as const;
