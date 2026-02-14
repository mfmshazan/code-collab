"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import EditorComponent from "@/components/EditorComponent";
import InviteButton from "@/components/InviteButton";
import { 
  Files, Search, GitGraph, Settings, ChevronDown, X, Play, Terminal 
} from "lucide-react";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("Ready to run...");
  const [isRunning, setIsRunning] = useState(false);
  
  // We need to track the code here to send it to the runner
  const [currentCode, setCurrentCode] = useState("// Loading...");

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");
    socketRef.current = newSocket;

    newSocket.emit("join-room", roomId);

    newSocket.on("language-update", (lang) => setLanguage(lang));
    
    // Listen for code updates from others so we keep our state in sync
    newSocket.on("code-update", (code) => setCurrentCode(code));

    // Listen for execution results
    newSocket.on("code-output", (result) => {
      setOutput(result);
      setIsRunning(false);
    });

    return () => { newSocket.disconnect(); };
  }, [roomId]);

  const runCode = () => {
    setIsRunning(true);
    setOutput("Running code...");
    socketRef.current?.emit("run-code", { 
      roomId, 
      language, 
      code: currentCode 
    });
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    socketRef.current?.emit("language-change", { roomId, language: newLang });
  };

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] text-[#cccccc] font-sans overflow-hidden">
      {/* ACTIVITY BAR */}
      <aside className="w-12 bg-[#333333] flex flex-col items-center py-3 gap-6 border-r border-[#252526] z-10">
        <Files className="w-6 h-6 text-white" />
        <Search className="w-6 h-6 text-gray-500" />
        <div className="flex-1" />
        <Settings className="w-6 h-6 text-gray-500" />
      </aside>

      {/* SIDEBAR */}
      <aside className="w-60 bg-[#252526] flex flex-col border-r border-[#1e1e1e]">
        <div className="h-9 px-4 flex items-center text-xs font-bold text-gray-400">EXPLORER</div>
        <div className="px-2 py-1 flex items-center gap-1 bg-[#37373d]">
          <ChevronDown className="w-4 h-4" />
          <span className="font-bold text-xs text-blue-400">ROOM: {roomId}</span>
        </div>
        <div className="p-4 border-t border-[#3e3e42] mt-auto">
          <InviteButton roomId={roomId} />
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        
        {/* TAB BAR & RUN BUTTON */}
        <div className="flex h-9 bg-[#252526] items-center justify-between pr-2">
          <div className="flex items-center gap-2 px-3 h-full bg-[#1e1e1e] text-white border-t-2 border-blue-500 min-w-30">
            <span className="text-sm">main.{getFileExtension(language)}</span>
            <X className="w-3 h-3 hover:text-white" />
          </div>
          
          {/* THE RUN BUTTON */}
          <button 
            onClick={runCode}
            disabled={isRunning}
            className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-colors
              ${isRunning ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}
            `}
          >
            <Play className="w-3 h-3 fill-current" />
            {isRunning ? "Running..." : "Run Code"}
          </button>
        </div>

        {/* EDITOR */}
        <div className="flex-1 relative">
           {/* IMPORTANT: We pass currentCode and setCurrentCode so the parent knows the code */}
           <EditorComponent 
             roomId={roomId} 
             language={language}
             // We need to update EditorComponent to accept these props next!
           />
        </div>

        {/* TERMINAL / OUTPUT WINDOW */}
        <div className="h-40 bg-[#1e1e1e] border-t border-[#3e3e42] flex flex-col">
          <div className="flex items-center justify-between px-4 py-1 bg-[#252526] border-b border-[#1e1e1e]">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-gray-400">
              <Terminal className="w-3 h-3" />
              <span>Terminal</span>
            </div>
            <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setOutput("")}/>
          </div>
          <div className="flex-1 p-4 font-mono text-sm overflow-auto text-gray-300 whitespace-pre-wrap">
            {output}
          </div>
        </div>

        {/* STATUS BAR */}
        <footer className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-xs">
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-1"><GitGraph className="w-3 h-3" /> main*</div>
           </div>
           <div className="relative group">
               <div className="font-semibold cursor-pointer">{getLanguageLabel(language)}</div>
               <select 
                 value={language}
                 onChange={(e) => handleLanguageChange(e.target.value)}
                 className="absolute bottom-6 right-0 w-32 bg-[#252526] p-1 shadow-xl opacity-0 group-hover:opacity-100"
                 size={5}
                 aria-label="Select programming language"
               >
                 <option value="javascript">JavaScript</option>
                 <option value="python">Python</option>
                 <option value="java">Java</option>
                 <option value="cpp">C++</option>
               </select>
            </div>
        </footer>
      </main>
    </div>
  );
}

// Helpers
function getFileExtension(lang: string) { return { javascript:'js', python:'py', java:'java', cpp:'cpp' }[lang] || 'txt'; }
function getLanguageLabel(lang: string) { return { javascript:'JavaScript', python:'Python', java:'Java', cpp:'C++' }[lang] || 'Text'; }