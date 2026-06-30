"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Paperclip, Smile, Send, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MessageAttachment } from "@/lib/types";
import EmojiPicker from "./EmojiPicker";

interface ComposerProps {
  conversationId: string;
  onSend: (body: string | null, attachments: MessageAttachment[]) => Promise<void>;
  disabled?: boolean;
  onTyping?: (isTyping: boolean) => void;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
}

const supabase = createClient();

export default function Composer({
  conversationId,
  onSend,
  disabled = false,
  onTyping,
}: ComposerProps) {
  const [text, setText] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Typing status effect
  useEffect(() => {
    if (!onTyping) return;

    if (text.trim().length > 0) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTyping(true);
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onTyping(false);
      }, 3000);
    } else {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTyping(false);
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [text, onTyping]);

  // Image compression helper
  const compressImage = (file: File): Promise<{ blob: Blob; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const maxDim = 1920;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context creation failed"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, width, height });
            } else {
              reject(new Error("Canvas compression failed"));
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => reject(new Error("Failed to load image file"));
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const validFiles = filesArray.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`"${file.name}" is not a supported image format.`);
        return false;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert(`"${file.name}" exceeds the 20MB size limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Start uploads in parallel
    validFiles.forEach(async (file) => {
      const uploadId = crypto.randomUUID();
      
      setUploadingFiles((prev) => [
        ...prev,
        { id: uploadId, name: file.name, progress: 10 },
      ]);

      try {
        const { blob, width, height } = await compressImage(file);
        
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === uploadId ? { ...f, progress: 40 } : f))
        );

        const ext = file.name.split(".").pop() || "jpg";
        const fileUuid = crypto.randomUUID();
        const path = `${conversationId}/${fileUuid}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("message-attachments")
          .upload(path, blob, {
            upsert: false,
            onUploadProgress: (event: { loaded: number; total: number }) => {
              const progress = Math.round((event.loaded / event.total) * 40) + 40;
              setUploadingFiles((prev) =>
                prev.map((f) => (f.id === uploadId ? { ...f, progress } : f))
              );
            },
          } as unknown as Record<string, unknown>);

        if (uploadError) throw uploadError;

        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === uploadId ? { ...f, progress: 90 } : f))
        );

        setAttachments((prev) => [
          ...prev,
          {
            url: path,
            type: "image",
            width,
            height,
          },
        ]);

        setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
      } catch (err) {
        console.error(`Attachment upload failed for "${file.name}":`, err);
        alert(`Failed to upload "${file.name}": ${err instanceof Error ? err.message : "Unknown error"}`);
        setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (disabled || uploadingFiles.length > 0 || (!text.trim() && attachments.length === 0)) return;

    const messageText = text.trim();
    const messageAttachments = [...attachments];

    setText("");
    setAttachments([]);

    try {
      await onSend(messageText || null, messageAttachments);
    } catch (err) {
      console.error("Failed to send message:", err);
      setText(messageText);
      setAttachments(messageAttachments);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      setText(newText);
      
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setText((prev) => prev + emoji);
    }
    setEmojiOpen(false);
  };

  const getAttachmentDisplayUrl = (path: string) => {
    return `/api/messages/attachment?path=${encodeURIComponent(path)}`;
  };

  return (
    <div className="bg-[#F9F6F0] px-4 pb-4 md:px-6 md:pb-6 relative z-10">
      {/* Container wrapper for floating feel */}
      <div className="max-w-4xl mx-auto">
        
        {/* Uploading files list */}
        {uploadingFiles.length > 0 && (
          <div className="mb-3 p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 space-y-2 shadow-xs">
            {uploadingFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-3 text-xs text-slate-700">
                <Loader2 className="h-4 w-4 animate-spin text-gold-600 shrink-0" />
                <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                <div className="h-1 flex-1 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gold-500 transition-all duration-300 rounded-full"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 shrink-0">{file.progress}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Attachments preview list */}
        {attachments.length > 0 && (
          <div className="mb-3 p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 flex flex-wrap gap-3 shadow-xs">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-xs group/thumb"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAttachmentDisplayUrl(att.url)}
                  alt="Attachment"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Floating Glassmorphism Composer Bar */}
        <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md border border-slate-200/80 p-2 rounded-full shadow-md focus-within:shadow-lg focus-within:border-slate-300 transition duration-300">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />

          {/* Attachment buttons */}
          <div className="flex items-center gap-1 pl-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploadingFiles.length > 0}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-450 hover:bg-slate-100 hover:text-slate-750 transition disabled:opacity-40 cursor-pointer"
              title="Attach photos"
            >
              <Paperclip className="h-4.5 w-4.5" />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploadingFiles.length > 0}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-455 hover:bg-slate-100 hover:text-slate-750 transition disabled:opacity-40 cursor-pointer"
              title="Take photo"
            >
              <Camera className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Input field */}
          <div className="relative flex-1">
            <input
              type="text"
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Type a message..."
              className="w-full bg-transparent py-2.5 pl-1 pr-10 text-sm text-slate-800 placeholder-slate-450 outline-none"
            />

            {/* Emoji Picker */}
            <div className="absolute right-1 top-1" ref={emojiRef}>
              <button
                type="button"
                onClick={() => setEmojiOpen(!emojiOpen)}
                disabled={disabled}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <Smile className="h-4.5 w-4.5" />
              </button>

              {emojiOpen && (
                <div className="absolute bottom-full right-0 z-50 mb-4 animate-fade-in">
                  <EmojiPicker onSelectEmoji={insertEmoji} />
                </div>
              )}
            </div>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            onClick={handleSend}
            disabled={
              disabled ||
              uploadingFiles.length > 0 ||
              (!text.trim() && attachments.length === 0)
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 text-white hover:bg-brand-800 hover:scale-[1.04] disabled:bg-slate-100 disabled:text-slate-300 disabled:scale-100 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4 text-gold-400" />
          </button>
        </div>

      </div>
    </div>
  );
}
