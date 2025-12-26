import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
  className?: string;
}

export function ToolCard({
  href,
  icon: Icon,
  title,
  description,
  gradient = "from-primary/20 to-accent/20",
  className,
}: ToolCardProps) {
  return (
    <Link href={href} className="block group">
      <div
        className={cn(
          // Base styles
          "relative h-full p-6 rounded-2xl",
          // Glassmorphism
          "bg-card/50 backdrop-blur-sm",
          // Border with gradient on hover
          "border border-border/50",
          // Transitions
          "transition-all duration-300 ease-out",
          // Hover effects
          "hover:bg-card/80 hover:border-primary/30",
          "hover:shadow-xl hover:shadow-primary/5",
          "hover:-translate-y-1",
          // Focus styles
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          className
        )}
      >
        {/* Gradient background on hover */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300",
            "group-hover:opacity-100",
            gradient
          )}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div
            className={cn(
              "p-4 rounded-xl",
              "bg-primary/10 text-primary",
              "transition-all duration-300",
              "group-hover:bg-primary group-hover:text-primary-foreground",
              "group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20"
            )}
          >
            <Icon className="h-7 w-7" />
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h3
              className={cn(
                "font-semibold text-lg",
                "transition-colors duration-300",
                "group-hover:text-primary"
              )}
            >
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Glow effect on hover */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl opacity-0",
            "transition-opacity duration-300",
            "group-hover:opacity-100",
            "glow-sm"
          )}
          style={{ pointerEvents: "none" }}
        />
      </div>
    </Link>
  );
}
