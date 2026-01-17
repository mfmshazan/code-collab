import EditorComponent from "@/components/EditorComponent";
import InviteButton from "@/components/InviteButton"; // <--- Import it

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default async function RoomPage({ params }: PageProps) {
  const { roomId } = await params;

  return (
    <div className="flex h-screen w-full flex-col bg-[#1e1e1e] text-[#cccccc]">
      
      {/* HEADER */}
      <header className="flex h-10 w-full items-center justify-between bg-[#3c3c3c] px-4 text-xs shadow-md">
        
        {/* Left Side: Logo & Room Name */}
        <div className="flex items-center gap-4">
          <div className="font-bold text-blue-400 text-sm">CodeCollab</div>
          <div className="flex items-center gap-2 text-gray-400 bg-[#252526] px-2 py-1 rounded">
             <span className="text-gray-500">Room:</span>
             <span className="text-white font-mono">{roomId}</span>
          </div>
        </div>

        {/* Right Side: Invite Button */}
        <div>
           <InviteButton roomId={roomId} />
        </div>

      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Simple Sidebar (Optional visual flair) */}
        <aside className="w-12 bg-[#333333] flex flex-col items-center py-4 gap-4 border-r border-[#252526]">
          <div className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer">📂</div>
          <div className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer">🔍</div>
        </aside>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
           {/* File Tab */}
           <div className="flex bg-[#252526] h-9 items-center px-4 border-b border-[#1e1e1e]">
              <span className="text-yellow-400 mr-2 text-sm">JS</span>
              <span className="text-sm">script.js</span>
           </div>
           
           {/* The Editor */}
           <div className="flex-1 overflow-hidden">
              <EditorComponent roomId={roomId} />
           </div>
        </div>

      </div>
    </div>
  );
}