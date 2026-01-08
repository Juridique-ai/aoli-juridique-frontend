"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Shield,
  AlertTriangle,
  Scale,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  FileSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { P1Phase } from "@/stores/p1-store";

interface PhaseCardProps {
  phase: P1Phase;
  status: "pending" | "running" | "completed";
  result: Record<string, unknown> | null;
}

const PHASE_CONFIG: Record<P1Phase, {
  label: string;
  icon: React.ElementType;
}> = {
  metadata: {
    label: "Métadonnées",
    icon: FileText,
  },
  validity: {
    label: "Validité",
    icon: Shield,
  },
  risks: {
    label: "Risques",
    icon: AlertTriangle,
  },
  fairness: {
    label: "Équité",
    icon: Scale,
  },
  compliance: {
    label: "Conformité",
    icon: CheckCircle,
  },
  summary: {
    label: "Résumé",
    icon: FileSearch,
  },
  recommendations: {
    label: "Recommandations",
    icon: Lightbulb,
  },
};

function getQuickSummary(phase: P1Phase, result: Record<string, unknown> | null): string[] {
  if (!result) return [];

  try {
    switch (phase) {
      case "metadata": {
        const meta = result.metadata as Record<string, unknown> | undefined;
        if (!meta) return [];
        const items: string[] = [];
        if (meta.contractType) items.push(`${meta.contractType}`);
        const parties = meta.parties as Array<unknown> | undefined;
        if (parties?.length) items.push(`${parties.length} parties`);
        return items.slice(0, 2);
      }
      case "validity": {
        const validity = result.validity as Record<string, unknown> | undefined;
        if (!validity) return [];
        const isValid = validity.isValid;
        const issues = (validity.issues as Array<unknown>) || [];
        if (isValid) return ["Valide"];
        return [`${issues.length} problème(s)`];
      }
      case "risks": {
        const risks = (result.risks as Array<{severity?: string}>) || [];
        const critical = risks.filter(r => r.severity?.toLowerCase() === "critical").length;
        const high = risks.filter(r => r.severity?.toLowerCase() === "high").length;
        if (critical > 0) return [`${risks.length} risques`, `${critical} critique(s)`];
        if (high > 0) return [`${risks.length} risques`, `${high} élevé(s)`];
        return [`${risks.length} risques`];
      }
      case "fairness": {
        const fairness = result.fairnessAnalysis as Record<string, unknown> | undefined;
        if (!fairness) return [];
        if (fairness.score !== undefined) {
          const score = fairness.score as number;
          return [`Score: ${score}/100`];
        }
        return [];
      }
      case "compliance": {
        const compliance = result.compliance as Record<string, unknown> | undefined;
        if (!compliance) return [];
        const gdpr = compliance.gdpr as Record<string, unknown> | undefined;
        if (gdpr?.compliant !== undefined) {
          return [gdpr.compliant ? "Conforme" : "Non conforme"];
        }
        return ["Analysé"];
      }
      case "summary": {
        const summary = result.executiveSummary as Record<string, unknown> | undefined;
        if (!summary) return [];
        if (summary.riskLevel) {
          const levelLabels: Record<string, string> = {
            low: "Risque faible",
            medium: "Risque modéré",
            high: "Risque élevé",
            critical: "Risque critique",
          };
          return [levelLabels[summary.riskLevel as string] || String(summary.riskLevel)];
        }
        return [];
      }
      case "recommendations": {
        const recs = (result.recommendations as Array<unknown>) || [];
        return [`${recs.length} action(s)`];
      }
    }
  } catch {
    return [];
  }
  return [];
}

function getDetailedContent(phase: P1Phase, result: Record<string, unknown> | null): React.ReactNode {
  if (!result) return null;

  try {
    switch (phase) {
      case "metadata": {
        const meta = result.metadata as Record<string, unknown> | undefined;
        if (!meta) return null;
        return (
          <div className="space-y-2 text-sm">
            {!!meta.contractType && <p><span className="text-muted-foreground">Type:</span> {String(meta.contractType)}</p>}
            {!!meta.parties && (
              <div>
                <span className="text-muted-foreground">Parties:</span>
                <ul className="ml-4 mt-1">
                  {(meta.parties as Array<{name?: string; role?: string}>).map((p, i) => (
                    <li key={i}>• {p.name} <span className="text-muted-foreground">({p.role})</span></li>
                  ))}
                </ul>
              </div>
            )}
            {!!meta.effectiveDate && <p><span className="text-muted-foreground">Date d'effet:</span> {String(meta.effectiveDate)}</p>}
            {!!meta.duration && <p><span className="text-muted-foreground">Durée:</span> {String(meta.duration)}</p>}
          </div>
        );
      }
      case "validity": {
        const validity = result.validity as Record<string, unknown> | undefined;
        if (!validity) return null;
        const issues = (validity.issues as Array<{issue?: string; description?: string}>) || [];
        const missing = (validity.missingMentions as Array<string>) || [];
        return (
          <div className="space-y-3 text-sm">
            <p className={validity.isValid ? "text-primary font-medium" : "text-destructive font-medium"}>
              {validity.isValid ? "Le contrat est valide" : "Problèmes détectés"}
            </p>
            {issues.length > 0 && (
              <ul className="space-y-1">
                {issues.map((issue, i) => (
                  <li key={i} className="text-destructive">• {issue.issue}</li>
                ))}
              </ul>
            )}
            {missing.length > 0 && (
              <div>
                <span className="text-muted-foreground">Mentions manquantes:</span>
                <ul className="ml-4 mt-1">
                  {missing.map((m, i) => (
                    <li key={i}>• {typeof m === 'string' ? m : JSON.stringify(m)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      }
      case "risks": {
        const risks = (result.risks as Array<{id?: string; severity?: string; description?: string; recommendation?: string}>) || [];
        return (
          <div className="space-y-2 text-sm">
            {risks.map((risk, i) => (
              <div key={i} className={cn(
                "p-2 rounded-lg border",
                risk.severity?.toLowerCase() === "critical" && "bg-destructive/10 border-destructive/30",
                risk.severity?.toLowerCase() === "high" && "bg-destructive/5 border-destructive/20",
                risk.severity?.toLowerCase() === "medium" && "bg-muted border-border",
                risk.severity?.toLowerCase() === "low" && "bg-primary/5 border-primary/20",
              )}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{risk.id || `Risque ${i + 1}`}</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    risk.severity?.toLowerCase() === "critical" && "bg-destructive/20 text-destructive",
                    risk.severity?.toLowerCase() === "high" && "bg-destructive/10 text-destructive",
                    risk.severity?.toLowerCase() === "medium" && "bg-muted-foreground/20 text-muted-foreground",
                    risk.severity?.toLowerCase() === "low" && "bg-primary/20 text-primary",
                  )}>{risk.severity}</span>
                </div>
                <p className="text-muted-foreground">{risk.description}</p>
              </div>
            ))}
          </div>
        );
      }
      case "fairness": {
        const fairness = result.fairnessAnalysis as Record<string, unknown> | undefined;
        if (!fairness) return null;
        return (
          <div className="space-y-2 text-sm">
            {fairness.score !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Score:</span>
                <span className="font-medium">{String(fairness.score)}/100</span>
              </div>
            )}
            {!!fairness.overallAssessment && (
              <p>{String(fairness.overallAssessment)}</p>
            )}
            {!!fairness.imbalances && (
              <ul className="space-y-1">
                {(fairness.imbalances as Array<{clause?: string; issue?: string}>).map((imb, i) => (
                  <li key={i} className="text-muted-foreground">• {imb.clause}: {imb.issue}</li>
                ))}
              </ul>
            )}
          </div>
        );
      }
      case "compliance": {
        const compliance = result.compliance as Record<string, unknown> | undefined;
        if (!compliance) return null;
        const gdpr = compliance.gdpr as Record<string, unknown> | undefined;
        const consumer = compliance.consumerProtection as Record<string, unknown> | undefined;
        return (
          <div className="space-y-3 text-sm">
            {gdpr && (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">RGPD:</span>
                  <span className={gdpr.compliant ? "text-primary" : "text-destructive"}>
                    {gdpr.compliant ? "Conforme" : "Non conforme"}
                  </span>
                </div>
                {!!gdpr.issues && (
                  <ul className="ml-4 mt-1">
                    {(gdpr.issues as Array<string>).map((issue, i) => (
                      <li key={i} className="text-muted-foreground">• {typeof issue === 'string' ? issue : JSON.stringify(issue)}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {consumer && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Droit conso:</span>
                <span className={consumer.compliant ? "text-primary" : "text-destructive"}>
                  {consumer.compliant ? "Conforme" : "Non conforme"}
                </span>
              </div>
            )}
          </div>
        );
      }
      case "summary": {
        const summary = result.executiveSummary as Record<string, unknown> | undefined;
        if (!summary) return null;
        return (
          <div className="space-y-3 text-sm">
            {!!summary.overview && <p>{String(summary.overview)}</p>}
            {!!summary.keyFindings && (
              <ul className="space-y-1">
                {(summary.keyFindings as Array<unknown>).map((finding, i) => (
                  <li key={i} className="text-muted-foreground">• {typeof finding === 'string' ? finding : JSON.stringify(finding)}</li>
                ))}
              </ul>
            )}
          </div>
        );
      }
      case "recommendations": {
        const recs = (result.recommendations as Array<{priority?: string; action?: string; clause?: string; suggestedText?: string}>) || [];
        return (
          <div className="space-y-2 text-sm">
            {recs.map((rec, i) => (
              <div key={i} className="p-2 rounded-lg bg-secondary/50 border border-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{rec.clause || `Action ${i + 1}`}</span>
                  {rec.priority && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {rec.priority}
                    </span>
                  )}
                </div>
                {rec.action && <p className="text-muted-foreground">{rec.action}</p>}
              </div>
            ))}
          </div>
        );
      }
    }
  } catch {
    return <pre className="text-xs overflow-auto text-muted-foreground">{JSON.stringify(result, null, 2)}</pre>;
  }
}

export function PhaseCard({ phase, status, result }: PhaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = PHASE_CONFIG[phase];
  const Icon = config.icon;
  const summary = getQuickSummary(phase, result);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border transition-all overflow-hidden",
        status === "completed" && "bg-card border-border shadow-sm",
        status === "running" && "bg-primary/5 border-primary/30 shadow-md shadow-primary/5",
        status === "pending" && "bg-muted/30 border-border/50 opacity-50"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "p-4 flex items-start gap-3",
          status === "completed" && "cursor-pointer hover:bg-muted/50 transition-colors"
        )}
        onClick={() => status === "completed" && setIsExpanded(!isExpanded)}
      >
        {/* Icon */}
        <div className={cn(
          "p-2 rounded-lg",
          status === "completed" && "bg-primary/10",
          status === "running" && "bg-primary/10",
          status === "pending" && "bg-muted"
        )}>
          {status === "running" ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Icon className={cn(
              "h-5 w-5",
              status === "completed" && "text-primary",
              status === "pending" && "text-muted-foreground/50"
            )} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={cn(
              "font-medium",
              status === "completed" && "text-foreground",
              status === "running" && "text-primary",
              status === "pending" && "text-muted-foreground"
            )}>
              {config.label}
            </h3>
            {status === "completed" && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            )}
          </div>

          {/* Status or Summary */}
          {status === "running" && (
            <p className="text-sm text-primary/80 mt-1 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Analyse en cours...
            </p>
          )}
          {status === "pending" && (
            <p className="text-sm text-muted-foreground/70 mt-1">En attente</p>
          )}
          {status === "completed" && summary.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {summary.map((item, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && status === "completed" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-border">
              {getDetailedContent(phase, result)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
