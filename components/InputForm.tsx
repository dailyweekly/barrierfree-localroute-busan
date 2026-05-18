"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const USER_TYPES: { value: string; label: string; icon: string; desc: string }[] = [
  { value: "wheelchair", label: "휠체어",     icon: "♿", desc: "휠체어 이용자" },
  { value: "elderly",     label: "고령자",     icon: "🧓", desc: "65세 이상" },
  { value: "pregnant",    label: "임산부",     icon: "🤰", desc: "출산예정 보호자 포함" },
  { value: "infant",      label: "유아동반",   icon: "👶", desc: "유아차 동반" },
  { value: "luggage",     label: "캐리어",     icon: "🧳", desc: "관광용 짐 동반" },
  { value: "general",     label: "일반",       icon: "🚶", desc: "일반 이용자" },
];

const PREFS: { value: string; label: string; icon: string }[] = [
  { value: "safety",         label: "안전 우선",   icon: "🛡️" },
  { value: "low_congestion", label: "혼잡 회피",   icon: "🌊" },
  { value: "min_transfer",   label: "환승 최소",   icon: "🔁" },
  { value: "include_local",  label: "로컬 포함",   icon: "🍜" },
];

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

export default function InputForm() {
  const router = useRouter();
  const [stations, setStations] = useState<string[]>([]);
  const [startStation, setStart] = useState("서면역");
  const [endStation, setEnd] = useState("남포역");
  const [hour, setHour] = useState(10);
  const [dow, setDow] = useState(2);
  const [userType, setUserType] = useState("wheelchair");
  const [prefs, setPrefs] = useState<string[]>(["safety", "low_congestion"]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/stations").then((r) => r.json()).then((j) => setStations(j.stations ?? []));
  }, []);

  const togglePref = (v: string) => setPrefs((cur) => cur.includes(v) ? cur.filter((p) => p !== v) : [...cur, v]);

  const submit = () => {
    setLoading(true);
    const params = new URLSearchParams({
      start: startStation, end: endStation,
      hour: String(hour), dow: String(dow),
      user: userType, pref: prefs.join(","),
    });
    router.push(`/routes?${params.toString()}`);
  };

  // 빠른 선택 프리셋
  const PRESETS: { label: string; icon: string; apply: () => void }[] = [
    { label: "서면 → 남포 · 유아", icon: "👶", apply: () => { setStart("서면역"); setEnd("남포역"); setUserType("infant"); setHour(10); setPrefs(["safety", "low_congestion"]); } },
    { label: "부산역 → 광안 · 캐리어", icon: "🧳", apply: () => { setStart("부산역"); setEnd("광안역"); setUserType("luggage"); setHour(12); setPrefs(["safety"]); } },
    { label: "센텀시티 MICE · 휠체어", icon: "♿", apply: () => { setStart("센텀시티역"); setEnd("해운대역"); setUserType("wheelchair"); setHour(10); setPrefs(["safety", "include_local"]); } },
  ];

  return (
    <section className="card p-5 sm:p-7 appear" aria-labelledby="input-h">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 id="input-h" className="text-xl sm:text-2xl font-extrabold text-brand-700">① 사용자 조건 입력</h2>
          <p className="text-sm text-slate-600 mt-1">출발·도착·시간대·사용자 유형·선호조건을 입력하면 안전 / 혼잡 회피 / 로컬 포함 3개 경로를 비교합니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.label} onClick={p.apply} className="chip chip-brand hover:bg-brand-100 transition" aria-label={`프리셋: ${p.label}`}>
              <span aria-hidden>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        <label className="text-sm">
          <span className="block font-semibold mb-1">🚏 출발역</span>
          <input list="stations" value={startStation} onChange={(e) => setStart(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            aria-label="출발역 입력" />
        </label>
        <label className="text-sm">
          <span className="block font-semibold mb-1">🎯 목적 역</span>
          <input list="stations" value={endStation} onChange={(e) => setEnd(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            aria-label="목적 역 입력" />
        </label>
        <datalist id="stations">
          {stations.map((s) => <option key={s} value={s} />)}
        </datalist>

        <label className="text-sm">
          <span className="block font-semibold mb-1">🕐 출발 시간</span>
          <select value={hour} onChange={(e) => setHour(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-200">
            {Array.from({ length: 24 }, (_, i) => i).map((h) => (
              <option key={h} value={h}>{String(h).padStart(2, "0")}시</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block font-semibold mb-1">📅 요일</span>
          <div className="flex flex-wrap gap-1">
            {DOW.map((d, i) => (
              <button type="button" key={d} onClick={() => setDow(i)}
                aria-pressed={dow === i}
                className={`px-3 py-2 rounded-xl text-sm font-medium border ${dow === i ? "bg-brand-700 text-white border-brand-700" : "bg-white border-slate-300"}`}>
                {d}
              </button>
            ))}
          </div>
        </label>
      </div>

      <fieldset className="mt-6">
        <legend className="font-semibold mb-2">👥 사용자 유형</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2" role="radiogroup" aria-label="사용자 유형 선택">
          {USER_TYPES.map((u) => {
            const active = userType === u.value;
            return (
              <button key={u.value} type="button" role="radio" aria-checked={active}
                onClick={() => setUserType(u.value)}
                className={`p-3 rounded-2xl border text-left transition ${active ? "bg-gradient-to-br from-brand-50 to-white border-brand-500 shadow-glow" : "bg-white border-slate-300 hover:border-brand-300"}`}>
                <div className="text-2xl" aria-hidden>{u.icon}</div>
                <div className="font-bold mt-1 text-sm">{u.label}</div>
                <div className="text-[11px] text-slate-500">{u.desc}</div>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="font-semibold mb-2">⚙️ 선호 조건 (복수 선택)</legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PREFS.map((p) => {
            const on = prefs.includes(p.value);
            return (
              <button key={p.value} type="button" aria-pressed={on}
                onClick={() => togglePref(p.value)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition ${on ? "bg-brand-700 text-white border-brand-700" : "bg-white border-slate-300 hover:border-brand-300"}`}>
                <span aria-hidden className="mr-1">{p.icon}</span>{p.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-7 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <button onClick={submit} disabled={loading} className="btn-primary text-base disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? "🤖 추천 계산 중…" : "🤖 AI 경로 추천 받기"}
        </button>
      </div>
    </section>
  );
}
