"use client";

export interface SetEditorRow {
  unit: "reps" | "time";
  reps: string;
  weight: string;
  duration: string;
}

interface Props {
  rows: SetEditorRow[];
  onRowsChange: (rows: SetEditorRow[]) => void;
}

export function ExerciseSetsEditor({ rows, onRowsChange }: Props) {
  const updateRow = (index: number, patch: Partial<SetEditorRow>) => {
    onRowsChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const setCount = (count: number) => {
    const n = Math.max(1, count);
    const next = [...rows];
    while (next.length < n) next.push({ unit: "reps", reps: "", weight: "", duration: "" });
    onRowsChange(next.slice(0, n));
  };

  const toggleClass = (active: boolean) =>
    `flex-1 rounded-full px-3 py-1 text-xs font-bold transition ${
      active ? "bg-secondary text-white shadow-glow" : "text-text-muted"
    }`;

  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
        Cantidad de series
      </label>
      <input
        className="field-input rounded-3xl"
        min={1}
        name="sets"
        onChange={(e) => setCount(Number(e.target.value))}
        placeholder="Series"
        type="number"
        value={rows.length}
      />
      <div className="mt-3 space-y-2">
        {rows.map((row, i) => (
          <div className="rounded-2xl bg-white/30 px-4 py-3" key={i}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted">Serie #{i + 1}</span>
              <div className="flex rounded-full bg-white/50 p-0.5">
                <button className={toggleClass(row.unit === "reps")} onClick={() => updateRow(i, { unit: "reps" })} type="button">
                  Reps
                </button>
                <button className={toggleClass(row.unit === "time")} onClick={() => updateRow(i, { unit: "time" })} type="button">
                  Seg
                </button>
              </div>
              <input name={`unit_${i}`} type="hidden" value={row.unit} />
            </div>
            {row.unit === "reps" ? (
              <div className="mt-2 flex gap-3">
                <input
                  className="field-input w-full rounded-2xl py-1.5 text-sm"
                  min={1}
                  name={`reps_${i}`}
                  onChange={(e) => updateRow(i, { reps: e.target.value })}
                  placeholder="Reps"
                  type="number"
                  value={row.reps}
                />
                <input
                  className="field-input w-full rounded-2xl py-1.5 text-sm"
                  min={0}
                  name={`weight_${i}`}
                  onChange={(e) => updateRow(i, { weight: e.target.value })}
                  placeholder="Peso (kg)"
                  step={0.5}
                  type="number"
                  value={row.weight}
                />
              </div>
            ) : (
              <div className="mt-2 flex gap-3">
                <input
                  className="field-input w-full rounded-2xl py-1.5 text-sm"
                  min={1}
                  name={`duration_${i}`}
                  onChange={(e) => updateRow(i, { duration: e.target.value })}
                  placeholder="Segundos (ej: 45)"
                  type="number"
                  value={row.duration}
                />
                <input
                  className="field-input w-full rounded-2xl py-1.5 text-sm"
                  min={0}
                  name={`weight_${i}`}
                  onChange={(e) => updateRow(i, { weight: e.target.value })}
                  placeholder="Peso (kg)"
                  step={0.5}
                  type="number"
                  value={row.weight}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
