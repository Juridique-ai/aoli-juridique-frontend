import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types";

interface RiskBadgeProps {
  level: RiskLevel;
  label?: string;
  showIcon?: boolean;
}

const styles: Record<RiskLevel, string> = {
  critical: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
};

const labels: Record<RiskLevel, string> = {
  critical: "Risque critique",
  high: "Risque élevé",
  medium: "Risque modéré",
  low: "Risque faible",
};

export function RiskBadge({ level, label, showIcon = true }: RiskBadgeProps) {
  const icons: Record<RiskLevel, string> = {
    critical: "●",
    high: "●",
    medium: "●",
    low: "●",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        styles[level]
      )}
    >
      {showIcon && <span className="text-[8px]">{icons[level]}</span>}
      <span>{label || labels[level]}</span>
    </span>
  );
}
