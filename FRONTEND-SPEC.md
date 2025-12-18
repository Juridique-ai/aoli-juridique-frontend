# Juridique AI - Frontend Specification

> Comprehensive specification for the Juridique AI frontend application.
> Version: 1.1.0 | Last Updated: December 2025
>
> **Related Documents:**
> - [Design Guidelines](./DESIGN-GUIDELINES.md) - Expert-backed UI/UX guidelines
> - [API Documentation](./API-DOCUMENTATION.md) - Backend API reference

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Design System](#design-system)
4. [Architecture](#architecture)
5. [Pages & Routes](#pages--routes)
6. [Components](#components)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Streaming Implementation](#streaming-implementation)
10. [Accessibility](#accessibility)
11. [Performance](#performance)
12. [Testing](#testing)
13. [Deployment](#deployment)

---

## Overview

### Product Description

Juridique AI is a legal assistant platform providing 5 AI-powered tools:

| Module | Name | Purpose |
|--------|------|---------|
| **P1** | Contract Analysis | Analyze contracts, identify risks and obligations |
| **P2** | Formation Assistant | Guide company formation (FR, BE, LU, DE) |
| **P3** | Legal Advisor | Answer legal questions with sources |
| **P4** | Legal Correspondence | Draft formal legal letters |
| **P5** | Procedural Documents | Draft court documents |

### Target Users

- Legal professionals (lawyers, paralegals)
- Business owners and entrepreneurs
- Individuals with legal needs
- Notaries and legal advisors

### Supported Jurisdictions

- France (FR) - Primary
- Belgium (BE)
- Luxembourg (LU)
- Germany (DE)

### Languages

- French (fr) - Primary
- English (en) - Secondary
- German (de) - For DE/LU jurisdictions

---

## Tech Stack

### Core Framework

```
Next.js 15.x (App Router)
├── React 19.x
├── TypeScript 5.x
└── Node.js 20.x LTS
```

### Styling

```
Tailwind CSS v4.x
├── @theme directive (CSS-native)
├── OKLCH color space
└── tw-animate-css
```

### UI Components

```
shadcn/ui (latest)
├── Radix UI primitives
├── "new-york" style variant
└── Fully accessible (WCAG 2.1 AA)
```

### State & Data

```
State Management:
├── Zustand (global state)
├── React Query / TanStack Query (server state)
└── nuqs (URL state for filters)

Forms:
├── React Hook Form
└── Zod (validation)
```

### Additional Libraries

```
Animations:       Framer Motion
Icons:            Lucide React
PDF Generation:   @react-pdf/renderer
Markdown:         react-markdown + remark-gfm
Date Handling:    date-fns
Internationalization: next-intl
```

### Development Tools

```
Package Manager:  pnpm
Linting:          ESLint + Prettier
Testing:          Vitest + Playwright
Storybook:        Component documentation
```

---

## Design System

### Brand Colors

```css
@theme {
  /* Primary - Professional Blue */
  --color-primary-50: oklch(0.97 0.01 250);
  --color-primary-100: oklch(0.93 0.03 250);
  --color-primary-200: oklch(0.86 0.06 250);
  --color-primary-300: oklch(0.75 0.10 250);
  --color-primary-400: oklch(0.65 0.14 250);
  --color-primary-500: oklch(0.55 0.16 250);  /* Main */
  --color-primary-600: oklch(0.48 0.15 250);
  --color-primary-700: oklch(0.40 0.13 250);
  --color-primary-800: oklch(0.33 0.10 250);
  --color-primary-900: oklch(0.27 0.08 250);

  /* Semantic Colors */
  --color-success: oklch(0.72 0.15 145);
  --color-warning: oklch(0.80 0.15 85);
  --color-error: oklch(0.65 0.20 25);
  --color-info: oklch(0.70 0.12 250);

  /* Risk Levels (for P1 Contract Analysis) */
  --color-risk-high: oklch(0.60 0.22 25);
  --color-risk-medium: oklch(0.78 0.16 70);
  --color-risk-low: oklch(0.72 0.15 145);

  /* Neutral - Gray Scale */
  --color-gray-50: oklch(0.98 0 0);
  --color-gray-100: oklch(0.96 0 0);
  --color-gray-200: oklch(0.92 0 0);
  --color-gray-300: oklch(0.87 0 0);
  --color-gray-400: oklch(0.70 0 0);
  --color-gray-500: oklch(0.55 0 0);
  --color-gray-600: oklch(0.45 0 0);
  --color-gray-700: oklch(0.37 0 0);
  --color-gray-800: oklch(0.27 0 0);
  --color-gray-900: oklch(0.20 0 0);
  --color-gray-950: oklch(0.13 0 0);
}
```

### Dark Mode

> **Important**: Never use pure black (#000000) or pure white (#FFFFFF).
> Pure black causes halation/eye strain. Use dark grays and off-whites.

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Backgrounds - Dark grays, NOT pure black */
    --background: #0A0A0B;           /* Page background */
    --foreground: #FAFAFA;           /* Primary text (off-white) */
    --card: #141415;                 /* Elevated surfaces */
    --card-foreground: #FAFAFA;
    --border: #27272A;               /* Borders, dividers */
    --input: #1A1A1C;                /* Form inputs */
    --muted: #27272A;
    --muted-foreground: #A1A1AA;     /* Secondary text */

    /* Primary - Lighter blue for dark mode */
    --primary: #60A5FA;              /* Increased brightness */
    --primary-foreground: #0A0A0B;

    /* Semantic - Adjusted for dark backgrounds */
    --success: #34D399;
    --warning: #FBBF24;
    --error: #F87171;                /* Lighter red */
  }
}
```

### Typography

```css
@theme {
  /* Font Families */
  --font-sans: "Inter", "SF Pro Display", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", monospace;
  --font-serif: "Merriweather", Georgia, serif; /* For legal documents */

  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Spacing Scale

```css
@theme {
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-20: 5rem;     /* 80px */
  --spacing-24: 6rem;     /* 96px */
}
```

### Border Radius

```css
@theme {
  --radius-none: 0;
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-2xl: 1rem;     /* 16px */
  --radius-full: 9999px;
}
```

### Shadows

> **Refactoring UI Principle**: Use two shadows per element - one larger/softer (ambient light),
> one smaller/darker (direct light). Add vertical offset to simulate light from above.

```css
@theme {
  /* Two-shadow technique: ambient + direct */
  --shadow-xs:  0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md:  0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-lg:  0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
  --shadow-xl:  0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04);
  --shadow-2xl: 0 25px 50px rgba(0,0,0,0.25);

  /* Use shadows instead of borders for cleaner look */
  --shadow-border: 0 0 0 1px rgba(0,0,0,0.05);
}
```

### Motion & Animation

```css
/* Timing Functions */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Durations */
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### Breakpoints (Mobile-First)

```css
/* Tailwind v4 default breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

---

## Architecture

### Folder Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home/Dashboard
│   │   ├── globals.css               # Global styles + @theme
│   │   ├── loading.tsx               # Global loading state
│   │   ├── error.tsx                 # Global error boundary
│   │   ├── not-found.tsx             # 404 page
│   │   │
│   │   ├── (auth)/                   # Auth group (future)
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── p1/                       # Contract Analysis
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   │
│   │   ├── p2/                       # Formation Assistant
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   │
│   │   ├── p3/                       # Legal Advisor
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   │
│   │   ├── p4/                       # Legal Correspondence
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   │
│   │   └── p5/                       # Procedural Documents
│   │       ├── page.tsx
│   │       └── loading.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   └── tooltip.tsx
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── nav.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── theme-toggle.tsx
│   │   │
│   │   ├── shared/                   # Shared business components
│   │   │   ├── jurisdiction-select.tsx
│   │   │   ├── language-select.tsx
│   │   │   ├── document-upload.tsx
│   │   │   ├── streaming-text.tsx
│   │   │   ├── tool-progress.tsx
│   │   │   ├── risk-badge.tsx
│   │   │   ├── export-menu.tsx
│   │   │   ├── markdown-renderer.tsx
│   │   │   └── loading-states.tsx
│   │   │
│   │   └── features/                 # Feature-specific components
│   │       ├── p1/
│   │       │   ├── contract-upload.tsx
│   │       │   ├── contract-viewer.tsx
│   │       │   ├── analysis-panel.tsx
│   │       │   ├── risk-summary.tsx
│   │       │   └── party-select.tsx
│   │       │
│   │       ├── p2/
│   │       │   ├── formation-wizard.tsx
│   │       │   ├── step-country.tsx
│   │       │   ├── step-activity.tsx
│   │       │   ├── step-details.tsx
│   │       │   ├── step-preferences.tsx
│   │       │   ├── recommendation-card.tsx
│   │       │   └── formation-checklist.tsx
│   │       │
│   │       ├── p3/
│   │       │   ├── chat-container.tsx
│   │       │   ├── chat-message.tsx
│   │       │   ├── chat-input.tsx
│   │       │   ├── clarification-prompt.tsx
│   │       │   └── source-citation.tsx
│   │       │
│   │       ├── p4/
│   │       │   ├── correspondence-form.tsx
│   │       │   ├── letter-preview.tsx
│   │       │   ├── tone-selector.tsx
│   │       │   ├── party-form.tsx
│   │       │   └── letter-type-select.tsx
│   │       │
│   │       └── p5/
│   │           ├── procedural-form.tsx
│   │           ├── document-preview.tsx
│   │           ├── facts-timeline.tsx
│   │           ├── claims-form.tsx
│   │           ├── case-info-form.tsx
│   │           └── court-select.tsx
│   │
│   ├── lib/                          # Utilities & helpers
│   │   ├── api/
│   │   │   ├── client.ts             # API client setup
│   │   │   ├── endpoints.ts          # API endpoint definitions
│   │   │   ├── types.ts              # API types
│   │   │   └── streaming.ts          # SSE streaming utilities
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts                 # classnames utility
│   │   │   ├── format.ts             # Formatting helpers
│   │   │   ├── validation.ts         # Zod schemas
│   │   │   └── storage.ts            # Local storage helpers
│   │   │
│   │   └── constants/
│   │       ├── jurisdictions.ts
│   │       ├── letter-types.ts
│   │       ├── court-types.ts
│   │       └── document-types.ts
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-streaming.ts          # SSE streaming hook
│   │   ├── use-api.ts                # API request hook
│   │   ├── use-local-storage.ts
│   │   ├── use-media-query.ts
│   │   └── use-debounce.ts
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── ui-store.ts               # UI state (theme, sidebar)
│   │   ├── p1-store.ts               # P1 state
│   │   ├── p2-store.ts               # P2 wizard state
│   │   ├── p3-store.ts               # P3 chat history
│   │   ├── p4-store.ts               # P4 form state
│   │   └── p5-store.ts               # P5 form state
│   │
│   └── types/                        # TypeScript types
│       ├── api.ts
│       ├── components.ts
│       └── forms.ts
│
├── public/
│   ├── fonts/
│   ├── images/
│   └── icons/
│
├── .env.local                        # Environment variables
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Component Architecture Principles

1. **Atomic Design**: Build from atoms → molecules → organisms → templates → pages
2. **Composition over Inheritance**: Use composition patterns, not deep inheritance
3. **Single Responsibility**: Each component does one thing well
4. **Prop Drilling Prevention**: Use Zustand for cross-component state
5. **Colocation**: Keep related files together (component + styles + tests)

---

## Pages & Routes

### Route Map

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Home with 5 tool cards |
| `/p1` | Contract Analysis | Upload and analyze contracts |
| `/p2` | Formation Assistant | Company formation wizard |
| `/p3` | Legal Advisor | Chat interface for legal questions |
| `/p4` | Legal Correspondence | Draft formal letters |
| `/p5` | Procedural Documents | Draft court documents |

### Page Specifications

#### Dashboard (`/`)

**Purpose**: Entry point, tool selection

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo | Nav | Theme Toggle | Help                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Welcome to Juridique AI                                    │
│  Your AI-powered legal assistant                            │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │     📄      │ │     🏢      │ │     💬      │           │
│  │  Contract   │ │  Formation  │ │   Legal     │           │
│  │  Analysis   │ │  Assistant  │ │   Advisor   │           │
│  │             │ │             │ │             │           │
│  │  Analyze    │ │  Create     │ │  Ask legal  │           │
│  │  contracts  │ │  company    │ │  questions  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐                           │
│  │     ✉️      │ │     ⚖️      │                           │
│  │   Legal     │ │ Procedural  │                           │
│  │   Letters   │ │  Documents  │                           │
│  │             │ │             │                           │
│  │  Draft mise │ │  Draft court│                           │
│  │  en demeure │ │  documents  │                           │
│  └─────────────┘ └─────────────┘                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Footer: Legal notice | Privacy | Contact                   │
└─────────────────────────────────────────────────────────────┘
```

**Components Used**:
- `ToolCard` - Clickable card for each P1-P5 tool
- `Header` - Site header with navigation
- `Footer` - Site footer

---

#### P1 - Contract Analysis (`/p1`)

**Purpose**: Upload/paste contract, receive AI analysis

**Layout - Desktop**:
```
┌─────────────────────────────────────────────────────────────┐
│  Header: ← Back | Contract Analysis | Jurisdiction | Help   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐                                    │
│  │  📄 Upload PDF      │  OR  [Paste contract text...]     │
│  │  Drag & drop here   │                                    │
│  └─────────────────────┘                                    │
│                                                             │
│  Your role: [Client ▼]    Jurisdiction: [France ▼]         │
│                                                             │
│  [Analyze Contract]                                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┬──────────────────────────────┐│
│  │  CONTRACT                │  ANALYSIS                    ││
│  │                          │                              ││
│  │  Article 1: ...          │  📊 Risk Summary             ││
│  │                          │  🔴 High: 2  🟡 Med: 5  🟢 Low: 8 ││
│  │  Article 2: ...          │                              ││
│  │                          │  ⚠️ Key Risks                ││
│  │  Article 3: ...          │  • Clause 4.2: Unlimited...  ││
│  │                          │  • Clause 7.1: Automatic...  ││
│  │  [highlighted sections]  │                              ││
│  │                          │  ✅ Obligations              ││
│  │                          │  • Payment within 30 days    ││
│  │                          │  • Quarterly reports         ││
│  │                          │                              ││
│  │                          │  💡 Recommendations          ││
│  │                          │  • Negotiate clause 4.2...   ││
│  │                          │                              ││
│  └──────────────────────────┴──────────────────────────────┘│
│                                                             │
│  [Export PDF] [Export Word] [Copy]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Layout - Mobile**:
```
┌─────────────────────────┐
│  ← | Contract Analysis  │
├─────────────────────────┤
│                         │
│  [Upload] [Paste]       │
│                         │
│  Role: [Client ▼]       │
│  Jurisdiction: [FR ▼]   │
│                         │
│  [Analyze]              │
│                         │
├─────────────────────────┤
│  [Contract] [Analysis]  │  ← Tabs
├─────────────────────────┤
│                         │
│  (Selected tab content) │
│                         │
└─────────────────────────┘
```

**States**:
1. **Empty**: Upload/paste prompt
2. **Uploading**: Progress bar
3. **Analyzing**: Skeleton + streaming progress
4. **Complete**: Split view with results
5. **Error**: Error message + retry

**Components**:
- `ContractUpload` - Drag & drop + paste
- `ContractViewer` - Left panel, scrollable contract text
- `AnalysisPanel` - Right panel, structured analysis
- `RiskSummary` - Risk level counts
- `RiskBadge` - Individual risk indicator
- `PartySelect` - User's role selector

---

#### P2 - Formation Assistant (`/p2`)

**Purpose**: Multi-step wizard for company formation guidance

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  Header: ← Back | Formation Assistant | Help                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 2 of 4: Activity Type                                 │
│  ●───────●───────○───────○                                  │
│  Country  Activity Details  Preferences                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What type of activity?                                     │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ 💻 Tech     │ │ 🛒 Commerce │ │ 🔧 Services │           │
│  │ Startup     │ │             │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐                           │
│  │ 🎨 Artisan  │ │ ⚖️ Liberal  │                           │
│  │             │ │ Profession  │                           │
│  └─────────────┘ └─────────────┘                           │
│                                                             │
│  Describe your activity:                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ We are building a mobile app for...                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [← Previous]                              [Next Step →]    │
└─────────────────────────────────────────────────────────────┘
```

**Wizard Steps**:

| Step | Title | Fields |
|------|-------|--------|
| 1 | Country | Country selection (FR/BE/LU/DE) |
| 2 | Activity | Activity type, description |
| 3 | Details | Founders count, capital, employees, revenue |
| 4 | Preferences | Asset protection, fundraising, exit plans |

**Result Screen**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ✅ Recommendation Complete                                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Recommended Structure: SAS                          │   │
│  │  (Société par Actions Simplifiée)                    │   │
│  │                                                       │   │
│  │  Why SAS?                                             │   │
│  │  • Flexible governance for startups                  │   │
│  │  • Easy to raise funds                               │   │
│  │  • Limited liability protection                      │   │
│  │                                                       │   │
│  │  📋 Formation Checklist                              │   │
│  │  □ Draft bylaws (statuts)                            │   │
│  │  □ Open bank account & deposit capital               │   │
│  │  □ Sign bylaws                                        │   │
│  │  □ Register with CFE/Greffe                          │   │
│  │  □ Obtain KBIS                                        │   │
│  │                                                       │   │
│  │  💰 Estimated Costs: €1,500 - €2,500                 │   │
│  │  📅 Timeline: 2-4 weeks                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Export PDF] [Start Over] [Contact a Lawyer]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Components**:
- `FormationWizard` - Main wizard container
- `WizardProgress` - Step indicator
- `StepCountry` - Country selection
- `StepActivity` - Activity type + description
- `StepDetails` - Business details form
- `StepPreferences` - Preferences form
- `RecommendationCard` - Result display
- `FormationChecklist` - Interactive checklist

---

#### P3 - Legal Advisor (`/p3`)

**Purpose**: Conversational interface for legal questions

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  Header: ← Back | Legal Advisor | Jurisdiction: [FR ▼]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  👤 You                                               │   │
│  │  Mon employeur veut me licencier après 5 ans.        │   │
│  │  Quels sont mes droits?                              │   │
│  │                                                       │   │
│  │  ─────────────────────────────────────────────────   │   │
│  │                                                       │   │
│  │  🤖 Juridique AI                                      │   │
│  │  🔍 Searching legal database...                      │   │
│  │                                                       │   │
│  │  Pour vous donner des informations précises,         │   │
│  │  j'aurais besoin de quelques clarifications:         │   │
│  │                                                       │   │
│  │  • S'agit-il d'un licenciement pour faute ou        │   │
│  │    économique?                                        │   │
│  │  • Avez-vous reçu une convocation à un entretien    │   │
│  │    préalable?                                         │   │
│  │                                                       │   │
│  │  [Licenciement économique] [Pour faute] [Je ne sais pas] │
│  │                                                       │   │
│  │  ─────────────────────────────────────────────────   │   │
│  │                                                       │   │
│  │  👤 You                                               │   │
│  │  Licenciement économique                             │   │
│  │                                                       │   │
│  │  ─────────────────────────────────────────────────   │   │
│  │                                                       │   │
│  │  🤖 Juridique AI                                      │   │
│  │  Selon le Code du travail (Art. L1233-3),           │   │
│  │  voici vos droits en cas de licenciement            │   │
│  │  économique après 5 ans d'ancienneté:               │   │
│  │                                                       │   │
│  │  **Indemnité de licenciement**                       │   │
│  │  • Minimum légal: 1/4 de mois par année...          │   │
│  │  • Pour 5 ans: ~1.25 mois de salaire                │   │
│  │                                                       │   │
│  │  **Préavis**                                          │   │
│  │  • 2 mois (cadre ou > 2 ans ancienneté)             │   │
│  │                                                       │   │
│  │  📚 Sources:                                          │   │
│  │  • Code du travail Art. L1234-1                     │   │
│  │  • Legifrance.gouv.fr                               │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Ask a legal question...                         [↑] │   │
│  └─────────────────────────────────────────────────────┘   │
│  [Clear Chat]                                               │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Streaming responses with typewriter effect
- Tool progress indicators ("Searching legal database...")
- Clarification questions with quick-reply buttons
- Source citations
- Chat history persistence (session)

**Components**:
- `ChatContainer` - Main chat wrapper
- `ChatMessage` - Individual message (user/AI)
- `ChatInput` - Input field + send button
- `StreamingText` - Typewriter text renderer
- `ToolProgress` - "Searching..." indicator
- `ClarificationPrompt` - Quick reply buttons
- `SourceCitation` - Legal source link

---

#### P4 - Legal Correspondence (`/p4`)

**Purpose**: Draft formal legal letters

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  Header: ← Back | Legal Correspondence | Help               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────┬────────────────────────────────┐│
│  │  FORM                  │  PREVIEW                       ││
│  │                        │                                ││
│  │  Letter Type           │  ┌──────────────────────────┐ ││
│  │  [Mise en demeure ▼]   │  │                          │ ││
│  │                        │  │  MISE EN DEMEURE         │ ││
│  │  Tone Level            │  │                          │ ││
│  │  ○ Cordial             │  │  Paris, le 18/12/2025    │ ││
│  │  ○ Formal              │  │                          │ ││
│  │  ● Firm                │  │  Expéditeur:             │ ││
│  │  ○ Pre-contentious     │  │  Jean Dupont             │ ││
│  │                        │  │  15 rue de la Paix       │ ││
│  │  ───────────────────   │  │  75001 Paris             │ ││
│  │                        │  │                          │ ││
│  │  Sender                │  │  Destinataire:           │ ││
│  │  Name: [Jean Dupont]   │  │  Société XYZ SARL        │ ││
│  │  Address: [...]        │  │  10 avenue des Champs    │ ││
│  │  Type: ○ Individual    │  │  75008 Paris             │ ││
│  │        ● Company       │  │                          │ ││
│  │                        │  │  Objet: Mise en demeure  │ ││
│  │  ───────────────────   │  │  de livraison            │ ││
│  │                        │  │                          │ ││
│  │  Recipient             │  │  Madame, Monsieur,       │ ││
│  │  Name: [...]           │  │                          │ ││
│  │  Address: [...]        │  │  Par la présente, je     │ ││
│  │                        │  │  vous mets en demeure... │ ││
│  │  ───────────────────   │  │                          │ ││
│  │                        │  │  ...                     │ ││
│  │  Request               │  │                          │ ││
│  │  ┌──────────────────┐  │  │  Veuillez agréer...     │ ││
│  │  │ Describe what    │  │  │                          │ ││
│  │  │ you need...      │  │  └──────────────────────────┘ ││
│  │  └──────────────────┘  │                                ││
│  │                        │  [Copy] [PDF] [Word]           ││
│  │  [Generate Letter]     │                                ││
│  │                        │                                ││
│  └────────────────────────┴────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Form Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `letterType` | Select | No | mise_en_demeure, resiliation, reclamation, notification |
| `toneLevel` | Radio | No | 1-4 scale |
| `sender.name` | Text | No | Sender name |
| `sender.address` | Textarea | No | Sender address |
| `sender.type` | Radio | No | individual / company |
| `recipient.name` | Text | No | Recipient name |
| `recipient.address` | Textarea | No | Recipient address |
| `recipient.type` | Radio | No | individual / company |
| `request` | Textarea | Yes | What the letter should address |
| `context` | Textarea | No | Additional context |
| `jurisdiction` | Select | No | FR/BE/LU/DE |
| `language` | Select | No | fr/de |

**Components**:
- `CorrespondenceForm` - Main form container
- `LetterTypeSelect` - Letter type dropdown
- `ToneSelector` - Tone level radio group
- `PartyForm` - Sender/recipient form section
- `LetterPreview` - Live preview panel
- `ExportMenu` - Copy/PDF/Word options

---

#### P5 - Procedural Documents (`/p5`)

**Purpose**: Draft court documents

**Layout**: Similar to P4 but with additional sections:

**Form Sections**:

1. **Document Parameters**
   - Document type (assignation, conclusions, requête, etc.)
   - Court type (civil, commercial, administrative, labor)
   - Procedure type (première instance, appel, cassation)
   - Procedure nature (fond, référé)

2. **Case Information**
   - Case number (if exists)
   - Court name and address
   - Plaintiff details
   - Defendant details
   - Key dates (hearing, deadlines)

3. **Facts Timeline**
   - Interactive timeline builder
   - Add fact: date + description
   - Drag to reorder

4. **Claims**
   - Principal amount
   - Interest request
   - Damages
   - Article 700 (legal fees)
   - Other requests

5. **Request Description**
   - Free text describing what's needed

**Components**:
- `ProceduralForm` - Main form container
- `DocumentTypeSelect` - Document type selection
- `CourtSelect` - Court type selection
- `CaseInfoForm` - Case details section
- `FactsTimeline` - Timeline builder
- `ClaimsForm` - Claims section
- `DocumentPreview` - Live preview
- `ExhibitsList` - Generated exhibits list

---

## Components

### UI Components (shadcn/ui)

Install via CLI:
```bash
npx shadcn@latest add button card dialog dropdown-menu form input label progress select separator skeleton tabs textarea toast tooltip
```

### Custom Shared Components

#### `StreamingText`

Renders text with typewriter effect during streaming.

```tsx
interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
  speed?: number; // ms per character
  className?: string;
}
```

#### `ToolProgress`

Shows tool call progress during AI processing.

```tsx
interface ToolProgressProps {
  tool: string | null;
  isVisible: boolean;
}

// Tool name mapping
const toolLabels = {
  'perplexity_search_legal': 'Searching legal database...',
  'perplexity_search_formation': 'Searching formation info...',
  'verify_legal_claim': 'Verifying legal references...',
};
```

#### `DocumentUpload`

Drag & drop file upload with paste support.

```tsx
interface DocumentUploadProps {
  onUpload: (content: string) => void;
  onPaste: (content: string) => void;
  accept?: string; // e.g., ".pdf,.txt,.doc,.docx"
  maxSize?: number; // bytes
  isLoading?: boolean;
}
```

#### `RiskBadge`

Risk level indicator.

```tsx
interface RiskBadgeProps {
  level: 'high' | 'medium' | 'low';
  label?: string;
}
```

#### `JurisdictionSelect`

Country/jurisdiction selector.

```tsx
interface JurisdictionSelectProps {
  value: 'FR' | 'BE' | 'LU' | 'DE';
  onChange: (value: string) => void;
  showFlags?: boolean;
}
```

#### `MarkdownRenderer`

Renders markdown with legal formatting.

```tsx
interface MarkdownRendererProps {
  content: string;
  className?: string;
}
```

#### `ExportMenu`

Export options dropdown.

```tsx
interface ExportMenuProps {
  content: string;
  filename: string;
  formats: ('copy' | 'pdf' | 'word' | 'txt')[];
}
```

---

## State Management

### Global UI Store

```typescript
// stores/ui-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarOpen: true,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    { name: 'ui-storage' }
  )
);
```

### P3 Chat Store

```typescript
// stores/p3-store.ts
import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  toolCalls?: { tool: string; status: 'pending' | 'complete' }[];
}

interface P3State {
  messages: Message[];
  isLoading: boolean;
  jurisdiction: string;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, content: string) => void;
  setLoading: (loading: boolean) => void;
  setJurisdiction: (jurisdiction: string) => void;
  clearChat: () => void;
}

export const useP3Store = create<P3State>((set) => ({
  messages: [],
  isLoading: false,
  jurisdiction: 'FR',
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id: crypto.randomUUID(), timestamp: new Date() },
      ],
    })),
  updateMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content, isStreaming: false } : m
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setJurisdiction: (jurisdiction) => set({ jurisdiction }),
  clearChat: () => set({ messages: [] }),
}));
```

---

## API Integration

### API Client Setup

```typescript
// lib/api/client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-functions-key': API_KEY!,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}
```

### Endpoint Definitions

```typescript
// lib/api/endpoints.ts
export const endpoints = {
  health: '/api/health',
  p1: {
    analyze: '/api/p1/analyze',
    analyzeStream: '/api/p1/analyze/stream',
  },
  p2: {
    analyze: '/api/p2/analyze',
    analyzeStream: '/api/p2/analyze/stream',
  },
  p3: {
    advise: '/api/p3/advise',
    adviseStream: '/api/p3/advise/stream',
  },
  p4: {
    draft: '/api/p4/draft',
    draftStream: '/api/p4/draft/stream',
  },
  p5: {
    draft: '/api/p5/draft',
    draftStream: '/api/p5/draft/stream',
  },
};
```

---

## Streaming Implementation

### SSE Hook

```typescript
// hooks/use-streaming.ts
import { useState, useCallback } from 'react';

interface StreamEvent {
  type: 'started' | 'tool_call' | 'tool_result' | 'content' | 'completed' | 'error';
  data: Record<string, unknown>;
}

interface UseStreamingOptions {
  onStart?: () => void;
  onToolCall?: (tool: string) => void;
  onToolResult?: (tool: string) => void;
  onContent?: (content: string) => void;
  onComplete?: (result: string) => void;
  onError?: (error: string) => void;
}

export function useStreaming(options: UseStreamingOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [content, setContent] = useState('');
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stream = useCallback(async (endpoint: string, body: unknown) => {
    setIsStreaming(true);
    setContent('');
    setError(null);
    setCurrentTool(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-functions-key': process.env.NEXT_PUBLIC_API_KEY!,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7);
          } else if (line.startsWith('data: ') && currentEvent) {
            try {
              const data = JSON.parse(line.slice(6));
              handleEvent(currentEvent, data);
            } catch {
              // Ignore parse errors
            }
            currentEvent = '';
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setIsStreaming(false);
      setCurrentTool(null);
    }
  }, [options]);

  const handleEvent = (type: string, data: Record<string, unknown>) => {
    switch (type) {
      case 'started':
        options.onStart?.();
        break;
      case 'tool_call':
        setCurrentTool(data.tool as string);
        options.onToolCall?.(data.tool as string);
        break;
      case 'tool_result':
        setCurrentTool(null);
        options.onToolResult?.(data.tool as string);
        break;
      case 'content':
        setContent((prev) => prev + (data.content as string));
        options.onContent?.(data.content as string);
        break;
      case 'completed':
        setContent(data.result as string);
        options.onComplete?.(data.result as string);
        break;
      case 'error':
        setError(data.error as string);
        options.onError?.(data.error as string);
        break;
    }
  };

  return {
    stream,
    isStreaming,
    content,
    currentTool,
    error,
    reset: () => {
      setContent('');
      setError(null);
      setCurrentTool(null);
    },
  };
}
```

### Tool Progress Component

```typescript
// components/shared/tool-progress.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Search, CheckCircle } from 'lucide-react';

const toolLabels: Record<string, string> = {
  perplexity_search_legal: 'Searching legal database...',
  perplexity_search_formation: 'Searching formation info...',
  verify_legal_claim: 'Verifying legal references...',
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
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{toolLabels[tool] || 'Processing...'}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Accessibility

### WCAG 2.1 AA Compliance

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.1.1 | Non-text content | Alt text for all images |
| 1.3.1 | Info and relationships | Semantic HTML, ARIA labels |
| 1.4.1 | Use of color | Don't rely solely on color |
| 1.4.3 | Contrast minimum | 4.5:1 for text, 3:1 for large text |
| 1.4.4 | Resize text | Support 200% zoom |
| 2.1.1 | Keyboard | All functionality via keyboard |
| 2.4.1 | Bypass blocks | Skip to main content link |
| 2.4.4 | Link purpose | Descriptive link text |
| 2.4.7 | Focus visible | Clear focus indicators |
| 3.1.1 | Language of page | `lang` attribute on `<html>` |
| 4.1.2 | Name, role, value | Proper ARIA attributes |

### Implementation Checklist

- [ ] All interactive elements have focus states
- [ ] Touch targets minimum 44x44px
- [ ] Form inputs have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Skip to main content link
- [ ] Keyboard navigation for all features
- [ ] ARIA labels for icon-only buttons

---

## Performance

### Targets

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTI (Time to Interactive) | < 3.5s |
| Bundle size (initial) | < 150KB gzipped |

### Optimization Strategies

1. **Code Splitting**
   - Route-based splitting (automatic with Next.js)
   - Dynamic imports for heavy components
   - Lazy load non-critical features

2. **Image Optimization**
   - Use Next.js `Image` component
   - WebP/AVIF formats
   - Responsive sizes

3. **Bundle Optimization**
   - Tree shaking
   - Analyze with `@next/bundle-analyzer`
   - Import only needed icons from Lucide

4. **Caching**
   - Static assets: 1 year cache
   - API responses: SWR with revalidation
   - Form state: persist to localStorage

5. **Streaming**
   - Use React Suspense boundaries
   - Stream SSE responses
   - Progressive rendering

---

## Testing

### Testing Strategy

| Type | Tool | Coverage Target |
|------|------|-----------------|
| Unit | Vitest | 80% |
| Component | React Testing Library | Critical paths |
| E2E | Playwright | Core user flows |
| Visual | Storybook + Chromatic | UI components |
| Accessibility | axe-core | All pages |

### Critical Test Paths

1. **P1**: Upload contract → receive analysis
2. **P2**: Complete wizard → receive recommendation
3. **P3**: Send message → receive streaming response
4. **P4**: Fill form → preview letter → export
5. **P5**: Fill form → preview document → export

### Example Test

```typescript
// __tests__/p3/chat.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatContainer } from '@/components/features/p3/chat-container';

describe('P3 Chat', () => {
  it('sends message and displays response', async () => {
    render(<ChatContainer />);

    const input = screen.getByPlaceholderText(/ask a legal question/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await userEvent.type(input, 'What are my rights?');
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/what are my rights/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/searching legal database/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
```

---

## Deployment

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://aoli-juridique-dev-func.azurewebsites.net
NEXT_PUBLIC_API_KEY=your-function-key

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature flags (optional)
NEXT_PUBLIC_ENABLE_P5=true
```

### Deployment Platforms

**Recommended: Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Alternative: Azure Static Web Apps**

```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install and Build
        run: |
          cd frontend
          npm ci
          npm run build

      - name: Deploy to Azure
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_SWA_TOKEN }}
          app_location: '/frontend'
          output_location: 'out'
```

---

## Appendix

### Quick Start Commands

```bash
# Create Next.js project
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir

# Install dependencies
cd frontend
pnpm add zustand @tanstack/react-query framer-motion lucide-react react-hook-form zod @hookform/resolvers date-fns react-markdown remark-gfm

# Install shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card dialog form input label select textarea tabs toast tooltip skeleton progress separator dropdown-menu

# Development
pnpm dev

# Build
pnpm build

# Test
pnpm test
```

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | kebab-case | `chat-message.tsx` |
| Hooks | camelCase with `use` prefix | `useStreaming.ts` |
| Stores | kebab-case with `-store` suffix | `p3-store.ts` |
| Types | PascalCase | `types/ApiResponse.ts` |
| Utils | kebab-case | `lib/utils/format.ts` |
| Constants | SCREAMING_SNAKE_CASE | `const API_BASE_URL` |

### Git Commit Convention

```
feat: add P3 chat streaming
fix: resolve mobile layout issue
docs: update API documentation
style: format code with prettier
refactor: extract streaming hook
test: add P1 upload tests
chore: update dependencies
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2025-12-18 | Added Design Guidelines, improved dark mode (no pure black/white), enhanced shadows (two-shadow technique) |
| 1.0.0 | 2025-12-18 | Initial specification |

---

*This specification is maintained by the Juridique AI team.*
