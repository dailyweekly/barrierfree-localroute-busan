"use client";
import { useState } from "react";

export default function CopyButton({ text, label = "복사" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {}
      }}
      className="text-[11px] px-2 py-0.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50"
    >
      {done ? "✓ 복사됨" : `📋 ${label}`}
    </button>
  );
}
