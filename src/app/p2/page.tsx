"use client";

import { useP2Store } from "@/stores/p2-store";
import {
  WizardProgress,
  StepCountry,
  StepActivity,
  StepDetails,
  StepPreferences,
  StepResult,
} from "@/components/features/p2";
import { WizardSummary } from "@/components/features/p2/wizard-summary";
import { ToolProgress } from "@/components/shared/tool-progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, Building2, ClipboardList } from "lucide-react";
import { endpoints } from "@/lib/api/endpoints";
import { P2_DEMO_DATA } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const STEPS = ["Pays", "Activité", "Détails", "Préférences", "Résultat"];

export default function P2Page() {
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const {
    step,
    country,
    questionnaire,
    result,
    isLoading,
    currentTool,
    error,
    nextStep,
    prevStep,
    setCountry,
    updateQuestionnaire,
    setResult,
    appendResult,
    setLoading,
    setCurrentTool,
    setError,
    reset,
    setStep,
  } = useP2Store();

  const handleDemo = () => {
    setCountry(P2_DEMO_DATA.country);
    updateQuestionnaire(P2_DEMO_DATA.questionnaire);
    setStep(4); // Go to preferences step (last before result)
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!country;
      case 2:
        return !!questionnaire.activityType && !!questionnaire.activityDescription;
      case 3:
        return questionnaire.foundersCount > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleAnalyze = async () => {
    setResult("");
    setLoading(true);
    setError(null);
    nextStep();

    try {
      const response = await fetch(`${API_BASE}${endpoints.p2.stream}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-functions-key": API_KEY!,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          country,
          questionnaire,
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
              setLoading(false);
              setCurrentTool(null);
              return;
            }

            try {
              const event = JSON.parse(data);

              switch (event.type) {
                case "started":
                  console.log("[P2] Agent started:", event.message);
                  break;

                case "progress":
                  console.log("[P2] Progress:", event.message);
                  break;

                case "content":
                  if (event.content) {
                    appendResult(event.content);
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
                  console.log("[P2] Completed event:", event);
                  // Extract result from completed event
                  if (event.result) {
                    let result = event.result as string;
                    // Remove markdown code blocks if present
                    if (result.startsWith("```json")) {
                      result = result.replace(/^```json\n?/, "").replace(/\n?```$/, "");
                    } else if (result.startsWith("```")) {
                      result = result.replace(/^```\n?/, "").replace(/\n?```$/, "");
                    }
                    console.log("[P2] Setting result, length:", result.length);
                    setResult(result);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite.");
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepCountry value={country} onChange={setCountry} />;
      case 2:
        return (
          <StepActivity
            activityType={questionnaire.activityType}
            activityDescription={questionnaire.activityDescription}
            onChange={updateQuestionnaire}
          />
        );
      case 3:
        return (
          <StepDetails
            foundersCount={questionnaire.foundersCount}
            plannedCapital={questionnaire.plannedCapital}
            employeesPlanned={questionnaire.employeesPlanned}
            onChange={updateQuestionnaire}
          />
        );
      case 4:
        return (
          <StepPreferences
            personalAssetProtection={questionnaire.personalAssetProtection}
            fundraisingPlanned={questionnaire.fundraisingPlanned}
            exitPlanned={questionnaire.exitPlanned}
            onChange={updateQuestionnaire}
          />
        );
      case 5:
        return (
          <StepResult
            content={result}
            isStreaming={isLoading}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-8 animate-fade-in">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
            <div className="relative p-3 rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Assistant Création d&apos;Entreprise</h1>
            <p className="text-muted-foreground mt-1">
              Trouvez la structure juridique adaptée à votre projet
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {step === 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDemo}
              className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Démo
            </Button>
          )}
          {/* Mobile summary toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            className="lg:hidden hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            Récapitulatif
          </Button>
        </div>
      </div>

      {/* Mobile Summary Drawer */}
      {showMobileSummary && (
        <div className="lg:hidden mb-6 p-4 rounded-xl bg-muted/30 border border-border/50 animate-fade-in">
          <WizardSummary
            country={country}
            questionnaire={questionnaire}
            currentStep={step}
          />
        </div>
      )}

      {/* Main content with sidebar on desktop */}
      <div className="grid lg:grid-cols-[1fr,280px] gap-6">
        {/* Main wizard area */}
        <div className="space-y-6">
          <WizardProgress currentStep={step} totalSteps={5} steps={STEPS} />

          {/* Tool Progress */}
          {currentTool && (
            <div className="animate-fade-in">
              <ToolProgress tool={currentTool} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 animate-fade-in">
              {error}
            </div>
          )}

          {/* Step Content */}
          <div className="min-h-[400px] animate-fade-in">{renderStep()}</div>

          {/* Navigation */}
          <div className={cn(
            "flex justify-between pt-6",
            "border-t border-border/50"
          )}>
            {step > 1 && step < 5 ? (
              <Button
                variant="outline"
                onClick={prevStep}
                className="hover:bg-muted/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
            ) : step === 5 ? (
              <Button
                variant="outline"
                onClick={reset}
                className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Recommencer
              </Button>
            ) : (
              <div />
            )}

            {step < 4 && (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="shadow-lg shadow-primary/20"
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {step === 4 && (
              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="shadow-lg shadow-primary/20"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Obtenir ma recommandation
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Summary Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-6 p-4 rounded-xl bg-muted/30 border border-border/50">
            <WizardSummary
              country={country}
              questionnaire={questionnaire}
              currentStep={step}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
