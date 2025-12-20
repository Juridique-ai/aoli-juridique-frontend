import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function ToolCard({ href, icon: Icon, title, description, className }: ToolCardProps) {
  return (
    <Link href={href} className="block">
      <Card
        className={cn(
          "h-full transition-all duration-200",
          "hover:shadow-lg hover:-translate-y-1",
          "cursor-pointer group border-border/50",
          className
        )}
      >
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
