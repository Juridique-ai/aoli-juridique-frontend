"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { P3_DEMO_QUESTIONS } from "@/lib/demo-data";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  showDemo?: boolean;
}

const QUICK_SUGGESTIONS = [
  "Quels sont mes droits en cas de licenciement ?",
  "Comment créer une SARL ?",
  "Litige avec un propriétaire",
];

export function ChatInput({ onSend, isLoading, showDemo = false }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleDemo = () => {
    const randomQuestion = P3_DEMO_QUESTIONS[Math.floor(Math.random() * P3_DEMO_QUESTIONS.length)];
    onSend(randomQuestion);
  };

  const handleSuggestion = (suggestion: string) => {
    onSend(suggestion);
  };

  return (
    <div className="space-y-3">
      {/* Quick suggestions - only show when empty and demo mode */}
      {showDemo && !input && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {QUICK_SUGGESTIONS.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestion(suggestion)}
              disabled={isLoading}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full",
                "bg-primary/10 text-primary border border-primary/20",
                "hover:bg-primary/20 hover:border-primary/30",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Main input area */}
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            "relative rounded-2xl transition-all duration-300",
            "bg-muted/50 backdrop-blur-sm",
            "border border-border/50",
            isFocused && "border-primary/50 shadow-lg shadow-primary/5",
            isLoading && "opacity-75"
          )}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Posez votre question juridique..."
            className={cn(
              "min-h-[56px] max-h-[200px] resize-none",
              "bg-transparent border-0 focus-visible:ring-0",
              "pr-14 py-4 px-4",
              "placeholder:text-muted-foreground/60"
            )}
            disabled={isLoading}
          />

          {/* Send button - positioned inside */}
          <Button
            type="submit"
            size="icon"
            className={cn(
              "absolute right-2 bottom-2",
              "h-10 w-10 rounded-xl",
              "transition-all duration-200",
              input.trim() && !isLoading
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-muted text-muted-foreground"
            )}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Envoyer</span>
          </Button>
        </div>

        {/* Character hint */}
        <p className="text-xs text-muted-foreground/60 mt-2 text-center">
          Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
        </p>
      </form>

      {/* Demo button */}
      {showDemo && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDemo}
          disabled={isLoading}
          className={cn(
            "w-full text-muted-foreground",
            "hover:text-primary hover:bg-primary/10",
            "transition-all duration-200"
          )}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Essayer une question démo
        </Button>
      )}
    </div>
  );
}
