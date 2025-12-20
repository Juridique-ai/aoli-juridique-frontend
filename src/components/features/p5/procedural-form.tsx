"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JurisdictionSelect } from "@/components/shared/jurisdiction-select";
import { PROCEDURAL_DOCUMENT_TYPES } from "@/lib/constants";
import { Plus, Trash2 } from "lucide-react";
import type { P4Party, P5Fact } from "@/types";

interface ProceduralFormProps {
  documentType: string;
  jurisdiction: string;
  court: string;
  caseNumber: string;
  plaintiff: P4Party;
  defendant: P4Party;
  facts: P5Fact[];
  claims: string[];
  legalBasis: string;
  onDocumentTypeChange: (type: string) => void;
  onJurisdictionChange: (jurisdiction: string) => void;
  onCourtChange: (court: string) => void;
  onCaseNumberChange: (caseNumber: string) => void;
  onPlaintiffChange: (plaintiff: Partial<P4Party>) => void;
  onDefendantChange: (defendant: Partial<P4Party>) => void;
  onAddFact: (fact: P5Fact) => void;
  onRemoveFact: (index: number) => void;
  onAddClaim: (claim: string) => void;
  onRemoveClaim: (index: number) => void;
  onLegalBasisChange: (basis: string) => void;
}

export function ProceduralForm({
  documentType,
  jurisdiction,
  court,
  caseNumber,
  plaintiff,
  defendant,
  facts,
  claims,
  legalBasis,
  onDocumentTypeChange,
  onJurisdictionChange,
  onCourtChange,
  onCaseNumberChange,
  onPlaintiffChange,
  onDefendantChange,
  onAddFact,
  onRemoveFact,
  onAddClaim,
  onRemoveClaim,
  onLegalBasisChange,
}: ProceduralFormProps) {
  const [newFactDate, setNewFactDate] = useState("");
  const [newFactDescription, setNewFactDescription] = useState("");
  const [newClaim, setNewClaim] = useState("");

  const handleAddFact = () => {
    if (newFactDate && newFactDescription) {
      onAddFact({ date: newFactDate, description: newFactDescription });
      setNewFactDate("");
      setNewFactDescription("");
    }
  };

  const handleAddClaim = () => {
    if (newClaim.trim()) {
      onAddClaim(newClaim.trim());
      setNewClaim("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Type & Jurisdiction */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Type de document</Label>
          <Select value={documentType} onValueChange={onDocumentTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROCEDURAL_DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Juridiction</Label>
          <JurisdictionSelect value={jurisdiction} onChange={onJurisdictionChange} className="w-full" />
        </div>
      </div>

      {/* Court & Case Number */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="court">Tribunal</Label>
          <Input
            id="court"
            value={court}
            onChange={(e) => onCourtChange(e.target.value)}
            placeholder="ex: Tribunal judiciaire de Paris"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="caseNumber">Numéro de dossier (optionnel)</Label>
          <Input
            id="caseNumber"
            value={caseNumber}
            onChange={(e) => onCaseNumberChange(e.target.value)}
            placeholder="ex: RG 23/12345"
          />
        </div>
      </div>

      {/* Plaintiff */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Demandeur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              value={plaintiff.name}
              onChange={(e) => onPlaintiffChange({ name: e.target.value })}
              placeholder="Nom complet"
            />
          </div>
          <div className="space-y-2">
            <Label>Adresse</Label>
            <Input
              value={plaintiff.address}
              onChange={(e) => onPlaintiffChange({ address: e.target.value })}
              placeholder="Adresse complète"
            />
          </div>
        </CardContent>
      </Card>

      {/* Defendant */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Défendeur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              value={defendant.name}
              onChange={(e) => onDefendantChange({ name: e.target.value })}
              placeholder="Nom complet"
            />
          </div>
          <div className="space-y-2">
            <Label>Adresse</Label>
            <Input
              value={defendant.address}
              onChange={(e) => onDefendantChange({ address: e.target.value })}
              placeholder="Adresse complète"
            />
          </div>
        </CardContent>
      </Card>

      {/* Facts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Faits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {facts.map((fact, index) => (
            <div key={index} className="flex gap-2 items-start p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">{fact.date}</p>
                <p className="text-sm text-muted-foreground">{fact.description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onRemoveFact(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
            <Input
              type="date"
              value={newFactDate}
              onChange={(e) => setNewFactDate(e.target.value)}
              placeholder="Date"
            />
            <Input
              value={newFactDescription}
              onChange={(e) => setNewFactDescription(e.target.value)}
              placeholder="Description du fait"
            />
            <Button onClick={handleAddFact} disabled={!newFactDate || !newFactDescription}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Claims */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Demandes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {claims.map((claim, index) => (
            <div key={index} className="flex gap-2 items-center p-3 bg-muted rounded-lg">
              <p className="flex-1 text-sm">{claim}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onRemoveClaim(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newClaim}
              onChange={(e) => setNewClaim(e.target.value)}
              placeholder="ex: Condamner le défendeur au paiement de..."
              onKeyDown={(e) => e.key === "Enter" && handleAddClaim()}
            />
            <Button onClick={handleAddClaim} disabled={!newClaim.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Legal Basis */}
      <div className="space-y-2">
        <Label htmlFor="legalBasis">Fondement juridique</Label>
        <Textarea
          id="legalBasis"
          value={legalBasis}
          onChange={(e) => onLegalBasisChange(e.target.value)}
          placeholder="Articles de loi, jurisprudence applicable..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
}
