import { ChatContainer } from "@/components/features/p3/chat-container";
import { MessageSquare } from "lucide-react";

export const metadata = {
  title: "Conseiller Juridique - Juridique AI",
  description: "Posez vos questions juridiques et obtenez des réponses basées sur l'IA",
};

export default function P3Page() {
  return (
    <div className="container py-8 max-w-4xl animate-fade-in">
      {/* Page Header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
          <div className="relative p-3 rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conseiller Juridique</h1>
          <p className="text-muted-foreground mt-1">
            Posez vos questions juridiques et obtenez des réponses détaillées
          </p>
        </div>
      </div>
      <ChatContainer />
    </div>
  );
}
