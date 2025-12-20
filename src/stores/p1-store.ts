import { create } from "zustand";
import type { RiskItem } from "@/types";

interface DocumentFile {
  uri: string;
  fileName: string;
  fileType: string;
}

interface P1State {
  contractContent: string;
  documentFile: DocumentFile | null;
  jurisdiction: string;
  userParty: string;
  analysis: string;
  risks: RiskItem[];
  isAnalyzing: boolean;
  currentTool: string | null;
  error: string | null;
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
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useP1Store = create<P1State>((set) => ({
  contractContent: "",
  documentFile: null,
  jurisdiction: "FR",
  userParty: "client",
  analysis: "",
  risks: [],
  isAnalyzing: false,
  currentTool: null,
  error: null,

  setContractContent: (contractContent) => set({ contractContent, analysis: "", risks: [], error: null }),
  setDocumentFile: (documentFile) => set({ documentFile }),
  setDocument: (contractContent, documentFile) => set({ contractContent, documentFile, analysis: "", risks: [], error: null }),
  setJurisdiction: (jurisdiction) => set({ jurisdiction }),
  setUserParty: (userParty) => set({ userParty }),
  setAnalysis: (analysis) => set({ analysis }),
  appendAnalysis: (content) => set((s) => ({ analysis: s.analysis + content })),
  setRisks: (risks) => set({ risks }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setCurrentTool: (currentTool) => set({ currentTool }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      contractContent: "",
      documentFile: null,
      analysis: "",
      risks: [],
      isAnalyzing: false,
      currentTool: null,
      error: null,
    }),
}));
