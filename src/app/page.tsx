import { FileText, Building2, MessageSquare, Mail, Scale, Sparkles, Shield, Zap } from "lucide-react";
import { ToolCard } from "@/components/shared/tool-card";

const tools = [
  {
    href: "/p1",
    icon: FileText,
    title: "Analyse de Contrat",
    description: "Analysez vos contrats et identifiez les risques juridiques",
    gradient: "from-teal-500/20 to-emerald-500/20",
  },
  {
    href: "/p2",
    icon: Building2,
    title: "Assistant Création",
    description: "Guide pour créer votre structure juridique",
    gradient: "from-emerald-500/20 to-cyan-500/20",
  },
  {
    href: "/p3",
    icon: MessageSquare,
    title: "Conseiller Juridique",
    description: "Posez vos questions juridiques et obtenez des réponses",
    gradient: "from-cyan-500/20 to-teal-500/20",
  },
  {
    href: "/p4",
    icon: Mail,
    title: "Correspondance",
    description: "Rédigez vos courriers juridiques professionnels",
    gradient: "from-teal-500/20 to-emerald-500/20",
  },
  {
    href: "/p5",
    icon: Scale,
    title: "Actes de Procédure",
    description: "Rédigez vos actes et documents judiciaires",
    gradient: "from-emerald-500/20 to-cyan-500/20",
  },
];

const features = [
  {
    icon: Sparkles,
    title: "IA Avancée",
    description: "Propulsé par les derniers modèles d'intelligence artificielle",
  },
  {
    icon: Shield,
    title: "Sécurisé",
    description: "Vos données sont chiffrées et protégées",
  },
  {
    icon: Zap,
    title: "Instantané",
    description: "Obtenez des réponses en quelques secondes",
  },
];

export default function HomePage() {
  return (
    <div className="relative">
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container py-12 md:py-20 lg:py-28">
        {/* Hero Section */}
        <div className="text-center mb-16 md:mb-24 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Propulsé par l&apos;IA</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="text-gradient">Juridique AI</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Votre assistant juridique intelligent. Analysez des contrats,
            obtenez des conseils et rédigez des documents en quelques clics.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mb-24">
          {tools.map((tool, index) => (
            <div
              key={tool.href}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ToolCard {...tool} />
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${(index + 5) * 100}ms` }}
              >
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-20 text-center animate-fade-in" style={{ animationDelay: '800ms' }}>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Ces outils sont conçus pour assister les professionnels du droit.
            Ils ne remplacent pas les conseils d&apos;un avocat qualifié.
          </p>
        </div>
      </div>
    </div>
  );
}
