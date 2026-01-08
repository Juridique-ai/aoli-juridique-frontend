"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { TOOL_LABELS } from "@/lib/constants";

interface ToolProgressProps {
  tool: string | null;
  message?: string | null;
}

export function ToolProgress({ tool, message }: ToolProgressProps) {
  // Determine what to display: tool label takes priority, then message
  const displayText = tool
    ? (TOOL_LABELS[tool] || tool)
    : (message || "Traitement en cours...");

  const shouldShow = tool || message;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 text-sm py-3 px-4 bg-primary/5 border border-primary/20 rounded-xl"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm" />
            <Loader2 className="h-4 w-4 animate-spin text-primary relative" />
          </div>
          <span className="text-foreground">{displayText}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
