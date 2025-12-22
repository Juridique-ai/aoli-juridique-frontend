"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Mail } from "lucide-react";

export default function LoginPage() {
  const handleSignIn = () => {
    signIn("microsoft-entra-id", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Aoli Juridique</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à vos services juridiques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSignIn}
            className="w-full h-12 text-base"
            size="lg"
          >
            <Mail className="w-5 h-5 mr-2" />
            Continuer avec votre email
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            En continuant, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
