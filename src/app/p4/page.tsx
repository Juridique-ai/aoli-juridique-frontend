"use client";

import { useState } from "react";
import { useP4Store } from "@/stores/p4-store";
import { CorrespondenceForm } from "@/components/features/p4/correspondence-form";
import { LetterPreview } from "@/components/features/p4/letter-preview";
import { ToolProgress } from "@/components/shared/tool-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileEdit, RotateCcw, HelpCircle, Send, User, Bot, Wand2 } from "lucide-react";
import { endpoints } from "@/lib/api/endpoints";
import { P4_DEMO_DATA } from "@/lib/demo-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// Parse the result to check for clarifications
function parseResult(content: string): { phase: string; clarifyingQuestions?: string[]; letterDraft?: unknown } | null {
  try {
    // Handle markdown code blocks
    let trimmed = content.trim();
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

export default function P4Page() {
  const {
    sender,
    recipient,
    subject,
    context,
    objective,
    tone,
    jurisdiction,
    result,
    isLoading,
    currentTool,
    error,
    conversation,
    clarifyingQuestions,
    setSender,
    setRecipient,
    setSubject,
    setContext,
    setObjective,
    setTone,
    setJurisdiction,
    setResult,
    setLoading,
    setCurrentTool,
    setError,
    addConversation,
    setClarifyingQuestions,
    clearClarifyingQuestions,
    reset,
  } = useP4Store();

  const [clarificationAnswer, setClarificationAnswer] = useState("");

  const canGenerate = sender.name && recipient.name && subject && context && objective;

  const handleDemo = () => {
    setSender(P4_DEMO_DATA.sender);
    setRecipient(P4_DEMO_DATA.recipient);
    setSubject(P4_DEMO_DATA.subject);
    setContext(P4_DEMO_DATA.context);
    setObjective(P4_DEMO_DATA.objective);
    setTone(P4_DEMO_DATA.tone);
    setJurisdiction(P4_DEMO_DATA.jurisdiction);
  };

  const handleGenerate = async (additionalContext?: string) => {
    if (!additionalContext) {
      setResult("");
      // Clear previous conversation when starting fresh
      clearClarifyingQuestions();
    }
    setLoading(true);
    setError(null);

    // Build request with conversation context
    const baseRequest = `Sujet: ${subject}\n\nContexte: ${context}\n\nObjectif: ${objective}`;
    const conversationContext = conversation.map(m => `${m.role === "user" ? "Utilisateur" : "Assistant"}: ${m.content}`).join("\n\n");
    const fullRequest = additionalContext
      ? `${baseRequest}\n\n--- Conversation précédente ---\n${conversationContext}\n\nNouvelle réponse de l'utilisateur: ${additionalContext}`
      : baseRequest;

    try {
      const response = await fetch(`${API_BASE}${endpoints.p4.stream}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-functions-key": API_KEY!,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          request: fullRequest,
          sender,
          recipient,
          context: {
            relationship: "autre",
            priorCommunications: context,
          },
          letterType: "",
          toneLevel: tone === "formal" ? 1 : tone === "firm" ? 3 : 2,
          jurisdiction,
          language: "fr",
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
      let fullContent = "";

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
                  const completedResult = event.result || fullContent;
                  const parsed = parseResult(typeof completedResult === "string" ? completedResult : JSON.stringify(completedResult));

                  if (parsed?.phase === "clarification" && parsed.clarifyingQuestions) {
                    // Store questions and add to conversation
                    setClarifyingQuestions(parsed.clarifyingQuestions);
                    addConversation({
                      role: "assistant",
                      content: parsed.clarifyingQuestions.join("\n"),
                    });
                  } else if (parsed?.letterDraft) {
                    // We have a complete letter
                    setResult(JSON.stringify(parsed.letterDraft, null, 2));
                    clearClarifyingQuestions();
                  } else {
                    // Raw result
                    setResult(typeof completedResult === "string" ? completedResult : JSON.stringify(completedResult, null, 2));
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

      // Handle any remaining content
      if (fullContent) {
        const parsed = parseResult(fullContent);
        if (parsed?.phase === "clarification" && parsed.clarifyingQuestions) {
          setClarifyingQuestions(parsed.clarifyingQuestions);
          addConversation({
            role: "assistant",
            content: parsed.clarifyingQuestions.join("\n"),
          });
        } else if (parsed?.letterDraft) {
          setResult(JSON.stringify(parsed.letterDraft, null, 2));
        } else {
          setResult(fullContent);
        }
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite.");
      setLoading(false);
    }
  };

  const handleClarificationSubmit = () => {
    if (!clarificationAnswer.trim()) return;

    // Add user answer to conversation
    addConversation({
      role: "user",
      content: clarificationAnswer,
    });

    // Clear questions and input
    clearClarifyingQuestions();
    setClarificationAnswer("");

    // Continue with the conversation
    handleGenerate(clarificationAnswer);
  };

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Correspondance Juridique</h1>
        <p className="text-muted-foreground mt-1">
          Rédigez des courriers juridiques professionnels
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Button onClick={() => handleGenerate()} disabled={isLoading || !canGenerate}>
          <FileEdit className="h-4 w-4 mr-2" />
          {isLoading ? "Génération en cours..." : "Générer le courrier"}
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

      {/* Clarification Questions */}
      {clarifyingQuestions.length > 0 && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Questions de clarification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Previous conversation */}
            {conversation.length > 0 && (
              <div className="space-y-3 mb-4 pb-4 border-b">
                {conversation.map((msg, i) => (
                  <div key={i} className="flex gap-2">
                    {msg.role === "user" ? (
                      <User className="h-4 w-4 mt-1 text-muted-foreground" />
                    ) : (
                      <Bot className="h-4 w-4 mt-1 text-primary" />
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Current questions */}
            <div className="space-y-2">
              <p className="text-sm font-medium">L'assistant a besoin de précisions :</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {clarifyingQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>

            {/* Answer input */}
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="Votre réponse..."
                value={clarificationAnswer}
                onChange={(e) => setClarificationAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleClarificationSubmit();
                  }
                }}
                disabled={isLoading}
              />
              <Button onClick={handleClarificationSubmit} disabled={isLoading || !clarificationAnswer.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Split View */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="lg:max-h-[calc(100vh-16rem)] lg:overflow-y-auto pr-2">
          <CorrespondenceForm
            sender={sender}
            recipient={recipient}
            subject={subject}
            context={context}
            objective={objective}
            tone={tone}
            jurisdiction={jurisdiction}
            onSenderChange={setSender}
            onRecipientChange={setRecipient}
            onSubjectChange={setSubject}
            onContextChange={setContext}
            onObjectiveChange={setObjective}
            onToneChange={setTone}
            onJurisdictionChange={setJurisdiction}
          />
        </div>
        <div className="lg:sticky lg:top-6">
          <LetterPreview content={result} isStreaming={isLoading} isLoading={isLoading && !clarifyingQuestions.length} />
        </div>
      </div>
    </div>
  );
}
