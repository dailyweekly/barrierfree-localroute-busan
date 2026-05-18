export default function Donut({ value, total, label, color = "#16A34A" }: { value: number; total: number; label?: string; color?: string }) {
  const pct = total > 0 ? value / total : 0;
  const r = 32;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  return (
    <div className="flex items-center gap-3">
      <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden>
        <circle cx="40" cy="40" r={r} fill="none" stroke="#E2E8F0" strokeWidth="10" />
        <circle
          cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeDashoffset={c / 4}
          transform="rotate(-90 40 40)"
          strokeLinecap="round"
        />
        <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1F3864">{Math.round(pct * 100)}%</text>
      </svg>
      <div>
        {label && <div className="text-xs text-slate-500">{label}</div>}
        <div className="font-bold text-brand-700">{value} / {total}</div>
      </div>
    </div>
  );
}
