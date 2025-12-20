"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { TOOL_LABELS } from "@/lib/constants";

interface ToolProgressProps {
  tool: string | null;
}

export function ToolProgress({ tool }: ToolProgressProps) {
  return (
    <AnimatePresence>
      {tool && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 text-sm text-muted-foreground py-2 px-3 bg-muted/50 rounded-lg"
        >
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>{TOOL_LABELS[tool] || "Traitement en cours..."}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
