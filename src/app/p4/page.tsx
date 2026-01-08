"use client";

import { useState, useEffect } from "react";
import { useP4Store, type P4Phase } from "@/stores/p4-store";
import { useUserProfileStore, formatFullAddress } from "@/stores/user-profile-store";
import { TemplatesGallery, CorrespondenceForm, LetterPreview, ProgressiveResult } from "@/components/features/p4";
import { ToolProgress } from "@/components/shared/tool-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileEdit,
  RotateCcw,
  HelpCircle,
  Send,
  User,
  Bot,
  Mail,
  Sparkles,
  LayoutGrid,
  FileText,
  ArrowLeft,
  UserCheck,
} from "lucide-react";
import { endpoints } from "@/lib/api/endpoints";
import { P4_DEMO_DATA } from "@/lib/demo-data";
import { cn, isDevEnvironment } from "@/lib/utils";
import { toast } from "sonner";

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
  const [view, setView] = useState<"templates" | "form">("templates");
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");

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
    progressMessage,
    error,
    phaseResults,
    completedPhases,
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
    setProgressMessage,
    setError,
    setPhaseResult,
    setCurrentPhase,
    addConversation,
    setClarifyingQuestions,
    clearClarifyingQuestions,
    reset,
  } = useP4Store();

  const { profile, isLoaded: profileLoaded } = useUserProfileStore();

  const [clarificationAnswer, setClarificationAnswer] = useState("");

  const canGenerate = sender.name && recipient.name && subject && context && objective;

  // Check if user has profile info
  const hasProfileInfo = profileLoaded && profile.fullName && profile.address;

  // Auto-fill sender from profile when switching to form view
  const fillSenderFromProfile = () => {
    if (!profile.fullName) {
      toast.error("Veuillez d'abord remplir votre profil");
      return;
    }
    const fullAddress = formatFullAddress(profile);
    const displayName = profile.company
      ? `${profile.fullName} (${profile.company})`
      : profile.fullName;
    setSender({
      name: displayName,
      address: fullAddress,
      role: profile.role,
    });
    toast.success("Expéditeur pré-rempli depuis votre profil");
  };

  // Auto-fill sender when entering form view if sender is empty and profile exists
  useEffect(() => {
    if (view === "form" && profileLoaded && !sender.name && profile.fullName) {
      const fullAddress = formatFullAddress(profile);
      const displayName = profile.company
        ? `${profile.fullName} (${profile.company})`
        : profile.fullName;
      setSender({
        name: displayName,
        address: fullAddress,
        role: profile.role,
      });
    }
  }, [view, profileLoaded, sender.name, profile, setSender]);

  const handleTemplateSelect = (prefill: { subject: string; context: string; objective: string; tone: "formal" | "firm" | "conciliatory" }) => {
    setSubject(prefill.subject);
    setContext(prefill.context);
    setObjective(prefill.objective);
    setTone(prefill.tone);
    setView("form");
  };

  const handleDemo = () => {
    setSender(P4_DEMO_DATA.sender);
    setRecipient(P4_DEMO_DATA.recipient);
    setSubject(P4_DEMO_DATA.subject);
    setContext(P4_DEMO_DATA.context);
    setObjective(P4_DEMO_DATA.objective);
    setTone(P4_DEMO_DATA.tone);
    setJurisdiction(P4_DEMO_DATA.jurisdiction);
    setView("form");
  };

  const handleReset = () => {
    reset();
    setView("templates");
    setMobileTab("form");
  };

  const handleGenerate = async (additionalContext?: string) => {
    if (!additionalContext) {
      setResult("");
      // Clear previous conversation when starting fresh
      clearClarifyingQuestions();
    }
    setLoading(true);
    setError(null);
    setCurrentPhase(null);
    setMobileTab("preview");

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
              setCurrentPhase(null);
              return;
            }

            try {
              const event = JSON.parse(data);

              switch (event.type) {
                case "started":
                  console.log("[P4] Agent started:", event.message);
                  setProgressMessage(event.message || "Démarrage de la génération...");
                  break;

                case "progress":
                  console.log("[P4] Progress:", event.phase, event.message);
                  setProgressMessage(event.message || "Traitement en cours...");
                  // Set current phase from progress event
                  if (event.phase && event.phase !== "init") {
                    setCurrentPhase(event.phase as P4Phase);
                  }
                  break;

                case "content":
                  // Handle phase content from parallel workflow
                  if (event.phase && event.status === "completed" && event.content) {
                    console.log("[P4] Phase completed:", event.phase, event.content);
                    setPhaseResult(event.phase as P4Phase, event.content);
                    setCurrentPhase(null);
                  } else if (event.content && typeof event.content === "string") {
                    // Legacy streaming content
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
                  setCurrentPhase(null);
                  return;

                case "completed":
                  console.log("[P4] Completed event:", event);
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
                    // Raw result (new parallel workflow format)
                    const resultData = typeof completedResult === "string"
                      ? completedResult
                      : JSON.stringify(completedResult, null, 2);
                    setResult(resultData);
                  }
                  setLoading(false);
                  setCurrentTool(null);
                  setCurrentPhase(null);
                  setProgressMessage(null);
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
      setCurrentPhase(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite.");
      setLoading(false);
      setCurrentPhase(null);
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

  // Template selection view
  if (view === "templates") {
    return (
      <div className="container py-8 max-w-4xl animate-fade-in">
        {/* Page Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
              <div className="relative p-3 rounded-xl bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Correspondance Juridique</h1>
              <p className="text-muted-foreground mt-1">
                Rédigez des courriers juridiques professionnels
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

        <TemplatesGallery onSelectTemplate={handleTemplateSelect} />

        {/* Skip templates option */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => setView("form")}
            className="text-muted-foreground hover:text-foreground"
          >
            <FileEdit className="h-4 w-4 mr-2" />
            Ou commencer de zéro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
            <div className="relative p-3 rounded-xl bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Correspondance Juridique</h1>
            <p className="text-muted-foreground mt-1">
              Rédigez des courriers juridiques professionnels
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView("templates")}
            className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Modèles
          </Button>
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

      {/* Controls */}
      <div className={cn(
        "flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl",
        "bg-muted/30 border border-border/50"
      )}>
        <Button
          onClick={() => handleGenerate()}
          disabled={isLoading || !canGenerate}
          className="shadow-lg shadow-primary/20"
        >
          <FileEdit className="h-4 w-4 mr-2" />
          {isLoading ? "Génération en cours..." : "Générer le courrier"}
        </Button>

        {hasProfileInfo && !sender.name && (
          <Button
            variant="outline"
            onClick={fillSenderFromProfile}
            className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Utiliser mon profil
          </Button>
        )}

        {!canGenerate && (
          <p className="text-sm text-muted-foreground">
            Remplissez l'expéditeur, le destinataire, l'objet, le contexte et l'objectif
          </p>
        )}
      </div>

      {/* Tool Progress - Show only when not displaying progressive results */}
      {(currentTool || progressMessage) && completedPhases.length === 0 && (
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

      {/* Clarification Questions */}
      {clarifyingQuestions.length > 0 && (
        <Card className="mb-6 border-primary/30 bg-primary/5 backdrop-blur-sm animate-slide-up">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Questions de clarification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Previous conversation */}
            {conversation.length > 0 && (
              <div className="space-y-3 mb-4 pb-4 border-b border-border/50">
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
                className="bg-background/50"
              />
              <Button
                onClick={handleClarificationSubmit}
                disabled={isLoading || !clarificationAnswer.trim()}
                className="shadow-lg shadow-primary/20"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden mb-4">
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
          <button
            type="button"
            onClick={() => setMobileTab("form")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              mobileTab === "form"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="h-4 w-4" />
            Formulaire
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all relative",
              mobileTab === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Mail className="h-4 w-4" />
            Aperçu
            {result && mobileTab === "form" && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop: Split View */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
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
        <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-16rem)] lg:overflow-y-auto">
          {completedPhases.length > 0 || isLoading ? (
            <ProgressiveResult results={phaseResults} isStreaming={isLoading} />
          ) : (
            <LetterPreview content={result} isStreaming={isLoading} isLoading={isLoading && !clarifyingQuestions.length} />
          )}
        </div>
      </div>

      {/* Mobile: Single Panel */}
      <div className="lg:hidden">
        {mobileTab === "form" ? (
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
        ) : completedPhases.length > 0 || isLoading ? (
          <ProgressiveResult results={phaseResults} isStreaming={isLoading} />
        ) : (
          <LetterPreview content={result} isStreaming={isLoading} isLoading={isLoading && !clarifyingQuestions.length} />
        )}
      </div>
    </div>
  );
}
