"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

/**
 * P1 Page Loading Skeleton
 * Matches the exact layout and styling of the P1 upload screen
 */
export default function Loading() {
  return (
    <div className="container py-8 max-w-3xl animate-fade-in">
      {/* Header - matches P1 page header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
            <div className="relative p-3 rounded-xl bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analyse de Contrat</h1>
            <p className="text-muted-foreground mt-1">
              Importez votre contrat pour obtenir une analyse juridique détaillée
            </p>
          </div>
        </div>
      </div>

      {/* Upload area skeleton - matches ContractUpload layout */}
      <div className="space-y-6">
        {/* Mode toggle skeleton */}
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>

        {/* Dropzone skeleton */}
        <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col items-center">
            <Skeleton className="h-16 w-16 rounded-full mb-4" />
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-36 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-12 rounded" />
              <Skeleton className="h-5 w-12 rounded" />
              <Skeleton className="h-5 w-14 rounded" />
              <Skeleton className="h-5 w-10 rounded" />
            </div>
          </div>
        </div>

        {/* Tips skeleton */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
          <Skeleton className="h-5 w-5 rounded flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
