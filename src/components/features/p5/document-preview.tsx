"use client";

import { StreamingText } from "@/components/shared/streaming-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Scale, Building, Users, Calendar, Gavel, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ProceduralDocument {
  metadata?: {
    jurisdiction?: string;
    language?: string;
    courtType?: string;
    procedureType?: string;
    procedureNature?: string;
    documentType?: string;
    stage?: string;
  };
  caseInfo?: {
    court?: {
      name?: string;
      address?: string;
      chamber?: string;
    };
    parties?: {
      plaintiff?: {
        type?: string;
        name?: string;
        address?: string;
        siren?: string;
      };
      defendant?: {
        type?: string;
        name?: string;
        address?: string;
        counsel?: string;
      };
    };
    keyDates?: {
      filingDeadline?: string;
      hearingDate?: string;
      prescriptionDate?: string;
    };
  };
  facts?: {
    chronology?: Array<{
      date?: string;
      event?: string;
      evidence?: string;
    }>;
    summary?: string;
  };
  legalArguments?: {
    moyens?: Array<{
      number?: number;
      title?: string;
      majorPremise?: {
        rule?: string;
        verified?: boolean;
        verificationConfidence?: number;
        content?: string;
      };
      minorPremise?: string;
      conclusion?: string;
    }>;
  };
  claims?: {
    principal?: Array<{
      claim?: string;
      amount?: number;
      basis?: string;
    }>;
    subsidiary?: Array<{
      claim?: string;
      amount?: number | string;
      basis?: string;
    }>;
    costs?: {
      article700?: number;
      depens?: boolean;
    };
    provisionalEnforcement?: boolean;
  };
  document?: string;
}

interface DocumentPreviewProps {
  content: string;
  structuredResult?: ProceduralDocument | null;
  isStreaming: boolean;
  isLoading: boolean;
}

export function DocumentPreview({ content, structuredResult, isStreaming, isLoading }: DocumentPreviewProps) {
  const displayContent = structuredResult?.document || content;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayContent);
    toast.success("Document copié dans le presse-papiers");
  };

  const handleDownload = () => {
    const blob = new Blob([displayContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "acte-procedure.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Document téléchargé");
  };

  if (isLoading && !content && !structuredResult) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Aperçu du document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </CardContent>
      </Card>
    );
  }

  if (!content && !structuredResult && !isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Aperçu du document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Scale className="h-12 w-12 mb-4 opacity-50" />
            <p>Remplissez le formulaire et cliquez sur &quot;Générer&quot;</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if document is empty (null, undefined, empty string, or empty object)
  const hasDocument = structuredResult?.document &&
    (typeof structuredResult.document === "string"
      ? structuredResult.document.trim().length > 0
      : Object.keys(structuredResult.document).length > 0);

  // If we have structured result without final document, display structured view
  if (structuredResult && !hasDocument) {
    return (
      <Card className="h-full overflow-auto max-h-[calc(100vh-12rem)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Aperçu du document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Metadata */}
          {structuredResult.metadata && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                <Gavel className="h-4 w-4" />
                Métadonnées
              </h4>
              <div className="flex flex-wrap gap-2">
                {structuredResult.metadata.documentType && (
                  <Badge variant="secondary">{structuredResult.metadata.documentType}</Badge>
                )}
                {structuredResult.metadata.courtType && (
                  <Badge variant="outline">{structuredResult.metadata.courtType}</Badge>
                )}
                {structuredResult.metadata.procedureType && (
                  <Badge variant="outline">{structuredResult.metadata.procedureType}</Badge>
                )}
                {structuredResult.metadata.stage && (
                  <Badge variant="outline">{structuredResult.metadata.stage}</Badge>
                )}
              </div>
            </div>
          )}

          {/* Court Info */}
          {structuredResult.caseInfo?.court && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                <Building className="h-4 w-4" />
                Tribunal
              </h4>
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="font-medium">{structuredResult.caseInfo.court.name}</p>
                {structuredResult.caseInfo.court.address && (
                  <p className="text-muted-foreground text-xs mt-1">{structuredResult.caseInfo.court.address}</p>
                )}
              </div>
            </div>
          )}

          {/* Parties */}
          {structuredResult.caseInfo?.parties && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Parties
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {structuredResult.caseInfo.parties.plaintiff && (
                  <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-sm border border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">Demandeur</p>
                    <p className="font-medium">{structuredResult.caseInfo.parties.plaintiff.name}</p>
                    {structuredResult.caseInfo.parties.plaintiff.address && (
                      <p className="text-xs text-muted-foreground mt-1">{structuredResult.caseInfo.parties.plaintiff.address}</p>
                    )}
                  </div>
                )}
                {structuredResult.caseInfo.parties.defendant && (
                  <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 text-sm border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-700 dark:text-red-400 font-medium mb-1">Défendeur</p>
                    <p className="font-medium">{structuredResult.caseInfo.parties.defendant.name}</p>
                    {structuredResult.caseInfo.parties.defendant.address && (
                      <p className="text-xs text-muted-foreground mt-1">{structuredResult.caseInfo.parties.defendant.address}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Key Dates */}
          {structuredResult.caseInfo?.keyDates && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dates clés
              </h4>
              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                {structuredResult.caseInfo.keyDates.filingDeadline && (
                  <p><span className="text-muted-foreground">Date limite de dépôt:</span> {structuredResult.caseInfo.keyDates.filingDeadline}</p>
                )}
                {structuredResult.caseInfo.keyDates.hearingDate && (
                  <p><span className="text-muted-foreground">Audience:</span> {structuredResult.caseInfo.keyDates.hearingDate}</p>
                )}
                {structuredResult.caseInfo.keyDates.prescriptionDate && (
                  <p><span className="text-muted-foreground">Prescription:</span> {structuredResult.caseInfo.keyDates.prescriptionDate}</p>
                )}
              </div>
            </div>
          )}

          {/* Facts Summary */}
          {structuredResult.facts?.summary && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Résumé des faits</h4>
              <p className="text-sm bg-muted/50 rounded-lg p-3">{structuredResult.facts.summary}</p>
            </div>
          )}

          {/* Legal Arguments */}
          {structuredResult.legalArguments?.moyens && structuredResult.legalArguments.moyens.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Arguments juridiques</h4>
              <div className="space-y-3">
                {structuredResult.legalArguments.moyens.map((moyen, idx) => (
                  <div key={idx} className="border rounded-lg p-3 text-sm">
                    <div className="flex items-start gap-2 mb-2">
                      <Badge variant="outline" className="shrink-0">Moyen {moyen.number || idx + 1}</Badge>
                      <span className="font-medium">{moyen.title}</span>
                    </div>
                    {moyen.majorPremise && (
                      <div className="mt-2 text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          {moyen.majorPremise.verified ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                          )}
                          <span className="text-muted-foreground">Fondement:</span>
                        </div>
                        <p className="italic text-muted-foreground">{moyen.majorPremise.rule}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Claims */}
          {structuredResult.claims && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Demandes</h4>
              <div className="space-y-2">
                {structuredResult.claims.principal?.map((claim, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-primary/5 rounded-lg p-3 text-sm">
                    <span>{claim.claim}</span>
                    {claim.amount && (
                      <Badge>{claim.amount.toLocaleString("fr-FR")} EUR</Badge>
                    )}
                  </div>
                ))}
                {structuredResult.claims.subsidiary?.map((claim, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-muted/50 rounded-lg p-3 text-sm">
                    <span className="text-muted-foreground">{claim.claim}</span>
                    {claim.amount && typeof claim.amount === "number" && (
                      <Badge variant="outline">{claim.amount.toLocaleString("fr-FR")} EUR</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note about pending document */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm">
            <p className="text-amber-800 dark:text-amber-200">
              Le document final sera généré après clarification des questions en attente.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display final document
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Aperçu du document</CardTitle>
        {displayContent && !isStreaming && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-1" />
              Copier
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Télécharger
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <StreamingText content={displayContent} isStreaming={isStreaming} />
        </div>
      </CardContent>
    </Card>
  );
}
