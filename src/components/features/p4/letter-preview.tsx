"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Mail, Send, AlertTriangle, Scale, FileText, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface LetterPreviewProps {
  content: string;
  isStreaming: boolean;
  isLoading: boolean;
}

interface LetterData {
  metadata?: {
    letterType?: string;
    toneName?: string;
    toneLevel?: number;
  };
  letter?: {
    fullText?: string;
  };
  legalBasis?: {
    applicableLaws?: Array<{ reference: string; relevance: string }>;
  };
  deliveryGuidance?: {
    recommendedMethod?: string;
    methodName?: string;
    reason?: string;
    cost?: string;
    nextStepsIfNoResponse?: string[];
  };
  disclaimer?: string;
}

function parseLetterData(content: string): LetterData | null {
  try {
    let trimmed = content.trim();
    // Handle markdown code blocks
    if (trimmed.startsWith("```")) {
      const lines = trimmed.split("\n");
      lines.shift();
      if (lines[lines.length - 1]?.trim() === "```") {
        lines.pop();
      }
      trimmed = lines.join("\n").trim();
    }
    if (trimmed.startsWith("{")) {
      return JSON.parse(trimmed);
    }
  } catch {
    // Not JSON
  }
  return null;
}

const TONE_COLORS: Record<string, string> = {
  cordial: "bg-green-100 text-green-800",
  ferme: "bg-yellow-100 text-yellow-800",
  assertif: "bg-orange-100 text-orange-800",
  pre_contentieux: "bg-red-100 text-red-800",
};

const LETTER_TYPE_LABELS: Record<string, string> = {
  mise_en_demeure: "Mise en demeure",
  resiliation: "Résiliation",
  reclamation: "Réclamation",
  notification: "Notification",
  reponse: "Réponse",
  contestation: "Contestation",
};

export function LetterPreview({ content, isStreaming, isLoading }: LetterPreviewProps) {
  const letterData = useMemo(() => parseLetterData(content), [content]);
  const fullText = letterData?.letter?.fullText;
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleCopy = async () => {
    const textToCopy = fullText || content;
    await navigator.clipboard.writeText(textToCopy);
    toast.success("Courrier copié dans le presse-papiers");
  };

  const handleDownload = () => {
    const textToDownload = fullText || content;
    const blob = new Blob([textToDownload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "courrier.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Courrier téléchargé");
  };

  const handleGeneratePdf = async () => {
    const textContent = fullText || content;
    if (!textContent) return;

    setIsGeneratingPdf(true);
    setPdfUrl(null);

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textContent, style: "legal" }),
      });

      const data = await response.json();

      if (data.success && data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
        toast.success("PDF généré avec succès");
      } else {
        toast.error(data.error || "Échec de la génération du PDF");
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading && !content) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Aperçu du courrier</CardTitle>
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

  if (!content && !isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Aperçu du courrier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Mail className="h-12 w-12 mb-4 opacity-50" />
            <p>Remplissez le formulaire et cliquez sur &quot;Générer&quot;</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If we have structured letter data, display it nicely
  if (letterData && fullText) {
    return (
      <div className="space-y-4">
        {/* Main Letter Card */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">Courrier généré</CardTitle>
              {letterData.metadata?.letterType && (
                <Badge variant="secondary">
                  {LETTER_TYPE_LABELS[letterData.metadata.letterType] || letterData.metadata.letterType}
                </Badge>
              )}
              {letterData.metadata?.toneName && (
                <Badge className={TONE_COLORS[letterData.metadata.toneName] || "bg-gray-100 text-gray-800"}>
                  Ton: {letterData.metadata.toneName}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Copier</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">TXT</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? (
                  <Loader2 className="h-4 w-4 sm:mr-1 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 sm:mr-1" />
                )}
                <span className="hidden sm:inline">PDF</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap leading-relaxed">
              {fullText}
            </div>

            {/* PDF Ready */}
            {pdfUrl && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    PDF généré avec succès
                  </span>
                </div>
                <Button variant="default" size="sm" asChild>
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ouvrir le PDF
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legal Basis Card */}
        {letterData.legalBasis?.applicableLaws && letterData.legalBasis.applicableLaws.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Base juridique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {letterData.legalBasis.applicableLaws.map((law, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">{law.reference}</span>
                    <p className="text-muted-foreground">{law.relevance}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Delivery Guidance Card */}
        {letterData.deliveryGuidance && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4" />
                Mode d&apos;envoi recommandé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default">{letterData.deliveryGuidance.methodName}</Badge>
                {letterData.deliveryGuidance.cost && (
                  <span className="text-sm text-muted-foreground">({letterData.deliveryGuidance.cost})</span>
                )}
              </div>
              {letterData.deliveryGuidance.reason && (
                <p className="text-sm text-muted-foreground">{letterData.deliveryGuidance.reason}</p>
              )}
              {letterData.deliveryGuidance.nextStepsIfNoResponse && letterData.deliveryGuidance.nextStepsIfNoResponse.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">En cas d&apos;absence de réponse :</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {letterData.deliveryGuidance.nextStepsIfNoResponse.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        {letterData.disclaimer && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-yellow-800 dark:text-yellow-200">{letterData.disclaimer}</p>
          </div>
        )}
      </div>
    );
  }

  // Fallback: show raw content
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <CardTitle className="text-base">Aperçu du courrier</CardTitle>
        {content && !isStreaming && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Copier</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">TXT</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <Loader2 className="h-4 w-4 sm:mr-1 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 sm:mr-1" />
              )}
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
          {content}
        </div>

        {/* PDF Ready */}
        {pdfUrl && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                PDF généré avec succès
              </span>
            </div>
            <Button variant="default" size="sm" asChild>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Ouvrir le PDF
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
