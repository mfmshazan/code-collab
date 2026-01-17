"use client";
import { useState } from "react";

export default function InviteButton({ roomId }: { roomId: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    // 1. Get the current full URL
    const fullUrl = window.location.href;
    
    // 2. Copy to clipboard
    navigator.clipboard.writeText(fullUrl).then(() => {
      // 3. Show "Copied" feedback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <button
      onClick={copyLink}
      className={`
        flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-all
        ${copied 
          ? "bg-green-600 text-white" 
          : "bg-[#2d2d2d] text-gray-300 hover:bg-[#3d3d3d] hover:text-white border border-gray-600"}
      `}
    >
      {copied ? (
        <>
          <span>✓</span> Copied!
        </>
      ) : (
        <>
          <span>🔗</span> Copy Invite Link
        </>
      )}
    </button>
  );
}