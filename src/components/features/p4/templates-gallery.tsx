"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  FileX,
  Receipt,
  RefreshCcw,
  ShieldAlert,
  Clock,
  Home,
  Briefcase,
  Car,
  CreditCard,
  Package,
  Wifi,
  Check,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: LucideIcon;
  prefill: {
    subject: string;
    context: string;
    objective: string;
    tone: "formal" | "firm" | "conciliatory";
  };
}

const TEMPLATES: Template[] = [
  // Mise en demeure
  {
    id: "mise-en-demeure-impaye",
    title: "Mise en demeure pour impayé",
    description: "Réclamer le paiement d'une facture impayée",
    category: "Mise en demeure",
    icon: CreditCard,
    prefill: {
      subject: "Mise en demeure de payer - Facture impayée",
      context: "J'ai une facture impayée depuis plus de 30 jours malgré plusieurs relances.",
      objective: "Obtenir le paiement de la facture dans un délai de 8 jours sous peine de poursuites judiciaires.",
      tone: "firm",
    },
  },
  {
    id: "mise-en-demeure-travaux",
    title: "Mise en demeure pour travaux",
    description: "Demander l'exécution de travaux promis",
    category: "Mise en demeure",
    icon: Home,
    prefill: {
      subject: "Mise en demeure d'exécuter les travaux",
      context: "Des travaux ont été commandés et payés mais n'ont pas été réalisés dans les délais convenus.",
      objective: "Obtenir l'exécution des travaux sous 15 jours ou le remboursement intégral.",
      tone: "firm",
    },
  },
  {
    id: "mise-en-demeure-livraison",
    title: "Mise en demeure pour non-livraison",
    description: "Réclamer une livraison en retard",
    category: "Mise en demeure",
    icon: Package,
    prefill: {
      subject: "Mise en demeure de livrer",
      context: "J'ai commandé un produit qui n'a toujours pas été livré malgré le dépassement du délai annoncé.",
      objective: "Obtenir la livraison sous 8 jours ou le remboursement complet.",
      tone: "firm",
    },
  },
  // Résiliation
  {
    id: "resiliation-bail",
    title: "Résiliation de bail",
    description: "Mettre fin à un contrat de location",
    category: "Résiliation",
    icon: Home,
    prefill: {
      subject: "Résiliation du contrat de bail",
      context: "Je souhaite résilier mon bail d'habitation en respectant le préavis légal.",
      objective: "Notifier officiellement la résiliation du bail avec effet à la fin du préavis.",
      tone: "formal",
    },
  },
  {
    id: "resiliation-telecom",
    title: "Résiliation abonnement télécom",
    description: "Résilier un forfait téléphone/internet",
    category: "Résiliation",
    icon: Wifi,
    prefill: {
      subject: "Demande de résiliation d'abonnement",
      context: "Je souhaite résilier mon abonnement téléphonique/internet.",
      objective: "Obtenir la résiliation de mon contrat dans les meilleurs délais.",
      tone: "formal",
    },
  },
  {
    id: "resiliation-assurance",
    title: "Résiliation contrat d'assurance",
    description: "Mettre fin à un contrat d'assurance",
    category: "Résiliation",
    icon: ShieldAlert,
    prefill: {
      subject: "Résiliation du contrat d'assurance",
      context: "Je souhaite résilier mon contrat d'assurance à son échéance annuelle.",
      objective: "Confirmer la résiliation du contrat à la date d'échéance.",
      tone: "formal",
    },
  },
  // Réclamation
  {
    id: "reclamation-produit",
    title: "Réclamation produit défectueux",
    description: "Signaler un défaut de conformité",
    category: "Réclamation",
    icon: AlertTriangle,
    prefill: {
      subject: "Réclamation pour produit défectueux",
      context: "Le produit que j'ai acheté présente un défaut de conformité ou un vice caché.",
      objective: "Obtenir le remplacement du produit, sa réparation ou le remboursement.",
      tone: "formal",
    },
  },
  {
    id: "reclamation-service",
    title: "Réclamation service non conforme",
    description: "Contester un service mal exécuté",
    category: "Réclamation",
    icon: Briefcase,
    prefill: {
      subject: "Réclamation pour service non conforme",
      context: "Le service fourni ne correspond pas à ce qui était convenu dans le contrat.",
      objective: "Obtenir la correction du service ou une compensation financière.",
      tone: "formal",
    },
  },
  {
    id: "reclamation-facture",
    title: "Contestation de facture",
    description: "Contester un montant facturé",
    category: "Réclamation",
    icon: Receipt,
    prefill: {
      subject: "Contestation de facture",
      context: "J'ai reçu une facture dont le montant ne correspond pas à ce qui était convenu.",
      objective: "Obtenir la rectification de la facture et un nouveau décompte.",
      tone: "formal",
    },
  },
  // Autres
  {
    id: "demande-remboursement",
    title: "Demande de remboursement",
    description: "Réclamer le remboursement d'un achat",
    category: "Demande",
    icon: RefreshCcw,
    prefill: {
      subject: "Demande de remboursement",
      context: "J'ai effectué un achat que je souhaite me faire rembourser (droit de rétractation, produit non conforme...).",
      objective: "Obtenir le remboursement intégral du montant payé.",
      tone: "formal",
    },
  },
  {
    id: "relance-paiement",
    title: "Relance de paiement",
    description: "Rappeler une facture en attente",
    category: "Relance",
    icon: Clock,
    prefill: {
      subject: "Relance - Facture en attente de règlement",
      context: "Une facture est en attente de paiement depuis sa date d'échéance.",
      objective: "Obtenir le règlement de la facture dans les plus brefs délais.",
      tone: "conciliatory",
    },
  },
  {
    id: "sinistre-auto",
    title: "Déclaration de sinistre auto",
    description: "Déclarer un accident de voiture",
    category: "Déclaration",
    icon: Car,
    prefill: {
      subject: "Déclaration de sinistre automobile",
      context: "J'ai été impliqué dans un accident de la circulation et je dois le déclarer à mon assurance.",
      objective: "Déclarer officiellement le sinistre et demander la prise en charge.",
      tone: "formal",
    },
  },
];

const CATEGORIES = [...new Set(TEMPLATES.map(t => t.category))];

interface TemplatesGalleryProps {
  onSelectTemplate: (template: Template["prefill"]) => void;
}

export function TemplatesGallery({ onSelectTemplate }: TemplatesGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredTemplates = selectedCategory
    ? TEMPLATES.filter(t => t.category === selectedCategory)
    : TEMPLATES;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Choisissez un modèle</h2>
        <p className="text-muted-foreground">
          Sélectionnez un type de courrier pour préremplir le formulaire
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            selectedCategory === null
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Tous
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              selectedCategory === cat
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          const isHovered = hoveredId === template.id;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate(template.prefill)}
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "relative p-4 rounded-xl text-left transition-all duration-200",
                "border-2 group",
                "hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10",
                "border-border/50 bg-card/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2.5 rounded-lg transition-all",
                  isHovered
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm mb-1">{template.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                  <div className="mt-2">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                      "bg-muted/50 text-muted-foreground"
                    )}>
                      {template.category}
                    </span>
                  </div>
                </div>
                <ChevronRight className={cn(
                  "h-5 w-5 transition-all flex-shrink-0",
                  isHovered
                    ? "text-primary translate-x-0.5"
                    : "text-muted-foreground/50"
                )} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Hint */}
      <p className="text-center text-sm text-muted-foreground">
        Vous pourrez personnaliser tous les détails après sélection
      </p>
    </div>
  );
}

export type { Template };
