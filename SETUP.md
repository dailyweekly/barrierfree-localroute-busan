# SETUP — 배리어프리 로컬루트 부산 (Next.js + Vercel)

## 0. 사전 요구사항
- Node.js >= 20 (Node 22 권장)
- npm 10+ (또는 pnpm/yarn 사용 가능)
- Vercel 계정 (배포 시)
- 공공데이터포털 서비스키 (`BUSAN_API_KEY`)
- Anthropic API 키 (`ANTHROPIC_API_KEY`)

## 1. 로컬 셋업

```bash
# 저장소 위치로 이동
cd "C:\Users\heeya\Desktop\부산 AI\barrierfree-localroute-busan"

# 1) 의존성 설치 — 처음 1회
npm install

# 2) 환경변수 설정
copy .env.example .env.local
# .env.local 을 메모장으로 열어 키 입력:
#   ANTHROPIC_API_KEY=sk-ant-...
#   BUSAN_API_KEY=lQ3g5k8RwZ5eWp48ErcgT1QqctiXXyqsYvH0BsvgWxzZZxkBgOl0glZMxFL27P5xLEp0HtqiMSR4f5XFso5Ptg==

# 3) 개발 서버 실행
npm run dev
# → http://localhost:3000
```

## 2. 정합성 검증 (4개 스크립트)

```bash
npm run typecheck       # TypeScript 타입 검증
npm run test            # 단위 테스트 10건 (route/congestion/llm guardrails)
npm run check-forbidden # 금지표현 자동 점검
npm run verify          # 위 3가지 일괄 실행
```

모두 통과 후 운영 빌드:
```bash
npm run build           # Next.js 프로덕션 빌드
npm start               # 빌드 산출물 실행 (포트 3000)
```

## 3. Vercel 배포

### A. GitHub 연동 방식 (권장)
1. 본 프로젝트를 GitHub 새 저장소에 push.
2. https://vercel.com 접속 → **New Project** → 본 저장소 import.
3. Framework Preset이 **Next.js** 로 자동 인식됨. 기본값으로 진행.
4. **Environment Variables** 추가:
   - `ANTHROPIC_API_KEY` → Anthropic 콘솔에서 발급한 키
   - `BUSAN_API_KEY` → 공공데이터포털 Decoded 일반 인증키
   - (선택) `ANTHROPIC_MODEL` → 기본값 `claude-sonnet-4-6`
   - (선택) `LLM_ENABLED` → 기본 `true`. `false` 면 결정론적 폴백 설명만 사용
5. **Deploy** 클릭. 자동 빌드 후 배포 URL 발급.

### B. Vercel CLI 방식
```bash
npm install -g vercel
vercel login
vercel
# 첫 배포 시 프로젝트 설정 마법사
vercel --prod
```

### C. 배포 후 캡처
신청서 §4-1 구동 확인자료용 캡처 화면 5개:
1. `/` — 사용자 조건 입력
2. `/routes?start=서면역&end=남포역&hour=10&dow=2&user=infant&pref=safety,low_congestion` — 경로 후보 비교 + AI 설명
3. `/routes?...` 우측 또는 하단 — AI 추천 근거 패널 (펼친 상태)
4. `/local?start=서면역&end=해운대역` — 로컬루트 확장 (유니크베뉴·갈맷길·택슐랭)
5. `/admin` — 관리자/심사 대시보드 (데이터·라벨 분포·시나리오 결과)

`/api/scenarios` 와 `/api/metrics` 응답도 그대로 캡처해 서식6 증빙으로 사용 가능.

## 4. 트러블슈팅

| 증상 | 원인 | 조치 |
|------|------|------|
| `BUSAN_API_KEY` 없이 실행 | 폴백 샘플 데이터로 동작 | `.env.local` 에 키 설정 후 재시작 |
| `ANTHROPIC_API_KEY` 없이 실행 | 결정론적 템플릿 설명 사용 (LLM 호출 없음) | 키 설정 후 재시작 |
| 빌드 시 한글 폴더 경로 오류 | Windows 일부 환경에서 발생 | 영문 경로로 옮기거나 WSL 사용 |
| `npm run test` 실패 | Node 20 이상 + `--experimental-strip-types` 필요 | Node 20.6+ 또는 Node 22 권장 |

## 5. 환경변수 전체 정의
`.env.example` 참고. Vercel 배포 시 모든 키를 **Environment Variables** 에 등록하고 코드/git 에는 절대 노출하지 마세요.

| 변수 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| ANTHROPIC_API_KEY | 권장 | — | Claude API 키. 없으면 결정론적 폴백 |
| ANTHROPIC_MODEL | 선택 | claude-sonnet-4-6 | 사용할 Claude 모델 |
| BUSAN_API_KEY | 권장 | — | 공공데이터포털 Decoded 인증키. 없으면 폴백 샘플 |
| GALMAEGIL_BASE_URL | 선택 | https://apis.data.go.kr/6260000/BusanGalmaetGilService | 갈맷길 endpoint |
| DATA_CACHE_TTL | 선택 | 86400 | 공공데이터 캐시 TTL(초) |
| LLM_ENABLED | 선택 | true | LLM 호출 여부 |

## 6. 코드 변경 시 권장 워크플로 (CLAUDE.md §5)
Explore → Plan → Implement → Verify → Commit

- 변경 후에는 반드시 `npm run verify` 통과 후 커밋.
- 신청서 문구·금지표현 점검은 자동(check-forbidden) + 수동 모두 권장.
