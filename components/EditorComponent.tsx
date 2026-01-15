"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export default function EditorComponent() {
  const [code, setCode] = useState("// Start typing your code here...");

  useEffect(() => {
    // Connect to the SEPARATE port 4000
    const newSocket = io("http://localhost:4000"); 
    socket = newSocket;

    newSocket.on("connect", () => {
      console.log("✅ Connected to Port 4000");
    });

    newSocket.on("code-update", (incomingCode: string) => {
      setCode(incomingCode);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  function handleEditorChange(value: string | undefined) {
    if (value !== undefined) {
      setCode(value);
      // 3. Send my changes to the server
      socket.emit("code-change", value);
    }
  }

  return (
    <div className="w-full h-125 border border-gray-700 rounded-lg overflow-hidden shadow-xl bg-[#1e1e1e]">
      {/* Header Bar */}
      <div className="bg-[#1e1e1e] px-4 py-2 border-b border-gray-700 flex items-center justify-between">
         <span className="text-gray-300 text-sm font-mono">script.js</span>
         <div className="flex gap-2 items-center">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-xs text-green-500">Live</span>
         </div>
      </div>
      
      {/* The Actual Editor */}
      <Editor
        height="100%"
        defaultLanguage="javascript"
        value={code} // IMPORTANT: Bind value to state
        theme="vs-dark"
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          padding: { top: 16 }
        }}
      />
    </div>
  );
}