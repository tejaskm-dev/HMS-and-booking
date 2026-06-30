"use client";

import { useState, useEffect, useRef, UIEvent } from "react";
import type { Message } from "@/lib/types";
import { Clock, Check, CheckCheck, ChevronDown, X, ZoomIn } from "lucide-react";

interface ChatThreadProps {
  messages: Message[];
  currentUserRole: "guest" | "host";
  otherPartyInitials: string;
  isOtherPartyTyping?: boolean;
}

export default function ChatThread({
  messages,
  currentUserRole,
  otherPartyInitials,
  isOtherPartyTyping = false,
}: ChatThreadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  
  const [showScrollPill, setShowScrollPill] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const prevMessagesCountRef = useRef(messages.length);
  const initialScrollDoneRef = useRef(false);

  // Helper to determine if user is near bottom
  const isNearBottom = () => {
    const container = containerRef.current;
    if (!container) return true;
    const threshold = 150; // px from bottom
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <= threshold
    );
  };

  // Scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    scrollEndRef.current?.scrollIntoView({ behavior });
    setShowScrollPill(false);
  };

  // Handle container scroll event
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <= 50;
    
    if (isAtBottom) {
      setShowScrollPill(false);
    }
  };

  // Scroll on new messages or typing indicator changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prevCount = prevMessagesCountRef.current;
    prevMessagesCountRef.current = messages.length;
    const hasNewMessage = messages.length > prevCount;

    if (hasNewMessage) {
      const lastMessage = messages[messages.length - 1];
      const wasSentByMe = lastMessage.sender_role === currentUserRole;

      if (wasSentByMe || isNearBottom()) {
        // If sent by current user or already at bottom, scroll down
        setTimeout(() => scrollToBottom("smooth"), 50);
      } else {
        // If sent by other party and user has scrolled up, show the new message pill
        setTimeout(() => {
          setShowScrollPill(true);
        }, 0);
      }
    } else if (isOtherPartyTyping && isNearBottom()) {
      // Scroll to bottom if typing indicator appears while at bottom
      setTimeout(() => scrollToBottom("smooth"), 50);
    }
  }, [messages, isOtherPartyTyping, currentUserRole]);

  // Initial scroll to bottom on mount/first load
  useEffect(() => {
    if (messages.length > 0 && !initialScrollDoneRef.current) {
      initialScrollDoneRef.current = true;
      setTimeout(() => scrollToBottom("auto"), 50);
    }
  }, [messages.length]);

  // Group messages by day
  const groupMessagesByDay = (msgs: Message[]) => {
    const groups: { day: string; messages: Message[] }[] = [];
    msgs.forEach((msg) => {
      const date = new Date(msg.created_at);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let dayStr = "";
      if (date.toDateString() === today.toDateString()) {
        dayStr = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dayStr = "Yesterday";
      } else {
        dayStr = date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }

      const existingGroup = groups.find((g) => g.day === dayStr);
      if (existingGroup) {
        existingGroup.messages.push(msg);
      } else {
        groups.push({ day: dayStr, messages: [msg] });
      }
    });
    return groups;
  };

  const messageGroups = groupMessagesByDay(messages);

  const formatMessageTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getAttachmentUrl = (url: string) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `/api/messages/attachment?path=${encodeURIComponent(url)}`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F9F6F0] relative overflow-hidden">
      {/* Luxury Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#C9A24D_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Scrollable Message Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 custom-scrollbar relative z-10"
      >
        {messageGroups.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 animate-fade-in">
            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm border border-gold-100/60">
              <Clock className="h-6 w-6 text-gold-600 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-serif tracking-tight">No messages yet</h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-xs">Your premium conversation with the concierge begins here.</p>
          </div>
        ) : (
          messageGroups.map((group) => (
            <div key={group.day} className="space-y-4">
              {/* Day Separator */}
              <div className="flex justify-center">
                <span className="rounded-full bg-white/80 border border-gold-100/50 backdrop-blur-xs px-4 py-1.5 text-[10px] font-bold text-gold-700 uppercase tracking-widest shadow-2xs">
                  {group.day}
                </span>
              </div>

              {/* Messages List */}
              <div className="space-y-1.5">
                {group.messages.map((msg, index) => {
                  const isOwn = msg.sender_role === currentUserRole;
                  const isSending = msg.sending;

                  // Consecutive grouping logic
                  const prevMsg = index > 0 ? group.messages[index - 1] : null;
                  const isConsecutive =
                    prevMsg &&
                    prevMsg.sender_role === msg.sender_role &&
                    new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() <
                      5 * 60 * 1000; // 5 minutes threshold

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-3.5 ${
                        isOwn ? "justify-end" : "justify-start"
                      } ${isConsecutive ? "mt-0.5" : "mt-6"} group/msg animate-fade-in-up`}
                    >
                      {/* Avatar column (only show for other sender if not consecutive) */}
                      {!isOwn && (
                        <div className="w-8 shrink-0 flex justify-center">
                          {!isConsecutive ? (
                            <div className="flex h-8 w-8 select-none items-center justify-center rounded-full bg-white text-[10px] font-black text-brand-800 border border-gold-200/50 shadow-sm uppercase tracking-wider">
                              {otherPartyInitials}
                            </div>
                          ) : (
                            <div className="w-8 h-8" />
                          )}
                        </div>
                      )}

                      {/* Bubble Body */}
                      <div
                        className={`max-w-[75%] sm:max-w-[65%] flex flex-col gap-1.5 p-3.5 sm:p-4 shadow-sm transition-all duration-300 ${
                          isOwn
                            ? "bg-gradient-to-br from-brand-700 to-brand-850 border border-brand-900 text-white rounded-3xl rounded-br-xs hover:shadow-md"
                            : "bg-white border border-slate-200/60 text-slate-800 rounded-3xl rounded-bl-xs hover:shadow-md"
                        } ${isSending ? "opacity-75 animate-pulse" : ""} ${
                          isConsecutive && isOwn
                            ? "rounded-br-3xl"
                            : isConsecutive && !isOwn
                            ? "rounded-bl-3xl"
                            : ""
                        }`}
                      >
                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="grid grid-cols-1 gap-2.5">
                            {msg.attachments.map((att, idx) => {
                              const displayUrl = getAttachmentUrl(att.url);
                              return (
                                <div
                                  key={idx}
                                  onClick={() => setLightboxImage(displayUrl)}
                                  className="relative cursor-zoom-in overflow-hidden rounded-2xl border border-black/10 hover:opacity-95 active:scale-[0.98] transition aspect-auto group/img shadow-2xs"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={displayUrl}
                                    alt="Attachment"
                                    className="max-h-72 w-full object-cover rounded-2xl"
                                    style={{
                                      width: att.width ? `${att.width}px` : "auto",
                                      height: att.height ? `${att.height}px` : "auto",
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white">
                                      <ZoomIn className="h-4.5 w-4.5" />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Text */}
                        {msg.body && (
                          <p className="text-[13.5px] font-medium leading-relaxed break-words whitespace-pre-wrap tracking-wide">
                            {msg.body}
                          </p>
                        )}

                        {/* Metadata row */}
                        <div
                          className={`flex items-center gap-1.5 justify-end text-[9px] font-bold tracking-wider uppercase mt-1 ${
                            isOwn ? "text-gold-300" : "text-slate-400"
                          }`}
                        >
                          <span>{formatMessageTime(msg.created_at)}</span>
                          {isOwn && (
                            <span>
                              {isSending ? (
                                <Clock className="h-3 w-3 animate-spin" />
                              ) : msg.read_at ? (
                                <CheckCheck className="h-3 w-3 text-gold-400" />
                              ) : (
                                <Check className="h-3 w-3 text-gold-400/80" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isOtherPartyTyping && (
          <div className="flex items-end gap-3.5 justify-start mt-6 animate-fade-in-up">
            <div className="w-8 shrink-0 flex justify-center">
              <div className="flex h-8 w-8 select-none items-center justify-center rounded-full bg-white text-[10px] font-black text-brand-800 border border-gold-200/50 shadow-sm uppercase tracking-wider">
                {otherPartyInitials}
              </div>
            </div>
            
            <div className="bg-white border border-slate-200/60 text-slate-800 rounded-3xl rounded-bl-xs p-4 shadow-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold-600 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-gold-650 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-gold-700 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={scrollEndRef} />
      </div>

      {/* Floating Scroll-to-Bottom Pill */}
      {showScrollPill && (
        <button
          type="button"
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-brand-700 border border-brand-900 px-5 py-2.5 text-xs font-black text-white shadow-xl hover:bg-brand-850 hover:shadow-2xl active:scale-95 transition-all cursor-pointer z-10 animate-bounce tracking-wider uppercase"
        >
          <span>New Messages</span>
          <ChevronDown className="h-4 w-4 text-gold-400" />
        </button>
      )}

      {/* Fullscreen Image Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 transition-all duration-300 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition cursor-pointer border border-white/10"
          >
            <X className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Enlarged view"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
