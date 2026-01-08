"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Scale,
  MessageSquare,
  FileEdit,
  Truck,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { P4Phase, P4PhaseResults } from "@/stores/p4-store";

interface PhaseResultsProps {
  phaseResults: P4PhaseResults;
  completedPhases: P4Phase[];
  currentPhase: P4Phase | null;
  isAnalyzing: boolean;
}

const PHASE_CONFIG: Record<P4Phase, {
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}> = {
  facts: {
    label: "Faits",
    icon: FileText,
    color: "text-blue-500",
    description: "Extraction des faits pertinents",
  },
  legal: {
    label: "Base juridique",
    icon: Scale,
    color: "text-purple-500",
    description: "Recherche des références légales",
  },
  tone: {
    label: "Ton",
    icon: MessageSquare,
    color: "text-orange-500",
    description: "Analyse du ton approprié",
  },
  draft: {
    label: "Courrier",
    icon: FileEdit,
    color: "text-cyan-500",
    description: "Rédaction du courrier",
  },
  delivery: {
    label: "Délivrance",
    icon: Truck,
    color: "text-emerald-500",
    description: "Instructions de délivrance",
  },
};

const PHASE_ORDER: P4Phase[] = [
  "facts",
  "legal",
  "tone",
  "draft",
  "delivery",
];

export function P4PhaseResults({
  phaseResults,
  completedPhases,
  currentPhase,
  isAnalyzing,
}: PhaseResultsProps) {
  if (!isAnalyzing && completedPhases.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Progression de la génération
      </h3>

      <div className="grid grid-cols-1 gap-2">
        <AnimatePresence mode="popLayout">
          {PHASE_ORDER.map((phase) => {
            const config = PHASE_CONFIG[phase];
            const isCompleted = completedPhases.includes(phase);
            const isCurrent = currentPhase === phase;
            const result = phaseResults[phase];
            const Icon = config.icon;

            // Don't show future phases unless analyzing
            if (!isCompleted && !isCurrent && !isAnalyzing) {
              return null;
            }

            return (
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-all",
                  isCompleted
                    ? "bg-background border-border"
                    : isCurrent
                    ? "bg-primary/5 border-primary/30"
                    : "bg-muted/30 border-border/50 opacity-50"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    isCompleted
                      ? "bg-primary/10"
                      : isCurrent
                      ? "bg-primary/10"
                      : "bg-muted"
                  )}
                >
                  {isCurrent ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : isCompleted ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Icon className={cn("h-4 w-4", config.color, "opacity-50")} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{config.label}</span>
                    {isCompleted && (
                      <Icon className={cn("h-3.5 w-3.5", config.color)} />
                    )}
                  </div>

                  {isCurrent && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {config.description}...
                    </p>
                  )}

                  {/* Show summary of result */}
                  {isCompleted && result && (
                    <PhaseResultSummary phase={phase} result={result} />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PhaseResultSummary({
  phase,
  result,
}: {
  phase: P4Phase;
  result: Record<string, unknown>;
}) {
  const getSummary = (): string | null => {
    try {
      switch (phase) {
        case "facts": {
          const facts = result.facts as Array<unknown> | undefined;
          const sender = result.sender as Record<string, unknown> | undefined;
          if (facts && facts.length > 0) {
            return `${facts.length} faits identifiés`;
          }
          if (sender?.name) {
            return `Expéditeur: ${sender.name}`;
          }
          break;
        }
        case "legal": {
          const refs = result.references as Array<unknown> | undefined;
          if (refs && refs.length > 0) {
            return `${refs.length} références légales`;
          }
          break;
        }
        case "tone": {
          const letterType = result.letterType as string | undefined;
          const toneLevel = result.toneLevel as number | undefined;
          const toneLabels: Record<number, string> = {
            1: "Cordial",
            2: "Ferme",
            3: "Assertif",
            4: "Pré-contentieux",
          };
          if (letterType || toneLevel) {
            const toneName = toneLevel ? toneLabels[toneLevel] : "";
            return `${letterType || ""}${toneName ? ` • ${toneName}` : ""}`;
          }
          break;
        }
        case "draft": {
          const header = result.header as Record<string, unknown> | undefined;
          if (header?.subject) {
            return `Objet: ${header.subject}`;
          }
          if (result.fullText) {
            return "Courrier rédigé";
          }
          break;
        }
        case "delivery": {
          const primary = result.primaryMethod as Record<string, unknown> | undefined;
          if (primary?.method) {
            return `${primary.method}`;
          }
          break;
        }
      }
    } catch {
      // Ignore parsing errors
    }
    return null;
  };

  const summary = getSummary();
  if (!summary) return null;

  return (
    <p className="text-xs text-muted-foreground mt-0.5 truncate">
      {summary}
    </p>
  );
}
