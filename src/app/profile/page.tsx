"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  LogOut,
  Shield,
  Sparkles,
  MapPin,
  Phone,
  Building2,
  Briefcase,
  Save,
  Check,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUserProfileStore } from "@/stores/user-profile-store";
import { toast } from "sonner";

const ROLE_OPTIONS = [
  { value: "Particulier", label: "Particulier" },
  { value: "Gérant", label: "Gérant" },
  { value: "Directeur", label: "Directeur" },
  { value: "Président", label: "Président" },
  { value: "Avocat", label: "Avocat" },
  { value: "Représentant légal", label: "Représentant légal" },
  { value: "Autre", label: "Autre" },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { profile, updateProfile, isLoaded } = useUserProfileStore();
  const [isSaved, setIsSaved] = useState(false);

  // Sync session name to profile if profile name is empty
  useEffect(() => {
    if (isLoaded && session?.user?.name && !profile.fullName) {
      updateProfile({ fullName: session.user.name });
    }
  }, [isLoaded, session?.user?.name, profile.fullName, updateProfile]);

  const handleSave = () => {
    setIsSaved(true);
    toast.success("Profil enregistré");
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (status === "loading" || !isLoaded) {
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

  const initials = (profile.fullName || session.user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
            <div className="pb-2 flex-1">
              <CardTitle className="text-2xl">{profile.fullName || session.user?.name}</CardTitle>
              <p className="text-muted-foreground">{session.user?.email}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
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

          {/* Profile Form */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Informations personnelles</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={(e) => updateProfile({ fullName: e.target.value })}
                  placeholder="Jean Dupont"
                  className="bg-muted/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Qualité</Label>
                <Select
                  value={profile.role}
                  onValueChange={(value) => updateProfile({ role: value })}
                >
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Société (optionnel)</Label>
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(e) => updateProfile({ company: e.target.value })}
                  placeholder="Nom de l'entreprise"
                  className="bg-muted/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => updateProfile({ phone: e.target.value })}
                  placeholder="+33 6 12 34 56 78"
                  className="bg-muted/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground pt-4">
              <MapPin className="h-4 w-4" />
              <span>Adresse</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => updateProfile({ address: e.target.value })}
                  placeholder="123 rue de la Paix"
                  className="bg-muted/30 min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={profile.postalCode}
                  onChange={(e) => updateProfile({ postalCode: e.target.value })}
                  placeholder="75001"
                  className="bg-muted/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => updateProfile({ city: e.target.value })}
                  placeholder="Paris"
                  className="bg-muted/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={profile.country}
                  onChange={(e) => updateProfile({ country: e.target.value })}
                  placeholder="France"
                  className="bg-muted/30"
                />
              </div>
            </div>
          </div>

          {/* Account info (read-only) */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Compte</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            <div className="grid gap-3">
              <div className={cn(
                "flex items-center gap-4 p-4 rounded-xl",
                "bg-muted/30 border border-border/50"
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
                "bg-muted/30 border border-border/50"
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
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
            <Button
              onClick={handleSave}
              className="shadow-lg shadow-primary/20"
            >
              {isSaved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Enregistré
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer le profil
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="sm:ml-auto"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info box */}
      <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
        <Building2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium mb-1">Pourquoi ces informations ?</p>
          <p className="text-muted-foreground">
            Vos informations sont utilisées pour pré-remplir automatiquement les formulaires
            (correspondance, actes de procédure) et sont stockées localement sur votre appareil.
          </p>
        </div>
      </div>
    </div>
  );
}
