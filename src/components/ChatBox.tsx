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
    <div className="flex flex-col h-full bg-white border-2 border-black rounded-3xl overflow-hidden shadow-[4px_4px_0px_0px_#1C1917]">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b-2 border-black flex items-center justify-between bg-[#FDE047]">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-black">
          <MessageSquare className="w-4 h-4 text-black" />
          <span>Kênh Chat Phòng</span>
        </div>
        <span className="text-[10px] text-black font-extrabold px-2 py-0.2 rounded-full bg-white border border-black">
          Live
        </span>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs bg-[#FFFDF7]">
        {messages.map((m) => {
          if (m.isSystem) {
            return (
              <div
                key={m.id}
                className="text-center py-1 px-2.5 rounded-full bg-[#FEF08A] border border-black text-black text-[11px] font-black shadow-[1px_1px_0px_0px_#000]"
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
              <span className="text-[10px] font-bold text-slate-600 mb-0.5 px-1">
                {isMe ? "Bạn" : m.senderName}
              </span>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-1.5 break-words text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_#1C1917] ${
                  isMe ? "bg-[#FDE047] rounded-tr-none" : "bg-[#F7F4EB] rounded-tl-none"
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
      <form onSubmit={handleSubmit} className="p-2 border-t-2 border-black bg-[#F7F4EB] flex gap-1.5">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhắn tin vào phòng..."
          className="flex-1 bg-white border-2 border-black rounded-xl px-3 py-1.5 text-xs font-bold text-black placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-[#FDE047] text-black border-2 border-black px-3 py-1.5 rounded-xl font-black shadow-[2px_2px_0px_0px_#1C1917] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
