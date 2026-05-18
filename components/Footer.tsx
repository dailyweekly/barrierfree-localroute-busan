import Link from "next/link";
import { DATA_SOURCES } from "../lib/data/sources";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden className="inline-flex w-8 h-8 rounded-xl bg-gradient-to-br from-brand-700 to-ocean text-white grid place-items-center text-sm font-extrabold">B</span>
            <span className="font-extrabold text-brand-700">배리어프리 로컬루트 부산</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            교통약자·관광약자를 위한 부산형 포용관광·혼잡분산 AI 서비스. 본 서비스는 정기 갱신형 설명가능 AI 추천이며, 실시간 고장 감지·실시간 혼잡 예측은 제공하지 않습니다.
          </p>
        </div>
        <div>
          <div className="text-xs font-bold text-slate-700 mb-2">사용 공공데이터</div>
          <ul className="space-y-1 text-xs">
            {DATA_SOURCES.map((d) => (
              <li key={d.id} className="text-slate-600">
                <a href={d.fileDataUrl} target="_blank" rel="noreferrer" className="hover:text-brand-700 underline-offset-2 hover:underline">
                  {d.name}
                </a>
                <span className="text-slate-400 ml-1">· {d.provider}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold text-slate-700 mb-2">바로가기</div>
          <ul className="space-y-1 text-xs">
            <li><Link href="/" className="hover:text-brand-700">① 사용자 조건 입력</Link></li>
            <li><Link href="/routes" className="hover:text-brand-700">②③ 경로 비교 + AI 설명</Link></li>
            <li><Link href="/local" className="hover:text-brand-700">④ 로컬루트 확장</Link></li>
            <li><Link href="/admin" className="hover:text-brand-700">⑤ 관리자/심사 대시보드</Link></li>
            <li><Link href="/scenarios" className="hover:text-brand-700">🧪 시나리오 20종 시연</Link></li>
            <li><Link href="/about" className="hover:text-brand-700">소개 (차별성·사업화·ESG)</Link></li>
            <li><Link href="/privacy" className="hover:text-brand-700">개인정보 처리방침</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-3 text-center text-[11px] text-slate-400">
        2026 부산광역시 공공데이터·AI 활용 창업경진대회 제출 시제품 · 데이터 라이선스 준수
      </div>
    </footer>
  );
}
