"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Building2,
  Euro,
  Clock,
  CheckSquare,
  Link2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { P2PhaseResults } from "@/stores/p2-store";

interface ProgressiveResultProps {
  results: P2PhaseResults;
  isStreaming?: boolean;
}

interface SectionProps {
  title: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "default" | "warning" | "success" | "primary";
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
              badgeVariant === "primary" && "bg-primary text-primary-foreground",
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

export function ProgressiveResult({ results, isStreaming = false }: ProgressiveResultProps) {
  // Extract data from phase results
  const profile = results.profile as Record<string, unknown> | null;
  const recommendation = results.recommendation as Record<string, unknown> | null;
  const alternatives = (recommendation?.alternatives as Array<Record<string, unknown>>) || [];
  const costs = results.costs as Record<string, unknown> | null;
  const timeline = results.timeline as Record<string, unknown> | null;
  const timelineSteps = (timeline?.steps as Array<Record<string, unknown>>) || [];
  const checklist = results.checklist as Record<string, unknown> | null;
  const checklistDocs = (checklist?.documents as Array<Record<string, unknown>>) || [];
  const resources = results.resources as Record<string, unknown> | null;
  const resourcesList = (resources?.resources as Array<Record<string, unknown>>) || [];

  // Get main recommendation
  const mainRec = recommendation?.recommendation as Record<string, unknown> | undefined;
  const structure = mainRec?.structure as string || mainRec?.structureName as string || "";
  const matchScore = mainRec?.matchScore as number || 0;
  const reasons = (mainRec?.reasons as Array<string>) || [];

  // Check if we have any data
  const hasAnyData = profile || recommendation || costs || timeline || checklist || resources;
  if (!hasAnyData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
        {/* Main Recommendation Banner */}
        {mainRec && structure && (
          <div className="px-6 py-5 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Structure recommandée</p>
                <h2 className="text-2xl font-bold text-primary">{structure}</h2>
                {mainRec.name ? (
                  <p className="text-muted-foreground mt-1">{String(mainRec.name)}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-4">
                {matchScore > 0 && (
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{matchScore}</p>
                    <p className="text-xs text-muted-foreground">/10</p>
                  </div>
                )}
                <div className="p-3 rounded-full bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>

            {/* Reasons */}
            {reasons.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <ul className="space-y-2">
                  {reasons.slice(0, 3).map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Expandable Sections */}
        <div>
          {/* Profile Analysis */}
          {profile && (
            <Section title="Analyse du profil" icon={Users} defaultOpen={false}>
              <div className="space-y-3">
                {profile.projectType ? (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Type de projet</span>
                    <span className="font-medium">{String(profile.projectType)}</span>
                  </div>
                ) : null}
                {profile.needs ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Besoins identifiés</p>
                    {Object.entries(profile.needs as Record<string, {required: boolean; reason: string}>).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          value.required ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {value.required ? "Requis" : "Optionnel"}
                        </span>
                        <span className="text-sm">{key}: {value.reason}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </Section>
          )}

          {/* Alternatives */}
          {alternatives.length > 0 && (
            <Section
              title="Alternatives"
              icon={TrendingUp}
              badge={`${alternatives.length} option${alternatives.length > 1 ? 's' : ''}`}
            >
              <div className="space-y-3">
                {alternatives.map((alt, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{String(alt.structure)}</span>
                      {alt.matchScore ? (
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          Score: {String(alt.matchScore)}/10
                        </span>
                      ) : null}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      {Array.isArray(alt.prosForProfile) && alt.prosForProfile.length > 0 ? (
                        <div>
                          <p className="text-xs font-medium text-primary mb-1">Avantages</p>
                          <ul className="space-y-1">
                            {(alt.prosForProfile as Array<string>).slice(0, 2).map((pro, j) => (
                              <li key={j} className="text-muted-foreground text-xs">+ {pro}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {Array.isArray(alt.consForProfile) && alt.consForProfile.length > 0 ? (
                        <div>
                          <p className="text-xs font-medium text-destructive mb-1">Inconvénients</p>
                          <ul className="space-y-1">
                            {(alt.consForProfile as Array<string>).slice(0, 2).map((con, j) => (
                              <li key={j} className="text-muted-foreground text-xs">- {con}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Costs */}
          {costs && (
            <Section title="Coûts estimés" icon={Euro} defaultOpen={true}>
              <div className="space-y-4">
                {/* Annual costs */}
                {Array.isArray(costs.annualCosts) ? (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Coûts annuels</p>
                    <div className="space-y-2">
                      {(costs.annualCosts as Array<{name: string; amount?: string; amountMin?: number; amountMax?: number}>).map((cost, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm">{cost.name}</span>
                          <span className="font-medium">
                            {cost.amount || (cost.amountMin && cost.amountMax ? `${cost.amountMin} - ${cost.amountMax}€` : "Variable")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {/* Sources */}
                {Array.isArray(costs.sources) ? (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Sources: {(costs.sources as Array<string>).join(", ")}
                    </p>
                  </div>
                ) : null}
              </div>
            </Section>
          )}

          {/* Timeline */}
          {timelineSteps.length > 0 && (
            <Section
              title="Étapes de création"
              icon={Clock}
              badge={timeline?.totalDays ? `~${String(timeline.totalDays)} jours` : undefined}
            >
              <ol className="space-y-3">
                {timelineSteps.map((step) => (
                  <li key={String(step.order)} className="flex gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs shrink-0">
                      {String(step.order)}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{String(step.name)}</p>
                      <p className="text-xs text-muted-foreground">{String(step.duration)}</p>
                      {step.description ? (
                        <p className="text-sm text-muted-foreground mt-1">{String(step.description)}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {/* Checklist */}
          {checklistDocs.length > 0 && (
            <Section
              title="Documents requis"
              icon={CheckSquare}
              badge={`${checklistDocs.length} document${checklistDocs.length > 1 ? 's' : ''}`}
            >
              <ul className="space-y-2">
                {checklistDocs.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-sm">{String(doc.name)}</span>
                      {doc.description ? (
                        <p className="text-xs text-muted-foreground">{String(doc.description)}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Resources */}
          {resourcesList.length > 0 && (
            <Section title="Ressources utiles" icon={Link2}>
              <ul className="space-y-2">
                {resourcesList.map((resource, i) => (
                  <li key={i}>
                    <a
                      href={String(resource.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline text-sm"
                    >
                      {String(resource.name)}
                    </a>
                    {resource.description ? (
                      <p className="text-xs text-muted-foreground">{String(resource.description)}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
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
              Ces recommandations sont fournies à titre informatif.
              Consultez un expert-comptable ou avocat pour valider votre choix.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
