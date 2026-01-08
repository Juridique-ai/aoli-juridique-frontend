"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Shield,
  AlertTriangle,
  Scale,
  CheckCircle,
  FileSearch,
  Lightbulb,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { P1Phase, P1PhaseResults } from "@/stores/p1-store";

interface PhaseResultsProps {
  phaseResults: P1PhaseResults;
  completedPhases: P1Phase[];
  currentPhase: P1Phase | null;
  isAnalyzing: boolean;
}

const PHASE_CONFIG: Record<P1Phase, {
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}> = {
  metadata: {
    label: "Métadonnées",
    icon: FileText,
    color: "text-blue-500",
    description: "Extraction des informations clés du contrat",
  },
  validity: {
    label: "Validité",
    icon: Shield,
    color: "text-sky-500",
    description: "Vérification des mentions obligatoires",
  },
  risks: {
    label: "Risques",
    icon: AlertTriangle,
    color: "text-orange-500",
    description: "Identification des risques juridiques",
  },
  fairness: {
    label: "Équité",
    icon: Scale,
    color: "text-purple-500",
    description: "Analyse de l'équilibre contractuel",
  },
  compliance: {
    label: "Conformité",
    icon: CheckCircle,
    color: "text-cyan-500",
    description: "Vérification RGPD et droit conso",
  },
  summary: {
    label: "Résumé",
    icon: FileSearch,
    color: "text-indigo-500",
    description: "Synthèse exécutive",
  },
  recommendations: {
    label: "Recommandations",
    icon: Lightbulb,
    color: "text-yellow-500",
    description: "Actions correctives proposées",
  },
};

const PHASE_ORDER: P1Phase[] = [
  "metadata",
  "validity",
  "risks",
  "fairness",
  "compliance",
  "summary",
  "recommendations",
];

export function PhaseResults({
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
  phase: P1Phase;
  result: Record<string, unknown>;
}) {
  const getSummary = (): string | null => {
    try {
      switch (phase) {
        case "metadata": {
          const metadata = result.metadata as Record<string, unknown> | undefined;
          if (metadata?.contractType) {
            const parties = (metadata.parties as Array<{name: string}>) || [];
            return `${metadata.contractType}${parties.length > 0 ? ` • ${parties.length} parties` : ""}`;
          }
          break;
        }
        case "validity": {
          const validity = result.validity as Record<string, unknown> | undefined;
          if (validity) {
            const issues = (validity.issues as Array<unknown>) || [];
            const isValid = validity.isValid;
            return isValid
              ? "Contrat valide"
              : `${issues.length} problème(s) identifié(s)`;
          }
          break;
        }
        case "risks": {
          const risks = (result.risks as Array<unknown>) || [];
          const summary = result.riskSummary as Record<string, number> | undefined;
          if (summary) {
            return `${summary.totalRisks || risks.length} risque(s) • ${summary.criticalCount || 0} critique(s)`;
          }
          return `${risks.length} risque(s) identifié(s)`;
        }
        case "fairness": {
          const fairness = result.fairnessAnalysis as Record<string, unknown> | undefined;
          if (fairness?.score !== undefined) {
            const score = fairness.score as number;
            return `Score d'équité: ${score}/100`;
          }
          break;
        }
        case "compliance": {
          const compliance = result.compliance as Record<string, unknown> | undefined;
          const gdpr = compliance?.gdpr as Record<string, unknown> | undefined;
          const overall = compliance?.overallCompliance as Record<string, unknown> | undefined;
          if (overall?.status) {
            const status = overall.status as string;
            const statusLabels: Record<string, string> = {
              compliant: "Conforme",
              partial: "Partiellement conforme",
              non_compliant: "Non conforme",
            };
            return statusLabels[status] || status;
          }
          if (gdpr?.compliant !== undefined) {
            return gdpr.compliant ? "RGPD: Conforme" : "RGPD: Non conforme";
          }
          break;
        }
        case "summary": {
          const summary = result.executiveSummary as Record<string, unknown> | undefined;
          if (summary?.riskLevel) {
            const levelLabels: Record<string, string> = {
              low: "Risque faible",
              medium: "Risque modéré",
              high: "Risque élevé",
              critical: "Risque critique",
            };
            return levelLabels[summary.riskLevel as string] || String(summary.riskLevel);
          }
          break;
        }
        case "recommendations": {
          const recs = (result.recommendations as Array<unknown>) || [];
          return `${recs.length} recommandation(s)`;
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
