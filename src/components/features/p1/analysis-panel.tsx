"use client";

import { useMemo } from "react";
import { StreamingText } from "@/components/shared/streaming-text";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle, Info, Scale, FileWarning, ShieldAlert } from "lucide-react";

interface ContractAnalysis {
  metadata?: {
    contractType?: string;
    parties?: Array<{ name: string; role: string }>;
    jurisdiction?: string;
  };
  validity?: {
    isValid?: boolean;
    issues?: Array<{ issue: string; description: string }>;
    missingMentions?: string[];
  };
  risks?: Array<{
    id: string;
    category: string;
    severity: string;
    description: string;
    recommendation: string;
  }>;
  executiveSummary?: {
    overview?: string;
    riskLevel?: string;
    keyFindings?: string[];
    priorityActions?: string[];
  };
  recommendations?: Array<{
    priority: string;
    clause: string;
    suggestedText: string;
    rationale: string;
  }>;
  disclaimer?: string;
}

function parseAnalysis(content: string): ContractAnalysis | null {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function getSeverityColor(severity: string): string {
  switch (severity?.toLowerCase()) {
    case "critical": return "text-red-600 bg-red-50 border-red-200";
    case "high": return "text-orange-600 bg-orange-50 border-orange-200";
    case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "low": return "text-green-600 bg-green-50 border-green-200";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

interface AnalysisPanelProps {
  content: string;
  isStreaming: boolean;
  isLoading: boolean;
}

export function AnalysisPanel({ content, isStreaming, isLoading }: AnalysisPanelProps) {
  if (isLoading && !content) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Analyse en cours...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (!content && !isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Analyse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Info className="h-12 w-12 mb-4 opacity-50" />
            <p>Cliquez sur &quot;Analyser le contrat&quot; pour commencer</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const analysis = useMemo(() => parseAnalysis(content), [content]);

  // If we can't parse JSON, show raw content
  if (!analysis) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Analyse</CardTitle>
        </CardHeader>
        <CardContent>
          <StreamingText
            content={content}
            isStreaming={isStreaming}
            className="text-sm"
          />
        </CardContent>
      </Card>
    );
  }

  // Formatted analysis display
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Analyse</span>
          {analysis.executiveSummary?.riskLevel && (
            <RiskBadge level={analysis.executiveSummary.riskLevel as "low" | "medium" | "high" | "critical"} />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {/* Executive Summary */}
            {analysis.executiveSummary && (
              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Résumé
                </h3>
                <p className="text-sm text-muted-foreground">
                  {analysis.executiveSummary.overview}
                </p>
                {analysis.executiveSummary.keyFindings && analysis.executiveSummary.keyFindings.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {analysis.executiveSummary.keyFindings.map((finding, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {typeof finding === 'string' ? finding : JSON.stringify(finding)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Validity */}
            {analysis.validity && (
              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  {analysis.validity.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  Validité
                </h3>
                {analysis.validity.issues && analysis.validity.issues.length > 0 && (
                  <div className="space-y-2">
                    {analysis.validity.issues.map((issue, i) => (
                      <div key={i} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                        <strong>{issue.issue}:</strong> {issue.description}
                      </div>
                    ))}
                  </div>
                )}
                {analysis.validity.missingMentions && analysis.validity.missingMentions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-muted-foreground">Mentions manquantes:</p>
                    <ul className="mt-1 space-y-1">
                      {analysis.validity.missingMentions.map((mention, i) => (
                        <li key={i} className="text-sm text-red-600">• {typeof mention === 'string' ? mention : JSON.stringify(mention)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Risks */}
            {analysis.risks && analysis.risks.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Risques identifiés ({analysis.risks.length})
                </h3>
                <div className="space-y-2">
                  {analysis.risks.map((risk) => (
                    <div
                      key={risk.id}
                      className={`text-sm p-3 rounded border ${getSeverityColor(risk.severity)}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{risk.id}</span>
                        <span className="text-xs uppercase">{risk.severity}</span>
                      </div>
                      <p>{risk.description}</p>
                      {risk.recommendation && (
                        <p className="mt-2 text-xs opacity-80">
                          <strong>Recommandation:</strong> {risk.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Priority Actions */}
            {analysis.executiveSummary?.priorityActions && analysis.executiveSummary.priorityActions.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Actions prioritaires
                </h3>
                <ul className="space-y-1">
                  {analysis.executiveSummary.priorityActions.map((action, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      {typeof action === 'string' ? action : (action as { action?: string; description?: string })?.action || (action as { action?: string; description?: string })?.description || JSON.stringify(action)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            {analysis.disclaimer && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground italic">
                  {analysis.disclaimer}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
