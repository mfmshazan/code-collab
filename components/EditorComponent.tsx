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
  initialCode?: string;
  onCodeChange?: (code: string) => void;
}

// Store for other users' cursors (User ID -> Decoration ID)
type CursorMap = Record<string, string[]>;

export default function EditorComponent({
  roomId,
  language = "javascript",
  initialCode,
  onCodeChange,
}: EditorProps) {
  const [code, setCode] = useState<string>(
    initialCode ?? "// Loading..."
  );
  const socketRef = useRef<Socket | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<CursorMap>({});
  // Track whether we've received the first server snapshot
  const hasReceivedSnapshot = useRef(false);

  // When initialCode prop changes (challenge or language template loaded),
  // update editor display AND notify parent so currentCode stays in sync.
  useEffect(() => {
    if (initialCode !== undefined) {
      setCode(initialCode);
      onCodeChange?.(initialCode); // <-- keep parent currentCode in sync
      hasReceivedSnapshot.current = false;
    }
  }, [initialCode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const newSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
      { transports: ["websocket"] }
    );
    socketRef.current = newSocket;

    // 1. Listen for Code Updates from other users
    newSocket.on("code-update", (incoming) => {
      const newCode =
        typeof incoming === "string" ? incoming : incoming.code;
      hasReceivedSnapshot.current = true;
      setCode(newCode);
      onCodeChange?.(newCode);
    });

    // 2. Listen for Cursor Updates
    newSocket.on("cursor-update", ({ userId, cursor }) => {
      if (!editorRef.current) return;

      const editor = editorRef.current;

      const newCursorDecoration = {
        range: new window.monaco.Range(
          cursor.lineNumber,
          cursor.column,
          cursor.lineNumber,
          cursor.column
        ),
        options: {
          className: "remote-cursor",
          hoverMessage: { value: `User ${userId.substr(0, 4)}` },
        },
      };

      const oldDecorations = decorationsRef.current[userId] || [];
      const newDecorationsIds = editor.deltaDecorations(oldDecorations, [
        newCursorDecoration,
      ]);
      decorationsRef.current[userId] = newDecorationsIds;
    });

    newSocket.emit("join-room", roomId);

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Handle Local Typing
  function handleEditorChange(value: string | undefined) {
    if (value !== undefined) {
      setCode(value);
      onCodeChange?.(value);
      socketRef.current?.emit("code-change", { roomId, code: value });
    }
  }

  // 4. Capture Editor Instance on Mount
  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      socketRef.current?.emit("cursor-move", {
        roomId,
        cursor: { lineNumber: position.lineNumber, column: position.column },
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
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          renderLineHighlight: "gutter",
        }}
      />
      {/* CSS for remote cursor line */}
      <style jsx global>{`
        .remote-cursor {
          background-color: #ff6b6b;
          width: 2px !important;
          height: 20px !important;
          border-left: 2px solid #ff4d4d;
        }
      `}</style>
    </div>
  );
}