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
  canEdit?: boolean;
  socket?: Socket | null;
  onRequestEditAccess?: () => void;
  isRequestingEdit?: boolean;
}

// Store for other users' cursors (User ID -> Decoration ID)
type CursorMap = Record<string, string[]>;

export default function EditorComponent({
  roomId,
  language = "javascript",
  initialCode,
  onCodeChange,
  canEdit = true,
  socket: parentSocket,
  onRequestEditAccess,
  isRequestingEdit,
}: EditorProps) {
  const [code, setCode] = useState<string>(
    initialCode ?? "// Loading..."
  );
  const internalSocketRef = useRef<Socket | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<CursorMap>({});
  // Use parent socket if provided, else use internal socket
  const activeSocket = parentSocket || internalSocketRef.current;

  // When initialCode prop changes (challenge or language template loaded),
  // adjust state during render (React-recommended pattern instead of setState in effect)
  const [prevInitialCode, setPrevInitialCode] = useState(initialCode);
  if (initialCode !== undefined && initialCode !== prevInitialCode) {
    setPrevInitialCode(initialCode);
    setCode(initialCode);
  }

  useEffect(() => {
    // If parent provides socket, attach listeners to parent socket
    let socketToUse: Socket;
    let shouldDisconnect = false;

    if (parentSocket) {
      socketToUse = parentSocket;
    } else {
      const s = io(
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
        { transports: ["websocket"] }
      );
      internalSocketRef.current = s;
      socketToUse = s;
      shouldDisconnect = true;
      s.emit("join-room", roomId);
    }

    // 1. Listen for Code Updates from other users
    const handleCodeUpdate = (incoming: string | { code: string }) => {
      const newCode =
        typeof incoming === "string" ? incoming : incoming.code;
      setCode(newCode);
      onCodeChange?.(newCode);
    };

    // 2. Listen for Cursor Updates
    const handleCursorUpdate = ({
      userId,
      username,
      cursor,
    }: {
      userId: string;
      username?: string;
      color?: string;
      cursor: { lineNumber: number; column: number };
    }) => {
      if (!editorRef.current || !window.monaco) return;

      const editor = editorRef.current;
      const displayName = username || `User ${userId.substring(0, 4)}`;

      const newCursorDecoration = {
        range: new window.monaco.Range(
          cursor.lineNumber,
          cursor.column,
          cursor.lineNumber,
          cursor.column
        ),
        options: {
          className: "remote-cursor",
          hoverMessage: { value: `👤 ${displayName}` },
        },
      };

      const oldDecorations = decorationsRef.current[userId] || [];
      const newDecorationsIds = editor.deltaDecorations(oldDecorations, [
        newCursorDecoration,
      ]);
      decorationsRef.current[userId] = newDecorationsIds;
    };

    socketToUse.on("code-update", handleCodeUpdate);
    socketToUse.on("cursor-update", handleCursorUpdate);

    return () => {
      socketToUse.off("code-update", handleCodeUpdate);
      socketToUse.off("cursor-update", handleCursorUpdate);
      if (shouldDisconnect) {
        socketToUse.disconnect();
      }
    };
  }, [roomId, parentSocket]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Handle Local Typing (blocked if !canEdit)
  function handleEditorChange(value: string | undefined) {
    if (!canEdit) return;
    if (value !== undefined) {
      setCode(value);
      onCodeChange?.(value);
      activeSocket?.emit("code-change", { roomId, code: value });
    }
  }

  // 4. Capture Editor Instance on Mount
  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      activeSocket?.emit("cursor-move", {
        roomId,
        cursor: { lineNumber: position.lineNumber, column: position.column },
      });
    });
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] relative">
      <Editor
        height="100%"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly: !canEdit,
          domReadOnly: !canEdit,
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

      {/* View-Only Overlay Badge when user cannot edit */}
      {!canEdit && (
        <div className="absolute bottom-4 right-6 bg-[#161b22]/95 border border-yellow-500/40 text-yellow-300 text-xs px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-sm flex items-center gap-2 pointer-events-auto z-10 animate-fade-in">
          <span>🔒 View-Only Mode</span>
          {onRequestEditAccess && (
            <button
              onClick={onRequestEditAccess}
              disabled={isRequestingEdit}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                isRequestingEdit
                  ? "bg-yellow-500/20 text-yellow-400 cursor-default"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {isRequestingEdit ? "Requested ✋" : "Request Edit Access ✋"}
            </button>
          )}
        </div>
      )}

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