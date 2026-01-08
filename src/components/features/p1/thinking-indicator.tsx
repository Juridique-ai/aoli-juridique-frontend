"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Wrench } from "lucide-react";
import type { P1Phase } from "@/stores/p1-store";

interface ThinkingIndicatorProps {
  currentPhase: P1Phase | null;
  completedCount: number;
  totalCount: number;
  progressMessage: string | null;
  currentTool: string | null;
}

const PHASE_TITLES: Record<P1Phase, string> = {
  metadata: "Extraction des métadonnées",
  validity: "Vérification de la validité",
  risks: "Analyse des risques",
  fairness: "Évaluation de l'équité",
  compliance: "Contrôle de conformité",
  summary: "Synthèse en cours",
  recommendations: "Génération des recommandations",
};

export function ThinkingIndicator({
  currentPhase,
  completedCount,
  totalCount,
  progressMessage,
  currentTool,
}: ThinkingIndicatorProps) {
  const phaseTitle = currentPhase ? PHASE_TITLES[currentPhase] : null;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full sticky top-4 z-40"
    >
      <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-sm p-6 shadow-lg">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Analyse en cours</span>
            <span>{completedCount}/{totalCount}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Current step */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 shrink-0">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            {/* Phase title - simple transition */}
            <h3 className="font-semibold text-foreground text-lg">
              {phaseTitle || "Initialisation..."}
            </h3>

            {/* Streaming progress message - no animation for stability */}
            {progressMessage && (
              <p className="text-muted-foreground mt-1 transition-opacity duration-150">
                {progressMessage}
              </p>
            )}

            {/* Current tool indicator */}
            <AnimatePresence>
              {currentTool && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 flex items-center gap-2 text-sm text-primary/70"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs">{currentTool}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Subtle animation dots */}
        <div className="flex justify-center gap-1 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/40"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
