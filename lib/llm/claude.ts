// Claude API 호출 — 서버 사이드 전용
// LLM은 경로를 결정하지 않고, 이미 선택된 경로 후보를 설명만 한다.

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { RouteCandidate, UserQuery, LLMExplanation } from "@/lib/types";
import { systemPrompt, userPrompt } from "./prompts";
import {
  buildWhitelistedInput,
  validateOutput,
  GuardrailContext,
} from "./guardrails";
import { recordGuardrail } from "./log";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

function deterministicFallback(candidate: RouteCandidate): { short: string; detail: string; voice: string } {
  const { complexityGrade, predictedCongestion, alternativeType, passable } = candidate;
  if (!passable) {
    return {
      short: "이 경로는 이동이 어렵습니다. 직원 안내를 권장합니다.",
      detail: `${candidate.startStation}에서 ${candidate.endStation}까지의 경로는 현재 입력 자료상 이동 불가로 표시됩니다. 역 직원이나 보호자의 도움을 받으세요. 자세한 내용은 확인 필요.`,
      voice: `이 경로는 이동이 어렵습니다. 역 직원의 도움을 받으세요.`,
    };
  }
  return {
    short: `복잡도 ${complexityGrade}, 예상혼잡 ${predictedCongestion}. ${alternativeType} 안내.`,
    detail: `${candidate.startStation}에서 ${candidate.endStation}까지 가는 길은 복잡도가 ${complexityGrade}이고, 이 시간대 예상혼잡은 ${predictedCongestion}입니다. 엘리베이터 ${alternativeType} 경로로 이동하면 됩니다.`,
    voice: `이 경로는 복잡도가 ${complexityGrade}이고, 예상혼잡은 ${predictedCongestion}입니다. ${alternativeType}로 이동하세요.`,
  };
}

export async function explainCandidate(
  candidate: RouteCandidate,
  query: UserQuery,
  knownStations: Set<string>
): Promise<LLMExplanation> {
  const ctx: GuardrailContext = { candidate, query, knownStations };
  const whitelisted = buildWhitelistedInput(ctx);
  const fallback = deterministicFallback(candidate);

  const enabled = (process.env.LLM_ENABLED ?? "true") === "true";
  const key = process.env.ANTHROPIC_API_KEY;

  if (!enabled || !key) {
    const report = validateOutput(fallback.detail, ctx);
    recordGuardrail(candidate.kind, report);
    return { ...fallback, guardrailReport: report };
  }

  const client = new Anthropic({ apiKey: key });
  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      temperature: 0.2,
      system: systemPrompt(),
      messages: [{ role: "user", content: userPrompt(whitelisted, query.userType) }],
    });

    const text = resp.content
      .filter((c): c is { type: "text"; text: string } => c.type === "text")
      .map((c) => c.text)
      .join("\n");

    const json = extractJSON(text);
    const candidateText = json
      ? JSON.stringify(json)
      : text;
    const report = validateOutput(candidateText, ctx);
    if (report.rejected || !json) {
      const r2 = { ...report, rejected: true, reason: report.reason ?? "JSON 파싱 실패" };
      recordGuardrail(candidate.kind, r2);
      return { ...fallback, guardrailReport: r2 };
    }
    recordGuardrail(candidate.kind, report);
    return {
      short: typeof json.short === "string" ? json.short : fallback.short,
      detail: typeof json.detail === "string" ? json.detail : fallback.detail,
      voice: typeof json.voice === "string" ? json.voice : fallback.voice,
      guardrailReport: report,
    };
  } catch (e) {
    const rep = {
      inputWhitelistOk: true,
      templateOk: false,
      existenceOk: true,
      passableOk: true,
      forbiddenTermsOk: true,
      rejected: true,
      reason: `Claude API 호출 실패: ${(e as Error).message}`,
    };
    recordGuardrail(candidate.kind, rep);
    return { ...fallback, guardrailReport: rep };
  }
}

function extractJSON(text: string): Record<string, unknown> | null {
  // ```json ... ``` 또는 첫 { ... } 추출
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const raw = fence ? fence[1] : text;
  const i = raw.indexOf("{");
  const j = raw.lastIndexOf("}");
  if (i < 0 || j < 0) return null;
  try {
    return JSON.parse(raw.slice(i, j + 1));
  } catch {
    return null;
  }
}
