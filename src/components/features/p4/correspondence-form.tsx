"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JurisdictionSelect } from "@/components/shared/jurisdiction-select";
import { CORRESPONDENCE_TONES } from "@/lib/constants";
import type { P4Party } from "@/types";

interface CorrespondenceFormProps {
  sender: P4Party;
  recipient: P4Party;
  subject: string;
  context: string;
  objective: string;
  tone: string;
  jurisdiction: string;
  onSenderChange: (sender: Partial<P4Party>) => void;
  onRecipientChange: (recipient: Partial<P4Party>) => void;
  onSubjectChange: (subject: string) => void;
  onContextChange: (context: string) => void;
  onObjectiveChange: (objective: string) => void;
  onToneChange: (tone: "formal" | "firm" | "conciliatory") => void;
  onJurisdictionChange: (jurisdiction: string) => void;
}

export function CorrespondenceForm({
  sender,
  recipient,
  subject,
  context,
  objective,
  tone,
  jurisdiction,
  onSenderChange,
  onRecipientChange,
  onSubjectChange,
  onContextChange,
  onObjectiveChange,
  onToneChange,
  onJurisdictionChange,
}: CorrespondenceFormProps) {
  return (
    <div className="space-y-6">
      {/* Jurisdiction */}
      <div className="space-y-2">
        <Label>Juridiction</Label>
        <JurisdictionSelect value={jurisdiction} onChange={onJurisdictionChange} className="w-full" />
      </div>

      {/* Sender */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Expéditeur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="senderName">Nom</Label>
            <Input
              id="senderName"
              value={sender.name}
              onChange={(e) => onSenderChange({ name: e.target.value })}
              placeholder="Nom complet ou raison sociale"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senderAddress">Adresse</Label>
            <Textarea
              id="senderAddress"
              value={sender.address}
              onChange={(e) => onSenderChange({ address: e.target.value })}
              placeholder="Adresse complète"
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senderRole">Qualité</Label>
            <Input
              id="senderRole"
              value={sender.role}
              onChange={(e) => onSenderChange({ role: e.target.value })}
              placeholder="ex: Gérant, Particulier, Avocat"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recipient */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Destinataire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="recipientName">Nom</Label>
            <Input
              id="recipientName"
              value={recipient.name}
              onChange={(e) => onRecipientChange({ name: e.target.value })}
              placeholder="Nom complet ou raison sociale"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipientAddress">Adresse</Label>
            <Textarea
              id="recipientAddress"
              value={recipient.address}
              onChange={(e) => onRecipientChange({ address: e.target.value })}
              placeholder="Adresse complète"
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipientRole">Qualité</Label>
            <Input
              id="recipientRole"
              value={recipient.role}
              onChange={(e) => onRecipientChange({ role: e.target.value })}
              placeholder="ex: Directeur, Service client"
            />
          </div>
        </CardContent>
      </Card>

      {/* Subject & Content */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Objet du courrier</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="ex: Mise en demeure, Réclamation, Demande de résiliation"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="context">Contexte</Label>
          <Textarea
            id="context"
            value={context}
            onChange={(e) => onContextChange(e.target.value)}
            placeholder="Décrivez la situation et les événements pertinents..."
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="objective">Objectif du courrier</Label>
          <Textarea
            id="objective"
            value={objective}
            onChange={(e) => onObjectiveChange(e.target.value)}
            placeholder="Que souhaitez-vous obtenir ? (remboursement, résiliation, excuses...)"
            className="min-h-[80px]"
          />
        </div>
      </div>

      {/* Tone */}
      <div className="space-y-3">
        <Label>Ton du courrier</Label>
        <RadioGroup value={tone} onValueChange={(v) => onToneChange(v as "formal" | "firm" | "conciliatory")}>
          {CORRESPONDENCE_TONES.map((t) => (
            <div key={t.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
              <RadioGroupItem value={t.value} id={t.value} className="mt-1" />
              <div>
                <Label htmlFor={t.value} className="font-medium cursor-pointer">
                  {t.label}
                </Label>
                <p className="text-sm text-muted-foreground">{t.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
