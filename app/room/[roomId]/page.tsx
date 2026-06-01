"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import EditorComponent from "@/components/EditorComponent";
import InviteButton from "@/components/InviteButton";
import ChallengesPanel from "@/components/ChallengesPanel";
import { defaultTemplates } from "@/lib/challenges";
import {
  Files,
  Search,
  GitGraph,
  Settings,
  ChevronDown,
  X,
  Play,
  Terminal,
  BookOpen,
  Code2,
} from "lucide-react";

type SidebarTab = "explorer" | "challenges";

const LANG_META: Record<string, { label: string; ext: string; badge: string; color: string }> = {
  javascript: { label: "JavaScript", ext: "js",   badge: "⚡ JS",   color: "text-yellow-300" },
  java:       { label: "Java",       ext: "java", badge: "☕ Java", color: "text-orange-300" },
  python:     { label: "Python",     ext: "py",   badge: "🐍 Py",   color: "text-blue-300"   },
  cpp:        { label: "C++",        ext: "cpp",  badge: "⚙ C++",  color: "text-purple-300" },
};

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("Ready to run...");
  const [isRunning, setIsRunning] = useState(false);
  const [currentCode, setCurrentCode] = useState(defaultTemplates["javascript"]);
  const [challengeCode, setChallengeCode] = useState<string | undefined>(undefined);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("explorer");
  const [outputError, setOutputError] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
      { transports: ["websocket"] }
    );
    socketRef.current = newSocket;
    newSocket.emit("join-room", roomId);

    newSocket.on("language-update", (lang) => setLanguage(lang));
    newSocket.on("code-update", (code) => setCurrentCode(code));

    newSocket.on("code-output", (result: string) => {
      setOutput(result);
      setIsRunning(false);
      setOutputError(result.toLowerCase().startsWith("error"));
    });

    return () => { newSocket.disconnect(); };
  }, [roomId]);

  const runCode = () => {
    setIsRunning(true);
    setOutputError(false);
    setOutput("⏳ Running code...");
    socketRef.current?.emit("run-code", { roomId, language, code: currentCode });
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // Load default template for the new language and sync currentCode immediately
    // so that Run Code sends the correct code (not the stale previous-language code)
    const template = defaultTemplates[newLang] ?? defaultTemplates["javascript"];
    setChallengeCode(template);
    setCurrentCode(template);
    socketRef.current?.emit("language-change", { roomId, language: newLang });
    socketRef.current?.emit("code-change", { roomId, code: template });
  };

  const handleChallengeSelect = (code: string) => {
    setChallengeCode(code);
    setCurrentCode(code);
    socketRef.current?.emit("code-change", { roomId, code });
  };

  const meta = LANG_META[language] ?? LANG_META["javascript"];

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] text-[#cccccc] font-sans overflow-hidden">

      {/* ── ACTIVITY BAR ── */}
      <aside className="w-12 bg-[#333333] flex flex-col items-center py-3 gap-2 border-r border-[#252526] z-10">
        <button
          title="Explorer"
          onClick={() => setSidebarTab("explorer")}
          className={`p-2 rounded transition-colors ${
            sidebarTab === "explorer"
              ? "text-white bg-[#444]"
              : "text-gray-500 hover:text-white"
          }`}
        >
          <Files className="w-5 h-5" />
        </button>
        <button
          title="Challenges"
          onClick={() => setSidebarTab("challenges")}
          className={`p-2 rounded transition-colors ${
            sidebarTab === "challenges"
              ? "text-white bg-[#444]"
              : "text-gray-500 hover:text-white"
          }`}
        >
          <BookOpen className="w-5 h-5" />
        </button>
        <button title="Search" className="p-2 text-gray-500 hover:text-white rounded transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <div className="flex-1" />
        <button title="Settings" className="p-2 text-gray-500 hover:text-white rounded transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </aside>

      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-[#252526] flex flex-col border-r border-[#1e1e1e] min-h-0">

        {/* Explorer tab */}
        {sidebarTab === "explorer" && (
          <>
            <div className="h-9 px-4 flex items-center text-xs font-bold text-gray-400 flex-shrink-0">
              EXPLORER
            </div>
            <div className="px-2 py-1 flex items-center gap-1 bg-[#37373d] flex-shrink-0">
              <ChevronDown className="w-4 h-4" />
              <span className="font-bold text-xs text-blue-400">ROOM: {roomId}</span>
            </div>

            {/* File entry */}
            <div className="px-3 py-1.5 flex items-center gap-2 text-xs text-gray-300 bg-[#1e1e1e] mx-2 mt-2 rounded">
              <Code2 className="w-3 h-3 text-gray-500 flex-shrink-0" />
              <span className="font-mono">main.{meta.ext}</span>
              <span className={`ml-auto text-[10px] font-bold ${meta.color}`}>{meta.badge}</span>
            </div>

            <div className="flex-1" />
            <div className="p-4 border-t border-[#3e3e42]">
              <InviteButton roomId={roomId} />
            </div>
          </>
        )}

        {/* Challenges tab */}
        {sidebarTab === "challenges" && (
          <div className="flex flex-col flex-1 min-h-0">
            <ChallengesPanel
              language={language}
              onSelectChallenge={handleChallengeSelect}
            />
          </div>
        )}
      </aside>

      {/* ── MAIN AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">

        {/* TAB BAR & RUN BUTTON */}
        <div className="flex h-9 bg-[#252526] items-center justify-between pr-2 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 h-full bg-[#1e1e1e] text-white border-t-2 border-blue-500 min-w-32">
            <Code2 className="w-3 h-3 text-gray-500" />
            <span className="text-sm font-mono">main.{meta.ext}</span>
            <X className="w-3 h-3 hover:text-white ml-1 text-gray-600" />
          </div>

          <div className="flex items-center gap-2">
            {/* Language quick-switch pills */}
            <div className="flex gap-1">
              {Object.entries(LANG_META).map(([lang, m]) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  title={m.label}
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                    language === lang
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:text-gray-300 hover:bg-[#3e3e42]"
                  }`}
                >
                  {m.badge}
                </button>
              ))}
            </div>

            {/* RUN BUTTON */}
            <button
              onClick={runCode}
              disabled={isRunning}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-colors ${
                isRunning
                  ? "bg-gray-600 cursor-not-allowed text-gray-400"
                  : "bg-green-600 hover:bg-green-500 text-white"
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              {isRunning ? "Running..." : "Run Code"}
            </button>
          </div>
        </div>

        {/* EDITOR */}
        <div className="flex-1 relative min-h-0">
          <EditorComponent
            roomId={roomId}
            language={language}
            initialCode={challengeCode}
            onCodeChange={setCurrentCode}
          />
        </div>

        {/* TERMINAL / OUTPUT */}
        <div className="h-44 bg-[#1e1e1e] border-t border-[#3e3e42] flex flex-col flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-1.5 bg-[#252526] border-b border-[#1e1e1e] flex-shrink-0">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-gray-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>Output</span>
              {isRunning && (
                <span className="flex items-center gap-1 text-yellow-400 normal-case font-normal">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                  running
                </span>
              )}
            </div>
            <X
              className="w-3 h-3 cursor-pointer hover:text-white"
              onClick={() => { setOutput(""); setOutputError(false); }}
            />
          </div>
          <div
            className={`flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap leading-relaxed ${
              outputError ? "text-red-400" : "text-gray-300"
            }`}
          >
            {output || <span className="text-gray-600 italic">No output yet. Click &ldquo;Run Code&rdquo; to execute.</span>}
          </div>
        </div>

        {/* STATUS BAR */}
        <footer className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <GitGraph className="w-3 h-3" />
              main*
            </div>
          </div>
          <div className="relative group">
            <div className={`font-semibold cursor-pointer hover:bg-blue-600 px-2 py-0.5 rounded transition-colors ${meta.color}`}>
              {meta.badge} {meta.label}
            </div>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="absolute bottom-7 right-0 w-36 bg-[#252526] border border-[#3e3e42] rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity text-gray-200 text-xs"
              size={4}
              aria-label="Select programming language"
            >
              <option value="javascript">⚡ JavaScript</option>
              <option value="java">☕ Java</option>
              <option value="python">🐍 Python</option>
              <option value="cpp">⚙ C++</option>
            </select>
          </div>
        </footer>
      </main>
    </div>
  );
}