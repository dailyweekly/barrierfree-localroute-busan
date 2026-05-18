// 코드·문서 전체에서 금지표현 사용 여부를 점검
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, extname, basename } from "node:path";

const FORBIDDEN = [
  "실시간 엘리베이터 고장 감지",
  "실시간 고장 감지",
  "실시간 혼잡도 예측",
  "실시간 혼잡 예측",
  "BTS 공연 대비",
  "AI 완전 자동 최적경로",
  "완전 자동 최적화",
  "교통약자 문제 완전 해결",
  "100% 안전",
  "완벽한 경로",
];

const TARGET_EXTS = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".md", ".json", ".css", ".html"]);
const IGNORE_DIRS = new Set([".next", "node_modules", ".git", ".vercel", ".cache", "data", "tests"]);
const IGNORE_FILES = new Set(["check_forbidden_terms.ts", "guardrails.ts"]);
const ALLOW_HINTS = [
  "미사용", "않는다", "않습", "않음", "아니다", "아닌", "아니라",
  "금지", "제공하지 않", "사용하지 않", "쓰지 않", "사용 금지",
  "FORBIDDEN", "forbidden", "Forbidden", "쓰면 안", "절대 사용", "대신",
];

interface Hit { file: string; line: number; phrase: string; ctx: string; allowed: boolean; }

function walk(root: string, files: string[] = []): string[] {
  for (const name of readdirSync(root)) {
    if (IGNORE_DIRS.has(name)) continue;
    if (IGNORE_FILES.has(name)) continue;
    const p = join(root, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (TARGET_EXTS.has(extname(p)) && !IGNORE_FILES.has(basename(p))) files.push(p);
  }
  return files;
}

function check(root: string) {
  const files = walk(root);
  const hits: Hit[] = [];
  for (const f of files) {
    const text = readFileSync(f, "utf8");
    const lines = text.split(/\r?\n/);
    for (const phrase of FORBIDDEN) {
      lines.forEach((line, i) => {
        const idx = line.indexOf(phrase);
        if (idx >= 0) {
          const ctxStart = Math.max(0, i - 2);
          const ctxEnd = Math.min(lines.length, i + 3);
          const ctx = lines.slice(ctxStart, ctxEnd).join("\n");
          const allowed = ALLOW_HINTS.some((h) => ctx.includes(h));
          hits.push({ file: f, line: i + 1, phrase, ctx: line.trim().slice(0, 200), allowed });
        }
      });
    }
  }
  return { hits, scanned: files.length };
}

const root = process.argv[2] ?? process.cwd();
const { hits, scanned } = check(root);
const violations = hits.filter((h) => !h.allowed);
const allowed = hits.filter((h) => h.allowed);

console.log("스캔된 파일: " + scanned);
console.log("금지표현 발견: 총 " + hits.length + " (허용 컨텍스트 " + allowed.length + " / 위반 " + violations.length + ")");

if (allowed.length > 0) {
  console.log("\n[허용 컨텍스트 - 가드레일/문서/금지 목록 명시]");
  for (const h of allowed) {
    console.log("  " + h.file + ":" + h.line + "  «" + h.phrase + "»  " + h.ctx);
  }
}

if (violations.length > 0) {
  console.error("\n[위반 - 수정 필요]");
  for (const h of violations) {
    console.error("  " + h.file + ":" + h.line + "  «" + h.phrase + "»  " + h.ctx);
  }
  process.exit(1);
}
console.log("\nOK: 금지표현 점검 통과");
