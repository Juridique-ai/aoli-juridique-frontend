"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  FileText,
  Shield,
  AlertTriangle,
  Scale,
  CheckCircle,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { P1PhaseResults } from "@/stores/p1-store";

interface FinalResultProps {
  results: P1PhaseResults;
  isStreaming?: boolean;
}

interface SectionProps {
  title: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "default" | "warning" | "error" | "success";
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon: Icon, badge, badgeVariant = "default", children, defaultOpen = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">{title}</span>
          {badge && (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              badgeVariant === "default" && "bg-secondary text-secondary-foreground",
              badgeVariant === "success" && "bg-primary/10 text-primary",
              badgeVariant === "warning" && "bg-amber-500/10 text-amber-600",
              badgeVariant === "error" && "bg-destructive/10 text-destructive",
            )}>
              {badge}
            </span>
          )}
        </div>
        <ChevronDown className={cn(
          "h-5 w-5 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 text-sm">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getRiskLevel(results: P1PhaseResults): { level: string; variant: "success" | "warning" | "error" } {
  const summary = results.summary?.executiveSummary as Record<string, unknown> | undefined;
  const riskLevel = summary?.riskLevel as string | undefined;

  if (riskLevel === "low") return { level: "Risque faible", variant: "success" };
  if (riskLevel === "medium") return { level: "Risque modéré", variant: "warning" };
  if (riskLevel === "high" || riskLevel === "critical") return { level: "Risque élevé", variant: "error" };

  // Fallback: count risks
  const risks = (results.risks?.risks as Array<unknown>) || [];
  if (risks.length === 0) return { level: "Risque faible", variant: "success" };
  if (risks.length <= 2) return { level: "Risque modéré", variant: "warning" };
  return { level: "Risque élevé", variant: "error" };
}

export function FinalResult({ results, isStreaming = false }: FinalResultProps) {
  const riskInfo = getRiskLevel(results);
  const metadata = results.metadata?.metadata as Record<string, unknown> | undefined;
  const validity = results.validity?.validity as Record<string, unknown> | undefined;
  const risks = (results.risks?.risks as Array<Record<string, unknown>>) || [];
  const fairness = results.fairness?.fairnessAnalysis as Record<string, unknown> | undefined;
  const compliance = results.compliance?.compliance as Record<string, unknown> | undefined;
  const summary = results.summary?.executiveSummary as Record<string, unknown> | undefined;
  const recommendations = (results.recommendations?.recommendations as Array<Record<string, unknown>>) || [];

  // Check what data we have
  const hasAnyData = metadata || validity || risks.length > 0 || fairness || compliance || summary || recommendations.length > 0;
  const hasSummary = !!summary;

  if (!hasAnyData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Header Card */}
      <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
        {/* Risk Level Banner - only show when we have summary or enough data */}
        {(hasSummary || risks.length > 0) && (
          <div className={cn(
            "px-6 py-5",
            riskInfo.variant === "success" && "bg-primary/5",
            riskInfo.variant === "warning" && "bg-amber-500/5",
            riskInfo.variant === "error" && "bg-destructive/5",
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Évaluation globale</p>
                <h2 className={cn(
                  "text-2xl font-bold",
                  riskInfo.variant === "success" && "text-primary",
                  riskInfo.variant === "warning" && "text-amber-600",
                  riskInfo.variant === "error" && "text-destructive",
                )}>
                  {isStreaming && !hasSummary ? "Analyse en cours..." : riskInfo.level}
                </h2>
              </div>
              <div className={cn(
                "p-3 rounded-full",
                riskInfo.variant === "success" && "bg-primary/10",
                riskInfo.variant === "warning" && "bg-amber-500/10",
                riskInfo.variant === "error" && "bg-destructive/10",
              )}>
                {riskInfo.variant === "success" && <CheckCircle className="h-8 w-8 text-primary" />}
                {riskInfo.variant === "warning" && <AlertCircle className="h-8 w-8 text-amber-600" />}
                {riskInfo.variant === "error" && <AlertTriangle className="h-8 w-8 text-destructive" />}
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-6 mt-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-2xl font-bold text-foreground">{risks.length}</p>
                <p className="text-xs text-muted-foreground">Risques</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{recommendations.length}</p>
                <p className="text-xs text-muted-foreground">Actions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {validity ? (validity.isValid ? "Oui" : "Non") : "..."}
                </p>
                <p className="text-xs text-muted-foreground">Valide</p>
              </div>
            </div>
          </div>
        )}

        {/* Expandable Sections */}
        <div>
          {/* Summary */}
          {!!summary?.overview && (
            <Section title="Résumé" icon={FileText} defaultOpen={true}>
              <p className="text-muted-foreground leading-relaxed">
                {String(summary.overview)}
              </p>
              {!!summary.keyFindings && (
                <ul className="mt-3 space-y-1">
                  {(summary.keyFindings as Array<unknown>).map((finding, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{typeof finding === 'string' ? finding : JSON.stringify(finding)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          {/* Metadata */}
          {metadata && (
            <Section title="Informations du contrat" icon={FileText} defaultOpen={true}>
              <div className="grid grid-cols-2 gap-4">
                {!!metadata.contractType && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Type</p>
                    <p className="font-medium">{String(metadata.contractType)}</p>
                  </div>
                )}
                {!!metadata.jurisdiction && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Juridiction</p>
                    <p className="font-medium">{String(metadata.jurisdiction)}</p>
                  </div>
                )}
                {!!metadata.effectiveDate && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Date d'effet</p>
                    <p className="font-medium">{String(metadata.effectiveDate)}</p>
                  </div>
                )}
                {!!metadata.duration && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Durée</p>
                    <p className="font-medium">{String(metadata.duration)}</p>
                  </div>
                )}
              </div>
              {!!metadata.parties && (
                <div className="mt-4">
                  <p className="text-muted-foreground text-xs mb-2">Parties</p>
                  <div className="space-y-2">
                    {(metadata.parties as Array<{name?: string; role?: string}>).map((party, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-medium">{party.name}</span>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                          {party.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Validity */}
          {validity && (
            <Section
              title="Validité"
              icon={Shield}
              badge={validity.isValid ? "Valide" : "Problèmes détectés"}
              badgeVariant={validity.isValid ? "success" : "error"}
              defaultOpen={true}
            >
              {validity.isValid ? (
                <p className="text-primary">Le contrat respecte les conditions de validité.</p>
              ) : (
                <div className="space-y-2">
                  {(validity.issues as Array<{issue?: string; description?: string}>)?.map((issue, i) => (
                    <div key={i} className="p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                      <p className="font-medium text-destructive">{issue.issue}</p>
                      {issue.description && (
                        <p className="text-muted-foreground mt-1">{issue.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Risks */}
          {risks.length > 0 && (
            <Section
              title="Risques identifiés"
              icon={AlertTriangle}
              badge={`${risks.length} risque${risks.length > 1 ? 's' : ''}`}
              badgeVariant={risks.some(r => r.severity === 'critical' || r.severity === 'high') ? "error" : "warning"}
              defaultOpen={true}
            >
              <div className="space-y-3">
                {risks.map((risk, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3 rounded-lg border",
                      risk.severity === "critical" && "bg-destructive/5 border-destructive/30",
                      risk.severity === "high" && "bg-destructive/5 border-destructive/20",
                      risk.severity === "medium" && "bg-amber-500/5 border-amber-500/20",
                      risk.severity === "low" && "bg-muted border-border",
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{String(risk.id || risk.category || `Risque ${i + 1}`)}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        risk.severity === "critical" && "bg-destructive/20 text-destructive",
                        risk.severity === "high" && "bg-destructive/10 text-destructive",
                        risk.severity === "medium" && "bg-amber-500/20 text-amber-600",
                        risk.severity === "low" && "bg-muted text-muted-foreground",
                      )}>
                        {String(risk.severity).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{String(risk.description)}</p>
                    {!!risk.recommendation && (
                      <p className="mt-2 text-sm text-primary">
                        → {String(risk.recommendation)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Fairness */}
          {fairness && (
            <Section
              title="Équité contractuelle"
              icon={Scale}
              badge={fairness.score ? `Score: ${fairness.score}/100` : undefined}
              defaultOpen={true}
            >
              {!!fairness.overallAssessment && (
                <p className="text-muted-foreground mb-3">{String(fairness.overallAssessment)}</p>
              )}
              {!!fairness.imbalances && (
                <div className="space-y-2">
                  {(fairness.imbalances as Array<{clause?: string; issue?: string; favoredParty?: string}>).map((imb, i) => (
                    <div key={i} className="p-2 bg-muted/50 rounded-lg">
                      <p className="font-medium text-sm">{imb.clause}</p>
                      <p className="text-muted-foreground text-sm">{imb.issue}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Compliance */}
          {compliance && (
            <Section title="Conformité réglementaire" icon={CheckCircle} defaultOpen={true}>
              <div className="space-y-3">
                {!!compliance.gdpr && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">RGPD</span>
                    <span className={cn(
                      "text-sm",
                      (compliance.gdpr as Record<string, unknown>).compliant ? "text-primary" : "text-destructive"
                    )}>
                      {(compliance.gdpr as Record<string, unknown>).compliant ? "Conforme" : "Non conforme"}
                    </span>
                  </div>
                )}
                {!!compliance.consumerProtection && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Protection consommateur</span>
                    <span className={cn(
                      "text-sm",
                      (compliance.consumerProtection as Record<string, unknown>).compliant ? "text-primary" : "text-destructive"
                    )}>
                      {(compliance.consumerProtection as Record<string, unknown>).compliant ? "Conforme" : "Non conforme"}
                    </span>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Section
              title="Actions recommandées"
              icon={Lightbulb}
              badge={`${recommendations.length} action${recommendations.length > 1 ? 's' : ''}`}
              badgeVariant="default"
              defaultOpen={true}
            >
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-medium">{String(rec.clause || rec.title || `Action ${i + 1}`)}</span>
                      {!!rec.priority && (
                        <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary ml-auto">
                          {String(rec.priority)}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground ml-8">
                      {String(rec.action || rec.description || rec.suggestedText || '')}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border">
          {isStreaming ? (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
              Analyse en cours... Les résultats apparaissent au fur et à mesure.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              Ce rapport est fourni à titre informatif et ne constitue pas un avis juridique.
              Consultez un professionnel du droit pour toute décision importante.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
