import { create } from "zustand";
import type { P2Questionnaire } from "@/types";

interface P2State {
  step: number;
  country: string;
  questionnaire: P2Questionnaire;
  result: string;
  isLoading: boolean;
  currentTool: string | null;
  error: string | null;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCountry: (country: string) => void;
  updateQuestionnaire: (data: Partial<P2Questionnaire>) => void;
  setResult: (result: string) => void;
  appendResult: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setCurrentTool: (tool: string | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialQuestionnaire: P2Questionnaire = {
  activityType: "",
  activityDescription: "",
  foundersCount: 1,
  plannedCapital: 0,
  fundraisingPlanned: false,
  employeesPlanned: 0,
  personalAssetProtection: true,
  exitPlanned: false,
};

export const useP2Store = create<P2State>((set) => ({
  step: 1,
  country: "",
  questionnaire: initialQuestionnaire,
  result: "",
  isLoading: false,
  currentTool: null,
  error: null,

  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(5, s.step + 1) })),
  prevStep: () => set((s) => ({ step: Math.max(1, s.step - 1) })),
  setCountry: (country) => set({ country }),
  updateQuestionnaire: (data) =>
    set((s) => ({ questionnaire: { ...s.questionnaire, ...data } })),
  setResult: (result) => set({ result }),
  appendResult: (content) => set((s) => ({ result: s.result + content })),
  setLoading: (isLoading) => set({ isLoading }),
  setCurrentTool: (currentTool) => set({ currentTool }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      step: 1,
      country: "",
      questionnaire: initialQuestionnaire,
      result: "",
      isLoading: false,
      currentTool: null,
      error: null,
    }),
}));
