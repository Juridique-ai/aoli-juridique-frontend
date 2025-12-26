"use client";

import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex gap-3 py-4", className)}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-primary/10 text-primary">
        <Bot className="h-5 w-5" />
      </div>

      {/* Typing bubble */}
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-muted/50 backdrop-blur-sm border border-border/50">
        <span className="w-2 h-2 rounded-full bg-primary/60 typing-dot" />
        <span className="w-2 h-2 rounded-full bg-primary/60 typing-dot" />
        <span className="w-2 h-2 rounded-full bg-primary/60 typing-dot" />
      </div>
    </div>
  );
}
