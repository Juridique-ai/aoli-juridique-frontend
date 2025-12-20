"use client";

import { useState } from "react";
import { useP5Store } from "@/stores/p5-store";
import { ProceduralForm } from "@/components/features/p5/procedural-form";
import { DocumentPreview } from "@/components/features/p5/document-preview";
import { ToolProgress } from "@/components/shared/tool-progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FileEdit, RotateCcw, Wand2, Send, User, Bot } from "lucide-react";
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
    conversation,
    clarifyingQuestions,
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
    addConversation,
    setClarifyingQuestions,
    clearClarifyingQuestions,
    setLoading,
    setCurrentTool,
    setError,
    reset,
  } = useP5Store();

  const [clarificationInput, setClarificationInput] = useState("");

  const canGenerate = plaintiff.name && defendant.name && court && facts.length > 0;
  const hasClarifications = clarifyingQuestions.length > 0;

  const handleDemo = () => {
    setDocumentType(P5_DEMO_DATA.documentType);
    setJurisdiction(P5_DEMO_DATA.jurisdiction);
    setCourt(P5_DEMO_DATA.caseInfo.court.name);
    setPlaintiff(P5_DEMO_DATA.caseInfo.parties.plaintiff);
    setDefendant(P5_DEMO_DATA.caseInfo.parties.defendant);
    // Add facts
    P5_DEMO_DATA.facts.forEach((fact) => {
      addFact(fact);
    });
    // Add claims
    P5_DEMO_DATA.claims.forEach((claim) => {
      addClaim(claim);
    });
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

  const processStream = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let fullContent = "";
    let isStructuredResponse = false;

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
            // If we have structured JSON that wasn't handled by completed event
            if (isStructuredResponse && fullContent) {
              try {
                const parsed = JSON.parse(fullContent.trim());
                if (parsed.clarifyingQuestions && parsed.clarifyingQuestions.length > 0) {
                  const questionsText = parsed.clarifyingQuestions.join("\n\n");
                  addConversation({ role: "assistant", content: questionsText });
                  setClarifyingQuestions(parsed.clarifyingQuestions);
                  if (parsed.proceduralDocument) {
                    setStructuredResult(parsed.proceduralDocument);
                  }
                } else if (parsed.proceduralDocument) {
                  setStructuredResult(parsed.proceduralDocument);
                  if (parsed.proceduralDocument.document && typeof parsed.proceduralDocument.document === "string") {
                    setResult(parsed.proceduralDocument.document);
                  }
                }
              } catch {
                // Not valid JSON, ignore
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
                if (event.content) {
                  fullContent += event.content;
                  // Check if this looks like JSON (structured response)
                  const trimmed = fullContent.trim();
                  if (trimmed.startsWith("{")) {
                    isStructuredResponse = true;
                    // Don't update result - will be handled by completed event
                  } else {
                    // Regular text content - show it
                    setResult(fullContent);
                  }
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
                setLoading(false);
                return;

              case "completed":
                // Handle clarification or final result
                if (event.result) {
                  // If result is a string, try to parse it as JSON first
                  let resultObj = event.result;
                  if (typeof event.result === "string") {
                    try {
                      const trimmed = event.result.trim();
                      if (trimmed.startsWith("{")) {
                        resultObj = JSON.parse(trimmed);
                      } else {
                        // Plain text result (not JSON)
                        setResult(event.result);
                        setLoading(false);
                        setCurrentTool(null);
                        return;
                      }
                    } catch {
                      // Not valid JSON, treat as plain text
                      setResult(event.result);
                      setLoading(false);
                      setCurrentTool(null);
                      return;
                    }
                  }

                  // Now handle the parsed object
                  if (resultObj.clarifyingQuestions && resultObj.clarifyingQuestions.length > 0) {
                    // It's a clarification phase
                    const questionsText = resultObj.clarifyingQuestions.join("\n\n");
                    addConversation({
                      role: "assistant",
                      content: questionsText,
                    });
                    setClarifyingQuestions(resultObj.clarifyingQuestions);
                    // Store partial document if available
                    if (resultObj.proceduralDocument) {
                      setStructuredResult(resultObj.proceduralDocument);
                    }
                  } else if (resultObj.proceduralDocument) {
                    // Final document received
                    setStructuredResult(resultObj.proceduralDocument);
                    // Check for document text
                    const docText = resultObj.proceduralDocument.document;
                    if (docText && typeof docText === "string" && docText.trim().length > 0) {
                      setResult(docText);
                    } else if (docText && docText.fullText && typeof docText.fullText === "string") {
                      setResult(docText.fullText);
                    }
                    clearClarifyingQuestions();
                  } else if (resultObj.document && typeof resultObj.document === "string") {
                    setResult(resultObj.document);
                    setStructuredResult(resultObj);
                  }
                  // Don't set raw JSON as result - let structured preview handle it
                }
                setLoading(false);
                setCurrentTool(null);
                return;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    setLoading(false);
  };

  const handleGenerate = async () => {
    setResult("");
    setStructuredResult(null);
    setLoading(true);
    setError(null);

    try {
      const requestText = buildRequestText();

      const response = await fetch(`${API_BASE}${endpoints.p5.stream}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-functions-key": API_KEY!,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          request: requestText,
          documentType,
          jurisdiction,
          court,
          caseNumber: caseNumber || undefined,
          parties: {
            plaintiff,
            defendant,
          },
          facts,
          claims,
          legalBasis,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      await processStream(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite.");
      setLoading(false);
    }
  };

  const handleClarificationSubmit = async () => {
    if (!clarificationInput.trim()) return;

    const userMessage = clarificationInput.trim();
    addConversation({ role: "user", content: userMessage });
    setClarificationInput("");
    clearClarifyingQuestions();
    setLoading(true);
    setError(null);

    try {
      // Build conversation history for context
      const conversationHistory = conversation.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      conversationHistory.push({ role: "user", content: userMessage });

      const requestText = buildRequestText() + "\n\nRÉPONSES AUX QUESTIONS:\n" + userMessage;

      const response = await fetch(`${API_BASE}${endpoints.p5.stream}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-functions-key": API_KEY!,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          request: requestText,
          documentType,
          jurisdiction,
          court,
          caseNumber: caseNumber || undefined,
          parties: {
            plaintiff,
            defendant,
          },
          facts,
          claims,
          legalBasis,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      await processStream(response);
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

          {/* Clarification Chat Section */}
          {(conversation.length > 0 || hasClarifications) && (
            <Card className="mt-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Questions de clarification</h3>

                {/* Conversation History */}
                <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                  {conversation.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Clarification Input */}
                {hasClarifications && (
                  <div className="flex gap-2">
                    <Textarea
                      value={clarificationInput}
                      onChange={(e) => setClarificationInput(e.target.value)}
                      placeholder="Répondez aux questions..."
                      className="min-h-[80px]"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleClarificationSubmit}
                      disabled={isLoading || !clarificationInput.trim()}
                      className="self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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
