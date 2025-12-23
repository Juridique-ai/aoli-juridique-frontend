"use client";

import { useMemo } from "react";
import { StreamingText } from "@/components/shared/streaming-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, CheckCircle, Euro, Clock, FileText, TrendingUp, AlertTriangle } from "lucide-react";

interface FormationResult {
  error?: string;
  profileAnalysis?: {
    projectType?: string;
    needs?: Record<string, { required: boolean; reason: string }>;
  };
  recommendation?: {
    structure?: string;
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
    annualCosts?: Array<{ name: string; amount: string }>;
    total?: number;
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
  disclaimer?: string;
}

function parseResult(content: string): FormationResult | null {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

interface StepResultProps {
  content: string;
  isStreaming: boolean;
  isLoading: boolean;
}

export function StepResult({ content, isStreaming, isLoading }: StepResultProps) {
  const result = useMemo(() => parseResult(content), [content]);

  if (isLoading && !content) {
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
                      {result.costs.annualCosts && result.costs.annualCosts.map((cost: { name: string; amount: string }, idx: number) => (
                        <li key={idx}>{cost.name}: {cost.amount}</li>
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
