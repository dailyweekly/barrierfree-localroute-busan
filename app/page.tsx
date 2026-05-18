import InputForm from "../components/InputForm";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6 appear">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-500 to-ocean text-white p-6 sm:p-10 shadow-cardLg">
        <div aria-hidden className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
        <div className="relative">
          <span className="chip bg-white/20 border-white/40 text-white">2026 부산광역시 공공데이터·AI 활용 창업경진대회 제출 시제품</span>
          <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold leading-snug">
            교통약자·관광약자를 위한<br className="hidden sm:block" />
            <span className="text-white">부산형 포용관광·혼잡분산 AI</span>
          </h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-white/90 leading-relaxed">
            부산교통공사·부산관광공사 공공데이터를 핵심 입력값으로 활용해, 휠체어 이용자·고령자·임산부·유아동반자·캐리어 관광객의 도시철도 이동 의사결정을 돕는 <strong>정기 갱신형 설명가능 AI 추천 서비스</strong>입니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="chip bg-white/15 border-white/30 text-white">학습라벨 기반 분류</span>
            <span className="chip bg-white/15 border-white/30 text-white">시간대 기반 예상혼잡</span>
            <span className="chip bg-white/15 border-white/30 text-white">5중 LLM 가드레일</span>
            <span className="chip bg-white/15 border-white/30 text-white">K-fold 교차검증</span>
            <span className="chip bg-white/15 border-white/30 text-white">시나리오 20종 자동평가</span>
          </div>
        </div>
      </section>

      {/* 데이터 카드 5종 */}
      <section aria-labelledby="data-h">
        <h2 id="data-h" className="sr-only">활용 공공데이터</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { id: "15151579", name: "엘리베이터 대체경로", role: "핵심", icon: "🛗", color: "from-brand-50 to-white" },
            { id: "3057229",  name: "시간대별 승하차인원", role: "핵심", icon: "🚇", color: "from-ocean/10 to-white" },
            { id: "15156491", name: "유니크베뉴",         role: "핵심", icon: "🏛", color: "from-coral/10 to-white" },
            { id: "15077591", name: "갈맷길 코스",        role: "보조 핵심", icon: "🚶", color: "from-moss/10 to-white" },
            { id: "15143578", name: "택슐랭 식당",        role: "보조", icon: "🍜", color: "from-amber-50 to-white" },
          ].map((d) => (
            <div key={d.id} className={`card card-hov p-3 bg-gradient-to-br ${d.color}`}>
              <div className="flex items-start justify-between">
                <span aria-hidden className="text-2xl">{d.icon}</span>
                <span className="chip chip-brand">{d.role}</span>
              </div>
              <div className="mt-2 font-bold text-brand-700 text-sm">{d.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{d.id}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 입력 폼 */}
      <InputForm />

      {/* 핵심 원칙 3개 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { title: "LLM은 결정하지 않습니다", body: "경로 결정은 공공데이터 학습라벨 기반 규칙 + 경량 분류기. LLM은 결과를 쉬운 말로 설명만 합니다.", icon: "🤖" },
          { title: "정기 갱신형 — 정직한 표현", body: "실시간 고장 감지·실시간 혼잡 예측은 제공하지 않습니다. 모든 표현은 자동 점검됩니다.", icon: "📅" },
          { title: "검증 가능한 AI", body: "K-fold 교차검증으로 F1·MAE·Spearman·Top-1을 실측. 환각 검출률은 ring-buffer로 누적 기록.", icon: "🔬" },
        ].map((p) => (
          <article key={p.title} className="card p-5">
            <div className="text-3xl" aria-hidden>{p.icon}</div>
            <h3 className="mt-2 font-extrabold text-brand-700">{p.title}</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{p.body}</p>
          </article>
        ))}
      </section>

      {/* 빠른 이동 */}
      <section className="card p-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <div className="text-sm text-slate-500">한눈에 보기</div>
          <div className="font-bold text-brand-700">심사·기능 검증용 페이지</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin" className="btn-ghost text-sm">⑤ 대시보드</Link>
          <Link href="/about" className="btn-ghost text-sm">차별성·사업화·ESG</Link>
        </div>
      </section>
    </div>
  );
}
