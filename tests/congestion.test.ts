import { test } from "node:test";
import assert from "node:assert/strict";
import { estimateCongestion } from "../lib/congestion/estimate.ts";
import { RIDERSHIP_SAMPLE } from "../data/sample/ridership.ts";

test("피크 시간대(07~09)는 비피크보다 혼잡 점수가 높다", () => {
  const peak = estimateCongestion(RIDERSHIP_SAMPLE, "부산역", 7, 1);
  const off = estimateCongestion(RIDERSHIP_SAMPLE, "부산역", 13, 1);
  assert.ok(peak.score >= off.score, `peak=${peak.score} off=${off.score}`);
});

test("데이터 없는 역에서는 보통/50 폴백", () => {
  const r = estimateCongestion(RIDERSHIP_SAMPLE, "없는역", 10, 1);
  assert.equal(r.score, 50);
  assert.equal(r.level, "보통");
});

test("결과 level 은 '낮음/보통/높음' 중 하나", () => {
  const r = estimateCongestion(RIDERSHIP_SAMPLE, "서면역", 18, 4);
  assert.ok(["낮음", "보통", "높음"].includes(r.level));
});
