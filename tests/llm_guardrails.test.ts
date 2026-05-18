import { test } from "node:test";
import assert from "node:assert/strict";
import { validateOutput, FORBIDDEN } from "../lib/llm/guardrails.ts";
import type { RouteCandidate, UserQuery } from "../lib/types.ts";

const candidate: RouteCandidate = {
  kind: "safe",
  title: "안전 우선 경로",
  startStation: "서면역", endStation: "남포역",
  steps: [
    { station: "서면역", description: "서면역에서 출발", isTransfer: false },
    { station: "남포역", description: "남포역에 도착", isTransfer: false },
  ],
  complexityScore: 25, complexityGrade: "낮음",
  predictedCongestion: "낮음", congestionScore: 30,
  passable: true,
  alternativeType: "대체 엘리베이터",
  rationale: {
    complexity: { score: 25, grade: "낮음", sourceIds: ["EV-X"] },
    congestion: { level: "낮음", score: 30, sourceStation: "서면역", sourceHour: 10 },
    passability: { passable: true, sourceLabel: "이동가능" },
    alternativeType: { type: "대체 엘리베이터", sourceIds: ["EV-X"] },
  },
};
const query: UserQuery = { startStation: "서면역", endStation: "남포역", travelHour: 10, travelDow: 2, userType: "wheelchair", preferences: ["safety"] };
const known = new Set(["서면역", "남포역"]);

test("정상 출력은 가드레일 통과", () => {
  const text = "복잡도 낮음 등급이며 예상혼잡도 낮습니다. 대체 엘리베이터로 이동하세요.";
  const r = validateOutput(text, { candidate, query, knownStations: known });
  assert.equal(r.rejected, false);
});

test("금지표현 포함 시 거부", () => {
  for (const f of FORBIDDEN) {
    const text = `복잡도 낮음. 예상혼잡 낮음. 대체 엘리베이터. ${f} 라고 안내합니다.`;
    const r = validateOutput(text, { candidate, query, knownStations: known });
    assert.equal(r.rejected, true, `should reject '${f}'`);
    assert.equal(r.forbiddenTermsOk, false);
  }
});

test("이동불가 경로를 추천하는 표현은 거부", () => {
  const bad = { ...candidate, passable: false };
  const text = "이 경로는 복잡도 보통, 예상혼잡 보통이며 추천드릴 만한 대체 엘리베이터입니다.";
  const r = validateOutput(text, { candidate: bad, query, knownStations: known });
  assert.equal(r.rejected, true);
  assert.equal(r.passableOk, false);
});

test("템플릿(복잡도/예상혼잡/대체) 누락 시 거부", () => {
  const text = "좋은 경로입니다. 빠르고 편안합니다.";
  const r = validateOutput(text, { candidate, query, knownStations: known });
  assert.equal(r.rejected, true);
  assert.equal(r.templateOk, false);
});
