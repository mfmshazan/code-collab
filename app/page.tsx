"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  const createRoom = () => {
    // Generate a random room ID (e.g., "room-842")
    const newRoomId = Math.random().toString(36).substring(2, 9);
    router.push(`/room/${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      router.push(`/room/${roomId}`);
    }
  };

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0d1117] text-white">
      {/* Background decoration (optional glow) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[100px]" />
      </div>

      <div className="z-10 flex flex-col items-center gap-8 p-8">
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            CodeCollab
          </h1>
          <p className="text-gray-400 text-lg">
            Real-time collaborative coding for teams.
          </p>
        </div>

        {/* Action Box */}
        <div className="flex flex-col gap-4 w-80 bg-[#161b22] p-6 rounded-xl border border-[#30363d] shadow-2xl">
          
          {/* Create New Button */}
          <button
            onClick={createRoom}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <span>+</span> Create New Room
          </button>

          <div className="flex items-center gap-2 my-2">
            <div className="h-[1px] flex-1 bg-[#30363d]"></div>
            <span className="text-xs text-gray-500 uppercase">OR</span>
            <div className="h-[1px] flex-1 bg-[#30363d]"></div>
          </div>

          {/* Join Input Group */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-mono">ENTER ROOM ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. project-alpha"
                className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={handleEnter}
              />
              <button
                onClick={joinRoom}
                disabled={!roomId}
                className="bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-md text-sm font-bold transition-colors"
              >
                Join
              </button>
            </div>
          </div>

        </div>

        <p className="text-gray-600 text-xs mt-4">
          Built with Next.js 16, Socket.io & Tailwind
        </p>
      </div>
    </div>
  );
}