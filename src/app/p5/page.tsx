"use client";

import { useState } from "react";
import { useP5Store, type P5Phase } from "@/stores/p5-store";
import {
  Step1DocumentType,
  Step2CaseInfo,
  Step3Parties,
  Step4Facts,
  Step5Claims,
} from "@/components/features/p5/wizard-steps";
import { DocumentPreview } from "@/components/features/p5/document-preview";
import { ProgressiveResult } from "@/components/features/p5/progressive-result";
import { ToolProgress } from "@/components/shared/tool-progress";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  FileEdit,
  RotateCcw,
  Scale,
  Sparkles,
  Check,
  FileText,
  Building2,
  Users,
  ListOrdered,
  Gavel,
} from "lucide-react";
import { endpoints } from "@/lib/api/endpoints";
import { P5_DEMO_DATA } from "@/lib/demo-data";
import { cn, isDevEnvironment } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const STEPS = [
  { id: 1, title: "Document", icon: FileText },
  { id: 2, title: "Affaire", icon: Building2 },
  { id: 3, title: "Parties", icon: Users },
  { id: 4, title: "Faits", icon: ListOrdered },
  { id: 5, title: "Demandes", icon: Gavel },
];

export default function P5Page() {
  const [step, setStep] = useState(1);
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");

  const {
    documentType,
    jurisdiction,
    court,
    caseNumber,
    plaintiff,
    defendant,
    facts,
    claims,
    legalBasis,
    result,
    structuredResult,
    isLoading,
    currentTool,
    progressMessage,
    error,
    phaseResults,
    completedPhases,
    currentPhase,
    setDocumentType,
    setJurisdiction,
    setCourt,
    setCaseNumber,
    setPlaintiff,
    setDefendant,
    addFact,
    removeFact,
    addClaim,
    removeClaim,
    setLegalBasis,
    setResult,
    setStructuredResult,
    setLoading,
    setCurrentTool,
    setProgressMessage,
    setError,
    setPhaseResult,
    setCurrentPhase,
    reset,
  } = useP5Store();

  const canGenerate = plaintiff.name && defendant.name && court && facts.length > 0;

  const handleDemo = () => {
    setDocumentType(P5_DEMO_DATA.documentType);
    setJurisdiction(P5_DEMO_DATA.jurisdiction);
    setCourt(P5_DEMO_DATA.caseInfo.court.name);
    setPlaintiff(P5_DEMO_DATA.caseInfo.parties.plaintiff);
    setDefendant(P5_DEMO_DATA.caseInfo.parties.defendant);
    P5_DEMO_DATA.facts.forEach((fact) => addFact(fact));
    P5_DEMO_DATA.claims.forEach((claim) => addClaim(claim));
    setLegalBasis(P5_DEMO_DATA.request);
    setStep(5); // Go to last step after demo
  };

  const handleReset = () => {
    reset();
    setStep(1);
    setMobileView("form");
  };

  const buildRequestText = () => {
    return `
Type de document: ${documentType}
Juridiction: ${jurisdiction}
Tribunal: ${court}
${caseNumber ? `Numéro de dossier: ${caseNumber}` : ""}

PARTIES:
Demandeur: ${plaintiff.name}, ${plaintiff.address}, ${plaintiff.role}
Défendeur: ${defendant.name}, ${defendant.address}, ${defendant.role}

FAITS:
${facts.map((f, i) => `${i + 1}. [${f.date}] ${f.description}`).join("\n")}

DEMANDES:
${claims.map((c, i) => `${i + 1}. ${c}`).join("\n")}

FONDEMENT JURIDIQUE:
${legalBasis}
    `.trim();
  };

  const handleGenerate = async () => {
    setResult("");
    setStructuredResult(null);
    setLoading(true);
    setError(null);
    setMobileView("preview");

    try {
      const response = await fetch(`${API_BASE}${endpoints.p5.stream}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-functions-key": API_KEY!,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          request: buildRequestText(),
          documentType,
          jurisdiction,
          court,
          caseNumber: caseNumber || undefined,
          parties: { plaintiff, defendant },
          facts,
          claims,
          legalBasis,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);

          if (data === "[DONE]") {
            const currentResult = useP5Store.getState().result;
            if (currentResult) {
              try {
                const jsonMatch = currentResult.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  if (parsed.metadata || parsed.caseInfo || parsed.document) {
                    setStructuredResult(parsed);
                    if (parsed.document?.fullText) {
                      setResult(parsed.document.fullText);
                    } else {
                      setResult("");
                    }
                  }
                }
              } catch {
                // Not valid JSON, keep as text
              }
            }
            setLoading(false);
            setCurrentTool(null);
            return;
          }

          try {
            const event = JSON.parse(data);

            switch (event.type) {
              case "started":
                console.log("[P5] Agent started:", event.message);
                setProgressMessage(event.message || "Démarrage de la génération...");
                break;

              case "progress":
                console.log("[P5] Progress:", event.message);
                setProgressMessage(event.message || "Traitement en cours...");
                break;

              case "content":
                // Handle phase content from parallel workflow
                if (event.phase && event.status === "completed" && event.content) {
                  console.log("[P5] Phase completed:", event.phase, event.content);
                  setPhaseResult(event.phase as P5Phase, event.content);
                  setCurrentPhase(null);
                } else if (event.content && typeof event.content === "string") {
                  // Legacy streaming content
                  useP5Store.setState((state) => ({ result: state.result + event.content }));
                }
                break;

              case "tool_call":
                if (event.tool) setCurrentTool(event.tool);
                break;

              case "tool_result":
                setCurrentTool(null);
                break;

              case "phase_start":
                if (event.phase) {
                  setCurrentPhase(event.phase as P5Phase);
                  setProgressMessage(event.message || `Phase: ${event.phase}`);
                }
                break;

              case "phase_result":
                if (event.phase && event.result) {
                  setPhaseResult(event.phase as P5Phase, event.result);
                  setCurrentPhase(null);
                }
                break;

              case "error":
                setError(event.error || "Une erreur s'est produite.");
                setLoading(false);
                return;

              case "completed":
                if (event.result) {
                  let resultObj = event.result;
                  if (typeof event.result === "string") {
                    try {
                      resultObj = JSON.parse(event.result);
                    } catch {
                      setResult(event.result);
                      setLoading(false);
                      setCurrentTool(null);
                      setProgressMessage(null);
                      return;
                    }
                  }
                  setStructuredResult(resultObj);
                  if (resultObj.document?.fullText) {
                    setResult(resultObj.document.fullText);
                  }
                }
                setLoading(false);
                setCurrentTool(null);
                setProgressMessage(null);
                return;
            }
          } catch {
            // Skip invalid JSON events
          }
        }
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite.");
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!documentType;
      case 2: return !!court;
      case 3: return !!plaintiff.name && !!defendant.name;
      case 4: return facts.length > 0;
      case 5: return claims.length > 0;
      default: return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1DocumentType value={documentType} onChange={setDocumentType} />;
      case 2:
        return (
          <Step2CaseInfo
            jurisdiction={jurisdiction}
            court={court}
            caseNumber={caseNumber}
            onJurisdictionChange={setJurisdiction}
            onCourtChange={setCourt}
            onCaseNumberChange={setCaseNumber}
          />
        );
      case 3:
        return (
          <Step3Parties
            plaintiff={plaintiff}
            defendant={defendant}
            onPlaintiffChange={setPlaintiff}
            onDefendantChange={setDefendant}
          />
        );
      case 4:
        return (
          <Step4Facts
            facts={facts}
            onAddFact={addFact}
            onRemoveFact={removeFact}
          />
        );
      case 5:
        return (
          <Step5Claims
            claims={claims}
            legalBasis={legalBasis}
            onAddClaim={addClaim}
            onRemoveClaim={removeClaim}
            onLegalBasisChange={setLegalBasis}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-8 animate-fade-in">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
            <div className="relative p-3 rounded-xl bg-primary/10 text-primary">
              <Scale className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Actes de Procédure</h1>
            <p className="text-muted-foreground mt-1">
              Rédigez des actes et documents judiciaires
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isDevEnvironment() && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDemo}
              className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Démo
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {STEPS.map((s, index) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;

            return (
              <div key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => isCompleted && setStep(s.id)}
                  disabled={!isCompleted && !isActive}
                  className={cn(
                    "flex flex-col items-center gap-1.5 transition-all",
                    isCompleted && "cursor-pointer"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      isActive && "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                      isCompleted && "bg-primary/20 text-primary",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium hidden sm:block",
                      isActive && "text-primary",
                      !isActive && "text-muted-foreground"
                    )}
                  >
                    {s.title}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-8 sm:w-16 h-0.5 mx-2",
                      step > s.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tool Progress */}
      {(currentTool || progressMessage) && (
        <div className="mb-4 animate-fade-in">
          <ToolProgress tool={currentTool} message={progressMessage} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 animate-fade-in">
          {error}
        </div>
      )}

      {/* Mobile Tab Toggle */}
      <div className="lg:hidden mb-4">
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
          <button
            type="button"
            onClick={() => setMobileView("form")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              mobileView === "form"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="h-4 w-4" />
            Formulaire
          </button>
          <button
            type="button"
            onClick={() => setMobileView("preview")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all relative",
              mobileView === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Scale className="h-4 w-4" />
            Aperçu
            {result && mobileView === "form" && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form (Desktop always visible, Mobile conditional) */}
        <div className={cn(
          "lg:block",
          mobileView === "form" ? "block" : "hidden"
        )}>
          <div className="min-h-[400px]">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="shadow-lg shadow-primary/20"
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !canGenerate}
                className="shadow-lg shadow-primary/20"
              >
                <FileEdit className="h-4 w-4 mr-2" />
                {isLoading ? "Génération..." : "Générer le document"}
              </Button>
            )}
          </div>
        </div>

        {/* Preview (Desktop always visible, Mobile conditional) */}
        <div className={cn(
          "lg:block lg:sticky lg:top-6",
          mobileView === "preview" ? "block" : "hidden"
        )}>
          {completedPhases.length > 0 || currentPhase ? (
            <ProgressiveResult
              results={phaseResults}
              isStreaming={isLoading}
            />
          ) : (
            <DocumentPreview
              content={result}
              structuredResult={structuredResult}
              isStreaming={isLoading}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
