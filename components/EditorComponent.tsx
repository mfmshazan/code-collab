"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

// Define the shape of props the component accepts
interface EditorProps {
  roomId: string;
  language?: string; // Optional: Defaults to "javascript" if not provided
}

export default function EditorComponent({ roomId, language = "javascript" }: EditorProps) {
  const [code, setCode] = useState<string>("// Loading code from room...");
  
  // Use a ref to store the socket so it doesn't re-connect on every render
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1. Connect to the Backend
    const newSocket = io("http://localhost:4000");
    socketRef.current = newSocket;

    // 2. SETUP LISTENER (Open ears before speaking)
    // We listen for updates *before* we join, so we don't miss the initial load.
    newSocket.on("code-update", (incomingCode: any) => {
      // 🛡️ CRASH PROTECTION: Handle both String and Object formats
      if (typeof incomingCode === "string") {
        setCode(incomingCode);
      } else if (incomingCode && typeof incomingCode.code === "string") {
        setCode(incomingCode.code);
      } else {
        console.error("Received unexpected data format:", incomingCode);
      }
    });

    // 3. JOIN THE ROOM (Speak)
    // Now that we are listening, tell the server we are here.
    newSocket.emit("join-room", roomId);

    // 4. CLEANUP
    // Disconnect when the user leaves the page to prevent memory leaks.
    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  // ⚡ Handle User Typing
  function handleEditorChange(value: string | undefined) {
    if (value !== undefined) {
      setCode(value);
      // Emit the change to the server so others see it
      socketRef.current?.emit("code-change", { roomId, code: value });
    }
  }

  return (
    <div className="h-full w-full bg-[#1e1e1e]">
      <Editor
        height="100%"
        defaultLanguage="javascript"
        language={language} // Updates dynamically if you pass a new language prop
        value={code}
        theme="vs-dark"
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}