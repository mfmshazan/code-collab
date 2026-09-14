"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import EditorComponent from "@/components/EditorComponent";
import InviteButton from "@/components/InviteButton";
import ChallengesPanel from "@/components/ChallengesPanel";
import ParticipantsPanel, { Participant } from "@/components/ParticipantsPanel";
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
  Users,
  Crown,
  Lock,
  UserCheck,
} from "lucide-react";

type SidebarTab = "explorer" | "challenges" | "participants";

const LANG_META: Record<string, { label: string; ext: string; badge: string; color: string }> = {
  javascript: { label: "JavaScript", ext: "js",   badge: "⚡ JS",   color: "text-yellow-300" },
  java:       { label: "Java",       ext: "java", badge: "☕ Java", color: "text-orange-300" },
  python:     { label: "Python",     ext: "py",   badge: "🐍 Py",   color: "text-blue-300"   },
  cpp:        { label: "C++",        ext: "cpp",  badge: "⚙ C++",  color: "text-purple-300" },
};

function RoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;

  // Extract requested language from URL query param (?lang=cpp, etc.)
  const requestedLang = searchParams?.get("lang") || "javascript";
  const initialLang = ["javascript", "java", "python", "cpp"].includes(requestedLang)
    ? requestedLang
    : "javascript";

  const [language, setLanguage] = useState(initialLang);
  const [output, setOutput] = useState("Ready to run...");
  const [isRunning, setIsRunning] = useState(false);
  const [currentCode, setCurrentCode] = useState(() => defaultTemplates[initialLang] ?? defaultTemplates["javascript"]);
  const [challengeCode, setChallengeCode] = useState<string | undefined>(undefined);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("explorer");
  const [outputError, setOutputError] = useState(false);
  const [permissionToast, setPermissionToast] = useState<string | null>(null);

  // Participant and Permission states
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [roomMode, setRoomMode] = useState<"host-only" | "collaborative">("host-only");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [username, setUsername] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("codecollab_username");
      if (stored) return stored;
    }
    return "Student";
  });

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1. Retrieve or generate username and host token from localStorage
    const hostToken = typeof window !== "undefined" ? localStorage.getItem(`codecollab_host_${roomId}`) : null;
    let storedName = typeof window !== "undefined" ? localStorage.getItem("codecollab_username") : null;
    
    if (!storedName) {
      storedName = hostToken ? "Host" : `Student-${Math.floor(100 + Math.random() * 900)}`;
      if (typeof window !== "undefined") {
        localStorage.setItem("codecollab_username", storedName);
      }
    }

    // 2. Connect single socket instance for the room
    const newSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
      { transports: ["websocket"] }
    );
    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setSocket(newSocket);
      if (storedName) {
        setUsername(storedName);
      }
    });

    newSocket.on("disconnect", () => {
      setSocket(null);
    });

    newSocket.emit("join-room", {
      roomId,
      username: storedName,
      hostToken: hostToken || undefined,
      language: initialLang,
    });

    // 3. Room initialization & participant events
    newSocket.on("room-init", (data: {
      isHost: boolean;
      hostToken?: string;
      canEdit: boolean;
      mode: "host-only" | "collaborative";
      myParticipant: Participant;
      participants: Participant[];
    }) => {
      setIsHost(data.isHost);
      setCanEdit(data.canEdit);
      setRoomMode(data.mode);
      setParticipants(data.participants);

      if (data.isHost && data.hostToken && typeof window !== "undefined") {
        localStorage.setItem(`codecollab_host_${roomId}`, data.hostToken);
      }

      if (data.isHost) {
        const currentName = typeof window !== "undefined" ? localStorage.getItem("codecollab_username") : null;
        if (!currentName || currentName.startsWith("Student-")) {
          setUsername("Host");
          if (typeof window !== "undefined") {
            localStorage.setItem("codecollab_username", "Host");
          }
          newSocket.emit("update-name", { roomId, username: "Host" });
        }
      }
    });

    newSocket.on("host-promoted", ({ hostToken }: { hostToken?: string }) => {
      setIsHost(true);
      setCanEdit(true);
      if (hostToken && typeof window !== "undefined") {
        localStorage.setItem(`codecollab_host_${roomId}`, hostToken);
      }
      const currentName = typeof window !== "undefined" ? localStorage.getItem("codecollab_username") : null;
      if (!currentName || currentName.startsWith("Student-")) {
        setUsername("Host");
        if (typeof window !== "undefined") {
          localStorage.setItem("codecollab_username", "Host");
        }
        newSocket.emit("update-name", { roomId, username: "Host" });
      }
    });

    newSocket.on("participants-update", (updatedList: Participant[]) => {
      setParticipants(updatedList);
      const me = updatedList.find((p) => p.socketId === newSocket.id);
      if (me) {
        setCanEdit(me.canEdit);
        setIsHost(me.isHost);
      }
    });

    newSocket.on("permission-updated", ({ canEdit }: { canEdit: boolean }) => {
      setCanEdit(canEdit);
      if (canEdit) {
        setPermissionToast("🎉 Admin granted you permission to write code!");
        setTimeout(() => setPermissionToast(null), 5000);
      } else {
        setPermissionToast("🔒 Your edit access was revoked by admin.");
        setTimeout(() => setPermissionToast(null), 4000);
      }
    });

    newSocket.on("room-mode-updated", (mode: "host-only" | "collaborative") => {
      setRoomMode(mode);
    });

    // Code and Language sync
    newSocket.on("language-update", (lang) => setLanguage(lang));
    newSocket.on("code-update", (code) => setCurrentCode(code));

    newSocket.on("code-output", (result: string) => {
      setOutput(result);
      setIsRunning(false);
      setOutputError(result.toLowerCase().startsWith("error"));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, initialLang]);

  const runCode = () => {
    setIsRunning(true);
    setOutputError(false);
    setOutput("⏳ Running code...");
    socketRef.current?.emit("run-code", { roomId, language, code: currentCode });
  };

  const handleLanguageChange = (newLang: string) => {
    if (!canEdit) return;
    setLanguage(newLang);
    const template = defaultTemplates[newLang] ?? defaultTemplates["javascript"];
    setChallengeCode(template);
    setCurrentCode(template);
    socketRef.current?.emit("language-change", { roomId, language: newLang });
    socketRef.current?.emit("code-change", { roomId, code: template });
  };

  const handleChallengeSelect = (code: string) => {
    if (!canEdit) return;
    setChallengeCode(code);
    setCurrentCode(code);
    socketRef.current?.emit("code-change", { roomId, code });
  };

  const handleUpdateName = (newName: string) => {
    setUsername(newName);
    if (typeof window !== "undefined") {
      localStorage.setItem("codecollab_username", newName);
    }
    socketRef.current?.emit("update-name", { roomId, username: newName });
  };

  const handleRequestEditAccess = () => {
    socketRef.current?.emit("request-edit-access", { roomId });
  };

  const handleSetEditPermission = (targetSocketId: string, targetCanEdit: boolean) => {
    socketRef.current?.emit("set-edit-permission", {
      roomId,
      targetSocketId,
      canEdit: targetCanEdit,
    });
  };

  const handleSetRoomMode = (mode: "host-only" | "collaborative") => {
    socketRef.current?.emit("set-room-mode", { roomId, mode });
  };

  const handleSetAllPermissions = (targetCanEdit: boolean) => {
    socketRef.current?.emit("set-all-edit-permissions", {
      roomId,
      canEdit: targetCanEdit,
    });
  };

  const handleClaimHost = () => {
    socketRef.current?.emit("claim-host", { roomId });
  };

  const meta = LANG_META[language] ?? LANG_META["javascript"];
  const pendingRequestsCount = participants.filter((p) => p.requestingEdit && !p.canEdit).length;
  const currentParticipant = participants.find((p) => p.socketId === socket?.id);

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
          title="Participants"
          onClick={() => setSidebarTab("participants")}
          className={`relative p-2 rounded transition-colors ${
            sidebarTab === "participants"
              ? "text-white bg-[#444]"
              : "text-gray-500 hover:text-white"
          }`}
        >
          <Users className="w-5 h-5" />
          {/* Notification badge for host on pending requests */}
          {isHost && pendingRequestsCount > 0 ? (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
          ) : participants.length > 0 ? (
            <span className="absolute bottom-1 right-1 text-[9px] bg-blue-600 text-white rounded-full px-1 font-bold">
              {participants.length}
            </span>
          ) : null}
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

        {/* Participants tab */}
        {sidebarTab === "participants" && (
          <div className="flex flex-col flex-1 min-h-0">
            <ParticipantsPanel
              roomId={roomId}
              participants={participants}
              currentSocketId={socket?.id || null}
              isHost={isHost}
              roomMode={roomMode}
              canEdit={canEdit}
              username={username}
              onUpdateName={handleUpdateName}
              onRequestEditAccess={handleRequestEditAccess}
              onSetEditPermission={handleSetEditPermission}
              onSetAllPermissions={handleSetAllPermissions}
              onSetRoomMode={handleSetRoomMode}
              onClaimHost={handleClaimHost}
            />
          </div>
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

        {/* TAB BAR & PERMISSIONS & RUN BUTTON */}
        <div className="flex h-9 bg-[#252526] items-center justify-between pr-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 h-9 bg-[#1e1e1e] text-white border-t-2 border-blue-500 min-w-32">
              <Code2 className="w-3 h-3 text-gray-500" />
              <span className="text-sm font-mono">main.{meta.ext}</span>
              <X className="w-3 h-3 hover:text-white ml-1 text-gray-600" />
            </div>

            {/* Role / Permission Indicator Tag */}
            {!participants.some((p) => p.isHost) ? (
              <button
                onClick={handleClaimHost}
                title="Room has no active host. Click to claim Admin rights!"
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500 hover:bg-yellow-400 text-black shadow transition-colors animate-pulse"
              >
                <Crown className="w-3 h-3" />
                <span>Claim Host / Admin</span>
              </button>
            ) : isHost ? (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
                <Crown className="w-3 h-3" /> Host
              </span>
            ) : canEdit ? (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/15 text-green-300 border border-green-500/30">
                <UserCheck className="w-3 h-3" /> Editor
              </span>
            ) : (
              <button
                onClick={handleRequestEditAccess}
                title="Click to request edit permission from the host"
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#333] hover:bg-[#444] text-yellow-300 border border-yellow-500/40 transition-colors"
              >
                <Lock className="w-3 h-3" />
                <span>View Only {currentParticipant?.requestingEdit ? "(Requested ✋)" : "(Ask Edit ✋)"}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Invite Button (Header Quick Copy) */}
            <InviteButton roomId={roomId} variant="header" />

            {/* Language quick-switch pills */}
            <div className="flex gap-1">
              {Object.entries(LANG_META).map(([lang, m]) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  disabled={!canEdit}
                  title={!canEdit ? "Editing locked by host" : m.label}
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                    language === lang
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:text-gray-300 hover:bg-[#3e3e42]"
                  } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
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
          {permissionToast && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-[#161b22]/95 border border-green-500/50 text-green-300 text-xs px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 pointer-events-none">
              <span>{permissionToast}</span>
            </div>
          )}
          <EditorComponent
            socket={socket}
            roomId={roomId}
            language={language}
            initialCode={challengeCode ?? currentCode}
            onCodeChange={setCurrentCode}
            canEdit={canEdit}
            onRequestEditAccess={handleRequestEditAccess}
            isRequestingEdit={Boolean(currentParticipant?.requestingEdit)}
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
            <div className="flex items-center gap-1 text-[11px] text-blue-100">
              <Users className="w-3 h-3" />
              <span>{participants.length} online</span>
            </div>
          </div>
          <div className="relative group">
            <div className={`font-semibold cursor-pointer hover:bg-blue-600 px-2 py-0.5 rounded transition-colors ${meta.color}`}>
              {meta.badge} {meta.label}
            </div>
            {canEdit && (
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
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-[#1e1e1e] text-[#cccccc] font-mono">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Loading CodeCollab room...</span>
          </div>
        </div>
      }
    >
      <RoomContent />
    </Suspense>
  );
}