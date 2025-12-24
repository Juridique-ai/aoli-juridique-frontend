"use client";

import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, LogOut, Shield, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="container max-w-2xl py-10">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const initials = session.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="container max-w-2xl py-10 animate-fade-in">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Gradient header */}
        <div className="h-24 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 relative">
          <div className="absolute inset-0 bg-grid-white/5" />
        </div>

        <CardHeader className="-mt-12 relative">
          <div className="flex items-end gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl relative">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="pb-2">
              <CardTitle className="text-2xl">{session.user?.name}</CardTitle>
              <p className="text-muted-foreground">
                {session.user?.email}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats/badges */}
          <div className="flex items-center gap-2 text-sm">
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full",
              "bg-primary/10 text-primary border border-primary/20"
            )}>
              <Sparkles className="h-3 w-3" />
              <span>Utilisateur actif</span>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid gap-3">
            <div className={cn(
              "flex items-center gap-4 p-4 rounded-xl",
              "bg-muted/30 border border-border/50",
              "transition-all duration-200 hover:bg-muted/50"
            )}>
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Nom</p>
                <p className="text-sm text-muted-foreground">
                  {session.user?.name || "Non renseigné"}
                </p>
              </div>
            </div>

            <div className={cn(
              "flex items-center gap-4 p-4 rounded-xl",
              "bg-muted/30 border border-border/50",
              "transition-all duration-200 hover:bg-muted/50"
            )}>
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {session.user?.email || "Non renseigné"}
                </p>
              </div>
            </div>

            <div className={cn(
              "flex items-center gap-4 p-4 rounded-xl",
              "bg-muted/30 border border-border/50",
              "transition-all duration-200 hover:bg-muted/50"
            )}>
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Authentification</p>
                <p className="text-sm text-muted-foreground">
                  Microsoft Entra ID
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border/50">
            <Button
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full sm:w-auto shadow-lg shadow-destructive/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
