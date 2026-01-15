"use client";
import Editor from "@monaco-editor/react";

export default function EditorComponent() {
  
  // This function triggers whenever you type in the editor
  function handleEditorChange(value: string | undefined) {
    console.log("Current code:", value);
  }

  return (
    <div className="w-full h-125 border border-gray-700 rounded-lg overflow-hidden shadow-xl bg-[#1e1e1e]">
      {/* Header Bar */}
      <div className="bg-[#1e1e1e] px-4 py-2 border-b border-gray-700 flex items-center justify-between">
         <span className="text-gray-300 text-sm font-mono">script.js</span>
         <div className="flex gap-2">
           <div className="w-3 h-3 rounded-full bg-red-500"></div>
           <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
           <div className="w-3 h-3 rounded-full bg-green-500"></div>
         </div>
      </div>
      
      {/* The Actual Editor */}
      <Editor
        height="100%"
        defaultLanguage="javascript"
        defaultValue="// Start typing your code here..."
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