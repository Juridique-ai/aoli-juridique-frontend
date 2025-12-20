"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { JURISDICTIONS } from "@/lib/constants";

interface StepCountryProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepCountry({ value, onChange }: StepCountryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Où souhaitez-vous créer votre entreprise ?</h2>
        <p className="text-muted-foreground mt-1">
          Sélectionnez le pays où vous souhaitez établir votre structure juridique
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {JURISDICTIONS.map((j) => (
          <Card
            key={j.value}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              value === j.value && "border-primary ring-2 ring-primary/20"
            )}
            onClick={() => onChange(j.value)}
          >
            <CardHeader className="text-center pb-2">
              <div className="text-4xl mb-2">{j.flag}</div>
              <CardTitle className="text-lg">{j.label}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
