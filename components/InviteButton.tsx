"use client";
import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

interface InviteButtonProps {
  roomId: string;
  variant?: "header" | "button" | "card";
}

export default function InviteButton({ roomId, variant = "button" }: InviteButtonProps) {
  const [copied, setCopied] = useState(false);

  const getFullUrl = () => {
    return typeof window !== "undefined" && window.location.href
      ? window.location.href
      : `http://localhost:3000/room/${roomId}`;
  };

  const copyLink = () => {
    const fullUrl = getFullUrl();
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (variant === "header") {
    return (
      <button
        onClick={copyLink}
        title="Copy room link to share with students"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
          copied
            ? "bg-green-600 text-white shadow-green-500/20 shadow-md"
            : "bg-[#2d2d2d] hover:bg-[#3d3d3d] text-gray-300 hover:text-white border border-[#444]"
        }`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-white" />
            <span>Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Copy Invite</span>
          </>
        )}
      </button>
    );
  }

  if (variant === "card") {
    return (
      <div className="p-3 bg-[#1e1e1e] border border-blue-500/30 rounded-lg space-y-2">
        <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5" />
          <span>Invite Students</span>
        </div>
        <p className="text-[10px] text-gray-400 leading-tight">
          Send this link to students so they can join this room:
        </p>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            readOnly
            value={typeof window !== "undefined" ? window.location.href : ""}
            className="flex-1 bg-[#2d2d2d] border border-[#3e3e42] rounded px-2 py-1 text-[11px] text-gray-300 font-mono truncate focus:outline-none select-all"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={copyLink}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
              copied
                ? "bg-green-600 text-white"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copy Link
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={copyLink}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all w-full justify-center
        ${copied 
          ? "bg-green-600 text-white shadow" 
          : "bg-[#2d2d2d] text-gray-300 hover:bg-[#3d3d3d] hover:text-white border border-gray-600"}
      `}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>Invite Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Copy Invite Link</span>
        </>
      )}
    </button>
  );
}