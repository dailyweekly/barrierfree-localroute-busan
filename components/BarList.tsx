export default function BarList({ data, max }: { data: { label: string; value: number; color?: string }[]; max?: number }) {
  const m = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-2 text-sm">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700">{d.label || "(미상)"}</span>
            <span className="font-bold text-brand-700">{d.value}</span>
          </div>
          <div className="bar mt-1">
            <span style={{ width: `${(d.value / m) * 100}%`, background: d.color || "linear-gradient(90deg, #2E5797, #0EA5E9)" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
