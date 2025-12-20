import { create } from "zustand";
import type { P4Party } from "@/types";

type Tone = "formal" | "firm" | "conciliatory";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

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
  error: string | null;
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
  setError: (error: string | null) => void;
  addConversation: (message: ConversationMessage) => void;
  setClarifyingQuestions: (questions: string[]) => void;
  clearClarifyingQuestions: () => void;
  reset: () => void;
}

const emptyParty: P4Party = { name: "", address: "", role: "" };

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
  error: null,
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
  setError: (error) => set({ error }),
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
      error: null,
      conversation: [],
      clarifyingQuestions: [],
    }),
}));
