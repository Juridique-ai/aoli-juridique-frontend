import type { Jurisdiction } from "@/types";

export const JURISDICTIONS: Jurisdiction[] = [
  { value: "FR", label: "France", flag: "🇫🇷" },
  { value: "BE", label: "Belgique", flag: "🇧🇪" },
  { value: "LU", label: "Luxembourg", flag: "🇱🇺" },
  { value: "DE", label: "Allemagne", flag: "🇩🇪" },
  { value: "CH", label: "Suisse", flag: "🇨🇭" },
];

export const USER_PARTIES = [
  { value: "client", label: "Client" },
  { value: "prestataire", label: "Prestataire" },
  { value: "acheteur", label: "Acheteur" },
  { value: "vendeur", label: "Vendeur" },
  { value: "employee", label: "Employé" },
  { value: "employer", label: "Employeur" },
  { value: "locataire", label: "Locataire" },
  { value: "bailleur", label: "Bailleur" },
];

export const CORRESPONDENCE_TONES = [
  { value: "formal", label: "Formel", description: "Ton neutre et professionnel" },
  { value: "firm", label: "Ferme", description: "Ton assertif mais respectueux" },
  { value: "conciliatory", label: "Conciliant", description: "Ton amiable et ouvert" },
] as const;

export const PROCEDURAL_DOCUMENT_TYPES = [
  { value: "assignation", label: "Assignation" },
  { value: "conclusions", label: "Conclusions" },
  { value: "requete", label: "Requête" },
  { value: "memoire", label: "Mémoire" },
  { value: "pourvoi", label: "Pourvoi en cassation" },
];

export const TOOL_LABELS: Record<string, string> = {
  perplexity_search_legal: "Recherche dans la base juridique...",
  perplexity_search_formation: "Recherche d'informations sur les structures...",
  perplexity_search_jurisprudence: "Recherche de jurisprudence...",
  verify_legal_claim: "Vérification des références légales...",
  search_legal_database: "Consultation de la base de données...",
};
