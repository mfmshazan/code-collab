"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

interface EditorProps {
  roomId: string;
}

export default function EditorComponent({ roomId }: EditorProps) {
  const [code, setCode] = useState<string>("// Start typing...");

  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    socket = newSocket;

    // ✅ STEP 1: Setup the Listener FIRST (Open your ears)
    newSocket.on("code-update", (incomingCode: any) => {
      if (typeof incomingCode === "string") {
        setCode(incomingCode);
      } else if (incomingCode && typeof incomingCode.code === "string") {
        setCode(incomingCode.code);
      }
    });

    // ✅ STEP 2: Join the room SECOND (Now you are ready to receive data)
    newSocket.emit("join-room", roomId);

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  function handleEditorChange(value: string | undefined) {
    if (value !== undefined) {
      setCode(value);
      // Send both the Room ID and the Code text
      socket.emit("code-change", { roomId, code: value });
    }
  }

  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      value={code} // This MUST be a string
      theme="vs-dark"
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        automaticLayout: true,
        wordWrap: "on",
      }}
    />
  );
}