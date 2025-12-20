"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JURISDICTIONS } from "@/lib/constants";

interface JurisdictionSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function JurisdictionSelect({ value, onChange, className }: JurisdictionSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className ?? "w-[180px]"}>
        <SelectValue placeholder="Juridiction" />
      </SelectTrigger>
      <SelectContent>
        {JURISDICTIONS.map((j) => (
          <SelectItem key={j.value} value={j.value}>
            <span className="flex items-center gap-2">
              <span>{j.flag}</span>
              <span>{j.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
