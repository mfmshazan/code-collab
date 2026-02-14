"use client";
import Editor, { OnMount } from "@monaco-editor/react";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { editor } from "monaco-editor";

declare global {
  interface Window {
    monaco: typeof import("monaco-editor");
  }
}

interface EditorProps {
  roomId: string;
  language?: string;
}

// Store for other users' cursors (User ID -> Decoration ID)
type CursorMap = Record<string, string[]>;

export default function EditorComponent({ roomId, language = "javascript" }: EditorProps) {
  const [code, setCode] = useState<string>("// Loading...");
  const socketRef = useRef<Socket | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null); // To store the Monaco instance
  const decorationsRef = useRef<CursorMap>({}); // To track active cursors

  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    socketRef.current = newSocket;

    // 1. Listen for Code Updates
    newSocket.on("code-update", (incoming) => {
      const newCode = typeof incoming === "string" ? incoming : incoming.code;
      setCode(newCode);
    });

    // 2. Listen for Cursor Updates (NEW)
    newSocket.on("cursor-update", ({ userId, cursor }) => {
      if (!editorRef.current) return;

      const editor = editorRef.current;
      
      // Define the new decoration (a colored vertical line)
      const newCursorDecoration = {
        range: new window.monaco.Range(
          cursor.lineNumber, 
          cursor.column, 
          cursor.lineNumber, 
          cursor.column
        ),
        options: {
          className: "remote-cursor", // We will define this CSS next
          hoverMessage: { value: `User ${userId.substr(0, 4)}` } // Tooltip
        }
      };

      // Update the editor decorations
      // We look up the old decoration ID for this user to replace it
      const oldDecorations = decorationsRef.current[userId] || [];
      const newDecorationsIds = editor.deltaDecorations(oldDecorations, [newCursorDecoration]);
      
      // Save the new ID so we can clear it next time they move
      decorationsRef.current[userId] = newDecorationsIds;
    });

    newSocket.emit("join-room", roomId);

    return () => { newSocket.disconnect(); };
  }, [roomId]);

  // 3. Handle Local Updates (Typing & Moving)
  function handleEditorChange(value: string | undefined) {
    if (value !== undefined) {
      setCode(value);
      socketRef.current?.emit("code-change", { roomId, code: value });
    }
  }

  // 4. Capture Editor Instance on Mount
  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    // Listen to YOUR cursor movement
    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      socketRef.current?.emit("cursor-move", { 
        roomId, 
        cursor: { lineNumber: position.lineNumber, column: position.column } 
      });
    });
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount} // <--- Hook up the mounter
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: "on",
          automaticLayout: true,
        }}
      />
      {/* 5. Simple CSS for the cursor line */}
      <style jsx global>{`
        .remote-cursor {
          background-color: #ff0000; /* Red cursor */
          width: 2px !important;
          height: 20px !important;
          border-left: 2px solid #ff4d4d;
        }
      `}</style>
    </div>
  );
}