"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Scale, Mail, Shield, Sparkles, Zap } from "lucide-react";

export default function LoginPage() {
  const handleSignIn = () => {
    signIn("microsoft-entra-id", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Main card with glassmorphism */}
        <div className="relative rounded-3xl bg-card/50 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/5 overflow-hidden">
          {/* Gradient top border effect */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

          <div className="p-8 sm:p-10">
            {/* Logo section */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl" />
                {/* Icon container */}
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25">
                  <Scale className="w-10 h-10" />
                </div>
              </div>

              <h1 className="text-3xl font-bold tracking-tight mb-2">
                <span className="text-gradient">Juridique AI</span>
              </h1>
              <p className="text-muted-foreground">
                Votre assistant juridique intelligent
              </p>
            </div>

            {/* Sign in button */}
            <div className="space-y-4">
              <Button
                onClick={handleSignIn}
                className="w-full h-14 text-base font-medium rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                size="lg"
              >
                <Mail className="w-5 h-5 mr-3" />
                Continuer avec votre email
              </Button>

              <p className="text-xs text-center text-muted-foreground leading-relaxed">
                En continuant, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité.
              </p>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card/50 backdrop-blur-sm px-4 text-xs text-muted-foreground">
                  Pourquoi nous choisir
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Sparkles, label: "IA Avancée" },
                { icon: Shield, label: "Sécurisé" },
                { icon: Zap, label: "Instantané" },
              ].map((feature, index) => (
                <div
                  key={feature.label}
                  className="flex flex-col items-center text-center animate-fade-in"
                  style={{ animationDelay: `${(index + 1) * 150}ms` }}
                >
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary mb-2">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          Propulsé par l&apos;intelligence artificielle
        </p>
      </div>
    </div>
  );
}
