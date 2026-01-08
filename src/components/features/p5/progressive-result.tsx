"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  FileText,
  Scale,
  Gavel,
  ListChecks,
  FileEdit,
  FolderOpen,
  Send,
  Copy,
  Download,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { P5PhaseResults } from "@/stores/p5-store";

interface ProgressiveResultProps {
  results: P5PhaseResults;
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Extract data from phase results
  const metadata = results.metadata as Record<string, unknown> | null;
  const caseInfo = metadata?.caseInfo as Record<string, unknown> | undefined;
  const docMetadata = metadata?.metadata as Record<string, unknown> | undefined;

  const factsData = results.facts as Record<string, unknown> | null;
  const factsInner = factsData?.facts as Record<string, unknown> | undefined;
  const chronology = (factsInner?.chronology as Array<Record<string, unknown>>) || [];
  const factsSummary = factsInner?.summary as string | undefined;

  const legalArgs = results.legal_args as Record<string, unknown> | null;
  const legalArgsInner = legalArgs?.legalArguments as Record<string, unknown> | undefined;
  const moyens = (legalArgsInner?.moyens as Array<Record<string, unknown>>) || [];

  const claims = results.claims as Record<string, unknown> | null;
  const claimsData = claims?.claims as Record<string, unknown> | undefined;
  const principalClaims = (claimsData?.principal as Array<Record<string, unknown>>) || [];
  const subsidiaryClaims = (claimsData?.subsidiary as Array<Record<string, unknown>>) || [];

  const draft = results.draft as Record<string, unknown> | null;
  const documentData = draft?.document as Record<string, unknown> | undefined;
  const fullText = documentData?.fullText as string | undefined;

  const exhibits = results.exhibits as Record<string, unknown> | null;
  const exhibitsInner = exhibits?.exhibitsList as Record<string, unknown> | undefined;
  const exhibitsList = (exhibitsInner?.items as Array<Record<string, unknown>>) || [];
  const mandatoryCheck = exhibits?.mandatoryMentionsCheck as Record<string, unknown> | undefined;

  const filing = results.filing as Record<string, unknown> | null;
  const filingGuidance = filing?.filingGuidance as Record<string, unknown> | undefined;

  // Check if we have any data
  const hasAnyData = metadata || factsData || legalArgs || claims || draft || exhibits || filing;
  if (!hasAnyData) return null;

  const handleCopy = async () => {
    if (!fullText) return;
    await navigator.clipboard.writeText(fullText);
    toast.success("Document copié dans le presse-papiers");
  };

  const handleDownload = () => {
    if (!fullText) return;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "acte-procedure.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Document téléchargé");
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
        {/* Header Banner */}
        {(docMetadata?.documentType || fullText) && (
          <div className="px-6 py-5 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Acte de procédure</p>
                <h2 className="text-xl font-bold text-foreground">
                  {docMetadata?.documentType as string || "Document procédural"}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  {docMetadata?.courtType ? (
                    <Badge variant="secondary">{String(docMetadata.courtType)}</Badge>
                  ) : null}
                  {docMetadata?.procedureType ? (
                    <Badge variant="outline">{String(docMetadata.procedureType)}</Badge>
                  ) : null}
                </div>
              </div>
              {fullText && (
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
                    <span className="ml-1">PDF</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expandable Sections */}
        <div>
          {/* Document Content */}
          {fullText && (
            <Section title="Contenu du document" icon={FileEdit} defaultOpen={true}>
              <div className="bg-muted/50 rounded-lg p-6 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
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
                      Ouvrir le PDF
                    </a>
                  </Button>
                </div>
              )}
            </Section>
          )}

          {/* Case Info */}
          {caseInfo && (
            <Section title="Informations du dossier" icon={FileText}>
              <div className="grid sm:grid-cols-2 gap-4">
                {caseInfo.caseNumber ? (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">N° RG</p>
                    <p className="font-medium">{String(caseInfo.caseNumber)}</p>
                  </div>
                ) : null}
                {caseInfo.court ? (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Juridiction</p>
                    <p className="font-medium">{String((caseInfo.court as Record<string, unknown>)?.name || caseInfo.court)}</p>
                  </div>
                ) : null}
              </div>
            </Section>
          )}

          {/* Facts */}
          {(chronology.length > 0 || factsSummary) && (
            <Section
              title="Faits"
              icon={ListChecks}
              badge={chronology.length > 0 ? `${chronology.length} événement${chronology.length > 1 ? 's' : ''}` : undefined}
            >
              <div className="space-y-4">
                {factsSummary ? (
                  <p className="text-muted-foreground">{factsSummary}</p>
                ) : null}
                {chronology.length > 0 ? (
                  <ol className="space-y-2">
                    {chronology.map((event, i) => (
                      <li key={i} className="flex gap-3 p-2 bg-muted/30 rounded-lg">
                        <span className="text-xs text-muted-foreground shrink-0 w-20">
                          {String(event.date || "")}
                        </span>
                        <span>{String(event.event || "")}</span>
                        {event.evidence ? (
                          <Badge variant="outline" className="shrink-0">{String(event.evidence)}</Badge>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                ) : null}
              </div>
            </Section>
          )}

          {/* Legal Arguments */}
          {moyens.length > 0 && (
            <Section
              title="Arguments juridiques"
              icon={Scale}
              badge={`${moyens.length} moyen${moyens.length > 1 ? 's' : ''}`}
            >
              <div className="space-y-4">
                {moyens.map((moyen, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                        {String(moyen.number || i + 1)}
                      </span>
                      <span className="font-medium">{String(moyen.title || "")}</span>
                    </div>
                    {moyen.majorPremise ? (
                      <div className="ml-8 space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-medium">Majeure: </span>
                          {String((moyen.majorPremise as Record<string, unknown>)?.content || moyen.majorPremise)}
                        </p>
                        {moyen.minorPremise ? (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Mineure: </span>
                            {String(moyen.minorPremise)}
                          </p>
                        ) : null}
                        {moyen.conclusion ? (
                          <p className="text-primary">
                            <span className="font-medium">Conclusion: </span>
                            {String(moyen.conclusion)}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Claims */}
          {(principalClaims.length > 0 || subsidiaryClaims.length > 0) && (
            <Section title="Demandes (Dispositif)" icon={Gavel}>
              <div className="space-y-4">
                {principalClaims.length > 0 ? (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Demandes principales</p>
                    <ul className="space-y-2">
                      {principalClaims.map((claim, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div>
                            <span>{String(claim.claim || "")}</span>
                            {claim.amount ? (
                              <Badge variant="secondary" className="ml-2">{String(claim.amount)}€</Badge>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {subsidiaryClaims.length > 0 ? (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Demandes subsidiaires</p>
                    <ul className="space-y-2">
                      {subsidiaryClaims.map((claim, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-xs">À titre subsidiaire:</span>
                          <span>{String(claim.claim || "")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </Section>
          )}

          {/* Exhibits */}
          {exhibitsList.length > 0 && (
            <Section
              title="Bordereau de pièces"
              icon={FolderOpen}
              badge={`${exhibitsList.length} pièce${exhibitsList.length > 1 ? 's' : ''}`}
            >
              <ul className="space-y-2">
                {exhibitsList.map((exhibit, i) => (
                  <li key={i} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                    <span className="w-8 h-8 rounded bg-primary/10 text-primary text-sm font-medium flex items-center justify-center shrink-0">
                      {String(exhibit.number || i + 1)}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{String(exhibit.description || "")}</p>
                      {exhibit.referencedIn ? (
                        <p className="text-xs text-muted-foreground">Réf: {String(exhibit.referencedIn)}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
              {mandatoryCheck ? (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {mandatoryCheck.complete ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-sm">
                      {mandatoryCheck.complete
                        ? "Toutes les mentions obligatoires sont présentes"
                        : "Certaines mentions obligatoires manquent"}
                    </span>
                  </div>
                </div>
              ) : null}
            </Section>
          )}

          {/* Filing Guidance */}
          {filingGuidance ? (
            <Section title="Instructions de dépôt" icon={Send}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="default">{String(filingGuidance.method || "")}</Badge>
                  {filingGuidance.copies ? (
                    <span className="text-sm text-muted-foreground">{String(filingGuidance.copies)} exemplaires</span>
                  ) : null}
                </div>
                {filingGuidance.methodDescription ? (
                  <p className="text-muted-foreground">{String(filingGuidance.methodDescription)}</p>
                ) : null}
                {Array.isArray(filingGuidance.nextSteps) && filingGuidance.nextSteps.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium mb-2">Prochaines étapes:</p>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                      {(filingGuidance.nextSteps as Array<string>).map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </div>
            </Section>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border">
          {isStreaming ? (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
              Génération en cours... Le document apparaît au fur et à mesure.
            </p>
          ) : fullText ? (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p>
                Ce document est fourni à titre de modèle. Les actes de procédure engagent la responsabilité de leur auteur.
                Consultez un avocat avant tout dépôt.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              Les résultats de la génération apparaîtront ici.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
