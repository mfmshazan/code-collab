"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export default function EditorComponent() {
  const [code, setCode] = useState("// Start typing your code here...");

  useEffect(() => {
    const newSocket = io("http://localhost:4000"); 
    socket = newSocket;

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
      socket.emit("code-change", value);
    }
  }

  return (
    // Just the editor, no extra wrappers
    <Editor
      height="100%"
      defaultLanguage="javascript"
      value={code}
      theme="vs-dark"
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: true }, // VS Code usually has minimap ON
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 10 },
        fontFamily: "'Fira Code', 'Droid Sans Mono', 'monospace'",
      }}
    />
  );
}