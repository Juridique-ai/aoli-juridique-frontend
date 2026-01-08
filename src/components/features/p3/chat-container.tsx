"use client";

import { useRef, useEffect, useCallback } from "react";
import { useP3Store } from "@/stores/p3-store";
import { useUserProfileStore } from "@/stores/user-profile-store";
import { endpoints } from "@/lib/api/endpoints";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ChatOnboarding } from "./chat-onboarding";
import { ClarificationCard } from "./clarification-card";
import { ToolProgress } from "@/components/shared/tool-progress";
import { TypingIndicator } from "@/components/shared/typing-indicator";
import { JurisdictionSelect } from "@/components/shared/jurisdiction-select";
import { Button } from "@/components/ui/button";
import { Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Clarification, ClarificationAnswers } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// Try to parse JSON from content (handles markdown code blocks and mixed text+JSON)
function tryParseJSON(content: string): Record<string, unknown> | null {
  if (!content) return null;
  try {
    let trimmed = content.trim();

    // Handle markdown code blocks: ```json ... ``` or ``` ... ```
    if (trimmed.startsWith("```")) {
      const lines = trimmed.split("\n");
      // Remove first line (```json or ```)
      lines.shift();
      // Remove last line if it's closing ```
      if (lines[lines.length - 1]?.trim() === "```") {
        lines.pop();
      }
      trimmed = lines.join("\n").trim();
    }

    // Direct JSON
    if (trimmed.startsWith("{")) {
      return JSON.parse(trimmed);
    }

    // Look for JSON object anywhere in the content (text + JSON case)
    const jsonMatch = content.match(/\{[\s\S]*"legalOpinion"[\s\S]*\}$/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Not valid JSON
  }
  return null;
}

// Try to extract clarification from JSON response
function extractClarification(content: string): Clarification | null {
  try {
    // Trim whitespace and try to parse
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

    const parsed = JSON.parse(trimmed);

    // New format: { title, questions_json } where questions_json is a string
    if (parsed.title && parsed.questions_json) {
      const questions = typeof parsed.questions_json === "string"
        ? JSON.parse(parsed.questions_json)
        : parsed.questions_json;
      return {
        title: parsed.title,
        questions,
      } as Clarification;
    }

    // Direct format: { title, questions }
    if (parsed.title && parsed.questions) {
      return parsed as Clarification;
    }

    // Legacy format: { phase: "clarification", clarification: { ... } }
    if (parsed.phase === "clarification" && parsed.clarification?.questions) {
      return parsed.clarification as Clarification;
    }
  } catch (e) {
    // Try to find JSON in the content (in case there's text before/after)
    const jsonMatch = content.match(/\{[\s\S]*"(questions_json|questions)"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.title && parsed.questions_json) {
          const questions = typeof parsed.questions_json === "string"
            ? JSON.parse(parsed.questions_json)
            : parsed.questions_json;
          return { title: parsed.title, questions } as Clarification;
        }
        if (parsed.title && parsed.questions) {
          return parsed as Clarification;
        }
        if (parsed.clarification?.questions) {
          return parsed.clarification as Clarification;
        }
      } catch {
        // Still not valid JSON
      }
    }
  }
  return null;
}

// Format legal opinion from tool-based structured data
interface LegalOpinionEvent {
  // camelCase (frontend standard)
  factsSummary?: string;
  analysisSummary?: string;
  applicableLaws?: Array<{ name: string; articles: string[]; relevance: string }>;
  riskLevel?: string;
  riskDetails?: string;
  options?: Array<{ option: string; description: string; pros: string[]; cons: string[]; successProbability: string }>;
  recommendedOption?: string;
  recommendationRationale?: string;
  immediateActions?: string[];
  disclaimer?: string;
  // snake_case (backend format)
  facts_summary?: string;
  analysis_summary?: string;
  applicable_laws?: string | Array<{ name: string; articles: string[]; relevance: string }>;
  risk_level?: string;
  risk_details?: string;
  options_json?: string | Array<{ option: string; description: string; pros: string[]; cons: string[]; successProbability: string }>;
  recommended_option?: string;
  recommendation_rationale?: string;
  immediate_actions?: string | string[];
}

function formatLegalOpinionFromTool(opinion: LegalOpinionEvent): string {
  const parts: string[] = [];

  // Helper to parse JSON strings
  const parseIfString = <T,>(val: string | T | undefined): T | undefined => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val) as T;
      } catch {
        return undefined;
      }
    }
    return val as T | undefined;
  };

  // Support both camelCase and snake_case
  const factsSummary = opinion.factsSummary || opinion.facts_summary;
  const analysisSummary = opinion.analysisSummary || opinion.analysis_summary;
  const riskLevel = opinion.riskLevel || opinion.risk_level;
  const riskDetails = opinion.riskDetails || opinion.risk_details;
  const recommendedOption = opinion.recommendedOption || opinion.recommended_option;
  const recommendationRationale = opinion.recommendationRationale || opinion.recommendation_rationale;

  // Parse arrays that might be JSON strings
  const applicableLaws = parseIfString(opinion.applicableLaws) || parseIfString(opinion.applicable_laws);
  const options = parseIfString(opinion.options) || parseIfString(opinion.options_json);
  const immediateActions = parseIfString(opinion.immediateActions) || parseIfString(opinion.immediate_actions);

  if (factsSummary) {
    parts.push(`## Résumé des faits\n${factsSummary}`);
  }

  if (analysisSummary) {
    parts.push(`## Analyse juridique\n${analysisSummary}`);
  }

  if (applicableLaws && Array.isArray(applicableLaws) && applicableLaws.length > 0) {
    const laws = applicableLaws
      .map((law) => `- **${law.name}** (${law.articles.join(", ")}): ${law.relevance}`)
      .join("\n");
    parts.push(`## Cadre juridique\n${laws}`);
  }

  if (riskLevel) {
    const riskEmoji = riskLevel === "high" ? "🔴" : riskLevel === "medium" ? "🟠" : "🟢";
    parts.push(`## Évaluation des risques\n${riskEmoji} **Niveau: ${riskLevel}**\n\n${riskDetails || ""}`);
  }

  if (options && Array.isArray(options) && options.length > 0) {
    const optionsText = options
      .map((opt) => {
        const pros = opt.pros?.map((p: string) => `  - ✅ ${p}`).join("\n") || "";
        const cons = opt.cons?.map((c: string) => `  - ❌ ${c}`).join("\n") || "";
        return `### ${opt.option}\n${opt.description}\n\n**Avantages:**\n${pros}\n\n**Inconvénients:**\n${cons}\n\n*Probabilité de succès: ${opt.successProbability}*`;
      })
      .join("\n\n");
    parts.push(`## Options\n${optionsText}`);
  }

  if (recommendedOption) {
    parts.push(`## Recommandation\n**${recommendedOption}**\n\n${recommendationRationale || ""}`);
  }

  if (immediateActions && Array.isArray(immediateActions) && immediateActions.length > 0) {
    const actions = immediateActions.map((a) => `- ${a}`).join("\n");
    parts.push(`## Actions immédiates\n${actions}`);
  }

  if (opinion.disclaimer) {
    parts.push(`\n---\n*${opinion.disclaimer}*`);
  }

  return parts.join("\n\n") || "Analyse complétée.";
}

// Format any structured JSON response into readable markdown
function formatStructuredResponse(data: Record<string, unknown>): string | null {
  // Check for legal opinion structure (from submit_legal_opinion tool)
  // Support both camelCase and snake_case
  if (data.factsSummary || data.analysisSummary || data.legalOpinion ||
      data.facts_summary || data.analysis_summary) {
    if (data.legalOpinion) {
      return formatLegalOpinion(data.legalOpinion as Record<string, unknown>);
    }
    return formatLegalOpinionFromTool(data as LegalOpinionEvent);
  }

  // Check for clarification (should be handled separately)
  if (data.phase === "clarification") {
    return null; // Let clarification handler deal with it
  }

  // Generic structured response - try to extract meaningful content
  if (data.result && typeof data.result === "string") {
    return data.result;
  }
  if (data.message && typeof data.message === "string") {
    return data.message;
  }
  if (data.analysis && typeof data.analysis === "object") {
    const analysis = data.analysis as Record<string, unknown>;
    if (analysis.summary) {
      return `## Analyse\n${analysis.summary}`;
    }
  }

  // Return null if we can't format it meaningfully
  return null;
}

// Legacy: Format legal opinion JSON into readable markdown (for old JSON responses)
function formatLegalOpinion(opinion: Record<string, unknown>): string {
  const parts: string[] = [];

  if (opinion.factsSummary) {
    parts.push(`## Résumé des faits\n${opinion.factsSummary}`);
  }

  const analysis = opinion.analysis as Record<string, unknown> | undefined;
  if (analysis?.summary) {
    parts.push(`## Analyse\n${analysis.summary}`);
  }

  const recommendation = opinion.recommendation as Record<string, unknown> | undefined;
  if (recommendation?.preferredOption) {
    parts.push(`## Recommandation\n**${recommendation.preferredOption}**\n\n${recommendation.rationale || ""}`);
  }

  const actionPlan = opinion.actionPlan as Record<string, unknown> | undefined;
  if (actionPlan?.immediateActions) {
    const actions = actionPlan.immediateActions as string[];
    parts.push(`## Actions à prendre\n${actions.map((a) => `- ${a}`).join("\n")}`);
  }

  if (opinion.disclaimer) {
    parts.push(`\n---\n*${opinion.disclaimer}*`);
  }

  return parts.join("\n\n") || "Analyse complétée.";
}

// Format clarification answers as a readable message
function formatAnswersAsMessage(
  clarification: Clarification,
  answers: ClarificationAnswers
): string {
  const parts: string[] = [];

  for (const question of clarification.questions) {
    const answer = answers[question.id];
    if (!answer) continue;

    let answerText: string;

    if (Array.isArray(answer)) {
      // Multi-choice: find labels for selected options
      const labels = answer.map((id) => {
        if (id.startsWith("__other:")) {
          return id.replace("__other:", "");
        }
        const option = question.options?.find((o) => o.id === id);
        return option?.label || id;
      });
      answerText = labels.join(", ");
    } else if (question.type === "amount") {
      answerText = `${answer}€`;
    } else {
      // Single choice or text: find label or use value
      const option = question.options?.find((o) => o.id === answer);
      answerText = option?.label || answer;
    }

    parts.push(`**${question.question}** ${answerText}`);
  }

  return parts.join("\n");
}

export function ChatContainer() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isLoading,
    jurisdiction,
    currentTool,
    progressMessage,
    addMessage,
    updateMessage,
    setClarification,
    setStreaming,
    setLoading,
    setJurisdiction,
    setCurrentTool,
    setProgressMessage,
    clearChat,
  } = useP3Store();
  const { profile } = useUserProfileStore();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (message: string) => {
    // Build conversation history from existing messages (before adding new ones)
    const conversationHistory = messages
      .filter((msg) => !msg.isStreaming && msg.content) // Only completed messages with content
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Add user message
    addMessage({ role: "user", content: message });

    // Add placeholder for assistant
    const assistantId = addMessage({
      role: "assistant",
      content: "",
      isStreaming: true,
    });

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}${endpoints.p3.stream}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-functions-key": API_KEY!,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message,
          jurisdiction,
          conversationHistory: conversationHistory.length > 0 ? conversationHistory : undefined,
          // User context from profile for personalized advice
          userContext: profile.fullName ? {
            name: profile.fullName,
            role: profile.role || undefined,
            company: profile.company || undefined,
            city: profile.city || undefined,
          } : undefined,
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
      let isStructuredResponse = false; // Don't show JSON responses while streaming

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
              // Check if the response is a clarification
              const clarification = extractClarification(fullContent);
              if (clarification) {
                setClarification(assistantId, clarification);
                updateMessage(assistantId, ""); // Clear any content
              } else if (isStructuredResponse) {
                // Not a clarification but was JSON - try to extract meaningful content
                const parsed = tryParseJSON(fullContent);
                if (parsed?.legalOpinion) {
                  updateMessage(assistantId, formatLegalOpinion(parsed.legalOpinion as Record<string, unknown>));
                } else if (parsed) {
                  // Some other JSON structure
                  updateMessage(assistantId, (parsed.message || parsed.result || "Analyse complétée.") as string);
                }
              }
              setStreaming(assistantId, false);
              setCurrentTool(null);
              setLoading(false);
              return;
            }

            try {
              const event = JSON.parse(data);

              switch (event.type) {
                case "started":
                  console.log("[P3] Agent started:", event.message);
                  setProgressMessage(event.message || "Démarrage de l'analyse...");
                  break;

                case "progress":
                  console.log("[P3] Progress:", event.message);
                  setProgressMessage(event.message || "Traitement en cours...");
                  break;

                case "content":
                  if (event.content) {
                    fullContent += event.content;

                    // Check if this looks like JSON (structured response)
                    const trimmed = fullContent.trim();
                    if (trimmed.startsWith("{") || trimmed.startsWith("```")) {
                      isStructuredResponse = true;
                      // Try to parse and format JSON for display
                      const parsed = tryParseJSON(fullContent);
                      if (parsed) {
                        // Format structured response for display
                        const formatted = formatStructuredResponse(parsed);
                        if (formatted) {
                          updateMessage(assistantId, formatted);
                        }
                      }
                    } else {
                      // Regular text content - show it
                      updateMessage(assistantId, fullContent);
                    }
                  }
                  break;

                case "clarification":
                  // Direct clarification event from backend
                  console.log("[P3] Received clarification event:", event);
                  if (event.title && event.questions) {
                    console.log("[P3] Setting clarification with", event.questions.length, "questions");
                    setClarification(assistantId, {
                      title: event.title,
                      questions: event.questions,
                    });
                    updateMessage(assistantId, "");
                    setStreaming(assistantId, false);
                    setCurrentTool(null);
                    setLoading(false);
                    return;
                  } else {
                    console.log("[P3] Clarification event missing title or questions");
                  }
                  break;

                case "legal_opinion":
                  // Direct legal opinion event from backend (tool-based)
                  console.log("[P3] Received legal_opinion event:", event);
                  const formattedOpinion = formatLegalOpinionFromTool(event as LegalOpinionEvent);
                  updateMessage(assistantId, formattedOpinion);
                  setStreaming(assistantId, false);
                  setCurrentTool(null);
                  setLoading(false);
                  return;

                case "tool_call":
                  if (event.tool) {
                    setCurrentTool(event.tool);
                  }
                  break;

                case "tool_result":
                  setCurrentTool(null);
                  break;

                case "error":
                  updateMessage(assistantId, event.error || "Une erreur s'est produite.");
                  setStreaming(assistantId, false);
                  setLoading(false);
                  return;

                case "completed":
                  // Use event.result if available (backend sends full result here)
                  const completedContent = (event.result || fullContent) as string;

                  // Check if the response is a clarification
                  const completedClarification = extractClarification(completedContent);
                  if (completedClarification) {
                    setClarification(assistantId, completedClarification);
                    updateMessage(assistantId, "");
                  } else {
                    // Try to parse as structured JSON response
                    const parsed = tryParseJSON(completedContent);
                    if (parsed) {
                      // Try to format the structured response
                      const formatted = formatStructuredResponse(parsed);
                      if (formatted) {
                        updateMessage(assistantId, formatted);
                      } else if (parsed.legalOpinion) {
                        updateMessage(assistantId, formatLegalOpinion(parsed.legalOpinion as Record<string, unknown>));
                      } else {
                        // Fallback: try to get any displayable content
                        const fallback = (parsed.message || parsed.result || completedContent) as string;
                        updateMessage(assistantId, fallback);
                      }
                    } else if (completedContent && !completedContent.trim().startsWith("{")) {
                      // Plain text response
                      updateMessage(assistantId, completedContent);
                    } else {
                      // Raw JSON that couldn't be parsed - show as is
                      updateMessage(assistantId, completedContent || "Analyse complétée.");
                    }
                  }
                  setStreaming(assistantId, false);
                  setCurrentTool(null);
                  setProgressMessage(null);
                  setLoading(false);
                  return;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Final check for clarification or structured response
      const finalClarification = extractClarification(fullContent);
      if (finalClarification) {
        setClarification(assistantId, finalClarification);
        updateMessage(assistantId, "");
      } else if (isStructuredResponse) {
        const parsed = tryParseJSON(fullContent);
        if (parsed?.legalOpinion) {
          updateMessage(assistantId, formatLegalOpinion(parsed.legalOpinion as Record<string, unknown>));
        } else if (parsed) {
          updateMessage(assistantId, (parsed.message || parsed.result || "Analyse complétée.") as string);
        }
      }
      setStreaming(assistantId, false);
      setLoading(false);
    } catch (error) {
      updateMessage(
        assistantId,
        "Une erreur s'est produite. Veuillez réessayer."
      );
      setStreaming(assistantId, false);
      setLoading(false);
    }
  };

  const handleClarificationSubmit = (
    messageId: string,
    clarification: Clarification,
    answers: ClarificationAnswers
  ) => {
    // Clear the clarification from the message
    setClarification(messageId, undefined);

    // Format answers as a user message
    const formattedAnswers = formatAnswersAsMessage(clarification, answers);

    // Send the formatted answers as a new message
    handleSend(formattedAnswers);
  };

  // Find the last message with clarification (if any)
  const lastClarificationMessage = [...messages]
    .reverse()
    .find((m) => m.clarification && !m.isStreaming);

  // Check if we should show typing indicator (loading but no streaming message yet)
  const showTypingIndicator = isLoading && !messages.some(m => m.isStreaming && m.content);

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)]">
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between pb-4",
        "border-b border-border/50"
      )}>
        <JurisdictionSelect value={jurisdiction} onChange={setJurisdiction} />
        <Button
          variant="ghost"
          size="sm"
          onClick={clearChat}
          disabled={messages.length === 0}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Effacer
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 scroll-smooth">
        {messages.length === 0 ? (
          <ChatOnboarding onSelectQuestion={handleSend} />
        ) : (
          <>
            {messages.map((msg, index) => {
              // Find if this is the last assistant message (for showing suggestions)
              const assistantMessages = messages.filter(m => m.role === "assistant" && !m.isStreaming && m.content);
              const isLastAssistant = Boolean(
                msg.role === "assistant" &&
                !msg.isStreaming &&
                msg.content &&
                assistantMessages[assistantMessages.length - 1]?.id === msg.id
              );

              return (
                <div key={msg.id} className="animate-fade-in">
                  {/* Show message content if not a clarification-only message */}
                  {(msg.content || msg.isStreaming) && (
                    <ChatMessage
                      message={msg}
                      isLastAssistantMessage={isLastAssistant}
                      onSuggestionSelect={handleSend}
                      isLoading={isLoading}
                    />
                  )}
                  {/* Show clarification card if present */}
                  {msg.clarification && !msg.isStreaming && (
                    <div className="mb-4 ml-12 animate-slide-up">
                      <ClarificationCard
                        clarification={msg.clarification}
                        onSubmit={(answers) =>
                          handleClarificationSubmit(msg.id, msg.clarification!, answers)
                        }
                        disabled={isLoading || msg.id !== lastClarificationMessage?.id}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing indicator */}
            {showTypingIndicator && <TypingIndicator className="animate-fade-in" />}
          </>
        )}
        {(currentTool || progressMessage) && (
          <div className="animate-fade-in">
            <ToolProgress tool={currentTool} message={progressMessage} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - hide when there's an active clarification */}
      <div className={cn(
        "pt-4",
        "border-t border-border/50"
      )}>
        {lastClarificationMessage ? (
          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-muted/30 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <p className="text-sm">
              Veuillez répondre aux questions ci-dessus pour continuer
            </p>
          </div>
        ) : (
          <ChatInput onSend={handleSend} isLoading={isLoading} showDemo={messages.length === 0} />
        )}
      </div>
    </div>
  );
}
