import EditorComponent from "@/components/EditorComponent";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col bg-[#1e1e1e] text-[#cccccc]">
      
      {/* --- TOP MENU BAR (File, Edit, etc.) --- */}
      <header className="flex h-8 w-full items-center bg-[#3c3c3c] px-3 text-xs select-none">
        <div className="mr-4 font-bold text-blue-400">CodeCollab</div>
        <div className="flex gap-4">
          <span className="cursor-pointer hover:text-white">File</span>
          <span className="cursor-pointer hover:text-white">Edit</span>
          <span className="cursor-pointer hover:text-white">Selection</span>
          <span className="cursor-pointer hover:text-white">View</span>
          <span className="cursor-pointer hover:text-white">Go</span>
          <span className="cursor-pointer hover:text-white">Run</span>
        </div>
        <div className="ml-auto text-xs text-gray-400">Home.tsx - CodeCollab</div>
      </header>

      {/* --- MIDDLE SECTION (Sidebar + Editor) --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 1. ACTIVITY BAR (Far Left Icons) */}
        <aside className="flex w-12 flex-col items-center bg-[#333333] py-2">
          {/* Files Icon (Active) */}
          <div className="mb-4 cursor-pointer border-l-2 border-white px-2 opacity-100">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          {/* Search Icon */}
          <div className="mb-4 cursor-pointer px-2 opacity-50 hover:opacity-100">
            <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {/* Git Icon */}
          <div className="mb-4 cursor-pointer px-2 opacity-50 hover:opacity-100">
             <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
             </svg>
          </div>
        </aside>

        {/* 2. SIDEBAR (File Explorer) */}
        <aside className="flex w-60 flex-col bg-[#252526] text-sm">
          <div className="flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Explorer</span>
            <span>...</span>
          </div>
          
          {/* Project Folder */}
          <div className="mt-1">
             <div className="flex cursor-pointer items-center bg-[#37373d] px-2 py-1 text-white">
                <span className="mr-1">▼</span>
                <span className="font-bold">CODE-COLLAB</span>
             </div>
             
             {/* File List */}
             <div className="flex flex-col">
               <div className="flex cursor-pointer items-center px-4 py-1 hover:bg-[#2a2d2e] text-blue-300">
                 <span className="mr-2 text-yellow-400">JS</span>
                 <span>script.js</span>
               </div>
               <div className="flex cursor-pointer items-center px-4 py-1 hover:bg-[#2a2d2e] text-gray-400">
                 <span className="mr-2 text-blue-400">TS</span>
                 <span>server.ts</span>
               </div>
               <div className="flex cursor-pointer items-center px-4 py-1 hover:bg-[#2a2d2e] text-gray-400">
                 <span className="mr-2 text-purple-400">JSON</span>
                 <span>package.json</span>
               </div>
               <div className="flex cursor-pointer items-center px-4 py-1 hover:bg-[#2a2d2e] text-gray-400">
                 <span className="mr-2 text-orange-400">#</span>
                 <span>README.md</span>
               </div>
             </div>
          </div>
        </aside>

        {/* 3. MAIN EDITOR AREA */}
        <main className="flex flex-1 flex-col bg-[#1e1e1e]">
          
          {/* Tab Bar */}
          <div className="flex h-9 bg-[#252526]">
            <div className="flex items-center gap-2 border-t-2 border-blue-500 bg-[#1e1e1e] px-3 pr-4 text-sm text-white">
              <span className="text-yellow-400 text-xs">JS</span>
              <span>script.js</span>
              <span className="ml-2 cursor-pointer text-gray-400 hover:text-white">×</span>
            </div>
            <div className="flex items-center gap-2 border-r border-[#1e1e1e] bg-[#2d2d2d] px-3 pr-4 text-sm text-gray-400 hover:bg-[#2a2d2e] cursor-pointer">
              <span className="text-blue-400 text-xs">TS</span>
              <span>server.ts</span>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 bg-[#1e1e1e] px-4 py-1 text-xs text-gray-500">
            <span>code-collab</span>
            <span>&gt;</span>
            <span>src</span>
            <span>&gt;</span>
            <span className="text-white">script.js</span>
          </div>

          {/* THE EDITOR COMPONENT */}
          <div className="relative flex-1 overflow-hidden">
             <EditorComponent />
          </div>

        </main>
      </div>

      {/* --- STATUS BAR (Bottom Blue Strip) --- */}
      <footer className="flex h-6 w-full items-center justify-between bg-[#007acc] px-3 text-xs text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 cursor-pointer hover:bg-blue-600 px-1 rounded">
             <span>🚫</span> <span>0</span>
             <span>⚠️</span> <span>0</span>
          </div>
          <span className="cursor-pointer hover:bg-blue-600 px-1 rounded">📡 Live: Connected</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="cursor-pointer hover:bg-blue-600 px-1 rounded">Ln 12, Col 4</span>
          <span className="cursor-pointer hover:bg-blue-600 px-1 rounded">UTF-8</span>
          <span className="cursor-pointer hover:bg-blue-600 px-1 rounded">JavaScript</span>
          <span className="cursor-pointer hover:bg-blue-600 px-1 rounded">🔔</span>
        </div>
      </footer>

    </div>
  );
}