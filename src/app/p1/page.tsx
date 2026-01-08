"use client";

import { useP1Store, type P1Phase } from "@/stores/p1-store";
import { ContractUpload } from "@/components/features/p1/contract-upload";
import { AnalysisLayout } from "@/components/features/p1/analysis-layout";
import { AnalysisHeader } from "@/components/features/p1/analysis-header";
import { AnalysisResults } from "@/components/features/p1/analysis-results";
import { NavigationPanel } from "@/components/features/p1/navigation-panel";
import { PDFDrawer } from "@/components/features/p1/pdf-drawer";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles } from "lucide-react";
import { endpoints } from "@/lib/api/endpoints";
import { P1_DEMO_CONTRACT } from "@/lib/demo-data";
import { isDevEnvironment } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const ALL_PHASES: P1Phase[] = ["metadata", "validity", "risks", "fairness", "compliance", "summary", "recommendations"];

export default function P1Page() {
  const {
    contractContent,
    documentFile,
    jurisdiction,
    userParty,
    isAnalyzing,
    error,
    phaseResults,
    completedPhases,
    currentPhase,
    progressMessage,
    currentTool,
    setDocument,
    setAnalysis,
    appendAnalysis,
    setAnalyzing,
    setCurrentTool,
    setProgressMessage,
    setError,
    setPhaseResult,
    setCurrentPhase,
    reset,
  } = useP1Store();

  const handleAnalyze = async (content?: string) => {
    const docContent = content || contractContent;
    if (!docContent) return;

    setAnalysis("");
    setAnalyzing(true);
    setError(null);
    setProgressMessage(null);
    setCurrentPhase(null);

    try {
      const response = await fetch(`${API_BASE}${endpoints.p1.stream}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-functions-key": API_KEY!,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          documentContent: docContent,
          userParty,
          jurisdiction,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setAnalyzing(false);
              setCurrentTool(null);
              setCurrentPhase(null);
              return;
            }

            try {
              const event = JSON.parse(data);

              switch (event.type) {
                case "started":
                  setProgressMessage(event.message || "Démarrage de l'analyse...");
                  break;

                case "progress":
                  setProgressMessage(event.message || "Traitement en cours...");
                  if (event.phase && event.phase !== "init" && event.phase !== "parallel_start") {
                    setCurrentPhase(event.phase as P1Phase);
                  }
                  break;

                case "content":
                  if (event.phase && event.status === "completed" && event.content) {
                    setPhaseResult(event.phase as P1Phase, event.content);
                    const currentIndex = ALL_PHASES.indexOf(event.phase);
                    if (currentIndex < ALL_PHASES.length - 1) {
                      setCurrentPhase(ALL_PHASES[currentIndex + 1]);
                    } else {
                      setCurrentPhase(null);
                    }
                  } else if (event.content && typeof event.content === "string") {
                    appendAnalysis(event.content);
                  }
                  break;

                case "tool_call":
                  if (event.tool) {
                    setCurrentTool(event.tool);
                  }
                  break;

                case "tool_result":
                  setCurrentTool(null);
                  break;

                case "error":
                  setError(event.error || "Une erreur s'est produite.");
                  setAnalyzing(false);
                  setCurrentPhase(null);
                  return;

                case "completed":
                  if (event.result) {
                    let result = event.result;
                    if (typeof result === "string") {
                      if (result.startsWith("```json")) {
                        result = result.replace(/^```json\n?/, "").replace(/\n?```$/, "");
                      } else if (result.startsWith("```")) {
                        result = result.replace(/^```\n?/, "").replace(/\n?```$/, "");
                      }
                      setAnalysis(result);
                    } else {
                      setAnalysis(JSON.stringify(result, null, 2));
                    }
                  }
                  setAnalyzing(false);
                  setCurrentTool(null);
                  setProgressMessage(null);
                  setCurrentPhase(null);
                  return;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      setAnalyzing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite.");
      setAnalyzing(false);
      setCurrentPhase(null);
    }
  };

  const handleDemo = () => {
    setDocument(P1_DEMO_CONTRACT, null);
    handleAnalyze(P1_DEMO_CONTRACT);
  };

  const handleDocumentUpload = (content: string, file: { fileName: string; fileType: string; uri: string } | null) => {
    setDocument(content, file);
    handleAnalyze(content);
  };

  const isComplete = completedPhases.length === ALL_PHASES.length;

  // Upload screen
  if (!contractContent) {
    return (
      <div className="container py-8 max-w-3xl animate-fade-in">
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
              <div className="relative p-3 rounded-xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Analyse de Contrat</h1>
              <p className="text-muted-foreground mt-1">
                Importez votre contrat pour obtenir une analyse juridique détaillée
              </p>
            </div>
          </div>
          {isDevEnvironment() && (
            <Button
              variant="outline"
              onClick={handleDemo}
              className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Démo
            </Button>
          )}
        </div>
        <ContractUpload onDocument={handleDocumentUpload} />
      </div>
    );
  }

  // Analysis screen - New 60/40 Layout
  return (
    <AnalysisLayout
      header={
        <AnalysisHeader
          documentFileName={documentFile?.fileName}
          isAnalyzing={isAnalyzing}
          currentPhase={currentPhase}
          completedCount={completedPhases.length}
          totalCount={ALL_PHASES.length}
          progressMessage={progressMessage}
          currentTool={currentTool}
          phaseResults={phaseResults}
          onReset={reset}
        />
      }
      results={
        <>
          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-center">
              {error}
            </div>
          )}
          <AnalysisResults results={phaseResults} isStreaming={isAnalyzing && !isComplete} />
        </>
      }
      navigation={
        <NavigationPanel
          phaseResults={phaseResults}
          completedPhases={completedPhases}
          isAnalyzing={isAnalyzing}
          hasDocument={!!documentFile}
        />
      }
      pdfViewer={
        <PDFDrawer
          documentFile={documentFile}
          contractContent={contractContent}
        />
      }
    />
  );
}
