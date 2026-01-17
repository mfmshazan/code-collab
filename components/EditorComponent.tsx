"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

interface EditorProps {
  roomId: string; // New Prop
}

export default function EditorComponent({ roomId }: EditorProps) {
  const [code, setCode] = useState("// Start typing...");

  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    socket = newSocket;

    // 1. Join the room immediately
    newSocket.emit("join-room", roomId);

    newSocket.on("code-update", (incomingCode: string) => {
      setCode(incomingCode);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]); // Re-run if roomId changes

  function handleEditorChange(value: string | undefined) {
    if (value !== undefined) {
      setCode(value);
      // 2. Send both the CODE and the ROOM ID
      socket.emit("code-change", { roomId, code: value });
    }
  }

  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      value={code}
      theme="vs-dark"
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        automaticLayout: true,
      }}
    />
  );
}