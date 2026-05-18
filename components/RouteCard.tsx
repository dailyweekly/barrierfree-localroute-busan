import type { RouteCandidate, LLMExplanation } from "../lib/types";

const KIND_THEME: Record<string, { bg: string; ring: string; icon: string; label: string; accent: string }> = {
  safe:           { bg: "bg-card-safe",  ring: "ring-moss/30",  icon: "🛡️", label: "안전 우선",       accent: "text-moss-deep" },
  low_congestion: { bg: "bg-card-cong",  ring: "ring-ocean/30", icon: "🌊", label: "혼잡 회피",       accent: "text-ocean-deep" },
  include_local:  { bg: "bg-card-local", ring: "ring-coral/30", icon: "🍜", label: "관광·맛집 코스",  accent: "text-coral-deep" },
};

const GRADE_CHIP: Record<string, string> = {
  "낮음": "chip-ok",
  "보통": "chip",
  "높음": "chip-warn",
};

const BAR_CLASS = (lvl: "낮음" | "보통" | "높음") =>
  lvl === "낮음" ? "bar bar-low" : lvl === "보통" ? "bar bar-mid" : "bar bar-high";

export function RouteCard({ candidate, explanation }: { candidate: RouteCandidate; explanation?: LLMExplanation | null }) {
  const t = KIND_THEME[candidate.kind] ?? KIND_THEME.safe;
  return (
    <article className={`relative card ${t.bg} ring-1 ${t.ring} p-5 sm:p-6 appear card-hov`} aria-labelledby={`route-${candidate.kind}`}>
      <header className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">{t.label}</span>
          <h3 id={`route-${candidate.kind}`} className={`text-lg font-extrabold ${t.accent} flex items-center gap-2`}>
            <span aria-hidden>{t.icon}</span> {candidate.title}
          </h3>
        </div>
        {candidate.passable ? (
          <span className="chip chip-ok">✓ 이동 가능</span>
        ) : (
          <span className="chip chip-warn">⚠ 이동 불가</span>
        )}
      </header>

      <dl className="grid grid-cols-3 gap-3 mt-4 text-sm">
        <div>
          <dt className="text-[11px] text-slate-500">복잡도</dt>
          <dd className="font-bold text-brand-700">{candidate.complexityScore}점</dd>
          <div className={`mt-1 ${BAR_CLASS(candidate.complexityGrade)}`}>
            <span style={{ width: `${Math.min(100, candidate.complexityScore)}%` }} />
          </div>
          <span className={`mt-1 inline-block ${GRADE_CHIP[candidate.complexityGrade] ?? "chip"}`}>{candidate.complexityGrade}</span>
        </div>
        <div>
          <dt className="text-[11px] text-slate-500">예상혼잡</dt>
          <dd className="font-bold text-brand-700">{candidate.congestionScore}점</dd>
          <div className={`mt-1 ${BAR_CLASS(candidate.predictedCongestion)}`}>
            <span style={{ width: `${Math.min(100, candidate.congestionScore)}%` }} />
          </div>
          <span className={`mt-1 inline-block ${GRADE_CHIP[candidate.predictedCongestion] ?? "chip"}`}>{candidate.predictedCongestion}</span>
        </div>
        <div>
          <dt className="text-[11px] text-slate-500">대체경로</dt>
          <dd className="font-bold text-brand-700 text-sm">{candidate.alternativeType || "확인 필요"}</dd>
          <p className="text-[10px] text-slate-500 mt-1">부산교통공사 학습라벨 기반</p>
        </div>
      </dl>

      <ol className="mt-4 space-y-2 text-sm">
        {candidate.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="inline-flex w-7 h-7 rounded-full bg-white border border-slate-200 text-center text-xs leading-7 font-bold shrink-0 shadow-card">{i + 1}</span>
            <div>
              <div className="font-semibold">
                {step.station}
                {step.isTransfer && <span className="ml-1 chip chip-brand">환승</span>}
              </div>
              <div className="text-xs text-slate-600">{step.alternative?.stepText || step.description}</div>
              {step.alternative?.elevatorId && (
                <div className="text-[10px] text-slate-400 font-mono">EV {step.alternative.elevatorId} · {step.alternative.type}</div>
              )}
            </div>
          </li>
        ))}
      </ol>

      {explanation && (
        <div className="mt-5 bg-white rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="chip chip-brand">🤖 AI 추천 근거</span>
            <span className="text-[10px] text-slate-400">LLM 가드레일 5중 적용</span>
          </div>
          <div className="font-bold text-brand-700">{explanation.short}</div>
          <p className="text-sm text-slate-700 mt-1 leading-relaxed">{explanation.detail}</p>

          <details className="mt-3 group">
            <summary className="text-xs text-brand-700 cursor-pointer flex items-center gap-1">
              <span aria-hidden className="transition group-open:rotate-90">▶</span>
              음성 안내 문장 (TTS 평문)
            </summary>
            <p className="text-xs text-slate-600 mt-1 bg-slate-50 rounded-lg p-2 border border-slate-100">{explanation.voice}</p>
          </details>

          <details className="mt-2 group">
            <summary className="text-xs text-brand-700 cursor-pointer flex items-center gap-1">
              <span aria-hidden className="transition group-open:rotate-90">▶</span>
              설명가능 AI — 근거 데이터 (XAI)
            </summary>
            <ul className="text-xs text-slate-700 mt-2 space-y-1 bg-slate-50 rounded-lg p-2 border border-slate-100">
              <li>• 학습라벨: <span className="font-mono">{candidate.rationale.passability.sourceLabel}</span></li>
              <li>• 복잡도 점수 {candidate.rationale.complexity.score} ({candidate.rationale.complexity.grade})</li>
              <li>• 예상혼잡 출처: {candidate.rationale.congestion.sourceStation} / {candidate.rationale.congestion.sourceHour}시</li>
              <li>• 대체경로유형: {candidate.rationale.alternativeType.type}</li>
              {candidate.rationale.alternativeType.sourceIds.length > 0 && (
                <li>• 엘리베이터 고유번호: <span className="font-mono">{candidate.rationale.alternativeType.sourceIds.join(", ")}</span></li>
              )}
            </ul>
          </details>

          {explanation.guardrailReport.rejected && (
            <p className="mt-3 chip chip-warn">⚠ LLM 출력 거부 → 결정론적 폴백 ({explanation.guardrailReport.reason})</p>
          )}
        </div>
      )}
    </article>
  );
}
