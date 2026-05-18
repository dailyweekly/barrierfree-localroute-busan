import { COMPETITORS, ORIGINALITY_PILLARS } from "../../lib/business/competition.ts";
import { ROADMAP } from "../../lib/business/roadmap.ts";
import { MARKETS, REVENUE_MODELS, RISKS } from "../../lib/business/markets.ts";
import { ESG_PILLARS, ESG_KPIS } from "../../lib/business/esg.ts";

export const metadata = { title: "사업 소개 — 배리어프리 로컬루트 부산" };

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="text-2xl font-bold text-brand">서비스·사업 소개</h2>
        <p className="text-sm text-slate-600 mt-2">
          이 페이지는 신청서(서식5) §1.4 차별성, §2 사업화, §3 ESG 의 핵심 정보를
          심사위원·이해관계자가 한눈에 확인할 수 있도록 정리한 화면입니다.
          모든 항목은 공공데이터·코드와 일치합니다.
        </p>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5" aria-labelledby="comp-h">
        <h3 id="comp-h" className="text-lg font-bold mb-3">§1.4 기존 서비스와의 차별성 (독창성 15점)</h3>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-2">서비스</th><th className="p-2">기존 기능</th>
              <th className="p-2">한계</th><th className="p-2">본 서비스의 차별점</th>
            </tr>
          </thead>
          <tbody>
            {COMPETITORS.map((c) => (
              <tr key={c.service} className="border-t align-top">
                <td className="p-2 font-semibold">{c.service}</td>
                <td className="p-2">{c.feature}</td>
                <td className="p-2 text-slate-600">{c.limit}</td>
                <td className="p-2 text-brand-700">{c.differentiator}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {ORIGINALITY_PILLARS.map((p, i) => (
            <div key={p.title} className="border rounded-xl p-4 bg-brand-50">
              <div className="text-xs text-brand">독창성 {i + 1}</div>
              <div className="font-bold mt-1">{p.title}</div>
              <p className="text-sm text-slate-700 mt-1">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5" aria-labelledby="market-h">
        <h3 id="market-h" className="text-lg font-bold mb-3">§2 사업화 시장 — B2G · B2B · B2C · 로컬상권 (발전가능성 20점)</h3>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr><th className="p-2">축</th><th className="p-2">고객</th><th className="p-2">제공 가치</th><th className="p-2">수익</th></tr>
          </thead>
          <tbody>
            {MARKETS.map((m) => (
              <tr key={m.axis} className="border-t align-top">
                <td className="p-2 font-bold text-brand">{m.axis}</td>
                <td className="p-2">{m.customer}</td>
                <td className="p-2 text-slate-600">{m.value}</td>
                <td className="p-2">{m.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5" aria-labelledby="roadmap-h">
        <h3 id="roadmap-h" className="text-lg font-bold mb-3">단계별 로드맵</h3>
        <ol className="space-y-3">
          {ROADMAP.map((r, i) => (
            <li key={r.step} className="flex gap-3 items-start">
              <span className="w-8 h-8 rounded-full bg-brand text-white grid place-items-center font-bold text-sm">{i + 1}</span>
              <div>
                <div className="font-bold">{r.step} <span className="text-xs text-slate-500 ml-2">{r.period}</span></div>
                <p className="text-sm text-slate-700">{r.goal}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5" aria-labelledby="revenue-h">
        <h3 id="revenue-h" className="text-lg font-bold mb-3">수익모델 5종</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {REVENUE_MODELS.map((r, i) => (
            <li key={r.name} className="border rounded-lg p-3">
              <div className="text-xs text-slate-400">#{i + 1}</div>
              <div className="font-bold">{r.name}</div>
              <p className="text-slate-600">{r.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5" aria-labelledby="risk-h">
        <h3 id="risk-h" className="text-lg font-bold mb-3">리스크와 대응</h3>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr><th className="p-2">리스크</th><th className="p-2">대응</th></tr>
          </thead>
          <tbody>
            {RISKS.map((r) => (
              <tr key={r.risk} className="border-t align-top">
                <td className="p-2 font-semibold">{r.risk}</td>
                <td className="p-2 text-slate-700">{r.mitigation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5" aria-labelledby="esg-h">
        <h3 id="esg-h" className="text-lg font-bold mb-3">§3 ESG 혁신 (5점)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {ESG_PILLARS.map((p) => (
            <div key={p.axis} className="border rounded-xl p-3 bg-slate-50">
              <div className="text-xs font-bold text-brand">{p.axis}</div>
              <p className="text-sm text-slate-700 mt-1">{p.body}</p>
            </div>
          ))}
        </div>
        <h4 className="font-semibold mt-4 mb-2 text-sm">정량 성과 지표 (운영 단계)</h4>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr><th className="p-2">지표</th><th className="p-2">측정</th><th className="p-2">목표</th><th className="p-2">현재</th></tr>
          </thead>
          <tbody>
            {ESG_KPIS.map((k) => (
              <tr key={k.name} className="border-t align-top">
                <td className="p-2 font-semibold">{k.name}</td>
                <td className="p-2 text-slate-600">{k.description}</td>
                <td className="p-2 font-bold text-brand">{k.target}</td>
                <td className="p-2 text-slate-500">{k.current}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
