# Frontend Development Roadmap

> Step-by-step guide to build the Juridique AI frontend.
> Follow each phase in order. Check off tasks as you complete them.

---

## Prerequisites

Before starting, ensure you have:

- [ ] Node.js 20.x LTS installed
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Access to backend API key
- [ ] Read the spec documents:
  - [FRONTEND-SPEC.md](./FRONTEND-SPEC.md)
  - [DESIGN-GUIDELINES.md](./DESIGN-GUIDELINES.md)
  - [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)

---

## Phase 1: Project Setup (Day 1)

### 1.1 Create Next.js Project

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

When prompted:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **Yes**
- App Router: **Yes**
- Import alias: **@/***

### 1.2 Install Core Dependencies

```bash
# UI & Styling
pnpm add class-variance-authority clsx tailwind-merge

# State Management
pnpm add zustand @tanstack/react-query

# Forms
pnpm add react-hook-form @hookform/resolvers zod

# Animation
pnpm add framer-motion

# Icons
pnpm add lucide-react

# Utilities
pnpm add date-fns react-markdown remark-gfm
```

### 1.3 Install shadcn/ui

```bash
npx shadcn@latest init
```

When prompted:
- Style: **New York**
- Base color: **Slate**
- CSS variables: **Yes**

### 1.4 Add shadcn Components

```bash
npx shadcn@latest add button card dialog dropdown-menu form input label select separator skeleton tabs textarea toast tooltip progress
```

### 1.5 Setup Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://aoli-juridique-dev-func.azurewebsites.net
NEXT_PUBLIC_API_KEY=your-function-key-here
```

Create `.env.example`:

```bash
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_API_KEY=
```

### 1.6 Configure Tailwind Theme

Update `src/app/globals.css` with design tokens from DESIGN-GUIDELINES.md.

**Checklist Phase 1:**
- [ ] Next.js project created
- [ ] All dependencies installed
- [ ] shadcn/ui initialized
- [ ] Environment variables set
- [ ] Tailwind configured

---

## Phase 2: Core Infrastructure (Day 2)

### 2.1 Setup Folder Structure

```bash
mkdir -p src/components/{ui,layout,shared,features/{p1,p2,p3,p4,p5}}
mkdir -p src/lib/{api,utils,constants}
mkdir -p src/hooks
mkdir -p src/stores
mkdir -p src/types
```

### 2.2 Create Utility Files

**`src/lib/utils/cn.ts`**
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 2.3 Create API Client

**`src/lib/api/client.ts`**
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-functions-key": API_KEY!,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }

  return response.json();
}
```

### 2.4 Create API Endpoints

**`src/lib/api/endpoints.ts`**
```typescript
export const endpoints = {
  health: "/api/health",
  p1: {
    analyze: "/api/p1/analyze",
    stream: "/api/p1/analyze/stream",
  },
  p2: {
    analyze: "/api/p2/analyze",
    stream: "/api/p2/analyze/stream",
  },
  p3: {
    advise: "/api/p3/advise",
    stream: "/api/p3/advise/stream",
  },
  p4: {
    draft: "/api/p4/draft",
    stream: "/api/p4/draft/stream",
  },
  p5: {
    draft: "/api/p5/draft",
    stream: "/api/p5/draft/stream",
  },
};
```

### 2.5 Create Streaming Hook

**`src/hooks/use-streaming.ts`**

Copy the implementation from FRONTEND-SPEC.md Section "Streaming Implementation".

### 2.6 Create UI Store

**`src/stores/ui-store.ts`**
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarOpen: true,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: "ui-storage" }
  )
);
```

**Checklist Phase 2:**
- [ ] Folder structure created
- [ ] Utility functions ready
- [ ] API client configured
- [ ] Streaming hook implemented
- [ ] UI store created

---

## Phase 3: Layout Components (Day 3)

### 3.1 Create Header Component

**`src/components/layout/header.tsx`**

```typescript
"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Juridique AI</span>
        </Link>
        <nav className="flex items-center gap-4">
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

### 3.2 Create Theme Toggle

**`src/components/layout/theme-toggle.tsx`**

```typescript
"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

### 3.3 Create Footer Component

**`src/components/layout/footer.tsx`**

```typescript
export function Footer() {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} AOLI - Juridique AI</p>
    </footer>
  );
}
```

### 3.4 Update Root Layout

**`src/app/layout.tsx`**

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Juridique AI",
  description: "AI-powered legal assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
```

**Checklist Phase 3:**
- [ ] Header component with logo
- [ ] Theme toggle working
- [ ] Footer component
- [ ] Root layout updated
- [ ] Dark mode functional

---

## Phase 4: Shared Components (Day 4)

### 4.1 Streaming Text Component

**`src/components/shared/streaming-text.tsx`**

```typescript
"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
  className?: string;
}

export function StreamingText({ content, isStreaming, className }: StreamingTextProps) {
  const [displayedContent, setDisplayedContent] = useState("");

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content);
      return;
    }

    // Typewriter effect handled by SSE chunks
    setDisplayedContent(content);
  }, [content, isStreaming]);

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayedContent}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
      )}
    </div>
  );
}
```

### 4.2 Tool Progress Component

**`src/components/shared/tool-progress.tsx`**

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const toolLabels: Record<string, string> = {
  perplexity_search_legal: "Recherche dans la base juridique...",
  perplexity_search_formation: "Recherche d'informations...",
  verify_legal_claim: "Vérification des références...",
};

interface ToolProgressProps {
  tool: string | null;
}

export function ToolProgress({ tool }: ToolProgressProps) {
  return (
    <AnimatePresence>
      {tool && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 text-sm text-muted-foreground py-2"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{toolLabels[tool] || "Traitement en cours..."}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 4.3 Jurisdiction Select Component

**`src/components/shared/jurisdiction-select.tsx`**

```typescript
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const jurisdictions = [
  { value: "FR", label: "France", flag: "🇫🇷" },
  { value: "BE", label: "Belgique", flag: "🇧🇪" },
  { value: "LU", label: "Luxembourg", flag: "🇱🇺" },
  { value: "DE", label: "Allemagne", flag: "🇩🇪" },
];

interface JurisdictionSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function JurisdictionSelect({ value, onChange }: JurisdictionSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Juridiction" />
      </SelectTrigger>
      <SelectContent>
        {jurisdictions.map((j) => (
          <SelectItem key={j.value} value={j.value}>
            <span className="flex items-center gap-2">
              <span>{j.flag}</span>
              <span>{j.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### 4.4 Risk Badge Component

**`src/components/shared/risk-badge.tsx`**

```typescript
import { cn } from "@/lib/utils/cn";

interface RiskBadgeProps {
  level: "high" | "medium" | "low";
  label?: string;
}

const styles = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const icons = {
  high: "🔴",
  medium: "🟡",
  low: "🟢",
};

export function RiskBadge({ level, label }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        styles[level]
      )}
    >
      <span>{icons[level]}</span>
      {label && <span>{label}</span>}
    </span>
  );
}
```

### 4.5 Loading Skeleton Component

**`src/components/shared/page-skeleton.tsx`**

```typescript
import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="grid gap-4 mt-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
```

**Checklist Phase 4:**
- [ ] StreamingText component
- [ ] ToolProgress component
- [ ] JurisdictionSelect component
- [ ] RiskBadge component
- [ ] PageSkeleton component

---

## Phase 5: Dashboard Page (Day 5)

### 5.1 Create Tool Card Component

**`src/components/shared/tool-card.tsx`**

```typescript
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ToolCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function ToolCard({ href, icon: Icon, title, description, className }: ToolCardProps) {
  return (
    <Link href={href}>
      <Card className={cn(
        "h-full transition-all hover:shadow-lg hover:-translate-y-1",
        "cursor-pointer group",
        className
      )}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 text-primary w-fit group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="h-8 w-8" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
```

### 5.2 Create Dashboard Page

**`src/app/page.tsx`**

```typescript
import { FileText, Building2, MessageSquare, Mail, Scale } from "lucide-react";
import { ToolCard } from "@/components/shared/tool-card";

const tools = [
  {
    href: "/p1",
    icon: FileText,
    title: "Analyse de Contrat",
    description: "Analysez vos contrats et identifiez les risques",
  },
  {
    href: "/p2",
    icon: Building2,
    title: "Assistant Création",
    description: "Guide pour créer votre entreprise",
  },
  {
    href: "/p3",
    icon: MessageSquare,
    title: "Conseiller Juridique",
    description: "Posez vos questions juridiques",
  },
  {
    href: "/p4",
    icon: Mail,
    title: "Correspondance",
    description: "Rédigez vos courriers juridiques",
  },
  {
    href: "/p5",
    icon: Scale,
    title: "Actes de Procédure",
    description: "Rédigez vos actes judiciaires",
  },
];

export default function HomePage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Juridique AI</h1>
        <p className="text-xl text-muted-foreground">
          Votre assistant juridique propulsé par l'IA
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {tools.map((tool) => (
          <ToolCard key={tool.href} {...tool} />
        ))}
      </div>
    </div>
  );
}
```

### 5.3 Create Loading State

**`src/app/loading.tsx`**

```typescript
import { PageSkeleton } from "@/components/shared/page-skeleton";

export default function Loading() {
  return <PageSkeleton />;
}
```

**Checklist Phase 5:**
- [ ] ToolCard component
- [ ] Dashboard with 5 tool cards
- [ ] Loading state
- [ ] Responsive grid layout
- [ ] Hover animations working

---

## Phase 6: P3 - Legal Advisor (Day 6-7)

> Start with P3 as it's the simplest pattern (chat interface).

### 6.1 Create P3 Store

**`src/stores/p3-store.ts`**

```typescript
import { create } from "zustand";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface P3State {
  messages: Message[];
  isLoading: boolean;
  jurisdiction: string;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => string;
  updateMessage: (id: string, content: string) => void;
  setStreaming: (id: string, isStreaming: boolean) => void;
  setLoading: (loading: boolean) => void;
  setJurisdiction: (jurisdiction: string) => void;
  clearChat: () => void;
}

export const useP3Store = create<P3State>((set) => ({
  messages: [],
  isLoading: false,
  jurisdiction: "FR",

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

  setStreaming: (id, isStreaming) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, isStreaming } : m
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setJurisdiction: (jurisdiction) => set({ jurisdiction }),
  clearChat: () => set({ messages: [] }),
}));
```

### 6.2 Create Chat Components

**`src/components/features/p3/chat-message.tsx`**

```typescript
import { cn } from "@/lib/utils/cn";
import { StreamingText } from "@/components/shared/streaming-text";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3 py-4", isUser && "flex-row-reverse")}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn(
        "flex-1 max-w-[80%] rounded-lg px-4 py-2",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {isUser ? (
          <p>{content}</p>
        ) : (
          <StreamingText
            content={content}
            isStreaming={isStreaming || false}
            className="prose prose-sm dark:prose-invert max-w-none"
          />
        )}
      </div>
    </div>
  );
}
```

**`src/components/features/p3/chat-input.tsx`**

```typescript
"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Posez votre question juridique..."
        className="min-h-[60px] resize-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
```

**`src/components/features/p3/chat-container.tsx`**

```typescript
"use client";

import { useRef, useEffect } from "react";
import { useP3Store } from "@/stores/p3-store";
import { useStreaming } from "@/hooks/use-streaming";
import { endpoints } from "@/lib/api/endpoints";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ToolProgress } from "@/components/shared/tool-progress";
import { JurisdictionSelect } from "@/components/shared/jurisdiction-select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function ChatContainer() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isLoading,
    jurisdiction,
    addMessage,
    updateMessage,
    setStreaming,
    setLoading,
    setJurisdiction,
    clearChat,
  } = useP3Store();

  const { stream, currentTool } = useStreaming({
    onContent: (content) => {
      // Content is appended in the hook
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (message: string) => {
    // Add user message
    addMessage({ role: "user", content: message });

    // Add placeholder for assistant
    const assistantId = addMessage({
      role: "assistant",
      content: "",
      isStreaming: true,
    });

    setLoading(true);

    try {
      let fullContent = "";

      await stream(endpoints.p3.stream, {
        message,
        jurisdiction,
      });

      // The streaming hook handles content updates
      // We need to listen for content updates and update the message

    } catch (error) {
      updateMessage(assistantId, "Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setStreaming(assistantId, false);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <JurisdictionSelect value={jurisdiction} onChange={setJurisdiction} />
        <Button variant="ghost" size="sm" onClick={clearChat}>
          <Trash2 className="h-4 w-4 mr-2" />
          Effacer
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p>Posez votre première question juridique</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isStreaming={msg.isStreaming}
            />
          ))
        )}
        <ToolProgress tool={currentTool} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t">
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
```

### 6.3 Create P3 Page

**`src/app/p3/page.tsx`**

```typescript
import { ChatContainer } from "@/components/features/p3/chat-container";

export default function P3Page() {
  return (
    <div className="container py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Conseiller Juridique</h1>
      <ChatContainer />
    </div>
  );
}
```

**Checklist Phase 6:**
- [ ] P3 store created
- [ ] ChatMessage component
- [ ] ChatInput component
- [ ] ChatContainer with streaming
- [ ] P3 page working
- [ ] Tool progress showing
- [ ] Jurisdiction selector working

---

## Phase 7: P1 - Contract Analysis (Day 8-9)

### 7.1 Create Document Upload Component

**`src/components/features/p1/contract-upload.tsx`**

```typescript
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/cn";

interface ContractUploadProps {
  onContent: (content: string) => void;
}

export function ContractUpload({ onContent }: ContractUploadProps) {
  const [pastedText, setPastedText] = useState("");

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    const text = await file.text();
    onContent(text);
  }, [onContent]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload">Importer</TabsTrigger>
        <TabsTrigger value="paste">Coller</TabsTrigger>
      </TabsList>

      <TabsContent value="upload">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">
            {isDragActive ? "Déposez le fichier ici" : "Glissez-déposez votre contrat"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            ou cliquez pour sélectionner (PDF, TXT)
          </p>
        </div>
      </TabsContent>

      <TabsContent value="paste">
        <Textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Collez le texte de votre contrat ici..."
          className="min-h-[200px]"
        />
        <Button
          className="mt-4 w-full"
          onClick={() => onContent(pastedText)}
          disabled={!pastedText.trim()}
        >
          <FileText className="h-4 w-4 mr-2" />
          Utiliser ce texte
        </Button>
      </TabsContent>
    </Tabs>
  );
}
```

### 7.2 Create Analysis Panel Component

**`src/components/features/p1/analysis-panel.tsx`**

```typescript
import { StreamingText } from "@/components/shared/streaming-text";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisPanelProps {
  content: string;
  isStreaming: boolean;
}

export function AnalysisPanel({ content, isStreaming }: AnalysisPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Analyse
          <div className="flex gap-2">
            <RiskBadge level="high" label="2" />
            <RiskBadge level="medium" label="5" />
            <RiskBadge level="low" label="8" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <StreamingText
          content={content}
          isStreaming={isStreaming}
          className="prose prose-sm dark:prose-invert max-w-none"
        />
      </CardContent>
    </Card>
  );
}
```

### 7.3 Create P1 Page

**`src/app/p1/page.tsx`**

```typescript
"use client";

import { useState } from "react";
import { ContractUpload } from "@/components/features/p1/contract-upload";
import { AnalysisPanel } from "@/components/features/p1/analysis-panel";
import { ToolProgress } from "@/components/shared/tool-progress";
import { JurisdictionSelect } from "@/components/shared/jurisdiction-select";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStreaming } from "@/hooks/use-streaming";
import { endpoints } from "@/lib/api/endpoints";

const partyOptions = [
  { value: "client", label: "Client" },
  { value: "prestataire", label: "Prestataire" },
  { value: "acheteur", label: "Acheteur" },
  { value: "vendeur", label: "Vendeur" },
  { value: "employee", label: "Employé" },
  { value: "employer", label: "Employeur" },
];

export default function P1Page() {
  const [contractContent, setContractContent] = useState("");
  const [jurisdiction, setJurisdiction] = useState("FR");
  const [userParty, setUserParty] = useState("client");

  const { stream, isStreaming, content, currentTool, error } = useStreaming();

  const handleAnalyze = async () => {
    if (!contractContent) return;

    await stream(endpoints.p1.stream, {
      documentContent: contractContent,
      userParty,
      jurisdiction,
    });
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Analyse de Contrat</h1>

      {!contractContent ? (
        <div className="max-w-2xl mx-auto">
          <ContractUpload onContent={setContractContent} />
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={userParty} onValueChange={setUserParty}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Votre rôle" />
              </SelectTrigger>
              <SelectContent>
                {partyOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <JurisdictionSelect value={jurisdiction} onChange={setJurisdiction} />

            <Button onClick={handleAnalyze} disabled={isStreaming}>
              Analyser le contrat
            </Button>

            <Button variant="outline" onClick={() => setContractContent("")}>
              Nouveau contrat
            </Button>
          </div>

          {/* Split View */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Contract */}
            <div className="border rounded-lg p-4 max-h-[600px] overflow-y-auto">
              <h3 className="font-semibold mb-4">Contrat</h3>
              <pre className="whitespace-pre-wrap text-sm">{contractContent}</pre>
            </div>

            {/* Analysis */}
            <div>
              <ToolProgress tool={currentTool} />
              <AnalysisPanel content={content} isStreaming={isStreaming} />
              {error && (
                <p className="text-destructive mt-4">{error}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

**Checklist Phase 7:**
- [ ] ContractUpload with drag & drop
- [ ] ContractUpload with paste option
- [ ] AnalysisPanel with risk badges
- [ ] P1 page with split view
- [ ] Party selector working
- [ ] Streaming analysis working

---

## Phase 8: P2 - Formation Wizard (Day 10-11)

### 8.1 Create Wizard Store

**`src/stores/p2-store.ts`**

```typescript
import { create } from "zustand";

interface P2State {
  step: number;
  country: string;
  questionnaire: {
    activityType: string;
    activityDescription: string;
    foundersCount: number;
    plannedCapital: number;
    fundraisingPlanned: boolean;
    employeesPlanned: number;
    personalAssetProtection: boolean;
    exitPlanned: boolean;
  };
  result: string | null;
  isLoading: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCountry: (country: string) => void;
  updateQuestionnaire: (data: Partial<P2State["questionnaire"]>) => void;
  setResult: (result: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialQuestionnaire = {
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
  result: null,
  isLoading: false,

  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: s.step + 1 })),
  prevStep: () => set((s) => ({ step: Math.max(1, s.step - 1) })),
  setCountry: (country) => set({ country }),
  updateQuestionnaire: (data) =>
    set((s) => ({ questionnaire: { ...s.questionnaire, ...data } })),
  setResult: (result) => set({ result }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      step: 1,
      country: "",
      questionnaire: initialQuestionnaire,
      result: null,
    }),
}));
```

### 8.2 Create Wizard Components

Create step components following the pattern in FRONTEND-SPEC.md.

### 8.3 Create P2 Page

**`src/app/p2/page.tsx`**

Implement the multi-step wizard using the P2 store.

**Checklist Phase 8:**
- [ ] P2 store with wizard state
- [ ] Step 1: Country selection
- [ ] Step 2: Activity type
- [ ] Step 3: Business details
- [ ] Step 4: Preferences
- [ ] Result display
- [ ] Progress indicator
- [ ] Navigation (next/prev)

---

## Phase 9: P4 & P5 - Form + Preview (Day 12-14)

### 9.1 Create Form + Preview Layout

Both P4 and P5 share a similar pattern: form on left, preview on right.

### 9.2 Create P4 Components

- CorrespondenceForm
- LetterPreview
- ToneSelector
- PartyForm

### 9.3 Create P5 Components

- ProceduralForm
- DocumentPreview
- FactsTimeline
- ClaimsForm

**Checklist Phase 9:**
- [ ] P4 form with all fields
- [ ] P4 letter preview
- [ ] P4 export options
- [ ] P5 form with all sections
- [ ] P5 document preview
- [ ] P5 facts timeline builder
- [ ] P5 export options

---

## Phase 10: Polish & Testing (Day 15-16)

### 10.1 Add Loading States

Ensure all pages have proper loading states using skeletons.

### 10.2 Add Error Handling

Add error boundaries and user-friendly error messages.

### 10.3 Test All Flows

- [ ] Dashboard → each tool works
- [ ] P1: Upload → Analyze → View results → Export
- [ ] P2: Complete wizard → Get recommendation
- [ ] P3: Chat → Get streaming response
- [ ] P4: Fill form → Preview → Export
- [ ] P5: Fill form → Preview → Export

### 10.4 Mobile Testing

- [ ] Dashboard responsive
- [ ] All tools usable on mobile
- [ ] Touch targets adequate (44px+)

### 10.5 Accessibility Testing

```bash
# Install axe-core
pnpm add -D @axe-core/react

# Run Lighthouse
npx lighthouse http://localhost:3000 --view
```

**Checklist Phase 10:**
- [ ] All loading states implemented
- [ ] Error handling complete
- [ ] All user flows tested
- [ ] Mobile responsive
- [ ] Accessibility checked
- [ ] Performance optimized

---

## Phase 11: Deployment (Day 17)

### 11.1 Build & Test Production

```bash
pnpm build
pnpm start
```

### 11.2 Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod
```

### 11.3 Configure Environment Variables

Set in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_API_KEY`

### 11.4 Verify Deployment

- [ ] All pages load
- [ ] API connection works
- [ ] Streaming works
- [ ] No console errors

**Checklist Phase 11:**
- [ ] Production build successful
- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] All features verified

---

## Summary Timeline

| Phase | Duration | Focus |
|-------|----------|-------|
| 1 | Day 1 | Project setup |
| 2 | Day 2 | Core infrastructure |
| 3 | Day 3 | Layout components |
| 4 | Day 4 | Shared components |
| 5 | Day 5 | Dashboard |
| 6 | Day 6-7 | P3 Legal Advisor |
| 7 | Day 8-9 | P1 Contract Analysis |
| 8 | Day 10-11 | P2 Formation Wizard |
| 9 | Day 12-14 | P4 & P5 Form+Preview |
| 10 | Day 15-16 | Polish & Testing |
| 11 | Day 17 | Deployment |

**Total: ~17 working days**

---

## Quick Reference

### Commands

```bash
# Development
pnpm dev

# Build
pnpm build

# Test
pnpm test

# Add shadcn component
npx shadcn@latest add [component]

# Deploy
vercel --prod
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/api/client.ts` | API requests |
| `src/hooks/use-streaming.ts` | SSE streaming |
| `src/stores/*.ts` | State management |
| `src/components/ui/*` | shadcn components |
| `src/components/shared/*` | Reusable components |
| `src/components/features/*` | Feature components |

---

*Follow this roadmap step by step. Check off each task as you complete it.*
