"use client";

import { cn } from "@/lib/utils";
import {
  Briefcase,
  Home,
  Building2,
  Users,
  FileText,
  Scale,
  Car,
  ShoppingBag,
  LucideIcon,
} from "lucide-react";

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  exampleQuestions: string[];
  color: string;
}

const CATEGORIES: Category[] = [
  {
    id: "employment",
    label: "Droit du travail",
    icon: Briefcase,
    description: "Licenciement, contrats, congés",
    exampleQuestions: [
      "Quels sont mes droits en cas de licenciement ?",
      "Mon employeur peut-il modifier mon contrat ?",
      "Comment contester un avertissement ?",
    ],
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "real-estate",
    label: "Droit immobilier",
    icon: Home,
    description: "Location, achat, copropriété",
    exampleQuestions: [
      "Mon propriétaire peut-il augmenter le loyer ?",
      "Quels recours contre un locataire qui ne paie pas ?",
      "Comment contester les charges de copropriété ?",
    ],
    color: "from-sky-500/20 to-blue-500/20",
  },
  {
    id: "business",
    label: "Droit des affaires",
    icon: Building2,
    description: "Création, contrats, litiges",
    exampleQuestions: [
      "Comment créer une SARL ?",
      "Quelles clauses inclure dans un contrat commercial ?",
      "Comment protéger ma propriété intellectuelle ?",
    ],
    color: "from-violet-500/20 to-purple-500/20",
  },
  {
    id: "family",
    label: "Droit de la famille",
    icon: Users,
    description: "Divorce, succession, garde",
    exampleQuestions: [
      "Comment se passe une procédure de divorce ?",
      "Quels sont mes droits de garde ?",
      "Comment contester un testament ?",
    ],
    color: "from-pink-500/20 to-rose-500/20",
  },
  {
    id: "consumer",
    label: "Droit consommation",
    icon: ShoppingBag,
    description: "Achats, garanties, litiges",
    exampleQuestions: [
      "Comment me faire rembourser un produit défectueux ?",
      "Quels sont mes droits face à un vendeur ?",
      "Comment annuler un abonnement ?",
    ],
    color: "from-orange-500/20 to-amber-500/20",
  },
  {
    id: "traffic",
    label: "Droit routier",
    icon: Car,
    description: "Infractions, permis, accidents",
    exampleQuestions: [
      "Comment contester une amende ?",
      "Que faire après un accident de voiture ?",
      "Comment récupérer des points sur mon permis ?",
    ],
    color: "from-red-500/20 to-orange-500/20",
  },
];

interface ChatOnboardingProps {
  onSelectQuestion: (question: string) => void;
  onSelectCategory?: (categoryId: string) => void;
}

export function ChatOnboarding({ onSelectQuestion, onSelectCategory }: ChatOnboardingProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
          <div className="relative p-4 rounded-2xl bg-primary/10 text-primary">
            <Scale className="h-10 w-10" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Comment puis-je vous aider ?</h2>
        <p className="text-muted-foreground max-w-md">
          Choisissez un domaine juridique ou posez directement votre question
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl mb-6">
        {CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onSelectQuestion={onSelectQuestion}
          />
        ))}
      </div>

      {/* Quick tip */}
      <p className="text-xs text-muted-foreground/60 text-center max-w-md">
        Cliquez sur une catégorie pour voir des exemples de questions, ou tapez directement votre question ci-dessous
      </p>
    </div>
  );
}

interface CategoryCardProps {
  category: Category;
  onSelectQuestion: (question: string) => void;
}

function CategoryCard({ category, onSelectQuestion }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <div className="group relative">
      <button
        type="button"
        className={cn(
          "w-full p-4 rounded-xl text-left",
          "bg-card/50 backdrop-blur-sm border border-border/50",
          "hover:bg-card/80 hover:border-primary/30",
          "hover:shadow-lg hover:shadow-primary/5",
          "transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-primary/50"
        )}
        onClick={() => {
          // Select a random question from this category
          const randomQuestion =
            category.exampleQuestions[
              Math.floor(Math.random() * category.exampleQuestions.length)
            ];
          onSelectQuestion(randomQuestion);
        }}
      >
        {/* Gradient background on hover */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0",
            "group-hover:opacity-100 transition-opacity duration-300",
            category.color
          )}
        />

        <div className="relative z-10">
          <div className={cn(
            "p-2 rounded-lg bg-primary/10 text-primary w-fit mb-3",
            "group-hover:bg-primary group-hover:text-primary-foreground",
            "transition-all duration-300"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
            {category.label}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {category.description}
          </p>
        </div>
      </button>

      {/* Hover tooltip with example questions */}
      <div className={cn(
        "absolute left-0 right-0 top-full mt-2 z-50",
        "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
        "transition-all duration-200 delay-300",
        "pointer-events-none group-hover:pointer-events-auto"
      )}>
        <div className={cn(
          "p-3 rounded-lg",
          "bg-popover/95 backdrop-blur-sm border border-border shadow-xl",
          "text-sm"
        )}>
          <p className="font-medium text-xs text-muted-foreground mb-2">
            Exemples de questions :
          </p>
          <div className="space-y-1.5">
            {category.exampleQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                className={cn(
                  "block w-full text-left text-xs p-2 rounded-md",
                  "hover:bg-primary/10 hover:text-primary",
                  "transition-colors"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectQuestion(q);
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
