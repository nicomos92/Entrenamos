export function LoadingSpinner({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="size-8 animate-spin rounded-full border-4 border-soft border-t-secondary" />
      <p className="text-sm font-bold text-text-muted">{text}</p>
    </div>
  );
}
