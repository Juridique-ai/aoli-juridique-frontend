"use client";

import { cn } from "@/lib/utils";
import {
  Globe,
  Briefcase,
  Users,
  Shield,
  Check,
} from "lucide-react";
import type { P2Questionnaire } from "@/types";

interface WizardSummaryProps {
  country: string;
  questionnaire: P2Questionnaire;
  currentStep: number;
}

const COUNTRY_NAMES: Record<string, string> = {
  FR: "France",
  BE: "Belgique",
  LU: "Luxembourg",
  DE: "Allemagne",
  CH: "Suisse",
};

const ACTIVITY_TYPES: Record<string, string> = {
  commerce: "Commerce",
  services: "Services",
  artisanat: "Artisanat",
  liberal: "Profession libérale",
  tech: "Tech / Startup",
  industrie: "Industrie",
};

interface SummaryItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export function WizardSummary({ country, questionnaire, currentStep }: WizardSummaryProps) {
  const activityItems: SummaryItem[] = [];
  if (questionnaire.activityType) {
    activityItems.push({
      label: "Type d'activité",
      value: ACTIVITY_TYPES[questionnaire.activityType] || questionnaire.activityType,
    });
  }
  if (questionnaire.activityDescription) {
    activityItems.push({
      label: "Description",
      value: questionnaire.activityDescription.length > 50
        ? `${questionnaire.activityDescription.substring(0, 50)}...`
        : questionnaire.activityDescription,
    });
  }

  const detailItems: SummaryItem[] = [];
  if (questionnaire.foundersCount > 0) {
    detailItems.push({
      label: "Nombre de fondateurs",
      value: questionnaire.foundersCount.toString(),
    });
  }
  if (questionnaire.plannedCapital > 0) {
    detailItems.push({
      label: "Capital prévu",
      value: new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(questionnaire.plannedCapital),
    });
  }
  if (questionnaire.employeesPlanned > 0) {
    detailItems.push({
      label: "Employés prévus",
      value: questionnaire.employeesPlanned.toString(),
    });
  }

  const sections = [
    {
      step: 1,
      title: "Pays",
      icon: Globe,
      items: country ? [
        { label: "Pays d'implantation", value: COUNTRY_NAMES[country] || country }
      ] : [] as SummaryItem[],
    },
    {
      step: 2,
      title: "Activité",
      icon: Briefcase,
      items: activityItems,
    },
    {
      step: 3,
      title: "Détails",
      icon: Users,
      items: detailItems,
    },
    {
      step: 4,
      title: "Préférences",
      icon: Shield,
      items: [
        {
          label: "Protection du patrimoine",
          value: questionnaire.personalAssetProtection ? "Oui" : "Non",
          highlight: questionnaire.personalAssetProtection,
        },
        {
          label: "Levée de fonds prévue",
          value: questionnaire.fundraisingPlanned ? "Oui" : "Non",
          highlight: questionnaire.fundraisingPlanned,
        },
        {
          label: "Revente envisagée",
          value: questionnaire.exitPlanned ? "Oui" : "Non",
          highlight: questionnaire.exitPlanned,
        },
      ] as SummaryItem[],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-sm">Récapitulatif</h3>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      {sections.map((section) => {
        const Icon = section.icon;
        const isCompleted = currentStep > section.step;
        const isCurrent = currentStep === section.step;
        const hasContent = section.items.length > 0;

        return (
          <div
            key={section.step}
            className={cn(
              "rounded-lg border transition-all",
              isCompleted && "border-primary/30 bg-primary/5",
              isCurrent && "border-primary/50 bg-primary/10 shadow-sm",
              !isCompleted && !isCurrent && "border-border/50 bg-muted/30"
            )}
          >
            {/* Section header */}
            <div className="flex items-center gap-2 p-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                isCompleted && "bg-primary text-primary-foreground",
                isCurrent && "bg-primary/20 text-primary",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}>
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>
              <span className={cn(
                "text-sm font-medium",
                (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
              )}>
                {section.title}
              </span>
            </div>

            {/* Section content */}
            {hasContent && (
              <div className="px-3 pb-3 pt-0">
                <div className="space-y-1.5 pl-8">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex items-start justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className={cn(
                        "text-xs font-medium text-right",
                        item.highlight ? "text-primary" : "text-foreground"
                      )}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state for current/future steps */}
            {!hasContent && (isCurrent || !isCompleted) && (
              <div className="px-3 pb-3 pt-0">
                <div className="pl-8">
                  <span className="text-xs text-muted-foreground italic">
                    {isCurrent ? "En cours..." : "À compléter"}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Progress indicator */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Progression</span>
          <span>{Math.round(((currentStep - 1) / 4) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
