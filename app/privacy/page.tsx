export const metadata = { title: "개인정보 처리방침 — 배리어프리 로컬루트 부산" };

export default function PrivacyPage() {
  return (
    <div className="space-y-6 appear">
      <section className="card p-5 sm:p-6">
        <h1 className="text-2xl font-extrabold text-brand-700">개인정보 처리방침 (MVP)</h1>
        <p className="text-sm text-slate-600 mt-2">
          본 서비스는 공모전 제출용 시제품(MVP)으로, 사용자의 개인식별정보를 수집하지 않습니다.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-extrabold text-brand-700 mb-2">1. 수집하지 않는 정보</h2>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li>이름, 연락처, 이메일, 주소 등 개인식별정보</li>
          <li>회원가입 또는 로그인 계정 정보 (시제품 비밀번호 외)</li>
          <li>GPS·실시간 위치 정보</li>
          <li>결제 정보·금융 정보</li>
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-extrabold text-brand-700 mb-2">2. 수집·이용 정보 (익명·일시)</h2>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li>사용자가 입력한 출발역·목적역·이동 시간·사용자 유형·선호조건 — 추천 결과 산출용으로만 사용, 영구 저장하지 않음</li>
          <li>접근 인증 쿠키(<code className="text-xs bg-slate-100 px-1 rounded">preview-pass</code>) — 시제품 비밀번호 통과 표시. 1일 유지 후 자동 만료. HttpOnly·Secure 적용</li>
          <li>LLM 가드레일 호출 로그(메모리 ring-buffer 1024건) — 환각 검출률 산정용. 서버 재시작 시 초기화</li>
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-extrabold text-brand-700 mb-2">3. 외부 서비스</h2>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li>공공데이터포털 odcloud.kr — 5종 공공데이터 호출. 사용자 식별 정보 전송 없음</li>
          <li>Anthropic Claude API — 추천 결과 설명 생성. 사용자 식별 정보 전송 없음. 입력은 시스템이 화이트리스트로 한정한 경로 후보 데이터만</li>
          <li>호스팅: Vercel — 배포·로그·CDN 제공</li>
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-extrabold text-brand-700 mb-2">4. 데이터 저장 위치 및 기간</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          본 MVP는 추천 결과를 영구 저장하지 않습니다. 모든 사용자 입력은 추천 결과 생성 직후 처리 컨텍스트에서 폐기됩니다. localStorage에 저장되는 즐겨찾기·최근 검색은 사용자 PC에만 남으며 서버로 전송되지 않습니다.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-extrabold text-brand-700 mb-2">5. 2단계 사업화에서의 변경 예정</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          정식 서비스에서는 사용자 동의 기반의 계정·즐겨찾기·보호자 공유 기능을 추가할 예정이며, 그 시점에 개인정보보호법에 따른 정식 처리방침을 별도 고지합니다. 본 MVP에는 해당 기능이 포함되지 않습니다.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-extrabold text-brand-700 mb-2">6. 문의</h2>
        <p className="text-sm text-slate-700">heescompany@gmail.com</p>
      </section>
    </div>
  );
}
