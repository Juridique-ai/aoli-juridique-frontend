"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, HelpCircle, FileText, Scale } from "lucide-react";

interface SuggestionChipsProps {
  onSelect: (suggestion: string) => void;
  context?: "general" | "follow-up" | "action";
  disabled?: boolean;
}

const FOLLOW_UP_SUGGESTIONS = [
  { text: "Pouvez-vous préciser ?", icon: HelpCircle },
  { text: "Quelles sont les démarches ?", icon: ArrowRight },
  { text: "Quels documents dois-je préparer ?", icon: FileText },
  { text: "Quels sont les délais ?", icon: Scale },
];

const GENERAL_SUGGESTIONS = [
  "Expliquez en termes simples",
  "Quels sont les risques ?",
  "Que me conseillez-vous ?",
  "Y a-t-il des exceptions ?",
];

export function SuggestionChips({
  onSelect,
  context = "follow-up",
  disabled = false
}: SuggestionChipsProps) {
  const suggestions = context === "follow-up" ? FOLLOW_UP_SUGGESTIONS : GENERAL_SUGGESTIONS;

  return (
    <div className="flex flex-wrap gap-2 mt-3 animate-fade-in">
      {context === "follow-up" ? (
        // Icon-based chips for follow-ups
        FOLLOW_UP_SUGGESTIONS.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(suggestion.text)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5",
                "text-xs rounded-full",
                "bg-muted/50 text-muted-foreground",
                "border border-border/50",
                "hover:bg-primary/10 hover:text-primary hover:border-primary/30",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Icon className="h-3 w-3" />
              <span>{suggestion.text}</span>
            </button>
          );
        })
      ) : (
        // Text-only chips for general suggestions
        GENERAL_SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(suggestion)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full",
              "bg-muted/50 text-muted-foreground",
              "border border-border/50",
              "hover:bg-primary/10 hover:text-primary hover:border-primary/30",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {suggestion}
          </button>
        ))
      )}
    </div>
  );
}
