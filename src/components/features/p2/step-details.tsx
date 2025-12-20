"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface StepDetailsProps {
  foundersCount: number;
  plannedCapital: number;
  employeesPlanned: number;
  onChange: (data: { foundersCount?: number; plannedCapital?: number; employeesPlanned?: number }) => void;
}

export function StepDetails({ foundersCount, plannedCapital, employeesPlanned, onChange }: StepDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Détails du projet</h2>
        <p className="text-muted-foreground mt-1">
          Ces informations nous aideront à recommander la structure adaptée
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label>Nombre de fondateurs / associés</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[foundersCount]}
              onValueChange={([v]) => onChange({ foundersCount: v })}
              min={1}
              max={10}
              step={1}
              className="flex-1"
            />
            <span className="w-12 text-center font-medium">{foundersCount}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="plannedCapital">Capital prévu (€)</Label>
          <Input
            id="plannedCapital"
            type="number"
            value={plannedCapital || ""}
            onChange={(e) => onChange({ plannedCapital: Number(e.target.value) || 0 })}
            placeholder="ex: 10000"
          />
          <p className="text-xs text-muted-foreground">
            Le capital minimum varie selon la forme juridique et le pays
          </p>
        </div>

        <div className="space-y-4">
          <Label>Nombre d&apos;employés prévus (1ère année)</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[employeesPlanned]}
              onValueChange={([v]) => onChange({ employeesPlanned: v })}
              min={0}
              max={50}
              step={1}
              className="flex-1"
            />
            <span className="w-12 text-center font-medium">{employeesPlanned}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
