"use client";

import React, { useState } from "react";
import {
  Crown,
  Edit3,
  Check,
  X,
  Lock,
  Unlock,
  Hand,
  Shield,
  Users,
  UserCheck,
} from "lucide-react";

export interface Participant {
  socketId: string;
  userId: string;
  username: string;
  isHost: boolean;
  canEdit: boolean;
  requestingEdit: boolean;
  color: string;
}

interface ParticipantsPanelProps {
  participants: Participant[];
  currentSocketId: string | null;
  isHost: boolean;
  roomMode: "host-only" | "collaborative";
  canEdit: boolean;
  username: string;
  onUpdateName: (newName: string) => void;
  onRequestEditAccess: () => void;
  onSetEditPermission: (targetSocketId: string, canEdit: boolean) => void;
  onSetRoomMode: (mode: "host-only" | "collaborative") => void;
  onClaimHost?: () => void;
}

export default function ParticipantsPanel({
  participants,
  currentSocketId,
  isHost,
  roomMode,
  canEdit,
  username,
  onUpdateName,
  onRequestEditAccess,
  onSetEditPermission,
  onSetRoomMode,
  onClaimHost,
}: ParticipantsPanelProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateName(tempName.trim());
      setIsEditingName(false);
    }
  };

  const handleCancelName = () => {
    setTempName(username);
    setIsEditingName(false);
  };

  const pendingRequests = participants.filter((p) => p.requestingEdit && !p.canEdit);
  const currentUser = participants.find((p) => p.socketId === currentSocketId);
  const isRequesting = currentUser?.requestingEdit;
  const hasHostInRoom = participants.some((p) => p.isHost);

  return (
    <div className="flex flex-col h-full bg-[#252526] text-gray-300 select-none">
      {/* ── HEADER ── */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-[#1e1e1e] flex-shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <Users className="w-4 h-4 text-blue-400" />
          <span>PARTICIPANTS</span>
          <span className="px-1.5 py-0.2 bg-[#333333] text-gray-300 rounded text-[11px]">
            {participants.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* ── NO HOST WARNING & CLAIM CARD ── */}
        {!hasHostInRoom && (
          <div className="p-3 bg-yellow-950/40 border border-yellow-500/50 rounded-lg space-y-2">
            <div className="text-xs text-yellow-300 font-semibold flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span>No Admin in this room</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-tight">
              You can claim admin rights to control who can edit the codebase.
            </p>
            {onClaimHost && (
              <button
                onClick={onClaimHost}
                className="w-full py-1.5 px-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Claim Host / Admin</span>
              </button>
            )}
          </div>
        )}
        {/* ── CURRENT USER PROFILE / RENAME CARD ── */}
        <div className="p-3 bg-[#1e1e1e] border border-[#3e3e42] rounded-lg shadow-sm">
          <div className="text-[10px] uppercase font-bold text-gray-500 mb-2 flex items-center justify-between">
            <span>Your Profile</span>
            {isHost ? (
              <span className="flex items-center gap-1 text-yellow-400 font-semibold text-[10px]">
                <Crown className="w-3 h-3" /> Host / Admin
              </span>
            ) : canEdit ? (
              <span className="flex items-center gap-1 text-green-400 font-semibold text-[10px]">
                <UserCheck className="w-3 h-3" /> Can Edit
              </span>
            ) : (
              <span className="flex items-center gap-1 text-gray-400 font-semibold text-[10px]">
                <Lock className="w-3 h-3" /> View Only
              </span>
            )}
          </div>

          {isEditingName ? (
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="text"
                value={tempName}
                maxLength={25}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") handleCancelName();
                }}
                autoFocus
                placeholder="Enter your name"
                className="flex-1 bg-[#2d2d2d] border border-blue-500 rounded px-2 py-1 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleSaveName}
                title="Save name"
                className="p-1 text-green-400 hover:bg-[#333] rounded transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelName}
                title="Cancel"
                className="p-1 text-gray-400 hover:bg-[#333] rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                  style={{ backgroundColor: currentUser?.color || "#3b82f6" }}
                >
                  {(username || "U")[0].toUpperCase()}
                </div>
                <div className="truncate text-xs font-semibold text-white">
                  {username}
                </div>
              </div>
              <button
                onClick={() => {
                  setTempName(username);
                  setIsEditingName(true);
                }}
                title="Rename your display name"
                className="flex items-center gap-1 px-2 py-1 text-[11px] text-blue-400 hover:text-blue-300 hover:bg-[#2d2d2d] rounded transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>Rename</span>
              </button>
            </div>
          )}
        </div>

        {/* ── STUDENT VIEW: REQUEST EDIT ACCESS BUTTON ── */}
        {!isHost && (
          <div className="p-3 bg-[#1e1e1e] border border-[#3e3e42] rounded-lg">
            {canEdit ? (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <UserCheck className="w-4 h-4 flex-shrink-0" />
                <span>You have permission to edit the code.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                  <span>The codebase is locked by the admin.</span>
                </div>
                <button
                  onClick={onRequestEditAccess}
                  disabled={isRequesting}
                  className={`w-full py-1.5 px-3 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isRequesting
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 cursor-default"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  <Hand className={`w-3.5 h-3.5 ${isRequesting ? "animate-bounce" : ""}`} />
                  {isRequesting ? "Edit Request Sent..." : "Request to Edit Code"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── HOST CONTROLS ── */}
        {isHost && (
          <div className="p-3 bg-[#1e1e1e] border border-blue-900/40 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Room Permission Mode
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 bg-[#2d2d2d] p-1 rounded-md">
              <button
                onClick={() => onSetRoomMode("host-only")}
                className={`py-1 px-2 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                  roomMode === "host-only"
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Host-Only</span>
              </button>
              <button
                onClick={() => onSetRoomMode("collaborative")}
                className={`py-1 px-2 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                  roomMode === "collaborative"
                    ? "bg-green-600 text-white shadow"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Unlock className="w-3 h-3" />
                <span>Open Collab</span>
              </button>
            </div>

            <p className="text-[10px] text-gray-500 leading-tight">
              {roomMode === "host-only"
                ? "Students are view-only until you grant edit access."
                : "All participants can edit simultaneously."}
            </p>
          </div>
        )}

        {/* ── HOST PENDING REQUESTS ── */}
        {isHost && pendingRequests.length > 0 && (
          <div className="p-3 bg-yellow-950/30 border border-yellow-600/40 rounded-lg space-y-2">
            <div className="text-[11px] font-bold text-yellow-400 flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5 animate-pulse" />
              <span>Pending Edit Requests ({pendingRequests.length})</span>
            </div>

            <div className="space-y-1.5">
              {pendingRequests.map((student) => (
                <div
                  key={student.socketId}
                  className="flex items-center justify-between p-2 bg-[#252526] rounded border border-yellow-600/20 text-xs"
                >
                  <span className="font-semibold text-gray-200 truncate max-w-[120px]">
                    {student.username}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSetEditPermission(student.socketId, true)}
                      className="px-2 py-0.5 bg-green-600 hover:bg-green-500 text-white rounded text-[10px] font-bold transition-colors"
                    >
                      Allow
                    </button>
                    <button
                      onClick={() => onSetEditPermission(student.socketId, false)}
                      className="px-2 py-0.5 bg-[#3e3e42] hover:bg-[#4e4e52] text-gray-300 rounded text-[10px] transition-colors"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ALL PARTICIPANTS LIST ── */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-bold text-gray-500 px-1">
            Online Users ({participants.length})
          </div>

          <div className="space-y-1">
            {participants.map((p) => {
              const isMe = p.socketId === currentSocketId;

              return (
                <div
                  key={p.socketId}
                  className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                    isMe ? "bg-[#1e1e1e] border border-blue-500/30" : "hover:bg-[#2d2d2d]"
                  }`}
                >
                  {/* Left: Avatar + Name + Badges */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white flex-shrink-0"
                      style={{ backgroundColor: p.color || "#3b82f6" }}
                    >
                      {(p.username || "U")[0].toUpperCase()}
                    </div>

                    <div className="truncate flex items-center gap-1.5 text-xs">
                      <span className={`font-medium ${isMe ? "text-blue-300 font-semibold" : "text-gray-200"}`}>
                        {p.username}
                      </span>
                      {isMe && (
                        <span className="text-[9px] bg-[#333] text-gray-400 px-1 py-0.2 rounded">
                          You
                        </span>
                      )}
                      {p.isHost && (
                        <span title="Host">
                          <Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Permission Status & Host Action */}
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {p.isHost ? (
                      <span className="text-[10px] text-yellow-400 font-semibold">Host</span>
                    ) : (
                      <>
                        {p.canEdit ? (
                          <span className="text-[10px] text-green-400 font-medium">Editor</span>
                        ) : p.requestingEdit ? (
                          <span className="text-[10px] text-yellow-400 font-medium animate-pulse">
                            Asking...
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500">Viewer</span>
                        )}

                        {/* Host controls toggle for this user */}
                        {isHost && (
                          <button
                            onClick={() => onSetEditPermission(p.socketId, !p.canEdit)}
                            title={p.canEdit ? "Revoke edit permission" : "Grant edit permission"}
                            className={`p-1 rounded ml-1 transition-colors ${
                              p.canEdit
                                ? "text-red-400 hover:bg-red-950/50"
                                : "text-green-400 hover:bg-green-950/50"
                            }`}
                          >
                            {p.canEdit ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
