import { ChatSkeleton } from "@/components/shared/page-skeleton";

export default function Loading() {
  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-72 bg-muted rounded animate-pulse" />
      </div>
      <ChatSkeleton />
    </div>
  );
}
