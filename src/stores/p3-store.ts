import { create } from "zustand";
import type { Message, Clarification } from "@/types";

interface P3State {
  messages: Message[];
  isLoading: boolean;
  jurisdiction: string;
  currentTool: string | null;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => string;
  updateMessage: (id: string, content: string) => void;
  setClarification: (id: string, clarification: Clarification | undefined) => void;
  setStreaming: (id: string, isStreaming: boolean) => void;
  setLoading: (loading: boolean) => void;
  setJurisdiction: (jurisdiction: string) => void;
  setCurrentTool: (tool: string | null) => void;
  clearChat: () => void;
}

export const useP3Store = create<P3State>((set, get) => ({
  messages: [],
  isLoading: false,
  jurisdiction: "FR",
  currentTool: null,

  addMessage: (message) => {
    const id = crypto.randomUUID();
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id, timestamp: new Date() },
      ],
    }));
    return id;
  },

  updateMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content } : m
      ),
    })),

  setClarification: (id, clarification) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, clarification } : m
      ),
    })),

  setStreaming: (id, isStreaming) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, isStreaming } : m
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setJurisdiction: (jurisdiction) => set({ jurisdiction }),
  setCurrentTool: (currentTool) => set({ currentTool }),
  clearChat: () => set({ messages: [], currentTool: null }),
}));
