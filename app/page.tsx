import InputForm from "../components/InputForm";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6 appear">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-500 to-ocean text-white p-6 sm:p-10 shadow-cardLg">
        <div aria-hidden className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
        <div className="relative">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.45)", color: "#ffffff" }}>
            2026 부산광역시 공공데이터·AI 활용 창업경진대회 제출 시제품
          </span>
          <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold leading-snug text-white">
            교통약자·관광약자를 위한<br className="hidden sm:block" />
            <span className="text-white">부산형 포용관광·혼잡분산 AI</span>
          </h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.92)" }}>
            부산교통공사·부산관광공사 공공데이터를 핵심 입력값으로 활용해, 휠체어 이용자·고령자·임산부·유아동반자·캐리어 관광객의 도시철도 이동 의사결정을 돕는 <strong className="text-white">정기 갱신형 설명가능 AI 추천 서비스</strong>입니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {["학습라벨 기반 분류", "시간대 기반 예상혼잡", "5중 LLM 가드레일", "K-fold 교차검증", "시나리오 20종 자동평가"].map((t) => (
              <span key={t} className="inline-flex items-center px-3 py-1 rounded-full font-medium" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.35)", color: "#ffffff" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 활용 데이터 — 사용자가 받게 될 결과 관점으로 설명 */}
      <section aria-labelledby="data-h">
        <h2 id="data-h" className="text-sm font-bold text-slate-500 mb-2">이 추천이 사용하는 부산 공공데이터</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: "엘리베이터 대체경로",  who: "부산교통공사", forUser: "엘리베이터가 막혔을 때 돌아가는 길을 알려드립니다",        icon: "🛗", color: "from-brand-50 to-white"  },
            { name: "시간대별 승하차인원", who: "부산교통공사", forUser: "이 시간대에 덜 붐비는 동선을 골라드립니다",                 icon: "🚇", color: "from-ocean/10 to-white"  },
            { name: "유니크베뉴",          who: "부산관광공사", forUser: "MICE·전시·공연장 같은 부산만의 장소를 함께 추천합니다",      icon: "🏛", color: "from-coral/10 to-white"  },
            { name: "갈맷길 코스",         who: "부산광역시",   forUser: "걷기 좋은 저강도 산책 구간을 동선에 끼워드립니다",            icon: "🚶", color: "from-moss/10 to-white"   },
            { name: "택슐랭 식당",         who: "부산광역시",   forUser: "택시기사가 추천한 맛집을 동선에 넣어드립니다",                icon: "🍜", color: "from-amber-50 to-white"  },
          ].map((d) => (
            <div key={d.name} className={`card p-3 bg-gradient-to-br ${d.color}`}>
              <div className="text-2xl" aria-hidden>{d.icon}</div>
              <div className="mt-2 font-bold text-brand-700 text-sm leading-tight">{d.name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{d.who}</div>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{d.forUser}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 입력 폼 */}
      <InputForm />

      {/* 서비스가 제공하는 3가지 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3" aria-labelledby="features-h">
        <h2 id="features-h" className="sr-only">서비스가 제공하는 3가지</h2>
        {[
          { title: "안전 우선 경로", body: "엘리베이터 이용불가 상황을 가정해도 이동 가능한 경로를 우선 제안합니다.", icon: "🛡️" },
          { title: "혼잡 회피 경로", body: "시간대별 승하차인원 데이터로 덜 붐비는 동선을 골라드립니다.", icon: "🌊" },
          { title: "관광·맛집 코스", body: "유니크베뉴·갈맷길·택슐랭 식당을 묶어 부산다운 반나절 코스를 제안합니다.", icon: "🍜" },
        ].map((p) => (
          <article key={p.title} className="card p-5">
            <div className="text-3xl" aria-hidden>{p.icon}</div>
            <h3 className="mt-2 font-extrabold text-brand-700">{p.title}</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{p.body}</p>
          </article>
        ))}
      </section>

      {/* 사업화 4축 미니 섹션 */}
      <section className="card p-5" aria-labelledby="biz-h">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h2 id="biz-h" className="text-base font-extrabold text-brand-700">이 서비스의 사업화 — 4축 매출 구조</h2>
          <Link href="/about" className="text-xs text-brand-700 hover:underline">전체 사업계획 보기 →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          {[
            { axis: "B2G", title: "지자체·공공기관", body: "교통약자 이동권 SaaS + 정책 대시보드", color: "from-brand-50 to-white" },
            { axis: "B2B", title: "MICE·호텔·여행사", body: "행사 동선 패키지 + 접근성 경로 API", color: "from-ocean/10 to-white" },
            { axis: "B2C", title: "고령·가족 관광객", body: "맞춤 반나절 코스 + 보호자 공유 + 음성 안내", color: "from-coral/10 to-white" },
            { axis: "로컬상권", title: "택슐랭·유니크베뉴", body: "비혼잡 시간대 송객 수수료/광고", color: "from-moss/10 to-white" },
          ].map((m) => (
            <article key={m.axis} className={`border rounded-xl p-3 bg-gradient-to-br ${m.color}`}>
              <div className="text-[10px] font-bold text-brand-700 tracking-wider">{m.axis}</div>
              <div className="font-bold mt-1 text-slate-800">{m.title}</div>
              <p className="text-slate-600 mt-1 leading-snug">{m.body}</p>
            </article>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
          공공데이터 학습라벨 활용 권한이 진입장벽으로 작동하며, 핵심 아키텍처는 도시 비종속이라 수도권·해외 도시로 동일 코드 확장이 가능합니다. 수익모델 5종·로드맵 4단계·리스크 대응 6종 상세는 <Link href="/about" className="text-brand-700 underline-offset-2 hover:underline">소개 페이지</Link>를 참고하세요.
        </p>
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
