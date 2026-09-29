"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript", icon: "⚡" },
  { value: "java",       label: "Java",       icon: "☕" },
  { value: "python",     label: "Python",     icon: "🐍" },
  { value: "cpp",        label: "C++",        icon: "⚙" },
];

// Scattered background symbols — inspired by Excalidraw+'s floating icons
const BG_ITEMS = [
  { s: "?",    x:  7.5, y:  9,  c: "#6b7280", fs: 36, r:  0, o: 0.70 },
  { s: "~",    x: 10,   y: 62,  c: "#4b5563", fs: 54, r:  0, o: 0.55 },
  { s: "→",    x:  5,   y: 47,  c: "#4b5563", fs: 28, r:  0, o: 0.65 },
  { s: "△",    x:  8,   y: 82,  c: "#ef4444", fs: 22, r: 10, o: 0.50 },
  { s: "{}",   x:  2,   y: 30,  c: "#6b7280", fs: 24, r: -5, o: 0.50 },
  { s: "=>",   x: 40,   y: 94,  c: "#6b7280", fs: 20, r:  0, o: 0.50 },
  { s: "+",    x: 14,   y: 96,  c: "#6b7280", fs: 30, r:  0, o: 0.55 },
  { s: "//",   x: 20,   y: 12,  c: "#4b5563", fs: 22, r:  0, o: 0.50 },
  { s: "fn",   x: 27,   y: 83,  c: "#4b5563", fs: 28, r:  6, o: 0.40 },
  { s: "[]",   x: 35,   y: 91,  c: "#6b7280", fs: 24, r: -8, o: 0.50 },
  { s: "○",    x: 72,   y:  5,  c: "#4b5563", fs: 24, r:  0, o: 0.50 },
  { s: "▷",    x: 58,   y: 96,  c: "#6b7280", fs: 20, r:  0, o: 0.50 },
  { s: "✕",    x: 93,   y: 75,  c: "#ef4444", fs: 20, r:  0, o: 0.60 },
  { s: "|",    x: 97,   y: 58,  c: "#4b5563", fs: 34, r:  0, o: 0.60 },
  { s: "⊕",   x: 84,   y: 12,  c: "#4b5563", fs: 22, r:  0, o: 0.50 },
  { s: "→",    x: 92,   y: 38,  c: "#d97706", fs: 26, r:  0, o: 0.55 },
  { s: "◁",    x: 88,   y: 88,  c: "#4b5563", fs: 20, r:  0, o: 0.50 },
  { s: "⌀",    x: 75,   y: 95,  c: "#6b7280", fs: 22, r:  0, o: 0.40 },
  { s: "⊗",   x: 96,   y: 22,  c: "#4b5563", fs: 20, r:  0, o: 0.50 },
  { s: "✓",    x: 22,   y: 46,  c: "#374151", fs: 22, r:  0, o: 0.40 },
  { s: "≡",    x: 44,   y: 96,  c: "#4b5563", fs: 26, r:  0, o: 0.45 },
  { s: "◆",    x: 15,   y: 25,  c: "#3b82f6", fs: 14, r: 15, o: 0.40 },
  { s: "✦",    x: 84,   y:  4,  c: "#6b7280", fs: 18, r:  0, o: 0.45 },
  { s: "⌘",    x:  3,   y: 17,  c: "#4b5563", fs: 20, r:  0, o: 0.45 },
];

// Syntax-highlighted code lines shown in the background editor preview
type Token = { t: string; c: string };
const CODE_PREVIEW: Token[][] = [
  [{ t: "const", c: "#c792ea" }, { t: " createRoom", c: "#82aaff" }, { t: " = (lang) => {", c: "#cdd3de" }],
  [{ t: "  return", c: "#c792ea" }, { t: " fetch", c: "#82aaff" }, { t: "('/api/room', {", c: "#cdd3de" }],
  [{ t: "    method", c: "#f78c6c" }, { t: ": ", c: "#cdd3de" }, { t: "'POST'", c: "#c3e88d" }, { t: ",", c: "#cdd3de" }],
  [{ t: "    body", c: "#f78c6c" }, { t: ": JSON.stringify({ lang })", c: "#cdd3de" }],
  [{ t: "  });", c: "#cdd3de" }],
  [{ t: "};", c: "#cdd3de" }],
  [],
  [{ t: "// Real-time collaboration", c: "#546e7a" }],
  [{ t: "socket", c: "#82aaff" }, { t: ".on(", c: "#cdd3de" }, { t: "'code-change'", c: "#c3e88d" }, { t: ", (", c: "#cdd3de" }, { t: "code", c: "#f78c6c" }, { t: ") => {", c: "#cdd3de" }],
  [{ t: "  setCode(code);", c: "#cdd3de" }],
  [{ t: "  syncCursors();", c: "#82aaff" }],
  [{ t: "});", c: "#cdd3de" }],
  [],
  [{ t: "const", c: "#c792ea" }, { t: " users", c: "#82aaff" }, { t: " = [", c: "#cdd3de" }, { t: "'alice'", c: "#c3e88d" }, { t: ", ", c: "#cdd3de" }, { t: "'bob'", c: "#c3e88d" }, { t: "];", c: "#cdd3de" }],
  [{ t: "users", c: "#82aaff" }, { t: ".forEach(", c: "#cdd3de" }, { t: "u", c: "#f78c6c" }, { t: " => session", c: "#82aaff" }, { t: ".invite(u));", c: "#cdd3de" }],
];

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [selectedLang, setSelectedLang] = useState("javascript");

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    const hostToken = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    if (typeof window !== "undefined") {
      localStorage.setItem(`codecollab_host_${newRoomId}`, hostToken);
    }
    router.push(`/room/${newRoomId}?lang=${selectedLang}`);
  };

  const joinRoom = () => {
    if (!roomId.trim()) return;
    const id = roomId.trim();
    if (typeof window !== "undefined") {
      if (!localStorage.getItem(`codecollab_host_${id}`)) {
        localStorage.setItem(
          `codecollab_host_${id}`,
          Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
        );
      }
    }
    router.push(`/room/${id}?lang=${selectedLang}`);
  };

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") joinRoom();
  };

  return (
    <div className="relative h-screen w-full overflow-hidden text-white" style={{ background: "#13141f" }}>

      {/* ── Scattered background symbols ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {BG_ITEMS.map((item, i) => (
          <span
            key={i}
            className="absolute font-mono font-bold leading-none"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              color: item.c,
              fontSize: `${item.fs}px`,
              opacity: item.o,
              transform: `rotate(${item.r}deg)`,
            }}
          >
            {item.s}
          </span>
        ))}
      </div>

      {/* ── Logo – top center ── */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center pt-5">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-3xl" style={{ color: "#a78bfa" }}>{"</>"}</span>
          <span className="text-2xl font-extrabold tracking-widest uppercase" style={{ color: "#e2e8f0" }}>
            Code<span style={{ color: "#7c5af0" }}>Collab</span>
          </span>
          <sup className="font-bold text-base" style={{ color: "#7c5af0", marginTop: "4px" }}>+</sup>
        </div>
      </div>

      {/* ── Background code-editor preview – left side ── */}
      <div
        className="absolute pointer-events-none"
        style={{ left: "15%", top: "50%", transform: "translateY(-50%)", width: "380px", opacity: 0.32 }}
      >
        {/* Label floats above the window so it doesn't shift the window's vertical center */}
        <p className="absolute -top-7 left-1 text-white text-xs font-semibold tracking-wide">my-project · 2026 · session</p>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2d2f3e", background: "#0d1117" }}>
          {/* Window chrome */}
          <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: "#161b22" }}>
            <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f56" }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "#27c93f" }} />
            <span className="ml-3 text-xs font-mono" style={{ color: "#6b7280" }}>main.js</span>
          </div>
          {/* Code lines */}
          <div className="p-3.5 font-mono text-xs" style={{ lineHeight: "1.55" }}>
            {CODE_PREVIEW.map((line, li) => (
              <div key={li} className="flex">
                <span
                  className="shrink-0 w-4 text-right mr-4 text-[10px] select-none"
                  style={{ color: "#3d4451", paddingTop: "1px" }}
                >
                  {li + 1}
                </span>
                <span>
                  {line.length === 0
                    ? " "
                    : line.map((tok, ti) => (
                        <span key={ti} style={{ color: tok.c }}>{tok.t}</span>
                      ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main action card – right side ── */}
      <div
        className="absolute z-20"
        style={{ right: "6%", top: "50%", transform: "translateY(-50%)", width: "400px" }}
      >
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{ background: "#1e2030", border: "1px solid #2d2f3e" }}
        >
          {/* Header */}
          <div className="text-center mb-7">
            <h2 className="text-[1.6rem] font-bold leading-snug" style={{ color: "#f1f5f9" }}>
              Ready to code together?
            </h2>
            <p className="text-sm mt-1.5" style={{ color: "#64748b" }}>
              Start a new session or join an existing room
            </p>
          </div>

          {/* Language selector */}
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: "#475569" }}>
              Language
            </p>
            <div className="grid grid-cols-4 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setSelectedLang(lang.value)}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all duration-150"
                  style={
                    selectedLang === lang.value
                      ? { borderColor: "#7c5af0", background: "rgba(124,90,240,0.12)", transform: "scale(1.05)" }
                      : { borderColor: "#2d2f3e", color: "#64748b" }
                  }
                >
                  <span className="text-lg">{lang.icon}</span>
                  <span className="text-[10px] font-semibold" style={{ color: "#94a3b8" }}>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Create Room */}
          <button
            onClick={createRoom}
            className="w-full py-3 rounded-xl font-bold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            style={{ background: "#7c5af0" }}
          >
            Create a new room
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1" style={{ background: "#2d2f3e" }} />
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#3d4451" }}>
              or join existing
            </span>
            <div className="h-px flex-1" style={{ background: "#2d2f3e" }} />
          </div>

          {/* Join existing room */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter room ID..."
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyDown={handleEnter}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              style={{
                background: "#13141f",
                border: "1px solid #2d2f3e",
                color: "#e2e8f0",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#7c5af0")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2f3e")}
            />
            <button
              onClick={joinRoom}
              disabled={!roomId.trim()}
              className="px-5 rounded-xl font-bold text-sm text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
              style={{ background: "#238636" }}
            >
              Join
            </button>
          </div>

        </div>

        {/* Terms footer below card */}
        <p className="text-center text-[11px] mt-3" style={{ color: "#3d4451" }}>
          By continuing you are agreeing to our{" "}
          <span className="underline cursor-pointer hover:text-gray-400 transition-colors" style={{ color: "#475569" }}>
            Terms of Use
          </span>{" "}
          and{" "}
          <span className="underline cursor-pointer hover:text-gray-400 transition-colors" style={{ color: "#475569" }}>
            Privacy Policy
          </span>
        </p>
      </div>

    </div>
  );
}
