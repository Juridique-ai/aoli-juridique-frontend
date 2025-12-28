import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if the app is running in development environment.
 * Uses NEXT_PUBLIC_SHOW_DEMO env var, or falls back to checking if API URL contains "dev".
 */
export function isDevEnvironment(): boolean {
  // Explicit env var takes precedence
  if (process.env.NEXT_PUBLIC_SHOW_DEMO === "true") return true;
  if (process.env.NEXT_PUBLIC_SHOW_DEMO === "false") return false;

  // Fall back to checking API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  return apiUrl.includes("-dev") || apiUrl.includes("localhost");
}
