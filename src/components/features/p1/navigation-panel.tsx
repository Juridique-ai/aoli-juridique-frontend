"use client";

import {
  FileText,
  Shield,
  AlertTriangle,
  Scale,
  CheckCircle,
  Lightbulb,
  FileSearch,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { P1Phase, P1PhaseResults } from "@/stores/p1-store";
import { useAnalysisLayout } from "./analysis-layout";

interface NavigationPanelProps {
  phaseResults: P1PhaseResults;
  completedPhases: P1Phase[];
  isAnalyzing: boolean;
  hasDocument: boolean;
}

interface NavItem {
  id: string;
  phase: P1Phase | null;
  title: string;
  icon: React.ElementType;
  getStatus: (results: P1PhaseResults) => { status: "success" | "warning" | "error" | "pending"; count?: number };
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "summary",
    phase: "summary",
    title: "Résumé",
    icon: FileText,
    getStatus: (results) => {
      if (!results.summary) return { status: "pending" };
      return { status: "success" };
    },
  },
  {
    id: "metadata",
    phase: "metadata",
    title: "Informations",
    icon: FileText,
    getStatus: (results) => {
      if (!results.metadata) return { status: "pending" };
      return { status: "success" };
    },
  },
  {
    id: "validity",
    phase: "validity",
    title: "Validité",
    icon: Shield,
    getStatus: (results) => {
      if (!results.validity) return { status: "pending" };
      const validity = results.validity?.validity as Record<string, unknown> | undefined;
      return { status: validity?.isValid ? "success" : "error" };
    },
  },
  {
    id: "risks",
    phase: "risks",
    title: "Risques",
    icon: AlertTriangle,
    getStatus: (results) => {
      if (!results.risks) return { status: "pending" };
      const risks = (results.risks?.risks as Array<Record<string, unknown>>) || [];
      const highRisks = risks.filter(r => r.severity === "critical" || r.severity === "high").length;
      if (highRisks > 0) return { status: "error", count: risks.length };
      if (risks.length > 0) return { status: "warning", count: risks.length };
      return { status: "success", count: 0 };
    },
  },
  {
    id: "fairness",
    phase: "fairness",
    title: "Équité",
    icon: Scale,
    getStatus: (results) => {
      if (!results.fairness) return { status: "pending" };
      const fairness = results.fairness?.fairnessAnalysis as Record<string, unknown> | undefined;
      const imbalances = (fairness?.imbalances as Array<unknown>) || [];
      if (imbalances.length > 2) return { status: "error", count: imbalances.length };
      if (imbalances.length > 0) return { status: "warning", count: imbalances.length };
      return { status: "success", count: 0 };
    },
  },
  {
    id: "compliance",
    phase: "compliance",
    title: "Conformité",
    icon: CheckCircle,
    getStatus: (results) => {
      if (!results.compliance) return { status: "pending" };
      const compliance = results.compliance?.compliance as Record<string, unknown> | undefined;
      const gdpr = compliance?.gdpr as Record<string, unknown> | undefined;
      const consumer = compliance?.consumerProtection as Record<string, unknown> | undefined;
      const allCompliant = (gdpr?.compliant !== false) && (consumer?.compliant !== false);
      return { status: allCompliant ? "success" : "error" };
    },
  },
  {
    id: "recommendations",
    phase: "recommendations",
    title: "Actions",
    icon: Lightbulb,
    getStatus: (results) => {
      if (!results.recommendations) return { status: "pending" };
      const recs = (results.recommendations?.recommendations as Array<unknown>) || [];
      return { status: "success", count: recs.length };
    },
  },
];

function scrollToSection(sectionId: string) {
  const element = document.getElementById(`section-${sectionId}`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function NavigationPanel({
  phaseResults,
  completedPhases,
  isAnalyzing,
  hasDocument,
}: NavigationPanelProps) {
  const { openPDF } = useAnalysisLayout();

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="font-medium text-sm text-foreground">Navigation</h3>
      </div>

      {/* Navigation Items */}
      <div className="p-2">
        {NAV_ITEMS.map((item) => {
          const statusInfo = item.getStatus(phaseResults);
          const isAvailable = item.phase ? completedPhases.includes(item.phase) : true;

          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              disabled={!isAvailable}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left",
                isAvailable
                  ? "hover:bg-muted/50 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "h-4 w-4",
                  statusInfo.status === "success" && "text-primary",
                  statusInfo.status === "warning" && "text-amber-500",
                  statusInfo.status === "error" && "text-destructive",
                  statusInfo.status === "pending" && "text-muted-foreground",
                )} />
                <span className={cn(
                  "text-sm",
                  isAvailable ? "text-foreground" : "text-muted-foreground"
                )}>
                  {item.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {statusInfo.count !== undefined && statusInfo.count > 0 && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full font-medium",
                    statusInfo.status === "success" && "bg-primary/10 text-primary",
                    statusInfo.status === "warning" && "bg-amber-500/10 text-amber-600",
                    statusInfo.status === "error" && "bg-destructive/10 text-destructive",
                  )}>
                    {statusInfo.count}
                  </span>
                )}
                {statusInfo.status === "success" && statusInfo.count === undefined && (
                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                )}
                {statusInfo.status === "pending" && isAnalyzing && (
                  <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
                )}
                {isAvailable && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* View Document Button */}
      {hasDocument && (
        <div className="p-3 border-t border-border">
          <Button
            onClick={() => openPDF()}
            variant="outline"
            className="w-full justify-center gap-2"
          >
            <FileSearch className="h-4 w-4" />
            Voir le document
          </Button>
        </div>
      )}

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="px-4 py-3 border-t border-border bg-primary/5">
          <div className="flex items-center gap-2 text-sm text-primary">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Analyse en cours...</span>
          </div>
        </div>
      )}
    </div>
  );
}
