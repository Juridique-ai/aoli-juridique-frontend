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
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { P1PhaseResults } from "@/stores/p1-store";
import { useAnalysisLayout } from "./analysis-layout";

interface AnalysisResultsProps {
  results: P1PhaseResults;
  isStreaming?: boolean;
}

interface SectionProps {
  id: string;
  title: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "default" | "warning" | "error" | "success";
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ id, title, icon: Icon, badge, badgeVariant = "default", children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div id={`section-${id}`} className="rounded-xl border border-border bg-card overflow-hidden scroll-mt-32">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
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
            <div className="px-5 pt-2 pb-5 text-sm border-t border-border/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ClauseReference({ clause }: { clause: string }) {
  const { openPDF } = useAnalysisLayout();

  return (
    <button
      onClick={() => openPDF(clause)}
      className="inline-flex items-center gap-1 text-primary hover:text-primary/80 hover:underline transition-colors"
    >
      <span>{clause}</span>
      <ExternalLink className="h-3 w-3" />
    </button>
  );
}

export function AnalysisResults({ results, isStreaming = false }: AnalysisResultsProps) {
  const metadata = results.metadata?.metadata as Record<string, unknown> | undefined;
  const validity = results.validity?.validity as Record<string, unknown> | undefined;
  const risks = (results.risks?.risks as Array<Record<string, unknown>>) || [];
  const fairness = results.fairness?.fairnessAnalysis as Record<string, unknown> | undefined;
  const compliance = results.compliance?.compliance as Record<string, unknown> | undefined;
  const summary = results.summary?.executiveSummary as Record<string, unknown> | undefined;
  const recommendations = (results.recommendations?.recommendations as Array<Record<string, unknown>>) || [];

  const hasAnyData = metadata || validity || risks.length > 0 || fairness || compliance || summary || recommendations.length > 0;

  if (!hasAnyData) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>L'analyse va s'afficher ici...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      {!!summary?.overview && (
        <Section id="summary" title="Résumé" icon={FileText}>
          <p className="text-muted-foreground leading-relaxed">
            {String(summary.overview)}
          </p>
          {!!summary.keyFindings && (
            <ul className="mt-4 space-y-2">
              {(summary.keyFindings as Array<unknown>).map((finding, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{typeof finding === 'string' ? finding : JSON.stringify(finding)}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {/* Metadata */}
      {metadata && (
        <Section id="metadata" title="Informations du contrat" icon={FileText}>
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
            {!!metadata.value && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Valeur</p>
                <p className="font-medium">{String(metadata.value)}</p>
              </div>
            )}
            {!!metadata.renewalTerms && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Renouvellement</p>
                <p className="font-medium">{String(metadata.renewalTerms)}</p>
              </div>
            )}
          </div>
          {!!metadata.parties && (
            <div className="mt-4 pt-4 border-t border-border/50">
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
          id="validity"
          title="Validité"
          icon={Shield}
          badge={validity.isValid ? "Valide" : "Problèmes détectés"}
          badgeVariant={validity.isValid ? "success" : "error"}
        >
          {validity.isValid ? (
            <p className="text-primary flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Le contrat respecte les conditions de validité.
            </p>
          ) : (
            <div className="space-y-3">
              {(validity.issues as Array<{issue?: string; description?: string; clauseReference?: string}>)?.map((issue, i) => (
                <div key={i} className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <p className="font-medium text-destructive">{issue.issue}</p>
                  {issue.description && (
                    <p className="text-muted-foreground mt-1">{issue.description}</p>
                  )}
                  {issue.clauseReference && (
                    <p className="mt-2 text-sm">
                      Référence: <ClauseReference clause={issue.clauseReference} />
                    </p>
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
          id="risks"
          title="Risques identifiés"
          icon={AlertTriangle}
          badge={`${risks.length} risque${risks.length > 1 ? 's' : ''}`}
          badgeVariant={risks.some(r => r.severity === 'critical' || r.severity === 'high') ? "error" : "warning"}
        >
          <div className="space-y-3">
            {risks.map((risk, i) => (
              <div
                key={i}
                className={cn(
                  "p-4 rounded-lg border",
                  risk.severity === "critical" && "bg-destructive/5 border-destructive/30",
                  risk.severity === "high" && "bg-destructive/5 border-destructive/20",
                  risk.severity === "medium" && "bg-amber-500/5 border-amber-500/20",
                  risk.severity === "low" && "bg-muted border-border",
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{String(risk.id || risk.category || `Risque ${i + 1}`)}</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium uppercase",
                    risk.severity === "critical" && "bg-destructive/20 text-destructive",
                    risk.severity === "high" && "bg-destructive/10 text-destructive",
                    risk.severity === "medium" && "bg-amber-500/20 text-amber-600",
                    risk.severity === "low" && "bg-muted text-muted-foreground",
                  )}>
                    {String(risk.severity)}
                  </span>
                </div>
                <p className="text-muted-foreground">{String(risk.description)}</p>
                {!!risk.clauseReference && (
                  <p className="mt-2 text-sm">
                    Clause: <ClauseReference clause={String(risk.clauseReference)} />
                  </p>
                )}
                {!!risk.recommendation && (
                  <p className="mt-3 text-sm text-primary flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" />
                    {String(risk.recommendation)}
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
          id="fairness"
          title="Équité contractuelle"
          icon={Scale}
          badge={fairness.score ? `Score: ${fairness.score}/100` : undefined}
        >
          {!!fairness.overallAssessment && (
            <p className="text-muted-foreground mb-4">{String(fairness.overallAssessment)}</p>
          )}
          {!!fairness.imbalances && Array.isArray(fairness.imbalances) && fairness.imbalances.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Déséquilibres identifiés</p>
              {(fairness.imbalances as Array<{area?: string; clause?: string; description?: string; issue?: string; favoredParty?: string; severity?: string; clauseReference?: string}>).map((imb, i) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{imb.area || imb.clause || `Déséquilibre ${i + 1}`}</p>
                    {imb.severity && (
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        imb.severity === "high" && "bg-destructive/10 text-destructive",
                        imb.severity === "medium" && "bg-amber-500/10 text-amber-600",
                        imb.severity === "low" && "bg-muted text-muted-foreground",
                      )}>
                        {imb.severity}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{imb.description || imb.issue}</p>
                  {imb.favoredParty && (
                    <p className="text-xs text-muted-foreground mt-2">Partie favorisée: {imb.favoredParty}</p>
                  )}
                  {imb.clauseReference && (
                    <p className="mt-2 text-sm">
                      Référence: <ClauseReference clause={imb.clauseReference} />
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Symmetry Analysis */}
          {!!fairness.symmetryAnalysis && (
            <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Analyse de symétrie</p>
              {(fairness.symmetryAnalysis as Record<string, string>).obligations && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Obligations</p>
                  <p className="text-sm">{(fairness.symmetryAnalysis as Record<string, string>).obligations}</p>
                </div>
              )}
              {(fairness.symmetryAnalysis as Record<string, string>).penalties && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Pénalités</p>
                  <p className="text-sm">{(fairness.symmetryAnalysis as Record<string, string>).penalties}</p>
                </div>
              )}
              {(fairness.symmetryAnalysis as Record<string, string>).termination && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Résiliation</p>
                  <p className="text-sm">{(fairness.symmetryAnalysis as Record<string, string>).termination}</p>
                </div>
              )}
            </div>
          )}
        </Section>
      )}

      {/* Compliance */}
      {compliance && (
        <Section id="compliance" title="Conformité réglementaire" icon={CheckCircle}>
          <div className="space-y-3">
            {!!compliance.gdpr && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <span className="font-medium">RGPD</span>
                  {(compliance.gdpr as Record<string, unknown>).details ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      {String((compliance.gdpr as Record<string, unknown>).details)}
                    </p>
                  ) : null}
                </div>
                <span className={cn(
                  "text-sm font-medium px-3 py-1 rounded-full",
                  (compliance.gdpr as Record<string, unknown>).compliant
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                )}>
                  {(compliance.gdpr as Record<string, unknown>).compliant ? "Conforme" : "Non conforme"}
                </span>
              </div>
            )}
            {!!compliance.consumerProtection && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <span className="font-medium">Protection consommateur</span>
                  {(compliance.consumerProtection as Record<string, unknown>).details ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      {String((compliance.consumerProtection as Record<string, unknown>).details)}
                    </p>
                  ) : null}
                </div>
                <span className={cn(
                  "text-sm font-medium px-3 py-1 rounded-full",
                  (compliance.consumerProtection as Record<string, unknown>).compliant
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
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
          id="recommendations"
          title="Actions recommandées"
          icon={Lightbulb}
          badge={`${recommendations.length} action${recommendations.length > 1 ? 's' : ''}`}
        >
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-medium">{String(rec.clause || rec.title || `Action ${i + 1}`)}</span>
                  {!!rec.priority && (
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded ml-auto",
                      rec.priority === "high" && "bg-destructive/10 text-destructive",
                      rec.priority === "medium" && "bg-amber-500/10 text-amber-600",
                      rec.priority === "low" && "bg-muted text-muted-foreground",
                    )}>
                      {String(rec.priority)}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground ml-10">
                  {String(rec.action || rec.description || rec.suggestedText || '')}
                </p>
                {!!rec.rationale && (
                  <p className="text-sm text-muted-foreground mt-2 ml-10 italic">
                    {String(rec.rationale)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Streaming indicator */}
      {isStreaming && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>Analyse en cours... Les résultats apparaissent au fur et à mesure.</span>
        </div>
      )}

      {/* Disclaimer */}
      {!isStreaming && hasAnyData && (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Ce rapport est fourni à titre informatif et ne constitue pas un avis juridique.
            Consultez un professionnel du droit pour toute décision importante.
          </p>
        </div>
      )}
    </div>
  );
}
