"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/types/game";
import { Send, MessageSquare } from "lucide-react";

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  myPlayerId: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  myPlayerId,
}) => {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm shadow-xl">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <MessageSquare className="w-4 h-4 text-yellow-400" />
          <span>Kênh Chat Phòng</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Live</span>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
        {messages.map((m) => {
          if (m.isSystem) {
            return (
              <div
                key={m.id}
                className="text-center py-1 px-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-[11px] font-medium"
              >
                {m.message}
              </div>
            );
          }

          const isMe = m.senderId === myPlayerId;
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                {isMe ? "Bạn" : m.senderName}
              </span>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-1.5 break-words ${
                  isMe
                    ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none"
                    : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60"
                }`}
              >
                {m.message}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-slate-800 bg-slate-950/30 flex gap-1.5">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"
        />
        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-center font-bold"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
