export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-3xl p-5">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}
