import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreRow, combinedScore } from "../lib/routing/score.ts";
import { ELEVATOR_SAMPLE } from "../data/sample/elevator.ts";
import type { CongestionEstimate } from "../lib/congestion/estimate.ts";

test("이동불가 행은 passable=false", () => {
  const impassable = ELEVATOR_SAMPLE.find((r) => r["경로_이용_가능_여부"] === "N");
  if (!impassable) throw new Error("샘플에 이동불가 행이 없습니다");
  const s = scoreRow(impassable, "wheelchair");
  assert.equal(s.passable, false);
  const cg: CongestionEstimate = { level: "낮음", score: 10, sourceStation: "X", sourceHour: 10, sampleSize: 5, bucket: "10시-11시" };
  const combined = combinedScore(s, cg, "wheelchair", ["safety"]);
  assert.ok(combined > 900, "이동불가 경로는 결합 점수가 큰 값이어야 함");
});

test("복잡도 점수에 따라 등급이 매겨진다", () => {
  const lowRow = ELEVATOR_SAMPLE.find((r) => r["학습라벨"] === "이동가능" && (r["경로복잡도_점수"] ?? 100) < 30);
  if (!lowRow) throw new Error("샘플에 저복잡도 행이 없습니다");
  const s = scoreRow(lowRow, "elderly");
  assert.equal(s.complexityGrade, "낮음");
});

test("환승역에는 페널티가 부여된다", () => {
  const transfer = ELEVATOR_SAMPLE.find((r) => r["환승역_여부"] === "Y" && r["경로_이용_가능_여부"] === "Y");
  if (!transfer) throw new Error("샘플에 환승역 행이 없습니다");
  const s = scoreRow(transfer, "wheelchair");
  assert.ok(s.transferPenalty > 0);
});
