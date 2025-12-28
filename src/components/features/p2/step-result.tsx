"use client";

import { useMemo } from "react";
import { StreamingText } from "@/components/shared/streaming-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, CheckCircle, Euro, Clock, FileText, TrendingUp, AlertTriangle, CheckSquare, Link2 } from "lucide-react";
import type { P2Phase, P2PhaseResults } from "@/stores/p2-store";

interface FormationResult {
  error?: string;
  profileAnalysis?: {
    projectType?: string;
    needs?: Record<string, { required: boolean; reason: string }>;
  };
  recommendation?: {
    structure?: string;
    structureName?: string;
    name?: string;
    matchScore?: number;
    reasons?: string[];
  };
  alternatives?: Array<{
    structure: string;
    matchScore: number;
    prosForProfile?: string[];
    consForProfile?: string[];
  }>;
  comparison?: Array<{
    structure: string;
    capitalMinimum?: string;
    taxRegime?: string;
    socialRegime?: string;
    liability?: string;
    governance?: string;
  }>;
  costs?: {
    creation?: {
      greffe?: number;
      annoncesLegales?: number;
      capital?: number;
      autres?: number;
    };
    annualCosts?: Array<{ name: string; amount?: string; amountMin?: number; amountMax?: number }>;
    total?: number;
    sources?: string[];
  };
  timeline?: {
    totalDays?: number;
    steps?: Array<{
      order: number;
      name: string;
      duration: string;
      description?: string;
    }>;
  };
  checklist?: {
    documents?: Array<{
      name: string;
      description?: string;
      required?: boolean;
      source?: string;
    }>;
    administrative?: string[];
  };
  resources?: Array<{
    name: string;
    url: string;
    description?: string;
    category?: string;
  }>;
  nextSteps?: string[];
  warnings?: string[];
  disclaimer?: string;
}

function parseResult(content: string): FormationResult | null {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// Build result from phase data
function buildResultFromPhases(phaseResults: P2PhaseResults, completedPhases: P2Phase[]): FormationResult | null {
  if (completedPhases.length === 0) return null;

  const result: FormationResult = {};

  if (phaseResults.profile) {
    result.profileAnalysis = phaseResults.profile as FormationResult["profileAnalysis"];
  }

  if (phaseResults.recommendation) {
    const recData = phaseResults.recommendation as Record<string, unknown>;
    result.recommendation = recData.recommendation as FormationResult["recommendation"];
    result.alternatives = recData.alternatives as FormationResult["alternatives"];
  }

  if (phaseResults.comparison) {
    const compData = phaseResults.comparison as Record<string, unknown>;
    result.comparison = compData.structures as FormationResult["comparison"];
  }

  if (phaseResults.costs) {
    const costsData = phaseResults.costs as Record<string, unknown>;
    result.costs = {
      annualCosts: costsData.annualCosts as Array<{ name: string; amount?: string; amountMin?: number; amountMax?: number }>,
      sources: costsData.sources as string[],
    };
  }

  if (phaseResults.timeline) {
    result.timeline = phaseResults.timeline as FormationResult["timeline"];
  }

  if (phaseResults.checklist) {
    result.checklist = phaseResults.checklist as FormationResult["checklist"];
  }

  if (phaseResults.resources) {
    const resData = phaseResults.resources as Record<string, unknown>;
    result.resources = resData.resources as FormationResult["resources"];
  }

  return result;
}

interface StepResultProps {
  content: string;
  isStreaming: boolean;
  isLoading: boolean;
  phaseResults?: P2PhaseResults;
  completedPhases?: P2Phase[];
}

export function StepResult({ content, isStreaming, isLoading, phaseResults, completedPhases }: StepResultProps) {
  // Try to build result from phase data first, fall back to parsed content
  const result = useMemo(() => {
    // If we have completed phases, build from those
    if (phaseResults && completedPhases && completedPhases.length > 0) {
      return buildResultFromPhases(phaseResults, completedPhases);
    }
    // Otherwise parse from content string
    return parseResult(content);
  }, [content, phaseResults, completedPhases]);

  // Show skeleton only if loading with no content and no phase results
  const hasPhaseData = completedPhases && completedPhases.length > 0;
  if (isLoading && !content && !hasPhaseData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Analyse en cours...</h2>
          <p className="text-muted-foreground mt-1">
            Nous analysons vos réponses pour vous recommander la meilleure structure
          </p>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // If we can't parse JSON, show raw content
  if (!result) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Notre recommandation</h2>
          <p className="text-muted-foreground mt-1">
            Voici la structure juridique recommandée en fonction de vos critères
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Analyse détaillée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreamingText content={content} isStreaming={isStreaming} className="text-sm" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle error response
  if (result.error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Erreur</h2>
          <p className="text-muted-foreground mt-1">
            Une erreur s'est produite lors de l'analyse
          </p>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm">{result.error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formatted result display
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Notre recommandation</h2>
        <p className="text-muted-foreground mt-1">
          Voici la structure juridique recommandée en fonction de vos critères
        </p>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-6">
          {/* Main Recommendation */}
          {result.recommendation && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Structure recommandée
                  </div>
                  {result.recommendation.matchScore && (
                    <span className="text-sm font-normal bg-primary text-primary-foreground px-2 py-1 rounded">
                      Score: {result.recommendation.matchScore}/10
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold text-primary mb-2">
                  {result.recommendation.structure}
                </h3>
                {result.recommendation.name && (
                  <p className="text-muted-foreground mb-4">{result.recommendation.name}</p>
                )}
                {result.recommendation.reasons && result.recommendation.reasons.length > 0 && (
                  <ul className="space-y-2">
                    {result.recommendation.reasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}

          {/* Costs */}
          {result.costs && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Euro className="h-4 w-4" />
                  Coûts estimés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Création</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {result.costs.creation?.capital && (
                        <li>Capital: {result.costs.creation.capital}€</li>
                      )}
                      {result.costs.creation?.greffe !== undefined && (
                        <li>Greffe: {result.costs.creation.greffe}€</li>
                      )}
                      {result.costs.creation?.autres !== undefined && result.costs.creation.autres > 0 && (
                        <li>Autres: {result.costs.creation.autres}€</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Annuel</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {result.costs.annualCosts && result.costs.annualCosts.map((cost, idx) => (
                        <li key={idx}>{cost.name}: {cost.amount || `${cost.amountMin}-${cost.amountMax}€`}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {result.costs.total && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-semibold">Total estimé: {result.costs.total}€</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          {result.timeline?.steps && result.timeline.steps.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Étapes de création
                  {result.timeline.totalDays && (
                    <span className="text-sm font-normal text-muted-foreground">
                      (~{result.timeline.totalDays} jours)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {result.timeline.steps.map((step) => (
                    <li key={step.order} className="flex gap-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs shrink-0">
                        {step.order}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{step.name}</p>
                        <p className="text-xs text-muted-foreground">{step.duration}</p>
                        {step.description && (
                          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Alternatives */}
          {result.alternatives && result.alternatives.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Alternatives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.alternatives.map((alt, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{alt.structure}</h4>
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        Score: {alt.matchScore}/10
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      {alt.prosForProfile && alt.prosForProfile.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-green-600 mb-1">Avantages</p>
                          <ul className="space-y-1">
                            {alt.prosForProfile.map((pro, j) => (
                              <li key={j} className="text-muted-foreground">+ {pro}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {alt.consForProfile && alt.consForProfile.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-red-600 mb-1">Inconvénients</p>
                          <ul className="space-y-1">
                            {alt.consForProfile.map((con, j) => (
                              <li key={j} className="text-muted-foreground">- {con}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Checklist */}
          {result.checklist?.documents && result.checklist.documents.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckSquare className="h-4 w-4" />
                  Documents requis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.checklist.documents.map((doc, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium">{doc.name}</span>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground">{doc.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Resources */}
          {result.resources && result.resources.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Link2 className="h-4 w-4" />
                  Ressources utiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.resources.map((resource, i) => (
                    <li key={i} className="text-sm">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        {resource.name}
                      </a>
                      {resource.description && (
                        <p className="text-xs text-muted-foreground">{resource.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {result.warnings && result.warnings.length > 0 && (
            <Card className="border-orange-500/30 bg-orange-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  Points d&apos;attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.warnings.map((warning, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          {result.disclaimer && (
            <p className="text-xs text-muted-foreground italic pt-4 border-t">
              {result.disclaimer}
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
