"use client";

import { useState } from "react";
import { useP1Store } from "@/stores/p1-store";
import { ContractUpload } from "@/components/features/p1/contract-upload";
import { ContractViewer } from "@/components/features/p1/contract-viewer";
import { AnalysisPanel } from "@/components/features/p1/analysis-panel";
import { ToolProgress } from "@/components/shared/tool-progress";
import { JurisdictionSelect } from "@/components/shared/jurisdiction-select";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileSearch, Wand2 } from "lucide-react";
import { USER_PARTIES } from "@/lib/constants";
import { endpoints } from "@/lib/api/endpoints";
import { P1_DEMO_CONTRACT } from "@/lib/demo-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export default function P1Page() {
  const {
    contractContent,
    documentFile,
    jurisdiction,
    userParty,
    analysis,
    isAnalyzing,
    currentTool,
    error,
    setDocument,
    setJurisdiction,
    setUserParty,
    setAnalysis,
    appendAnalysis,
    setAnalyzing,
    setCurrentTool,
    setError,
    reset,
  } = useP1Store();

  const handleAnalyze = async () => {
    if (!contractContent) return;

    setAnalysis("");
    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}${endpoints.p1.stream}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-functions-key": API_KEY!,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          documentContent: contractContent,
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
              return;
            }

            try {
              const event = JSON.parse(data);

              switch (event.type) {
                case "started":
                  console.log("[P1] Agent started:", event.message);
                  break;

                case "progress":
                  console.log("[P1] Progress:", event.message);
                  break;

                case "content":
                  if (event.content) {
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
                  return;

                case "completed":
                  console.log("[P1] Completed event:", event);
                  // Extract result from completed event
                  if (event.result) {
                    let result = event.result as string;
                    console.log("[P1] Raw result length:", result.length);
                    // Remove markdown code blocks if present
                    if (result.startsWith("```json")) {
                      result = result.replace(/^```json\n?/, "").replace(/\n?```$/, "");
                    } else if (result.startsWith("```")) {
                      result = result.replace(/^```\n?/, "").replace(/\n?```$/, "");
                    }
                    console.log("[P1] Setting analysis, length:", result.length);
                    setAnalysis(result);
                  } else {
                    console.log("[P1] No result in completed event");
                  }
                  setAnalyzing(false);
                  setCurrentTool(null);
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
    }
  };

  const handleDemo = () => {
    setDocument(P1_DEMO_CONTRACT, null);
  };

  if (!contractContent) {
    return (
      <div className="container py-6 max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analyse de Contrat</h1>
            <p className="text-muted-foreground mt-1">
              Importez votre contrat pour obtenir une analyse juridique détaillée
            </p>
          </div>
          <Button variant="outline" onClick={handleDemo}>
            <Wand2 className="h-4 w-4 mr-2" />
            Démo
          </Button>
        </div>
        <ContractUpload onDocument={setDocument} />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analyse de Contrat</h1>
        <p className="text-muted-foreground mt-1">
          Analysez votre contrat et identifiez les risques juridiques
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Select value={userParty} onValueChange={setUserParty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Votre rôle" />
          </SelectTrigger>
          <SelectContent>
            {USER_PARTIES.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <JurisdictionSelect value={jurisdiction} onChange={setJurisdiction} />

        <Button onClick={handleAnalyze} disabled={isAnalyzing}>
          <FileSearch className="h-4 w-4 mr-2" />
          {isAnalyzing ? "Analyse en cours..." : "Analyser le contrat"}
        </Button>

        <Button variant="outline" onClick={reset}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Nouveau contrat
        </Button>
      </div>

      {/* Tool Progress */}
      {currentTool && (
        <div className="mb-4">
          <ToolProgress tool={currentTool} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Split View */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ContractViewer content={contractContent} documentFile={documentFile} />
        <AnalysisPanel
          content={analysis}
          isStreaming={isAnalyzing}
          isLoading={isAnalyzing}
        />
      </div>
    </div>
  );
}
