import { NextRequest, NextResponse } from "next/server";
import { FORBIDDEN } from "@/lib/llm/guardrails";

// 임의 텍스트에 금지표현이 있는지 점검 (관리자 패널·QA용)
export async function POST(req: NextRequest) {
  const { text } = await req.json().catch(() => ({ text: "" }));
  const hits: { phrase: string; index: number }[] = [];
  if (typeof text === "string") {
    for (const f of FORBIDDEN) {
      const i = text.indexOf(f);
      if (i >= 0) hits.push({ phrase: f, index: i });
    }
  }
  return NextResponse.json({ ok: hits.length === 0, hits, forbiddenList: FORBIDDEN });
}
