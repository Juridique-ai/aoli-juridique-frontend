"use client";

import { cn } from "@/lib/utils";
import { StreamingText } from "@/components/shared/streaming-text";
import { User, Bot, Sparkles } from "lucide-react";
import type { Message } from "@/types";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming || false;

  return (
    <div
      className={cn(
        "flex gap-3 py-4 animate-fade-in",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
          "transition-all duration-200",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-primary/10 text-primary"
        )}
      >
        {isUser ? (
          <User className="h-5 w-5" />
        ) : (
          <Bot className="h-5 w-5" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "flex-1 max-w-[85%] rounded-2xl px-4 py-3",
          "transition-all duration-200",
          isUser
            ? "bg-primary text-primary-foreground"
            : cn(
                "bg-muted/50 backdrop-blur-sm border border-border/50",
                isStreaming && "glow-sm"
              )
        )}
      >
        {/* Streaming indicator */}
        {!isUser && isStreaming && (
          <div className="flex items-center gap-1.5 text-primary text-xs mb-2">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>En train de répondre...</span>
          </div>
        )}

        {/* Content */}
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <StreamingText
            content={message.content}
            isStreaming={isStreaming}
            className="text-sm"
          />
        )}
      </div>
    </div>
  );
}
