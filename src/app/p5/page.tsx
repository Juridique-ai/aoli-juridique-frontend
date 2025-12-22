"use client";

import { useP5Store } from "@/stores/p5-store";
import { ProceduralForm } from "@/components/features/p5/procedural-form";
import { DocumentPreview } from "@/components/features/p5/document-preview";
import { ToolProgress } from "@/components/shared/tool-progress";
import { Button } from "@/components/ui/button";
import { FileEdit, RotateCcw, Wand2 } from "lucide-react";
import { endpoints } from "@/lib/api/endpoints";
import { P5_DEMO_DATA } from "@/lib/demo-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export default function P5Page() {
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
    error,
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
    setError,
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
            // Try to parse accumulated result as structured JSON
            const currentResult = useP5Store.getState().result;
            if (currentResult) {
              try {
                // Find JSON in the accumulated content
                const jsonMatch = currentResult.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  if (parsed.metadata || parsed.caseInfo || parsed.document) {
                    setStructuredResult(parsed);
                    if (parsed.document?.fullText) {
                      setResult(parsed.document.fullText);
                    } else {
                      setResult(""); // Clear raw JSON from display
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
              case "content":
                // Content streaming - append to result
                if (event.content) {
                  useP5Store.setState((state) => ({ result: state.result + event.content }));
                }
                break;

              case "tool_call":
                if (event.tool) setCurrentTool(event.tool);
                break;

              case "tool_result":
                setCurrentTool(null);
                break;

              case "error":
                setError(event.error || "Une erreur s'est produite.");
                setLoading(false);
                return;

              case "completed":
                // Final structured result - may be a JSON string
                if (event.result) {
                  let resultObj = event.result;
                  // Parse if it's a string
                  if (typeof event.result === "string") {
                    try {
                      resultObj = JSON.parse(event.result);
                    } catch {
                      // Not JSON, treat as text
                      setResult(event.result);
                      setLoading(false);
                      setCurrentTool(null);
                      return;
                    }
                  }
                  setStructuredResult(resultObj);
                  // Extract document text if available
                  if (resultObj.document?.fullText) {
                    setResult(resultObj.document.fullText);
                  }
                }
                setLoading(false);
                setCurrentTool(null);
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

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Actes de Procédure</h1>
        <p className="text-muted-foreground mt-1">
          Rédigez des actes et documents judiciaires
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Button onClick={handleGenerate} disabled={isLoading || !canGenerate}>
          <FileEdit className="h-4 w-4 mr-2" />
          {isLoading ? "Génération en cours..." : "Générer le document"}
        </Button>
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
        <Button variant="outline" onClick={handleDemo}>
          <Wand2 className="h-4 w-4 mr-2" />
          Démo
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
        <div className="lg:max-h-[calc(100vh-16rem)] lg:overflow-y-auto pr-2">
          <ProceduralForm
            documentType={documentType}
            jurisdiction={jurisdiction}
            court={court}
            caseNumber={caseNumber}
            plaintiff={plaintiff}
            defendant={defendant}
            facts={facts}
            claims={claims}
            legalBasis={legalBasis}
            onDocumentTypeChange={setDocumentType}
            onJurisdictionChange={setJurisdiction}
            onCourtChange={setCourt}
            onCaseNumberChange={setCaseNumber}
            onPlaintiffChange={setPlaintiff}
            onDefendantChange={setDefendant}
            onAddFact={addFact}
            onRemoveFact={removeFact}
            onAddClaim={addClaim}
            onRemoveClaim={removeClaim}
            onLegalBasisChange={setLegalBasis}
          />
        </div>
        <div className="lg:sticky lg:top-6">
          <DocumentPreview
            content={result}
            structuredResult={structuredResult}
            isStreaming={isLoading}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
