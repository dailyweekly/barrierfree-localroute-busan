# 배리어프리 로컬루트 부산 (Barrierfree LocalRoute Busan)

부산교통공사·부산관광공사 공공데이터를 핵심 입력값으로 활용하여, 교통약자·관광약자가 부산 도시철도와 로컬 관광지를 안전하게 이동하도록 돕는 **정기 갱신형 설명가능 AI 추천 서비스**의 Next.js + Vercel 구현체입니다.

> 본 저장소는 2026년 부산광역시 공공데이터·AI 활용 창업경진대회 제출 신청서 ([서식5]/[서식6]) 내용을 그대로 구현한 MVP입니다. 신청서 상의 5개 화면과 모든 핵심 기능을 포함합니다.

## 핵심 원칙
- LLM은 경로를 결정하지 않고 **설명만** 합니다 (5중 가드레일).
- "실시간 고장 감지", "실시간 혼잡 예측" 같은 금지 표현을 사용하지 않습니다.
- 모든 외부 API 호출은 서버 사이드(Route Handler)에서만 이루어집니다.

## 5개 핵심 화면 (신청서 캡처 대상)
| # | 경로 | 화면 |
|---|---|---|
| ① | `/` | 사용자 조건 입력 (휠체어/고령자/임산부/유아동반/캐리어/일반 + 선호조건) |
| ② | `/routes` 상단 | 안전 우선 / 혼잡 회피 / 로컬 포함 3개 경로 비교 |
| ③ | `/routes` 하단 | AI 추천 근거 설명 (복잡도·예상혼잡·이동가능성·대체경로 사유) |
| ④ | `/local` | 로컬루트 확장 (유니크베뉴·갈맷길·택슐랭) |
| ⑤ | `/admin` | 관리자/심사 대시보드 (데이터·모델 성능·시나리오·환각 검출) |

## 활용 공공데이터 (Plan A 확정 — 2026-05-18 Swagger 검증)
1. **부산교통공사_엘리베이터 고장 시 대체 이동 경로** (15151579) — 학습라벨·경로복잡도·대체경로유형
2. **부산교통공사_시간대별 승하차인원** (3057229) — 시간대 기반 예상혼잡 산정
3. **부산관광공사_유니크베뉴** (15156491) — MICE·관광 목적지
4. **부산광역시_갈맷길 코스 정보** (15077591) — 저강도 도보 동선
5. **부산광역시_택슐랭 선정 식당** (15143578) — 로컬상권 연계

## 빠른 시작
```bash
# 1. 환경변수 설정
cp .env.example .env.local
# .env.local 에 ANTHROPIC_API_KEY, BUSAN_API_KEY 입력

# 2. 의존성 설치
npm install

# 3. 개발 서버
npm run dev
# → http://localhost:3000
```

## 스크립트
| 명령 | 설명 |
|---|---|
| `npm run dev` | 로컬 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 |
| `npm run typecheck` | TypeScript 타입 검증 |
| `npm run test` | 단위 테스트 |
| `npm run check-forbidden` | 금지표현 자동 점검 |

## Vercel 배포 (전체 절차는 `DEPLOY.md` 참조)

요약:
1. 로컬에서 `git init` → 첫 커밋 → GitHub push.
2. Vercel `New Project` → 본 저장소 import.
3. **Environment Variables** 에 `ANTHROPIC_API_KEY`, `BUSAN_API_KEY`, `PREVIEW_PASSWORD`(기본 `test1234`) 등록.
4. Framework Preset: **Next.js** (자동 인식). Deploy.
5. 배포 URL 접속 시 `/login` 화면에서 비밀번호 입력 → 7일 쿠키 유지.

> 모든 API 키는 Vercel Project Settings → Environment Variables 에만 보관합니다. 코드·README·git 히스토리에 키를 노출하지 마세요.

### 초기 화면 비밀번호 보호
- 미들웨어 `middleware.ts` 가 모든 페이지(API 일부 제외) 접근 시 쿠키 검증.
- 환경변수 `PREVIEW_PASSWORD` (미설정 시 기본 `test1234`).
- 완전 해제: `PREVIEW_AUTH_DISABLED=true`.
- 인증 후 쿠키 `preview-pass=ok` 7일 유지.

## 디렉터리 구조
```
barrierfree-localroute-busan/
├── app/                       # Next.js App Router
│   ├── page.tsx               # ① 사용자 조건 입력
│   ├── routes/page.tsx        # ② 경로 비교 + ③ AI 설명
│   ├── local/page.tsx         # ④ 로컬루트 확장
│   ├── admin/page.tsx         # ⑤ 관리자 대시보드
│   └── api/                   # Route Handlers (서버 사이드)
├── lib/
│   ├── data/                  # odcloud 클라이언트, 5종 데이터 어댑터
│   ├── routing/               # 경로 점수화·랭킹 (규칙기반 + 경량 모델)
│   ├── congestion/            # 시간대 기반 예상혼잡 산정
│   ├── llm/                   # Claude API + 5중 가드레일
│   ├── scenarios.ts           # 시나리오 20종
│   └── types.ts               # 도메인 타입
├── components/                # UI 컴포넌트
├── data/sample/               # 실API 구조와 일치하는 폴백 샘플
├── scripts/check_forbidden_terms.ts
└── tests/                     # 단위 테스트
```

## 평가항목 매핑 (서식5)
| 평가항목 | 배점 | 본 코드의 구현 위치 |
|---|---|---|
| 공공데이터 활용성 | 30 | `lib/data/*`, 모든 화면 |
| AI 기술 활용 | 15 | `lib/routing/*`, `lib/congestion/*`, `lib/llm/*` |
| AI 서비스 | 15 | `app/page.tsx`, `app/routes/page.tsx`, `app/local/page.tsx` |
| 독창성 | 15 | 학습라벨 기반 의사결정 + LLM 가드레일 |
| 발전가능성 | 20 | API Route Handler 아키텍처(2단계 확장 가능) |
| ESG 혁신 | 5 | 큰글씨·쉬운말·아이콘·스크린리더 + 로컬상권 연계 |

## 라이선스 및 데이터 출처
- 공공데이터: 공공데이터포털(data.go.kr), 부산공공데이터포털(data.busan.go.kr) 각 데이터셋의 라이선스(CC BY 등) 준수.
- 코드: 본 프로젝트 제출자 권리 보유. 공모전 심사용으로 제출.
