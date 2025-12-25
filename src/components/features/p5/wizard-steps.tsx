"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { JurisdictionSelect } from "@/components/shared/jurisdiction-select";
import { PROCEDURAL_DOCUMENT_TYPES } from "@/lib/constants";
import {
  FileText,
  Gavel,
  Users,
  ListOrdered,
  Scale,
  Check,
  Plus,
  Trash2,
  Building2,
  User,
  HelpCircle,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { P4Party, P5Fact } from "@/types";
import { useUserProfileStore, formatFullAddress } from "@/stores/user-profile-store";
import { toast } from "sonner";

// Step 1: Document Type Selection
interface Step1Props {
  value: string;
  onChange: (type: string) => void;
}

export function Step1DocumentType({ value, onChange }: Step1Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">Quel document souhaitez-vous rédiger ?</h2>
        <p className="text-muted-foreground">Sélectionnez le type d'acte de procédure</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PROCEDURAL_DOCUMENT_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={cn(
              "relative p-4 rounded-xl text-left transition-all duration-200",
              "border-2",
              value === type.value
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border/50 bg-card/50 hover:border-primary/30 hover:bg-muted/30"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                value === type.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{type.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getDocumentDescription(type.value)}
                </p>
              </div>
              {value === type.value && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function getDocumentDescription(type: string): string {
  const descriptions: Record<string, string> = {
    assignation: "Acte introductif d'instance",
    conclusions: "Écritures en réponse ou en demande",
    requete: "Demande au juge sans adversaire",
    memoire: "Exposé détaillé des arguments",
    opposition: "Contestation d'une décision",
    appel: "Recours contre un jugement",
  };
  return descriptions[type] || "Document judiciaire";
}

// Step 2: Case Information
interface Step2Props {
  jurisdiction: string;
  court: string;
  caseNumber: string;
  onJurisdictionChange: (jurisdiction: string) => void;
  onCourtChange: (court: string) => void;
  onCaseNumberChange: (caseNumber: string) => void;
}

export function Step2CaseInfo({
  jurisdiction,
  court,
  caseNumber,
  onJurisdictionChange,
  onCourtChange,
  onCaseNumberChange,
}: Step2Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">Informations sur l'affaire</h2>
        <p className="text-muted-foreground">Précisez le tribunal et la juridiction</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-muted-foreground" />
            Juridiction
          </Label>
          <JurisdictionSelect
            value={jurisdiction}
            onChange={onJurisdictionChange}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="court" className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Tribunal
          </Label>
          <Input
            id="court"
            value={court}
            onChange={(e) => onCourtChange(e.target.value)}
            placeholder="ex: Tribunal judiciaire de Paris"
            className="bg-muted/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="caseNumber" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Numéro de dossier
            <span className="text-xs text-muted-foreground">(optionnel)</span>
          </Label>
          <Input
            id="caseNumber"
            value={caseNumber}
            onChange={(e) => onCaseNumberChange(e.target.value)}
            placeholder="ex: RG 23/12345"
            className="bg-muted/30"
          />
        </div>
      </div>
    </div>
  );
}

// Step 3: Parties
interface Step3Props {
  plaintiff: P4Party;
  defendant: P4Party;
  onPlaintiffChange: (plaintiff: Partial<P4Party>) => void;
  onDefendantChange: (defendant: Partial<P4Party>) => void;
}

export function Step3Parties({
  plaintiff,
  defendant,
  onPlaintiffChange,
  onDefendantChange,
}: Step3Props) {
  const { profile, isLoaded: profileLoaded } = useUserProfileStore();
  const hasProfileInfo = profileLoaded && profile.fullName && profile.address;

  const fillPlaintiffFromProfile = () => {
    if (!profile.fullName) {
      toast.error("Veuillez d'abord remplir votre profil");
      return;
    }
    const fullAddress = formatFullAddress(profile);
    const displayName = profile.company
      ? `${profile.fullName} (${profile.company})`
      : profile.fullName;
    onPlaintiffChange({ name: displayName, address: fullAddress, role: profile.role });
    toast.success("Demandeur pré-rempli depuis votre profil");
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">Parties au litige</h2>
        <p className="text-muted-foreground">Identifiez le demandeur et le défendeur</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plaintiff */}
        <div className={cn(
          "p-5 rounded-xl border-2 transition-all",
          plaintiff.name ? "border-primary/50 bg-primary/5" : "border-border/50 bg-card/50"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <h3 className="font-medium">Demandeur</h3>
            </div>
            {hasProfileInfo && !plaintiff.name && (
              <Button
                variant="ghost"
                size="sm"
                onClick={fillPlaintiffFromProfile}
                className="text-xs h-7 text-primary hover:text-primary hover:bg-primary/10"
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Mon profil
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plaintiff-name">Nom complet</Label>
              <Input
                id="plaintiff-name"
                value={plaintiff.name}
                onChange={(e) => onPlaintiffChange({ name: e.target.value })}
                placeholder="Nom ou raison sociale"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plaintiff-address">Adresse</Label>
              <Input
                id="plaintiff-address"
                value={plaintiff.address}
                onChange={(e) => onPlaintiffChange({ address: e.target.value })}
                placeholder="Adresse complète"
                className="bg-background/50"
              />
            </div>
          </div>
        </div>

        {/* Defendant */}
        <div className={cn(
          "p-5 rounded-xl border-2 transition-all",
          defendant.name ? "border-primary/50 bg-primary/5" : "border-border/50 bg-card/50"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
              <User className="h-4 w-4" />
            </div>
            <h3 className="font-medium">Défendeur</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defendant-name">Nom complet</Label>
              <Input
                id="defendant-name"
                value={defendant.name}
                onChange={(e) => onDefendantChange({ name: e.target.value })}
                placeholder="Nom ou raison sociale"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defendant-address">Adresse</Label>
              <Input
                id="defendant-address"
                value={defendant.address}
                onChange={(e) => onDefendantChange({ address: e.target.value })}
                placeholder="Adresse complète"
                className="bg-background/50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4: Facts
interface Step4Props {
  facts: P5Fact[];
  onAddFact: (fact: P5Fact) => void;
  onRemoveFact: (index: number) => void;
}

export function Step4Facts({ facts, onAddFact, onRemoveFact }: Step4Props) {
  const [newDate, setNewDate] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleAdd = () => {
    if (newDate && newDescription) {
      onAddFact({ date: newDate, description: newDescription });
      setNewDate("");
      setNewDescription("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">Exposé des faits</h2>
        <p className="text-muted-foreground">Décrivez les faits de l'affaire par ordre chronologique</p>
      </div>

      {/* Facts list */}
      <div className="space-y-3 max-w-2xl mx-auto">
        {facts.length > 0 ? (
          facts.map((fact, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3 p-4 rounded-xl",
                "bg-muted/30 border border-border/50",
                "animate-fade-in"
              )}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">{fact.date}</p>
                <p className="text-sm">{fact.description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                onClick={() => onRemoveFact(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ListOrdered className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Aucun fait ajouté</p>
            <p className="text-sm">Ajoutez les faits de l'affaire ci-dessous</p>
          </div>
        )}
      </div>

      {/* Add new fact */}
      <div className="max-w-2xl mx-auto p-4 rounded-xl bg-muted/20 border border-dashed border-border/50">
        <p className="text-sm font-medium mb-3">Ajouter un fait</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="sm:w-40 bg-background"
          />
          <Input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description du fait..."
            className="flex-1 bg-background"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button
            onClick={handleAdd}
            disabled={!newDate || !newDescription}
            className="shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 max-w-2xl mx-auto">
        <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Les faits seront présentés dans l'ordre chronologique. Soyez précis et factuel.
        </p>
      </div>
    </div>
  );
}

// Step 5: Claims & Legal Basis
interface Step5Props {
  claims: string[];
  legalBasis: string;
  onAddClaim: (claim: string) => void;
  onRemoveClaim: (index: number) => void;
  onLegalBasisChange: (basis: string) => void;
}

export function Step5Claims({
  claims,
  legalBasis,
  onAddClaim,
  onRemoveClaim,
  onLegalBasisChange,
}: Step5Props) {
  const [newClaim, setNewClaim] = useState("");

  const handleAdd = () => {
    if (newClaim.trim()) {
      onAddClaim(newClaim.trim());
      setNewClaim("");
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">Demandes et fondements</h2>
        <p className="text-muted-foreground">Précisez vos demandes et le fondement juridique</p>
      </div>

      {/* Claims */}
      <div className="max-w-2xl mx-auto space-y-4">
        <Label className="flex items-center gap-2">
          <Gavel className="h-4 w-4 text-muted-foreground" />
          Demandes
        </Label>

        <div className="space-y-2">
          {claims.map((claim, index) => (
            <div
              key={index}
              className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 animate-fade-in"
            >
              <span className="text-primary font-medium">{index + 1}.</span>
              <p className="flex-1 text-sm">{claim}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => onRemoveClaim(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newClaim}
            onChange={(e) => setNewClaim(e.target.value)}
            placeholder="ex: Condamner le défendeur au paiement de..."
            className="bg-muted/30"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={!newClaim.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legal Basis */}
      <div className="max-w-2xl mx-auto space-y-4">
        <Label htmlFor="legalBasis" className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-muted-foreground" />
          Fondement juridique
        </Label>
        <Textarea
          id="legalBasis"
          value={legalBasis}
          onChange={(e) => onLegalBasisChange(e.target.value)}
          placeholder="Articles de loi, jurisprudence applicable, principes juridiques..."
          className="min-h-[150px] bg-muted/30"
        />
        <p className="text-xs text-muted-foreground">
          Citez les textes de loi et la jurisprudence sur lesquels vous fondez vos demandes
        </p>
      </div>
    </div>
  );
}
