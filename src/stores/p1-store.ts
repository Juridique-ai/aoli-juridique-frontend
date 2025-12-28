import { create } from "zustand";
import type { RiskItem } from "@/types";

interface DocumentFile {
  uri: string;
  fileName: string;
  fileType: string;
}

// Phase results for progressive display
export interface P1PhaseResults {
  metadata: Record<string, unknown> | null;
  validity: Record<string, unknown> | null;
  risks: Record<string, unknown> | null;
  fairness: Record<string, unknown> | null;
  compliance: Record<string, unknown> | null;
  summary: Record<string, unknown> | null;
  recommendations: Record<string, unknown> | null;
}

export type P1Phase = keyof P1PhaseResults;

interface P1State {
  contractContent: string;
  documentFile: DocumentFile | null;
  jurisdiction: string;
  userParty: string;
  analysis: string;
  risks: RiskItem[];
  isAnalyzing: boolean;
  currentTool: string | null;
  progressMessage: string | null;
  error: string | null;
  // New: Phase-based results for progressive display
  phaseResults: P1PhaseResults;
  completedPhases: P1Phase[];
  currentPhase: P1Phase | null;
  setContractContent: (content: string) => void;
  setDocumentFile: (file: DocumentFile | null) => void;
  setDocument: (content: string, file: DocumentFile | null) => void;
  setJurisdiction: (jurisdiction: string) => void;
  setUserParty: (party: string) => void;
  setAnalysis: (analysis: string) => void;
  appendAnalysis: (content: string) => void;
  setRisks: (risks: RiskItem[]) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setCurrentTool: (tool: string | null) => void;
  setProgressMessage: (message: string | null) => void;
  setError: (error: string | null) => void;
  // New: Phase management
  setPhaseResult: (phase: P1Phase, result: Record<string, unknown>) => void;
  setCurrentPhase: (phase: P1Phase | null) => void;
  reset: () => void;
}

const initialPhaseResults: P1PhaseResults = {
  metadata: null,
  validity: null,
  risks: null,
  fairness: null,
  compliance: null,
  summary: null,
  recommendations: null,
};

export const useP1Store = create<P1State>((set) => ({
  contractContent: "",
  documentFile: null,
  jurisdiction: "FR",
  userParty: "client",
  analysis: "",
  risks: [],
  isAnalyzing: false,
  currentTool: null,
  progressMessage: null,
  error: null,
  phaseResults: initialPhaseResults,
  completedPhases: [],
  currentPhase: null,

  setContractContent: (contractContent) => set({
    contractContent,
    analysis: "",
    risks: [],
    error: null,
    phaseResults: initialPhaseResults,
    completedPhases: [],
    currentPhase: null,
  }),
  setDocumentFile: (documentFile) => set({ documentFile }),
  setDocument: (contractContent, documentFile) => set({
    contractContent,
    documentFile,
    analysis: "",
    risks: [],
    error: null,
    phaseResults: initialPhaseResults,
    completedPhases: [],
    currentPhase: null,
  }),
  setJurisdiction: (jurisdiction) => set({ jurisdiction }),
  setUserParty: (userParty) => set({ userParty }),
  setAnalysis: (analysis) => set({ analysis }),
  appendAnalysis: (content) => set((s) => ({ analysis: s.analysis + content })),
  setRisks: (risks) => set({ risks }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
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
      contractContent: "",
      documentFile: null,
      analysis: "",
      risks: [],
      isAnalyzing: false,
      currentTool: null,
      progressMessage: null,
      error: null,
      phaseResults: initialPhaseResults,
      completedPhases: [],
      currentPhase: null,
    }),
}));
