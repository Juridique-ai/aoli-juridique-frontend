import { FileText, Building2, MessageSquare, Mail, Scale } from "lucide-react";
import { ToolCard } from "@/components/shared/tool-card";

const tools = [
  {
    href: "/p1",
    icon: FileText,
    title: "Analyse de Contrat",
    description: "Analysez vos contrats et identifiez les risques juridiques",
  },
  {
    href: "/p2",
    icon: Building2,
    title: "Assistant Création",
    description: "Guide pour créer votre structure juridique",
  },
  {
    href: "/p3",
    icon: MessageSquare,
    title: "Conseiller Juridique",
    description: "Posez vos questions juridiques et obtenez des réponses",
  },
  {
    href: "/p4",
    icon: Mail,
    title: "Correspondance",
    description: "Rédigez vos courriers juridiques professionnels",
  },
  {
    href: "/p5",
    icon: Scale,
    title: "Actes de Procédure",
    description: "Rédigez vos actes et documents judiciaires",
  },
];

export default function HomePage() {
  return (
    <div className="container py-12 md:py-16 lg:py-20">
      {/* Hero Section */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          Juridique AI
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Votre assistant juridique propulsé par l&apos;intelligence artificielle
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {tools.map((tool) => (
          <ToolCard key={tool.href} {...tool} />
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Ces outils sont conçus pour assister les professionnels du droit.
          Ils ne remplacent pas les conseils d&apos;un avocat qualifié.
        </p>
      </div>
    </div>
  );
}
