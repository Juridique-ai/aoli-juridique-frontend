import { create } from "zustand";
import type { P2Questionnaire } from "@/types";

// Phase results for progressive display
export interface P2PhaseResults {
  profile: Record<string, unknown> | null;
  costs: Record<string, unknown> | null;
  comparison: Record<string, unknown> | null;
  recommendation: Record<string, unknown> | null;
  timeline: Record<string, unknown> | null;
  checklist: Record<string, unknown> | null;
  resources: Record<string, unknown> | null;
}

export type P2Phase = keyof P2PhaseResults;

interface P2State {
  step: number;
  country: string;
  questionnaire: P2Questionnaire;
  result: string;
  isLoading: boolean;
  currentTool: string | null;
  progressMessage: string | null;
  error: string | null;
  // Phase-based results for progressive display
  phaseResults: P2PhaseResults;
  completedPhases: P2Phase[];
  currentPhase: P2Phase | null;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCountry: (country: string) => void;
  updateQuestionnaire: (data: Partial<P2Questionnaire>) => void;
  setResult: (result: string) => void;
  appendResult: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setCurrentTool: (tool: string | null) => void;
  setProgressMessage: (message: string | null) => void;
  setError: (error: string | null) => void;
  // Phase management
  setPhaseResult: (phase: P2Phase, result: Record<string, unknown>) => void;
  setCurrentPhase: (phase: P2Phase | null) => void;
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

const initialPhaseResults: P2PhaseResults = {
  profile: null,
  costs: null,
  comparison: null,
  recommendation: null,
  timeline: null,
  checklist: null,
  resources: null,
};

export const useP2Store = create<P2State>((set) => ({
  step: 1,
  country: "",
  questionnaire: initialQuestionnaire,
  result: "",
  isLoading: false,
  currentTool: null,
  progressMessage: null,
  error: null,
  phaseResults: initialPhaseResults,
  completedPhases: [],
  currentPhase: null,

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
  setProgressMessage: (progressMessage) => set({ progressMessage }),
  setError: (error) => set({ error }),
  setPhaseResult: (phase, result) => set((s) => ({
    phaseResults: { ...s.phaseResults, [phase]: result },
    completedPhases: s.completedPhases.includes(phase)
      ? s.completedPhases
      : [...s.completedPhases, phase],
  })),
  setCurrentPhase: (currentPhase) => set({ currentPhase }),
  reset: () =>
    set({
      step: 1,
      country: "",
      questionnaire: initialQuestionnaire,
      result: "",
      isLoading: false,
      currentTool: null,
      progressMessage: null,
      error: null,
      phaseResults: initialPhaseResults,
      completedPhases: [],
      currentPhase: null,
    }),
}));
