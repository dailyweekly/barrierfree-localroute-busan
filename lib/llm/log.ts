// LLM 가드레일 호출 결과 ring-buffer
// 메모리 한정 (1024개). 서버리스 환경에서는 콜드스타트마다 초기화.

import type { GuardrailReport } from "../types.ts";

interface LogEntry {
  at: string;
  routeKind: string;
  rejected: boolean;
  reason?: string;
  report: GuardrailReport;
}

const BUF: LogEntry[] = [];
const MAX = 1024;

export function recordGuardrail(routeKind: string, report: GuardrailReport) {
  BUF.push({
    at: new Date().toISOString(),
    routeKind,
    rejected: report.rejected,
    reason: report.reason,
    report,
  });
  while (BUF.length > MAX) BUF.shift();
}

export function guardrailStats() {
  const total = BUF.length;
  const rejected = BUF.filter((b) => b.rejected).length;
  return {
    total,
    rejected,
    rejectionRate: total > 0 ? Number((rejected / total).toFixed(3)) : 0,
    recent: BUF.slice(-20),
  };
}
