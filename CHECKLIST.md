# 신청서 ↔ 코드 매핑 체크리스트

> 본 문서는 신청서(서식5·서식6) 모든 항목이 코드에 **기능·기술적으로** 구현되어 있는지 점검한 결과입니다. 시각적 노출이 아니라 동작·계산·연결 데이터 단위로 매핑합니다.

검증 일자: 2026-05-18
검증 결과: typecheck 0건 · test 10/10 · check-forbidden 위반 0건

---

## §1.1 개요·제안배경 — 공공데이터 활용성 (30점)

| 신청서 항목 | 구현 위치 | 검증 가능 결과 |
|---|---|---|
| 5종 공공데이터 식별 메타 | `lib/data/sources.ts` (DATA_SOURCES) | ID·URL·제공기관·라이선스·갱신주기·컬럼수·활용위치·리스크 노트 7필드 |
| 엘리베이터 대체경로 (15151579) | `lib/data/elevator.ts` + 23개 컬럼 ↔ `ElevatorAltRoute` 타입 | Swagger OAS 매칭 |
| 시간대별 승하차인원 (3057229) | `lib/data/ridership.ts` + 30개 컬럼 | 24개 시간대 long-format 변환 |
| 유니크베뉴 (15156491) | `lib/data/venue.ts` + `venuesNearStation()` | 행정구역 매칭 함수 |
| 갈맷길 (15077591) | `lib/data/galmaegil.ts` + `fetchGalmaegil()` | REST API + JSON 파싱 |
| 택슐랭 (15143578) | `lib/data/taxulang.ts` + `restaurantsNear()` | 위치/주소 매칭 |
| 데이터 활용 추적 | `/api/recommend` 응답의 `usageTrace`, `sourceCells` | 호출당 어느 행·셀이 쓰였는지 응답에 포함 |
| 캐시 (정기 갱신형) | `lib/data/odcloud.ts` Next ISR 1일 TTL | `DATA_CACHE_TTL` 환경변수로 제어 |

---

## §1.2 AI 기술 활용 (15점) — 실제 평가 함수

| 모델 | 함수 | 평가 지표 | 코드 위치 |
|---|---|---|---|
| ① 이용가능성 분류 | `predictPassable()` | Accuracy/Precision/Recall/F1 | `lib/eval/metrics.ts` |
| ② 대체경로 유형 분류 | `predictAltType()` | Macro F1 | 동 |
| ③ 복잡도 회귀 | `predictComplexity()` | MAE/RMSE | 동 |
| ④ 랭킹 | 동 + `spearman()` + Top-1 | Spearman 상관, Top-1 성공률 | 동 |
| ⑤ 예상혼잡 산정 | `estimateCongestion()` | 분위수 기반 3단계 | `lib/congestion/estimate.ts` |
| 교차검증 | `kfoldSplits()` k=5 시드 42 | fold 평균 + 표본 수 보고 | `lib/eval/metrics.ts` |
| 메트릭 노출 | `/api/metrics` 응답 `eval` 필드 | 호출 시점 K-fold 실측 | `app/api/metrics/route.ts` |

### LLM 5중 가드레일 (`lib/llm/guardrails.ts`)
1. 입력 화이트리스트: `buildWhitelistedInput()`
2. 출력 템플릿 고정: `REQUIRED_TEMPLATE_TERMS` 검사
3. 존재 검증: `knownStations` 대비 검사
4. 이동불가 추천 차단: `passableOk`
5. 금지표현 검출: `FORBIDDEN_PHRASES`

### 환각 검출률 실측 (`lib/llm/log.ts`)
- ring-buffer 1024개 호출 결과 저장
- `guardrailStats().rejectionRate` 로 환각 검출률 산정
- `/api/metrics` 응답에 `guardrail.rejectionRate` 노출

---

## §1.3 AI 서비스 (15점) — 5개 화면 모두 동작 구현

| # | 경로 | 핵심 기능 |
|---|---|---|
| ① | `/` | 6종 사용자 유형 + 4종 선호조건 + 큰글씨·고대비 토글 |
| ② | `/routes` 상단 | 안전/혼잡회피/로컬포함 3개 경로 + 동적 추천 |
| ③ | `/routes` 내장 | LLM 가드레일 통과 설명 + XAI 근거(학습라벨·sourceIds 노출) |
| ④ | `/local` | 유니크베뉴·갈맷길·택슐랭 결합 반나절 코스 |
| ⑤ | `/admin` | 데이터 메타·K-fold 결과·시나리오 통과·환각 로그·ESG KPI |
| (보조) | `/about` | 차별성/사업화/ESG 정적 메타 페이지 |

### 접근성 (신청서 §1.3 — 큰글씨·쉬운말·아이콘·스크린리더 등)
- `app/globals.css` `[data-bigtext="true"]`, `[data-contrast="high"]`
- `components/AppHeader.tsx` 토글 버튼 (`aria-pressed`)
- `sr-only` 클래스, `aria-label`/`aria-labelledby` 다수 사용
- 아이콘+텍스트 병행 (모든 액션 버튼)
- LLM 출력 `voice` 필드 — TTS 호환 평문

---

## §1.4 차별성·독창성 (15점)

| 항목 | 코드 위치 |
|---|---|
| 경쟁사 5종 비교표 | `lib/business/competition.ts` (COMPETITORS) |
| 독창성 3대 핵심 | `lib/business/competition.ts` (ORIGINALITY_PILLARS) |
| 학습라벨 기반 의사결정 | `lib/routing/score.ts` `scoreRow()` (학습라벨 직접 인입) |
| LLM 결정 분리 원칙 | `lib/llm/claude.ts` 주석 + 가드레일로 강제 |

---

## §2 사업화 및 실현가능성 (20점)

| 항목 | 코드 위치 |
|---|---|
| 단계별 로드맵 (4단계) | `lib/business/roadmap.ts` (ROADMAP) |
| B2G/B2B/B2C/로컬상권 4축 | `lib/business/markets.ts` (MARKETS) |
| 수익모델 5종 | `lib/business/markets.ts` (REVENUE_MODELS) |
| 리스크 6종 + 대응 | `lib/business/markets.ts` (RISKS) |

---

## §3 ESG 혁신 (5점) — 정량 지표 동적 측정

| 지표 | 측정 방식 | 코드 위치 |
|---|---|---|
| 교통약자 경로 도달 성공률 | 시나리오 20종 통과율 자동 계산 | `app/api/metrics/route.ts` |
| 이동불가 경로 추천율 | safe 경로 중 passable=false 비율 | 동 |
| 고복잡도 경로 회피율 | safe 경로 평균 complexityScore | 동 |
| 혼잡 회피 효과 | (K-fold 검증 진행 중) | 동 |
| 로컬상권 연결률 | include_local 경로의 alternativeType 비율 | 동 |
| 설명 이해도 | (사용자 테스트 단계) | 동 |
| 4축 ESG 정의 | `lib/business/esg.ts` (ESG_PILLARS) | 동 |

---

## §4 추가 사항

| 항목 | 코드 위치 |
|---|---|
| 시나리오 20종 | `lib/scenarios.ts` (SCENARIOS) — 신청서 §4-3 그대로 |
| 시나리오 자동 평가 | `/api/scenarios` 응답 (통과율 자동 계산) |
| 금지표현 자동 점검 | `scripts/check_forbidden_terms.ts` (10종) |
| 표현 가드레일 점검 | `npm run check-forbidden` 명령 |
| 데이터·법적 안전성 | `.env.example`, server-only 데이터 모듈, MVP 개인정보 비수집 |

---

## 서식6 후원기관 데이터 활용 증빙

| 데이터 | 코드에서의 실제 활용 |
|---|---|
| 부산교통공사 — 15151579 | `lib/routing/score.ts`가 학습라벨·복잡도·대체경로유형을 분류·랭킹 정답으로 사용 |
| 부산교통공사 — 3057229 | `lib/congestion/estimate.ts`가 시간대 분위수로 예상혼잡 산정 |
| 부산관광공사 — 15156491 | `lib/data/venue.ts`가 행정구역 매칭으로 인근 베뉴 추천 |

### 가공·처리 방법
- odcloud REST API → JSON 정규화 (`lib/data/odcloud.ts`)
- 행정구역 키 정규화 (`venue.getDistrict()`)
- 24개 시간대 long-format 변환 (`ridership` long-format)
- K-fold 분할 + 분위수 변환

### 적용 결과
- 화면 캡처 5종 (`/`, `/routes`, AI 설명 패널, `/local`, `/admin`)
- 데이터 활용 트레이스 (`/api/recommend.usageTrace`)
- 시나리오 자동 평가 (`/api/scenarios`)

---

## 검증 명령 일괄

```bash
npm run verify
# = typecheck + test + check-forbidden
# 모두 통과해야 신청서 일관성 보장
```
