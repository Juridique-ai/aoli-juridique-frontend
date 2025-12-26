"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-all duration-200 hover:opacity-80 group"
        >
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105">
            <Scale className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight">
            Juridique <span className="text-primary">AI</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
