"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript", badge: "⚡", color: "border-yellow-500/50 hover:border-yellow-400 text-yellow-300" },
  { value: "java",       label: "Java",       badge: "☕", color: "border-orange-500/50 hover:border-orange-400 text-orange-300" },
  { value: "python",     label: "Python",     badge: "🐍", color: "border-blue-500/50 hover:border-blue-400 text-blue-300" },
  { value: "cpp",        label: "C++",        badge: "⚙",  color: "border-purple-500/50 hover:border-purple-400 text-purple-300" },
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
    if (roomId.trim()) {
      const id = roomId.trim();
      if (typeof window !== "undefined") {
        const existingToken = localStorage.getItem(`codecollab_host_${id}`);
        if (!existingToken) {
          const hostToken = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
          localStorage.setItem(`codecollab_host_${id}`, hostToken);
        }
      }
      router.push(`/room/${id}?lang=${selectedLang}`);
    }
  };

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") joinRoom();
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0d1117] text-white overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] h-[300px] w-[300px] rounded-full bg-cyan-500/5 blur-[80px]" />
      </div>

      <div className="z-10 flex flex-col items-center gap-8 p-8 w-full max-w-md">

        {/* Logo + Title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-4xl">{'</>'}</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
            CodeCollab
          </h1>
          <p className="text-gray-400 text-base">
            Real-time collaborative coding — JavaScript & Java
          </p>
        </div>

        {/* Action Card */}
        <div className="w-full bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-2xl backdrop-blur-sm">

          {/* Language Selector */}
          <div className="mb-5">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-widest block mb-2">
              Choose Language
            </label>
            <div className="grid grid-cols-4 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setSelectedLang(lang.value)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 text-center transition-all duration-200 ${
                    selectedLang === lang.value
                      ? `${lang.color} bg-white/5 scale-105 shadow-lg`
                      : "border-[#30363d] text-gray-600 hover:border-[#484f58] hover:text-gray-400"
                  }`}
                >
                  <span className="text-xl">{lang.badge}</span>
                  <span className="text-[10px] font-semibold">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Create Room Button */}
          <button
            onClick={createRoom}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-100"
          >
            <span className="text-lg">+</span>
            Create New Room
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-[#30363d]" />
            <span className="text-xs text-gray-600 uppercase font-semibold">or join existing</span>
            <div className="h-px flex-1 bg-[#30363d]" />
          </div>

          {/* Join Input Group */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-widest">
              Room ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. project-alpha"
                className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder-gray-700"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={handleEnter}
              />
              <button
                onClick={joinRoom}
                disabled={!roomId}
                className="bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 rounded-lg text-sm font-bold transition-all hover:shadow-green-500/20 hover:shadow-lg active:scale-95"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Feature badges */}
        <div className="flex gap-3 flex-wrap justify-center">
          {["⚡ Real-time sync", "☕ Java support", "▶ Run & execute", "🔗 Invite links"].map((f) => (
            <span key={f} className="text-xs text-gray-600 bg-[#161b22] border border-[#30363d] px-3 py-1 rounded-full">
              {f}
            </span>
          ))}
        </div>

        <p className="text-gray-700 text-xs">
          Built with Next.js · Socket.io · Monaco Editor · JDoodle API
        </p>
      </div>
    </div>
  );
}