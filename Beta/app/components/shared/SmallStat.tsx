export function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/30 px-2 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-primary">{value}</p>
    </div>
  );
}
