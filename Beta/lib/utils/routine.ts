export interface RoutineUsableInfo {
  status: string;
  start_date?: string | null;
  end_date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export function todayLocalString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isRoutineUsable(r: RoutineUsableInfo): boolean {
  if (r.status !== "activa") return false;
  const today = todayLocalString();
  const start = r.start_date ?? r.startDate ?? null;
  const end = r.end_date ?? r.endDate ?? null;
  if (start && today < start) return false;
  if (end && today > end) return false;
  return true;
}

export function getTodayDayNumber(startWeekday: number, days: number): number | null {
  const offset = (new Date().getDay() - startWeekday + 7) % 7;
  return offset < days ? offset + 1 : null;
}
