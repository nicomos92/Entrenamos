export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return "-";
  const s = Math.round(seconds);
  if (s <= 0) return "0 seg";
  if (s < 60) return `${s} seg`;
  const minutes = Math.floor(s / 60);
  const remainder = s % 60;
  if (remainder === 0) return `${minutes} min`;
  return `${minutes} min ${remainder} seg`;
}
