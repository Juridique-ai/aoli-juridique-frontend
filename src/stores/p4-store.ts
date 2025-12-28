import { create } from "zustand";
import type { P4Party } from "@/types";

type Tone = "formal" | "firm" | "conciliatory";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

// Phase results for progressive display
export interface P4PhaseResults {
  facts: Record<string, unknown> | null;
  legal: Record<string, unknown> | null;
  tone: Record<string, unknown> | null;
  draft: Record<string, unknown> | null;
  delivery: Record<string, unknown> | null;
}

export type P4Phase = keyof P4PhaseResults;

interface P4State {
  sender: P4Party;
  recipient: P4Party;
  subject: string;
  context: string;
  objective: string;
  tone: Tone;
  jurisdiction: string;
  result: string;
  isLoading: boolean;
  currentTool: string | null;
  progressMessage: string | null;
  error: string | null;
  // Phase-based results for progressive display
  phaseResults: P4PhaseResults;
  completedPhases: P4Phase[];
  currentPhase: P4Phase | null;
  // Conversation for clarifications
  conversation: ConversationMessage[];
  clarifyingQuestions: string[];
  setSender: (sender: Partial<P4Party>) => void;
  setRecipient: (recipient: Partial<P4Party>) => void;
  setSubject: (subject: string) => void;
  setContext: (context: string) => void;
  setObjective: (objective: string) => void;
  setTone: (tone: Tone) => void;
  setJurisdiction: (jurisdiction: string) => void;
  setResult: (result: string) => void;
  appendResult: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setCurrentTool: (tool: string | null) => void;
  setProgressMessage: (message: string | null) => void;
  setError: (error: string | null) => void;
  // Phase management
  setPhaseResult: (phase: P4Phase, result: Record<string, unknown>) => void;
  setCurrentPhase: (phase: P4Phase | null) => void;
  addConversation: (message: ConversationMessage) => void;
  setClarifyingQuestions: (questions: string[]) => void;
  clearClarifyingQuestions: () => void;
  reset: () => void;
}

const emptyParty: P4Party = { name: "", address: "", role: "" };

const initialPhaseResults: P4PhaseResults = {
  facts: null,
  legal: null,
  tone: null,
  draft: null,
  delivery: null,
};

export const useP4Store = create<P4State>((set) => ({
  sender: { ...emptyParty },
  recipient: { ...emptyParty },
  subject: "",
  context: "",
  objective: "",
  tone: "formal",
  jurisdiction: "FR",
  result: "",
  isLoading: false,
  currentTool: null,
  progressMessage: null,
  error: null,
  phaseResults: initialPhaseResults,
  completedPhases: [],
  currentPhase: null,
  conversation: [],
  clarifyingQuestions: [],

  setSender: (sender) => set((s) => ({ sender: { ...s.sender, ...sender } })),
  setRecipient: (recipient) => set((s) => ({ recipient: { ...s.recipient, ...recipient } })),
  setSubject: (subject) => set({ subject }),
  setContext: (context) => set({ context }),
  setObjective: (objective) => set({ objective }),
  setTone: (tone) => set({ tone }),
  setJurisdiction: (jurisdiction) => set({ jurisdiction }),
  setResult: (result) => set({ result }),
  appendResult: (content) => set((s) => ({ result: s.result + content })),
  setLoading: (isLoading) => set({ isLoading }),
  setCurrentTool: (currentTool) => set({ currentTool }),
  setProgressMessage: (progressMessage) => set({ progressMessage }),
  setError: (error) => set({ error }),
  setPhaseResult: (phase, result) => set((s) => ({
    phaseResults: { ...s.phaseResults, [phase]: result },
    completedPhases: s.completedPhases.includes(phase)
      ? s.completedPhases
      : [...s.completedPhases, phase],
  })),
  setCurrentPhase: (currentPhase) => set({ currentPhase }),
  addConversation: (message) => set((s) => ({ conversation: [...s.conversation, message] })),
  setClarifyingQuestions: (questions) => set({ clarifyingQuestions: questions }),
  clearClarifyingQuestions: () => set({ clarifyingQuestions: [] }),
  reset: () =>
    set({
      sender: { ...emptyParty },
      recipient: { ...emptyParty },
      subject: "",
      context: "",
      objective: "",
      tone: "formal",
      result: "",
      isLoading: false,
      currentTool: null,
      progressMessage: null,
      error: null,
      phaseResults: initialPhaseResults,
      completedPhases: [],
      currentPhase: null,
      conversation: [],
      clarifyingQuestions: [],
    }),
}));
