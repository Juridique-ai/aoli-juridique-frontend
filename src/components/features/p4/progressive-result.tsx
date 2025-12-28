"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  FileText,
  Scale,
  MessageSquare,
  Truck,
  Copy,
  Download,
  CheckCircle,
  AlertTriangle,
  FileEdit,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { P4PhaseResults } from "@/stores/p4-store";

interface ProgressiveResultProps {
  results: P4PhaseResults;
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

const TONE_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "bg-green-100", text: "text-green-800", label: "Cordial" },
  2: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Ferme" },
  3: { bg: "bg-orange-100", text: "text-orange-800", label: "Assertif" },
  4: { bg: "bg-red-100", text: "text-red-800", label: "Pré-contentieux" },
};

export function ProgressiveResult({ results, isStreaming = false }: ProgressiveResultProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Extract data from phase results
  const facts = results.facts as Record<string, unknown> | null;
  const factsList = (facts?.facts as Array<Record<string, unknown>>) || [];
  const sender = facts?.sender as Record<string, unknown> | undefined;
  const recipient = facts?.recipient as Record<string, unknown> | undefined;

  const legal = results.legal as Record<string, unknown> | null;
  const legalRefs = (legal?.references as Array<Record<string, unknown>>) || [];

  const tone = results.tone as Record<string, unknown> | null;
  const toneLevel = tone?.toneLevel as number | undefined;
  const letterType = tone?.letterType as string | undefined;

  const draft = results.draft as Record<string, unknown> | null;
  const fullText = draft?.fullText as string | undefined;
  const header = draft?.header as Record<string, unknown> | undefined;

  const delivery = results.delivery as Record<string, unknown> | null;
  const primaryMethod = delivery?.primaryMethod as Record<string, unknown> | undefined;
  const nextSteps = (delivery?.nextStepsIfNoResponse as Array<string>) || [];

  // Check if we have any data
  const hasAnyData = facts || legal || tone || draft || delivery;
  if (!hasAnyData) return null;

  const handleCopy = async () => {
    if (!fullText) return;
    await navigator.clipboard.writeText(fullText);
    toast.success("Courrier copié dans le presse-papiers");
  };

  const handleDownload = () => {
    if (!fullText) return;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "courrier.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Courrier téléchargé");
  };

  const handleGeneratePdf = async () => {
    if (!fullText) return;
    setIsGeneratingPdf(true);
    setPdfUrl(null);

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: fullText, style: "legal" }),
      });
      const data = await response.json();
      if (data.success && data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
        toast.success("PDF généré avec succès");
      } else {
        toast.error(data.error || "Échec de la génération du PDF");
      }
    } catch {
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const toneInfo = toneLevel ? TONE_COLORS[toneLevel] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
        {/* Letter Header Banner - show when we have the draft */}
        {fullText && (
          <div className="px-6 py-5 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Courrier généré</p>
                <h2 className="text-xl font-bold text-foreground">
                  {String(header?.subject || letterType || "Correspondance juridique")}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  {letterType ? (
                    <Badge variant="secondary">{letterType}</Badge>
                  ) : null}
                  {toneInfo ? (
                    <Badge className={cn(toneInfo.bg, toneInfo.text)}>
                      Ton: {toneInfo.label}
                    </Badge>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleGeneratePdf}
                  disabled={isGeneratingPdf}
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Expandable Sections */}
        <div>
          {/* Letter Content */}
          {fullText && (
            <Section title="Contenu du courrier" icon={FileEdit} defaultOpen={true}>
              <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                {fullText}
              </div>
              {/* PDF Ready */}
              {pdfUrl && (
                <div className="flex items-center justify-between gap-3 mt-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      PDF généré avec succès
                    </span>
                  </div>
                  <Button variant="default" size="sm" asChild>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ouvrir
                    </a>
                  </Button>
                </div>
              )}
            </Section>
          )}

          {/* Facts */}
          {(factsList.length > 0 || sender || recipient) && (
            <Section
              title="Faits identifiés"
              icon={FileText}
              badge={factsList.length > 0 ? `${factsList.length} fait${factsList.length > 1 ? 's' : ''}` : undefined}
            >
              <div className="space-y-4">
                {/* Parties */}
                {(sender || recipient) && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {sender ? (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Expéditeur</p>
                        <p className="font-medium">{String(sender.name || "")}</p>
                        {sender.address ? <p className="text-xs text-muted-foreground">{String(sender.address)}</p> : null}
                      </div>
                    ) : null}
                    {recipient ? (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Destinataire</p>
                        <p className="font-medium">{String(recipient.name || "")}</p>
                        {recipient.address ? <p className="text-xs text-muted-foreground">{String(recipient.address)}</p> : null}
                      </div>
                    ) : null}
                  </div>
                )}
                {/* Facts list */}
                {factsList.length > 0 && (
                  <ul className="space-y-2">
                    {factsList.map((fact, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{String(fact.description || fact.fact || JSON.stringify(fact))}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Section>
          )}

          {/* Legal References */}
          {legalRefs.length > 0 && (
            <Section
              title="Base juridique"
              icon={Scale}
              badge={`${legalRefs.length} référence${legalRefs.length > 1 ? 's' : ''}`}
            >
              <ul className="space-y-3">
                {legalRefs.map((ref, i) => (
                  <li key={i} className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">{String(ref.reference || ref.law || ref.article || "")}</p>
                    {ref.relevance ? (
                      <p className="text-muted-foreground text-sm mt-1">{String(ref.relevance)}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Tone Analysis */}
          {tone && (
            <Section title="Analyse du ton" icon={MessageSquare}>
              <div className="space-y-3">
                {toneInfo ? (
                  <div className="flex items-center gap-3">
                    <div className={cn("px-3 py-2 rounded-lg", toneInfo.bg)}>
                      <span className={cn("font-medium", toneInfo.text)}>{toneInfo.label}</span>
                    </div>
                    <span className="text-muted-foreground">Niveau {toneLevel}/4</span>
                  </div>
                ) : null}
                {tone.reasoning ? (
                  <p className="text-muted-foreground">{String(tone.reasoning)}</p>
                ) : null}
                {Array.isArray(tone.keyPhrases) ? (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Formulations clés</p>
                    <div className="flex flex-wrap gap-2">
                      {(tone.keyPhrases as Array<string>).map((phrase, i) => (
                        <Badge key={i} variant="outline">{phrase}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </Section>
          )}

          {/* Delivery Guidance */}
          {delivery && primaryMethod && (
            <Section title="Mode d'envoi recommandé" icon={Truck}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="default">{String(primaryMethod.method || primaryMethod.name || "")}</Badge>
                  {primaryMethod.cost ? (
                    <span className="text-sm text-muted-foreground">({String(primaryMethod.cost)})</span>
                  ) : null}
                </div>
                {primaryMethod.reason ? (
                  <p className="text-muted-foreground">{String(primaryMethod.reason)}</p>
                ) : null}
                {nextSteps.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium mb-2">En cas d&apos;absence de réponse :</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {nextSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border">
          {isStreaming ? (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
              Génération en cours... Le courrier apparaît au fur et à mesure.
            </p>
          ) : fullText ? (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p>
                Ce courrier est fourni à titre de modèle. Vérifiez son contenu avant envoi
                et consultez un avocat pour les situations complexes.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              Les résultats de l&apos;analyse apparaîtront ici.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
