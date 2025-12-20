"use client";

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

const ACTIVITY_TYPES = [
  { value: "commerce", label: "Commerce" },
  { value: "services", label: "Services" },
  { value: "tech", label: "Technologie / IT" },
  { value: "consulting", label: "Conseil" },
  { value: "artisanat", label: "Artisanat" },
  { value: "industrie", label: "Industrie" },
  { value: "immobilier", label: "Immobilier" },
  { value: "sante", label: "Santé" },
  { value: "autre", label: "Autre" },
];

interface StepActivityProps {
  activityType: string;
  activityDescription: string;
  onChange: (data: { activityType?: string; activityDescription?: string }) => void;
}

export function StepActivity({ activityType, activityDescription, onChange }: StepActivityProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Quelle est votre activité ?</h2>
        <p className="text-muted-foreground mt-1">
          Décrivez l&apos;activité de votre future entreprise
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="activityType">Type d&apos;activité</Label>
          <Select value={activityType} onValueChange={(v) => onChange({ activityType: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un type d'activité" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activityDescription">Description de l&apos;activité</Label>
          <Textarea
            id="activityDescription"
            value={activityDescription}
            onChange={(e) => onChange({ activityDescription: e.target.value })}
            placeholder="Décrivez en quelques phrases l'activité de votre entreprise..."
            className="min-h-[120px]"
          />
        </div>
      </div>
    </div>
  );
}
