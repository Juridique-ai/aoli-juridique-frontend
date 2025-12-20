import { CardSkeleton } from "@/components/shared/page-skeleton";

export default function Loading() {
  return (
    <div className="container py-12 md:py-16 lg:py-20">
      <div className="text-center mb-12 md:mb-16 space-y-4">
        <div className="h-12 w-48 bg-muted rounded mx-auto animate-pulse" />
        <div className="h-6 w-96 bg-muted rounded mx-auto animate-pulse" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {[...Array(5)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
