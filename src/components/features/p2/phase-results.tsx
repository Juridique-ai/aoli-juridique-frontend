"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Euro,
  Scale,
  Target,
  Calendar,
  CheckSquare,
  Link2,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { P2Phase, P2PhaseResults } from "@/stores/p2-store";

interface PhaseResultsProps {
  phaseResults: P2PhaseResults;
  completedPhases: P2Phase[];
  currentPhase: P2Phase | null;
  isAnalyzing: boolean;
}

const PHASE_CONFIG: Record<P2Phase, {
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}> = {
  profile: {
    label: "Profil",
    icon: User,
    color: "text-blue-500",
    description: "Analyse de votre profil entrepreneurial",
  },
  costs: {
    label: "Coûts",
    icon: Euro,
    color: "text-emerald-500",
    description: "Recherche des coûts de création 2025",
  },
  comparison: {
    label: "Comparaison",
    icon: Scale,
    color: "text-purple-500",
    description: "Comparaison des structures juridiques",
  },
  recommendation: {
    label: "Recommandation",
    icon: Target,
    color: "text-orange-500",
    description: "Génération de la recommandation",
  },
  timeline: {
    label: "Calendrier",
    icon: Calendar,
    color: "text-cyan-500",
    description: "Création du calendrier de création",
  },
  checklist: {
    label: "Checklist",
    icon: CheckSquare,
    color: "text-indigo-500",
    description: "Préparation de la checklist",
  },
  resources: {
    label: "Ressources",
    icon: Link2,
    color: "text-pink-500",
    description: "Compilation des ressources utiles",
  },
};

const PHASE_ORDER: P2Phase[] = [
  "profile",
  "costs",
  "comparison",
  "recommendation",
  "timeline",
  "checklist",
  "resources",
];

export function P2PhaseResults({
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
        Progression de l&apos;analyse
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
  phase: P2Phase;
  result: Record<string, unknown>;
}) {
  const getSummary = (): string | null => {
    try {
      switch (phase) {
        case "profile": {
          const projectType = result.projectType as string | undefined;
          if (projectType) {
            const typeLabels: Record<string, string> = {
              tech_startup: "Startup technologique",
              commerce: "Commerce",
              consulting: "Conseil",
              artisan: "Artisan",
              liberal: "Profession libérale",
              other: "Autre",
            };
            return typeLabels[projectType] || projectType;
          }
          break;
        }
        case "costs": {
          const structures = result.structures as Array<Record<string, unknown>> | undefined;
          if (structures && structures.length > 0) {
            return `${structures.length} structures analysées`;
          }
          break;
        }
        case "comparison": {
          const structures = result.structures as Array<Record<string, unknown>> | undefined;
          if (structures && structures.length > 0) {
            return `${structures.length} structures comparées`;
          }
          break;
        }
        case "recommendation": {
          const rec = result.recommendation as Record<string, unknown> | undefined;
          if (rec?.structure) {
            const score = rec.matchScore as number | undefined;
            return `${rec.structure}${score ? ` (${score}/10)` : ""}`;
          }
          break;
        }
        case "timeline": {
          const totalDays = result.totalDays as number | undefined;
          const steps = result.steps as Array<unknown> | undefined;
          if (totalDays || steps) {
            return `${steps?.length || 0} étapes • ~${totalDays || 30} jours`;
          }
          break;
        }
        case "checklist": {
          const docs = result.documents as Array<unknown> | undefined;
          if (docs) {
            return `${docs.length} documents requis`;
          }
          break;
        }
        case "resources": {
          const resources = result.resources as Array<unknown> | undefined;
          if (resources) {
            return `${resources.length} ressources utiles`;
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
