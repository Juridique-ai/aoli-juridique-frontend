"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Wand2 } from "lucide-react";
import { P3_DEMO_QUESTIONS } from "@/lib/demo-data";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  showDemo?: boolean;
}

export function ChatInput({ onSend, isLoading, showDemo = false }: ChatInputProps) {
  const [input, setInput] = useState("");

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

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question juridique..."
          className="min-h-[60px] max-h-[200px] resize-none"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="h-[60px] w-[60px] flex-shrink-0"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span className="sr-only">Envoyer</span>
        </Button>
      </form>
      {showDemo && (
        <Button variant="outline" size="sm" onClick={handleDemo} disabled={isLoading} className="w-full">
          <Wand2 className="h-4 w-4 mr-2" />
          Question démo aléatoire
        </Button>
      )}
    </div>
  );
}
