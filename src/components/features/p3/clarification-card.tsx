"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { HelpCircle, Send } from "lucide-react";
import type {
  Clarification,
  ClarificationQuestion,
  ClarificationAnswers,
} from "@/types";

interface ClarificationCardProps {
  clarification: Clarification;
  onSubmit: (answers: ClarificationAnswers) => void;
  disabled?: boolean;
}

export function ClarificationCard({
  clarification,
  onSubmit,
  disabled = false,
}: ClarificationCardProps) {
  const [answers, setAnswers] = useState<ClarificationAnswers>({});
  const [otherValues, setOtherValues] = useState<Record<string, string>>({});
  const [showOther, setShowOther] = useState<Record<string, boolean>>({});

  const handleSingleChoice = (questionId: string, optionId: string) => {
    if (optionId === "__other__") {
      setShowOther((prev) => ({ ...prev, [questionId]: true }));
      setAnswers((prev) => ({ ...prev, [questionId]: "" }));
    } else {
      setShowOther((prev) => ({ ...prev, [questionId]: false }));
      setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    }
  };

  const handleMultiChoice = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      if (optionId === "__other__") {
        setShowOther((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
        return prev;
      }
      if (current.includes(optionId)) {
        return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
      } else {
        return { ...prev, [questionId]: [...current, optionId] };
      }
    });
  };

  const handleOtherChange = (questionId: string, value: string) => {
    setOtherValues((prev) => ({ ...prev, [questionId]: value }));
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const isComplete = () => {
    return clarification.questions.every((q) => {
      const answer = answers[q.id];
      if (q.type === "multi_choice") {
        return Array.isArray(answer) && answer.length > 0;
      }
      return answer && answer.toString().trim() !== "";
    });
  };

  const handleSubmit = () => {
    if (isComplete()) {
      onSubmit(answers);
    }
  };

  const renderQuestion = (question: ClarificationQuestion) => {
    const selectedValue = answers[question.id];

    switch (question.type) {
      case "single_choice":
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {question.options?.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSingleChoice(question.id, option.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    "border border-border hover:border-primary hover:bg-primary/5",
                    selectedValue === option.id &&
                      "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                  )}
                >
                  {option.label}
                </button>
              ))}
              {question.allowOther && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSingleChoice(question.id, "__other__")}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    "border border-dashed border-border hover:border-primary hover:bg-primary/5",
                    showOther[question.id] &&
                      "bg-primary text-primary-foreground border-primary border-solid hover:bg-primary/90"
                  )}
                >
                  Autre...
                </button>
              )}
            </div>
            {showOther[question.id] && (
              <Input
                placeholder="Précisez..."
                value={otherValues[question.id] || ""}
                onChange={(e) => handleOtherChange(question.id, e.target.value)}
                disabled={disabled}
                className="mt-2"
              />
            )}
          </div>
        );

      case "multi_choice":
        const multiSelected = (selectedValue as string[]) || [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {question.options?.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleMultiChoice(question.id, option.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    "border border-border hover:border-primary hover:bg-primary/5",
                    multiSelected.includes(option.id) &&
                      "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                  )}
                >
                  {option.label}
                </button>
              ))}
              {question.allowOther && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleMultiChoice(question.id, "__other__")}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    "border border-dashed border-border hover:border-primary hover:bg-primary/5",
                    showOther[question.id] &&
                      "bg-primary text-primary-foreground border-primary border-solid hover:bg-primary/90"
                  )}
                >
                  Autre...
                </button>
              )}
            </div>
            {showOther[question.id] && (
              <Input
                placeholder="Précisez..."
                value={otherValues[question.id] || ""}
                onChange={(e) => {
                  setOtherValues((prev) => ({ ...prev, [question.id]: e.target.value }));
                  // Add to multi-choice array
                  if (e.target.value) {
                    setAnswers((prev) => {
                      const current = (prev[question.id] as string[]) || [];
                      const filtered = current.filter((v) => !v.startsWith("__other:"));
                      return { ...prev, [question.id]: [...filtered, `__other:${e.target.value}`] };
                    });
                  }
                }}
                disabled={disabled}
                className="mt-2"
              />
            )}
          </div>
        );

      case "text":
        return (
          <Input
            placeholder={question.placeholder || "Votre réponse..."}
            value={(selectedValue as string) || ""}
            onChange={(e) => handleTextChange(question.id, e.target.value)}
            disabled={disabled}
          />
        );

      case "amount":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder={question.placeholder || "0"}
              value={(selectedValue as string) || ""}
              onChange={(e) => handleTextChange(question.id, e.target.value)}
              disabled={disabled}
              className="max-w-[200px]"
            />
            <span className="text-muted-foreground">€</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          {clarification.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {clarification.questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <Label className="text-sm font-medium">{question.question}</Label>
            {renderQuestion(question)}
          </div>
        ))}

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSubmit}
            disabled={disabled || !isComplete()}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Confirmer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
