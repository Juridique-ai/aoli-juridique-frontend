import { create } from "zustand";
import type { P4Party, P5Fact } from "@/types";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface P5State {
  documentType: string;
  jurisdiction: string;
  court: string;
  caseNumber: string;
  plaintiff: P4Party;
  defendant: P4Party;
  facts: P5Fact[];
  claims: string[];
  legalBasis: string;
  result: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  structuredResult: any | null;
  conversation: ConversationMessage[];
  clarifyingQuestions: string[];
  isLoading: boolean;
  currentTool: string | null;
  error: string | null;
  setDocumentType: (type: string) => void;
  setJurisdiction: (jurisdiction: string) => void;
  setCourt: (court: string) => void;
  setCaseNumber: (caseNumber: string) => void;
  setPlaintiff: (plaintiff: Partial<P4Party>) => void;
  setDefendant: (defendant: Partial<P4Party>) => void;
  addFact: (fact: P5Fact) => void;
  removeFact: (index: number) => void;
  updateFact: (index: number, fact: P5Fact) => void;
  addClaim: (claim: string) => void;
  removeClaim: (index: number) => void;
  updateClaim: (index: number, claim: string) => void;
  setLegalBasis: (basis: string) => void;
  setResult: (result: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setStructuredResult: (result: any) => void;
  appendResult: (content: string) => void;
  addConversation: (message: ConversationMessage) => void;
  setClarifyingQuestions: (questions: string[]) => void;
  clearClarifyingQuestions: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentTool: (tool: string | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const emptyParty: P4Party = { name: "", address: "", role: "" };

export const useP5Store = create<P5State>((set) => ({
  documentType: "assignation",
  jurisdiction: "FR",
  court: "",
  caseNumber: "",
  plaintiff: { ...emptyParty },
  defendant: { ...emptyParty },
  facts: [],
  claims: [],
  legalBasis: "",
  result: "",
  structuredResult: null,
  conversation: [],
  clarifyingQuestions: [],
  isLoading: false,
  currentTool: null,
  error: null,

  setDocumentType: (documentType) => set({ documentType }),
  setJurisdiction: (jurisdiction) => set({ jurisdiction }),
  setCourt: (court) => set({ court }),
  setCaseNumber: (caseNumber) => set({ caseNumber }),
  setPlaintiff: (plaintiff) => set((s) => ({ plaintiff: { ...s.plaintiff, ...plaintiff } })),
  setDefendant: (defendant) => set((s) => ({ defendant: { ...s.defendant, ...defendant } })),
  addFact: (fact) => set((s) => ({ facts: [...s.facts, fact] })),
  removeFact: (index) => set((s) => ({ facts: s.facts.filter((_, i) => i !== index) })),
  updateFact: (index, fact) =>
    set((s) => ({ facts: s.facts.map((f, i) => (i === index ? fact : f)) })),
  addClaim: (claim) => set((s) => ({ claims: [...s.claims, claim] })),
  removeClaim: (index) => set((s) => ({ claims: s.claims.filter((_, i) => i !== index) })),
  updateClaim: (index, claim) =>
    set((s) => ({ claims: s.claims.map((c, i) => (i === index ? claim : c)) })),
  setLegalBasis: (legalBasis) => set({ legalBasis }),
  setResult: (result) => set({ result }),
  setStructuredResult: (structuredResult) => set({ structuredResult }),
  appendResult: (content) => set((s) => ({ result: s.result + content })),
  addConversation: (message) => set((s) => ({ conversation: [...s.conversation, message] })),
  setClarifyingQuestions: (clarifyingQuestions) => set({ clarifyingQuestions }),
  clearClarifyingQuestions: () => set({ clarifyingQuestions: [] }),
  setLoading: (isLoading) => set({ isLoading }),
  setCurrentTool: (currentTool) => set({ currentTool }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      documentType: "assignation",
      court: "",
      caseNumber: "",
      plaintiff: { ...emptyParty },
      defendant: { ...emptyParty },
      facts: [],
      claims: [],
      legalBasis: "",
      result: "",
      structuredResult: null,
      conversation: [],
      clarifyingQuestions: [],
      isLoading: false,
      currentTool: null,
      error: null,
    }),
}));
