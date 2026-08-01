import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export interface BodyMetricEntry {
  id: string;
  recordedAt: string;
  recordedBy: string;
  weightKg: number | null;
  heightCm: number | null;
  bodyFatPct: number | null;
  muscleMassKg: number | null;
  notes: string;
}

export async function getBodyMetrics(supabase: Client, studentId: string): Promise<BodyMetricEntry[]> {
  const { data } = await supabase
    .from("body_metrics")
    .select("id, recorded_at, recorded_by, weight_kg, height_cm, body_fat_pct, muscle_mass_kg, notes")
    .eq("student_id", studentId)
    .order("recorded_at", { ascending: false })
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    recordedAt: row.recorded_at,
    recordedBy: row.recorded_by,
    weightKg: row.weight_kg,
    heightCm: row.height_cm,
    bodyFatPct: row.body_fat_pct,
    muscleMassKg: row.muscle_mass_kg,
    notes: row.notes,
  }));
}

export function calcBmi(
  weightKg: number | null | undefined,
  heightCm: number | null | undefined
): { value: number; label: string } | null {
  if (!weightKg || !heightCm) return null;
  const bmi = weightKg / ((heightCm / 100) * (heightCm / 100));
  const value = Math.round(bmi * 10) / 10;
  let label: string;
  if (value < 18.5) label = "Bajo peso";
  else if (value < 25) label = "Normal";
  else if (value < 30) label = "Sobrepeso";
  else label = "Obesidad";
  return { value, label };
}

export interface MetricTrend {
  latest: number | null;
  deltaFromFirst: number | null;
  points: { date: string; value: number }[];
}

export function buildTrend(entries: BodyMetricEntry[], key: "weightKg" | "bodyFatPct" | "muscleMassKg"): MetricTrend {
  // entries vienen ordenados desc; para el grafico los queremos asc (cronologico).
  const chronological = [...entries].reverse().filter((e) => e[key] != null);
  const points = chronological.map((e) => ({ date: e.recordedAt, value: e[key] as number }));
  const latest = points.length > 0 ? points[points.length - 1].value : null;
  const first = points.length > 0 ? points[0].value : null;
  const deltaFromFirst = latest != null && first != null ? Math.round((latest - first) * 10) / 10 : null;
  return { latest, deltaFromFirst, points };
}
