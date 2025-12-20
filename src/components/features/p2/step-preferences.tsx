"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, TrendingUp, Users } from "lucide-react";

interface StepPreferencesProps {
  personalAssetProtection: boolean;
  fundraisingPlanned: boolean;
  exitPlanned: boolean;
  onChange: (data: { personalAssetProtection?: boolean; fundraisingPlanned?: boolean; exitPlanned?: boolean }) => void;
}

export function StepPreferences({
  personalAssetProtection,
  fundraisingPlanned,
  exitPlanned,
  onChange
}: StepPreferencesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Vos préférences</h2>
        <p className="text-muted-foreground mt-1">
          Ces critères influenceront le choix de la structure juridique
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Protection du patrimoine personnel</CardTitle>
                  <CardDescription className="text-sm">
                    Limiter la responsabilité aux apports
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={personalAssetProtection}
                onCheckedChange={(v) => onChange({ personalAssetProtection: v })}
              />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Levée de fonds prévue</CardTitle>
                  <CardDescription className="text-sm">
                    Faire entrer des investisseurs au capital
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={fundraisingPlanned}
                onCheckedChange={(v) => onChange({ fundraisingPlanned: v })}
              />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Sortie envisagée</CardTitle>
                  <CardDescription className="text-sm">
                    Vente de l&apos;entreprise ou cession de parts
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={exitPlanned}
                onCheckedChange={(v) => onChange({ exitPlanned: v })}
              />
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
