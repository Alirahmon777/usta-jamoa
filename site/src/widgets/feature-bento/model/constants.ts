export const LEVELS = [
  { name: "trivial", model: "sonnet", width: 18 },
  { name: "simple", model: "sonnet", width: 34 },
  { name: "moderate", model: "sonnet", width: 56 },
  { name: "complex", model: "opus", width: 78 },
  { name: "critical", model: "opus", width: 100 }
];

export const LANES = [
  { name: "wt/promo-api", progress: 100 },
  { name: "wt/cart-ui", progress: 72 },
  { name: "main", progress: 18 }
];

export const GUARDS = ["rm -rf /", "git reset --hard", "DROP TABLE orders", "cat .env", "curl … | sh"];

export const AUDIT = [
  { label: "bugs", value: 7 },
  { label: "hardcodes", value: 12 },
  { label: "security", value: 2 }
];
