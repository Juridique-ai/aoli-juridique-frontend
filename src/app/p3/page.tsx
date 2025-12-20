import { ChatContainer } from "@/components/features/p3/chat-container";

export const metadata = {
  title: "Conseiller Juridique - Juridique AI",
  description: "Posez vos questions juridiques et obtenez des réponses basées sur l'IA",
};

export default function P3Page() {
  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Conseiller Juridique</h1>
        <p className="text-muted-foreground mt-1">
          Posez vos questions juridiques et obtenez des réponses détaillées
        </p>
      </div>
      <ChatContainer />
    </div>
  );
}
