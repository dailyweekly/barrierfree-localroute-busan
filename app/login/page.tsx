"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp?.get("next") || "/";
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error || "인증 실패");
        setLoading(false);
        return;
      }
      router.replace(next);
    } catch (e) {
      setErr((e as Error).message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card w-full max-w-sm p-6 sm:p-8 appear" aria-labelledby="login-h">
      <div className="flex items-center gap-2 mb-2">
        <span aria-hidden className="inline-flex w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-700 to-ocean text-white grid place-items-center text-lg font-extrabold shadow-card">B</span>
        <div>
          <h1 id="login-h" className="text-lg font-extrabold text-brand-700">배리어프리 로컬루트 부산</h1>
          <p className="text-xs text-slate-500">시제품 — 비공개 미리보기</p>
        </div>
      </div>
      <p className="text-sm text-slate-600 mt-3 leading-relaxed">
        공모전 심사·내부 검토용 시제품입니다. 접근에 비밀번호가 필요합니다.
      </p>
      <label className="block mt-5 text-sm">
        <span className="block font-semibold mb-1">비밀번호</span>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
          required
          className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          aria-label="비밀번호 입력"
        />
      </label>
      {err && <p className="mt-2 text-xs text-warn" role="alert">{err}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full mt-5 disabled:opacity-60 disabled:cursor-not-allowed">
        {loading ? "확인 중…" : "입장"}
      </button>
      <p className="text-[11px] text-slate-400 mt-4">
        비밀번호는 Vercel Environment Variables의 <code>PREVIEW_PASSWORD</code>로 관리됩니다.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Suspense fallback={<div className="card w-full max-w-sm p-6 text-center text-sm text-slate-500">로딩 중…</div>}>
        <LoginInner />
      </Suspense>
    </div>
  );
}
