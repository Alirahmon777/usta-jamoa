export const formatDuration = (ms: number) => {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes ? `${minutes}m ${String(seconds).padStart(2, "0")}s` : `${seconds}s`;
};

export const formatTokens = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

export const formatUsd = (n: number) => `$${n.toFixed(2)}`;

export const formatClock = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export const elapsedMs = (from: string, to?: string) => new Date(to ?? Date.now()).getTime() - new Date(from).getTime();
