"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { P1Phase, P1PhaseResults } from "@/stores/p1-store";

const PHASE_TITLES: Record<P1Phase, string> = {
  metadata: "Extraction des métadonnées",
  validity: "Vérification de la validité",
  risks: "Analyse des risques",
  fairness: "Évaluation de l'équité",
  compliance: "Contrôle de conformité",
  summary: "Synthèse en cours",
  recommendations: "Génération des recommandations",
};

interface AnalysisHeaderProps {
  documentFileName?: string;
  isAnalyzing: boolean;
  currentPhase: P1Phase | null;
  completedCount: number;
  totalCount: number;
  progressMessage: string | null;
  currentTool: string | null;
  phaseResults: P1PhaseResults;
  onReset: () => void;
}

function getRiskInfo(results: P1PhaseResults): { level: string; variant: "success" | "warning" | "error" } {
  const summary = results.summary?.executiveSummary as Record<string, unknown> | undefined;
  const riskLevel = summary?.riskLevel as string | undefined;

  if (riskLevel === "low") return { level: "Risque faible", variant: "success" };
  if (riskLevel === "medium") return { level: "Risque modéré", variant: "warning" };
  if (riskLevel === "high" || riskLevel === "critical") return { level: "Risque élevé", variant: "error" };

  const risks = (results.risks?.risks as Array<unknown>) || [];
  if (risks.length === 0) return { level: "Risque faible", variant: "success" };
  if (risks.length <= 2) return { level: "Risque modéré", variant: "warning" };
  return { level: "Risque élevé", variant: "error" };
}

export function AnalysisHeader({
  documentFileName,
  isAnalyzing,
  currentPhase,
  completedCount,
  totalCount,
  progressMessage,
  currentTool,
  phaseResults,
  onReset,
}: AnalysisHeaderProps) {
  const isComplete = completedCount === totalCount;
  const progress = Math.round((completedCount / totalCount) * 100);
  const phaseTitle = currentPhase ? PHASE_TITLES[currentPhase] : null;
  const riskInfo = getRiskInfo(phaseResults);

  const metadata = phaseResults.metadata?.metadata as Record<string, unknown> | undefined;
  const risks = (phaseResults.risks?.risks as Array<unknown>) || [];
  const recommendations = (phaseResults.recommendations?.recommendations as Array<unknown>) || [];
  const validity = phaseResults.validity?.validity as Record<string, unknown> | undefined;

  return (
    <div className="container max-w-7xl py-3 lg:py-4">
      <div className="flex items-center justify-between gap-2 lg:gap-4">
        {/* Left: Title and file info */}
        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
          <div className="p-1.5 lg:p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base lg:text-lg font-semibold truncate">Analyse de Contrat</h1>
            {documentFileName && (
              <p className="text-xs lg:text-sm text-muted-foreground truncate max-w-[150px] lg:max-w-none">{documentFileName}</p>
            )}
          </div>
        </div>

        {/* Center: Progress or Metadata - hidden on mobile when complete */}
        <div className="hidden sm:block flex-1 max-w-xl mx-4 lg:mx-8">
          <AnimatePresence mode="wait">
            {isAnalyzing && !isComplete && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {completedCount}/{totalCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {phaseTitle || "Initialisation..."}
                  </span>
                  {currentTool && (
                    <span className="flex items-center gap-1 text-xs text-primary/70">
                      <Wrench className="h-3 w-3" />
                      {currentTool}
                    </span>
                  )}
                </div>
                {progressMessage && (
                  <p className="text-xs text-muted-foreground truncate">{progressMessage}</p>
                )}
              </motion.div>
            )}
            {isComplete && (
              <motion.div
                key="metadata"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-6"
              >
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full",
                  riskInfo.variant === "success" && "bg-primary/10",
                  riskInfo.variant === "warning" && "bg-amber-500/10",
                  riskInfo.variant === "error" && "bg-destructive/10",
                )}>
                  {riskInfo.variant === "success" && <CheckCircle className="h-4 w-4 text-primary" />}
                  {riskInfo.variant === "warning" && <AlertCircle className="h-4 w-4 text-amber-600" />}
                  {riskInfo.variant === "error" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                  <span className={cn(
                    "text-sm font-medium",
                    riskInfo.variant === "success" && "text-primary",
                    riskInfo.variant === "warning" && "text-amber-600",
                    riskInfo.variant === "error" && "text-destructive",
                  )}>
                    {riskInfo.level}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground">{risks.length}</span>
                    <span className="text-muted-foreground">Risques</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground">{recommendations.length}</span>
                    <span className="text-muted-foreground">Actions</span>
                  </div>
                  {validity && (
                    <>
                      <div className="w-px h-4 bg-border" />
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "font-bold",
                          Boolean(validity.isValid) ? "text-primary" : "text-destructive"
                        )}>
                          {Boolean(validity.isValid) ? "Valide" : "Invalide"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {metadata?.contractType ? (
                  <>
                    <div className="w-px h-4 bg-border" />
                    <span className="text-sm text-muted-foreground">
                      {String(metadata.contractType)}
                    </span>
                  </>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: New analysis button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Nouveau
        </Button>
      </div>
    </div>
  );
}
