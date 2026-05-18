"use client";
import { useEffect, useState } from "react";

const KEY = "blb_favorites_v1";

interface Fav { start: string; end: string; user: string; at: number }

export default function RouteActions({ start, end, user, hour, dow, pref }: { start: string; end: string; user: string; hour: number; dow: number; pref: string }) {
  const [favs, setFavs] = useState<Fav[]>([]);
  const [saved, setSaved] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFavs(JSON.parse(raw) as Fav[]);
    } catch {}
  }, []);

  useEffect(() => {
    setSaved(favs.some((f) => f.start === start && f.end === end && f.user === user));
  }, [favs, start, end, user]);

  const toggleFav = () => {
    const next = saved
      ? favs.filter((f) => !(f.start === start && f.end === end && f.user === user))
      : [{ start, end, user, at: Date.now() }, ...favs].slice(0, 10);
    localStorage.setItem(KEY, JSON.stringify(next));
    setFavs(next);
  };

  const share = async () => {
    const url = `${location.origin}/routes?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&hour=${hour}&dow=${dow}&user=${user}&pref=${encodeURIComponent(pref)}`;
    const text = `${start} → ${end} 추천 경로`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "배리어프리 로컬루트 부산", text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareMsg("링크가 복사되었습니다");
      setTimeout(() => setShareMsg(null), 2000);
    } catch {
      setShareMsg("공유에 실패했습니다");
      setTimeout(() => setShareMsg(null), 2000);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={toggleFav} aria-pressed={saved}
        className={`text-sm px-3 py-2 rounded-xl border ${saved ? "bg-coral text-white border-coral" : "bg-white border-slate-300"}`}>
        {saved ? "★ 즐겨찾기에서 빼기" : "☆ 즐겨찾기"}
      </button>
      <button onClick={share} className="text-sm px-3 py-2 rounded-xl border bg-white border-slate-300 hover:bg-slate-50">
        🔗 공유
      </button>
      {shareMsg && <span className="chip chip-ok">{shareMsg}</span>}
    </div>
  );
}
