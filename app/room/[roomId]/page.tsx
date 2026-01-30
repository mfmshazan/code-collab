"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client"; // Import Socket
import EditorComponent from "@/components/EditorComponent";
import InviteButton from "@/components/InviteButton";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [language, setLanguage] = useState("javascript");
  
  // We need a socket connection here to sync the language dropdown
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    socket.emit("join-room", roomId);

    // Listen for language updates from other users or DB
    socket.on("language-update", (newLang: string) => {
      setLanguage(newLang);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // Handle Dropdown Change
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // Tell the server we changed the language
    socketRef.current?.emit("language-change", { roomId, language: newLang });
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#1e1e1e] text-[#cccccc]">
      <header className="flex h-10 w-full items-center justify-between bg-[#3c3c3c] px-4 text-xs shadow-md">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <div className="font-bold text-blue-400 text-sm">CodeCollab</div>
          <div className="flex items-center gap-2 text-gray-400 bg-[#252526] px-2 py-1 rounded">
             <span className="text-gray-500">Room:</span>
             <span className="text-white font-mono">{roomId}</span>
          </div>
        </div>

        {/* Center: Language Selector */}
        <div className="flex items-center gap-2">
           <span className="text-gray-400">Language:</span>
           <select 
             aria-label="Language Selector"
             value={language}
             onChange={(e) => handleLanguageChange(e.target.value)} // <--- Use new handler
             className="bg-[#252526] text-white border border-[#555] rounded px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
           >
             <option value="javascript">JavaScript</option>
             <option value="python">Python</option>
             <option value="java">Java</option>
             <option value="cpp">C++</option>
             <option value="html">HTML</option>
             <option value="css">CSS</option>
           </select>
        </div>

        {/* Right Side */}
        <div><InviteButton roomId={roomId} /></div>
      </header>

      {/* Editor Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-12 bg-[#333333] flex flex-col items-center py-4 gap-4 border-r border-[#252526]">
          <div className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer">📂</div>
        </aside>

        <div className="flex-1 flex flex-col">
           <div className="flex bg-[#1e1e1e] h-9 items-center px-4 border-b border-[#252526]">
              <span className="mr-2 text-sm">
                {language === 'javascript' && '🟨'}
                {language === 'python' && '🐍'}
                {language === 'java' && '☕'}
                {language === 'cpp' && '🔵'}
                {language === 'html' && '🌐'}
                {language === 'css' && '🎨'}
              </span>
              <span className="text-sm font-medium text-white">main.{getFileExtension(language)}</span>
           </div>
           
           <div className="flex-1 overflow-hidden">
              <EditorComponent roomId={roomId} language={language} />
           </div>
        </div>
      </div>
    </div>
  );
}

function getFileExtension(lang: string) {
  switch(lang) {
    case 'javascript': return 'js';
    case 'python': return 'py';
    case 'java': return 'java';
    case 'cpp': return 'cpp';
    case 'html': return 'html';
    case 'css': return 'css';
    default: return 'txt';
  }
}