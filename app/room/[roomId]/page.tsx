"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import EditorComponent from "@/components/EditorComponent";
import InviteButton from "@/components/InviteButton";
import { 
  Files, 
  Search, 
  GitGraph, 
  Settings, 
  ChevronDown, 
  X,
  Menu,
  Bell
} from "lucide-react";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [language, setLanguage] = useState("javascript");
  
  // ✅ FIX 1: Use useRef instead of useState for the socket
  // This prevents the "Cascading Render" error
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1. Initialize Socket
    const newSocket = io("http://localhost:4000");
    socketRef.current = newSocket; // Store it in Ref

    newSocket.emit("join-room", roomId);

    newSocket.on("language-update", (newLang: string) => {
      setLanguage(newLang);
    });

    // ✅ FIX 2: Proper Cleanup Function
    // We wrap it in {} so it returns 'void' (nothing), satisfying TypeScript
    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // Use the Ref to emit
    socketRef.current?.emit("language-change", { roomId, language: newLang });
  };

  // ... (The rest of your JSX remains exactly the same) ...

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] text-[#cccccc] font-sans overflow-hidden">
      
      {/* 1. ACTIVITY BAR */}
      <aside className="w-12 bg-[#333333] flex flex-col items-center py-3 gap-6 border-r border-[#252526] z-10">
        <Files className="w-6 h-6 text-white cursor-pointer opacity-100" />
        <Search className="w-6 h-6 text-gray-500 hover:text-white cursor-pointer" />
        <GitGraph className="w-6 h-6 text-gray-500 hover:text-white cursor-pointer" />
        <div className="flex-1" />
        <Settings className="w-6 h-6 text-gray-500 hover:text-white cursor-pointer" />
      </aside>

      {/* 2. SIDEBAR */}
      <aside className="w-60 bg-[#252526] flex flex-col border-r border-[#1e1e1e]">
        <div className="h-9 px-4 flex items-center text-xs text-gray-400 font-bold tracking-wider">
          EXPLORER
        </div>
        <div className="px-2 py-1 flex items-center gap-1 cursor-pointer hover:bg-[#37373d]">
          <ChevronDown className="w-4 h-4" />
          <span className="font-bold text-xs text-blue-400 uppercase">ROOM: {roomId}</span>
        </div>
        <div className="flex-1 overflow-y-auto mt-1">
          <div className="px-4 py-1 flex items-center gap-2 bg-[#37373d] text-white cursor-pointer border-l-2 border-blue-500">
            <span className="text-sm">{getIcon(language)}</span>
            <span className="text-sm">main.{getFileExtension(language)}</span>
          </div>
          <div className="px-4 py-1 flex items-center gap-2 text-gray-500 hover:text-gray-300 cursor-pointer hover:bg-[#2a2d2e]">
            <span className="text-sm">#</span>
            <span className="text-sm">README.md</span>
          </div>
        </div>
        <div className="p-4 border-t border-[#3e3e42]">
          <div className="text-xs text-gray-400 mb-2">COLLABORATION</div>
          <InviteButton roomId={roomId} />
        </div>
      </aside>

      {/* 3. MAIN EDITOR */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        <div className="flex h-9 bg-[#252526] items-center overflow-x-auto">
          <div className="flex items-center gap-2 px-3 h-full bg-[#1e1e1e] text-white border-t-2 border-blue-500 min-w-[120px] justify-between group">
            <div className="flex items-center gap-2">
              <span className="text-sm">{getIcon(language)}</span>
              <span className="text-sm">main.{getFileExtension(language)}</span>
            </div>
            <X className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-white" />
          </div>
          <div className="flex-1 h-full bg-[#252526] border-b border-[#1e1e1e]"></div>
          <div className="flex items-center px-3 gap-3 bg-[#252526] h-full border-b border-[#1e1e1e]">
            <Menu className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
          </div>
        </div>

        <div className="flex-1 relative">
           <EditorComponent roomId={roomId} language={language} />
        </div>

        {/* 4. STATUS BAR */}
        <footer className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-xs select-none">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 hover:bg-white/20 px-1 rounded cursor-pointer">
              <GitGraph className="w-3 h-3" />
              <span>main*</span>
            </div>
            <div className="flex items-center gap-1 hover:bg-white/20 px-1 rounded cursor-pointer">
              <X className="w-3 h-3 rounded-full bg-red-400 text-white p-[1px]" />
              <span>0 Errors</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hover:bg-white/20 px-2 rounded cursor-pointer">Ln 12, Col 45</div>
            <div className="hover:bg-white/20 px-2 rounded cursor-pointer">UTF-8</div>
            <div className="relative group">
               <div className="flex items-center gap-1 hover:bg-white/20 px-2 rounded cursor-pointer font-semibold">
                 {getLanguageLabel(language)}
               </div>
               <select 
                 title="Select programming language"
                 value={language}
                 onChange={(e) => handleLanguageChange(e.target.value)}
                 className="absolute bottom-6 right-0 w-32 bg-[#252526] text-white border border-[#454545] p-1 shadow-xl outline-none opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                 size={5}
               >
                 <option value="javascript">JavaScript</option>
                 <option value="python">Python</option>
                 <option value="java">Java</option>
                 <option value="cpp">C++</option>
                 <option value="html">HTML</option>
                 <option value="css">CSS</option>
               </select>
            </div>
            <div className="hover:bg-white/20 px-2 rounded cursor-pointer">
              <Bell className="w-3 h-3" />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

// Helper functions (Keep these at the bottom)
function getFileExtension(lang: string) {
  const map: Record<string, string> = { 
    javascript: 'js', python: 'py', java: 'java', cpp: 'cpp', html: 'html', css: 'css' 
  };
  return map[lang] || 'txt';
}

function getLanguageLabel(lang: string) {
  const map: Record<string, string> = { 
    javascript: 'JavaScript', python: 'Python', java: 'Java', cpp: 'C++', html: 'HTML', css: 'CSS' 
  };
  return map[lang] || 'Plain Text';
}

function getIcon(lang: string) {
  switch(lang) {
    case 'javascript': return '🟨';
    case 'python': return '🐍';
    case 'java': return '☕';
    case 'cpp': return '🔵';
    case 'html': return '🌐';
    case 'css': return '🎨';
    default: return '📄';
  }
}