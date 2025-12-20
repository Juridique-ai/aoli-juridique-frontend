// Common types used across the application

export interface Jurisdiction {
  value: string;
  label: string;
  flag: string;
}

// Clarification (Interactive Questions) - must be before Message
export type ClarificationQuestionType = "single_choice" | "multi_choice" | "text" | "amount";

export interface ClarificationOption {
  id: string;
  label: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  type: ClarificationQuestionType;
  required: boolean;
  options?: ClarificationOption[];
  allowOther?: boolean;
  placeholder?: string;
}

export interface Clarification {
  title: string;
  questions: ClarificationQuestion[];
}

export interface ClarificationAnswers {
  [questionId: string]: string | string[]; // string for single_choice/text/amount, string[] for multi_choice
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  clarification?: Clarification;
}

export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface RiskItem {
  level: RiskLevel;
  title: string;
  description: string;
  clause?: string;
}

// P1 - Contract Analysis
export interface P1Request {
  documentContent: string;
  userParty: string;
  jurisdiction: string;
}

export interface P1Response {
  analysis: string;
  risks: RiskItem[];
}

// P2 - Formation Assistant
export interface P2Questionnaire {
  activityType: string;
  activityDescription: string;
  foundersCount: number;
  plannedCapital: number;
  fundraisingPlanned: boolean;
  employeesPlanned: number;
  personalAssetProtection: boolean;
  exitPlanned: boolean;
}

export interface P2Request {
  country: string;
  questionnaire: P2Questionnaire;
}

// P3 - Legal Advisor
export interface P3Request {
  message: string;
  jurisdiction: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

// P4 - Legal Correspondence
export interface P4Party {
  name: string;
  address: string;
  role: string;
}

export interface P4Request {
  sender: P4Party;
  recipient: P4Party;
  subject: string;
  context: string;
  objective: string;
  tone: "formal" | "firm" | "conciliatory";
  jurisdiction: string;
}

// P5 - Procedural Documents
export interface P5Fact {
  date: string;
  description: string;
}

export interface P5Request {
  documentType: string;
  jurisdiction: string;
  court: string;
  caseNumber?: string;
  parties: {
    plaintiff: P4Party;
    defendant: P4Party;
  };
  facts: P5Fact[];
  claims: string[];
  legalBasis: string;
}
