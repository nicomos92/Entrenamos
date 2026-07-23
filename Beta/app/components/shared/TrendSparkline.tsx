interface TrendSparklineProps {
  points: { date: string; value: number }[];
  width?: number;
  height?: number;
}

export function TrendSparkline({ points, width = 220, height = 56 }: TrendSparklineProps) {
  if (points.length < 2) {
    return <p className="text-sm text-text-muted">Necesitás al menos 2 mediciones para ver la tendencia.</p>;
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p.value - min) / range) * (height - 8) - 4;
    return { x, y };
  });

  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const last = coords[coords.length - 1];

  return (
    <svg height={height} viewBox={`0 0 ${width} ${height}`} width={width}>
      <path d={path} fill="none" stroke="#16A34A" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
      <circle cx={last.x} cy={last.y} fill="#16A34A" r={4} />
    </svg>
  );
}
