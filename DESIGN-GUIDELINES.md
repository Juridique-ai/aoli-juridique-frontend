# Juridique AI - Design Guidelines

> Expert-backed UI/UX guidelines based on 2025 industry research and best practices.
> Sources: Refactoring UI, Nielsen Norman Group, Material Design 3, Apple HIG, and expert communities.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Typography](#typography)
3. [Color System](#color-system)
4. [Spacing & Layout](#spacing--layout)
5. [Shadows & Depth](#shadows--depth)
6. [Buttons & CTAs](#buttons--ctas)
7. [Forms & Validation](#forms--validation)
8. [Loading States](#loading-states)
9. [Motion & Animation](#motion--animation)
10. [Icons](#icons)
11. [Accessibility](#accessibility)
12. [Dark Mode](#dark-mode)
13. [Inspiration](#inspiration)

---

## Design Philosophy

### Core Principles (Refactoring UI)

1. **Design in grayscale first** - Focus on spacing, contrast, and hierarchy before adding color
2. **Start with too much white space** - Then reduce until happy
3. **Don't rely on font size alone** - Use weight, color, and spacing for hierarchy
4. **Limit your choices** - Constrain yourself to a defined system

### Legal Tech Specific

> "Color in legal tech conveys trust and professionalism. Blue communicates stability and reliability - essential for legal applications."

- **Trust signals**: Clean, professional UI = credibility
- **Reduce cognitive load**: Lawyers deal with complex info; simplify the interface
- **Workflow efficiency**: Every click saved = value delivered

---

## Typography

### Recommended Fonts

| Font | Use Case | Why |
|------|----------|-----|
| **Inter** | Primary UI font | #1 choice for SaaS, screen-optimized, massive weight range, free |
| **JetBrains Mono** | Code/legal citations | Excellent readability for technical content |
| **Merriweather** | Legal documents (export) | Professional serif for formal documents |

### Type Scale (Modular Scale 1.25)

```css
/* Base: 16px, Ratio: 1.25 (Major Third) */
--text-xs:   0.75rem;    /* 12px - Labels, captions */
--text-sm:   0.875rem;   /* 14px - Secondary text */
--text-base: 1rem;       /* 16px - Body text */
--text-lg:   1.125rem;   /* 18px - Lead text */
--text-xl:   1.25rem;    /* 20px - H4 */
--text-2xl:  1.5rem;     /* 24px - H3 */
--text-3xl:  1.875rem;   /* 30px - H2 */
--text-4xl:  2.25rem;    /* 36px - H1 */
--text-5xl:  3rem;       /* 48px - Display */
```

### Line Height

| Content Type | Line Height | Reason |
|--------------|-------------|--------|
| Headings | 1.2 - 1.3 | Tight for visual impact |
| Body text | 1.5 - 1.6 | Optimal readability |
| Long-form content | 1.6 - 1.75 | Reduces eye strain |

> **Research**: Increasing line spacing from 100% to 120% improves reading accuracy by up to 20%.

### Line Length

- **Optimal**: 50-75 characters per line
- **Maximum**: 80 characters
- Beyond 80 chars, users need to move their head to read

### Font Weights

| Weight | Use |
|--------|-----|
| 400 (Regular) | Body text |
| 500 (Medium) | Emphasized body, labels |
| 600 (Semibold) | Subheadings, buttons |
| 700 (Bold) | Headings |

> **Warning**: Avoid weights below 400 for small text (accessibility issue)

### Fluid Typography (CSS)

```css
/* Responsive heading that scales smoothly */
h1 {
  font-size: clamp(1.875rem, 1.5rem + 1.5vw, 2.25rem);
  line-height: 1.2;
}

/* Responsive body text */
body {
  font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  line-height: 1.6;
}
```

---

## Color System

### Why Blue for Legal Tech

> "85% of consumers make purchasing decisions based on color. Blue conveys trust, stability, and professionalism - essential for legal applications."

### Primary Palette

```css
/* Professional Blue - Trust & Reliability */
--color-primary-50:  #EFF6FF;  /* Backgrounds */
--color-primary-100: #DBEAFE;
--color-primary-200: #BFDBFE;
--color-primary-300: #93C5FD;
--color-primary-400: #60A5FA;
--color-primary-500: #3B82F6;  /* Primary actions */
--color-primary-600: #2563EB;  /* Hover states */
--color-primary-700: #1D4ED8;
--color-primary-800: #1E40AF;
--color-primary-900: #1E3A8A;  /* Dark accents */
```

### Semantic Colors

```css
/* Success - Confirmations, completed actions */
--color-success-light: #ECFDF5;
--color-success: #10B981;
--color-success-dark: #059669;

/* Warning - Caution, medium risk */
--color-warning-light: #FFFBEB;
--color-warning: #F59E0B;
--color-warning-dark: #D97706;

/* Error - Errors, high risk, destructive */
--color-error-light: #FEF2F2;
--color-error: #EF4444;
--color-error-dark: #DC2626;

/* Info - Informational, neutral highlights */
--color-info-light: #EFF6FF;
--color-info: #3B82F6;
--color-info-dark: #2563EB;
```

### Risk Level Colors (P1 Contract Analysis)

```css
--color-risk-high:   #EF4444;  /* Red - Critical issues */
--color-risk-medium: #F59E0B;  /* Amber - Attention needed */
--color-risk-low:    #10B981;  /* Green - Acceptable */
```

### Neutral Palette (Light Mode)

```css
--color-gray-50:  #F9FAFB;  /* Page background */
--color-gray-100: #F3F4F6;  /* Card backgrounds */
--color-gray-200: #E5E7EB;  /* Borders, dividers */
--color-gray-300: #D1D5DB;  /* Disabled states */
--color-gray-400: #9CA3AF;  /* Placeholder text */
--color-gray-500: #6B7280;  /* Secondary text */
--color-gray-600: #4B5563;  /* Body text */
--color-gray-700: #374151;  /* Headings */
--color-gray-800: #1F2937;  /* Primary text */
--color-gray-900: #111827;  /* High emphasis */
```

### 2025 Trend: Minimal Color Use

> "The approach to color in SaaS has shifted to minimalistic use. Vivid colors in only a few elements - CTAs, key metrics, alerts."

**Structure:**
1. **Grounding color** - Neutral background (most used)
2. **Primary accent** - Brand blue (CTAs, links, key actions)
3. **Semantic accents** - Success/warning/error (sparingly)

---

## Spacing & Layout

### Spacing Scale (4px base)

```css
--space-0:   0;
--space-1:   0.25rem;   /* 4px */
--space-2:   0.5rem;    /* 8px */
--space-3:   0.75rem;   /* 12px */
--space-4:   1rem;      /* 16px */
--space-5:   1.25rem;   /* 20px */
--space-6:   1.5rem;    /* 24px */
--space-8:   2rem;      /* 32px */
--space-10:  2.5rem;    /* 40px */
--space-12:  3rem;      /* 48px */
--space-16:  4rem;      /* 64px */
--space-20:  5rem;      /* 80px */
--space-24:  6rem;      /* 96px */
```

### Whitespace Principles

> "Use of negative space between paragraphs and margins increases comprehension by almost 20%."

1. **Start generous** - Begin with more whitespace than you think you need
2. **Group by proximity** - Related items close, unrelated items far
3. **Consistent rhythm** - Use the spacing scale, not arbitrary values
4. **Let content breathe** - Every element needs room

### Layout Patterns

| Pattern | Use Case |
|---------|----------|
| **Split View** | P1 (Contract + Analysis), P4/P5 (Form + Preview) |
| **Wizard/Stepper** | P2 Formation (multi-step) |
| **Chat** | P3 Legal Advisor |
| **Cards Grid** | Dashboard (tool selection) |

### Container Widths

```css
--container-sm:  640px;   /* Narrow content */
--container-md:  768px;   /* Default */
--container-lg:  1024px;  /* Wide content */
--container-xl:  1280px;  /* Full layouts */
--container-2xl: 1536px;  /* Extra wide */
```

---

## Shadows & Depth

### Refactoring UI Shadow Principles

> "Instead of using large blur to make shadows noticeable, add a vertical offset. It simulates a light source from above."

### Two-Shadow Technique

Use two shadows per elevated element:
1. **Ambient shadow** - Larger, softer (general light diffusion)
2. **Direct shadow** - Smaller, darker (direct light source)

```css
/* Elevated card */
.card {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12),    /* Ambient */
    0 1px 2px rgba(0, 0, 0, 0.24);     /* Direct */
}

/* Modal/overlay */
.modal {
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.15),   /* Ambient */
    0 6px 10px rgba(0, 0, 0, 0.20);    /* Direct */
}
```

### Shadow Scale

```css
/* Elevation levels */
--shadow-xs:  0 1px 2px rgba(0,0,0,0.05);
--shadow-sm:  0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
--shadow-md:  0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
--shadow-lg:  0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
--shadow-xl:  0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04);
--shadow-2xl: 0 25px 50px rgba(0,0,0,0.25);
```

### Use Shadows Instead of Borders

> "Shadows do a great job of outlining an element like a border would, but can be more subtle and less distracting."

- Buttons: `shadow-sm` instead of border
- Cards: `shadow-md` for separation
- Modals: `shadow-xl` for overlay

---

## Buttons & CTAs

### Hierarchy Rule

> "Your UI can have more than one button, just not more than one primary button. If every button screams for attention, none of them get it."

| Type | Style | Use |
|------|-------|-----|
| **Primary** | Solid, high contrast | Main action (1 per view) |
| **Secondary** | Outline or lighter fill | Alternative actions |
| **Tertiary/Ghost** | Text only, minimal | Cancel, less important |
| **Destructive** | Red solid/outline | Delete, remove |

### Visual Hierarchy

```
Primary:     ████████████  (Solid, brand color)
Secondary:   ┌──────────┐  (Outline or light fill)
Tertiary:    Link text     (Text with underline on hover)
```

### Sizing

| Size | Height | Padding | Use |
|------|--------|---------|-----|
| Small | 32px | 12px 16px | Inline, tables |
| Default | 40px | 16px 24px | Most cases |
| Large | 48px | 20px 32px | Hero CTAs |

### Minimum Touch Targets

- **Apple HIG**: 44x44px minimum
- **Material Design**: 48x48px minimum
- **Gap between buttons**: 8px minimum

### Button Copy

> "Use strong verbs: Get, Start, Download, Join. Avoid vague 'Click Here' or 'Submit'."

| Bad | Good |
|-----|------|
| Submit | Analyze Contract |
| Click Here | Get My Report |
| Learn More | See Pricing |

---

## Forms & Validation

### Validation Timing

> "Ideally, all validation should be inline - as soon as the user finishes a field."

| Timing | When to Use |
|--------|-------------|
| On blur | Most fields (after user leaves field) |
| On submit | Simple forms, when blur is too aggressive |
| Real-time | Password strength, character counts |

**Never:** Validate on every keystroke (frustrating)

### Error Message Placement

> "Place error messages directly below the input field. Never group at top/bottom of form."

```
┌─────────────────────────────┐
│ Email                       │
├─────────────────────────────┤
│ john@                       │
└─────────────────────────────┘
⚠ Please enter a valid email address
```

### Error Message Content

| Bad | Good |
|-----|------|
| "Invalid input" | "Please enter a valid email address" |
| "Error" | "This field is required" |
| "Wrong format" | "Phone number should be 10 digits" |

**Guidelines:**
- Be specific and actionable
- Use friendly, non-blaming tone
- Provide corrective guidance

### Visual Indicators

- **Error**: Red border + red text + icon
- **Success**: Green checkmark (sparingly)
- **Required**: Asterisk (*) with legend

```css
/* Error state */
.input-error {
  border-color: var(--color-error);
  background-color: var(--color-error-light);
}

.error-message {
  color: var(--color-error);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}
```

### Accessibility

- Use `aria-invalid="true"` for error states
- Use `aria-describedby` to link error messages
- Don't rely on color alone (add icons)

---

## Loading States

### Skeleton Screens

> "Users perceive pages loading 20-30% faster with skeletons than with spinners."

**Best Practices:**

1. **Match the real layout** - Skeletons should mirror final UI
2. **Animation timing** - 1.5-2 second shimmer cycle
3. **Only use for >0.5s loads** - Fast loads don't need skeletons
4. **Smooth transition** - Cross-fade to real content

```tsx
// Skeleton example
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
</div>
```

### Loading Indicators by Context

| Context | Indicator |
|---------|-----------|
| Page load | Skeleton screen |
| Button action | Spinner inside button + disabled |
| Background process | Toast/notification |
| Streaming content | Typewriter effect + tool progress |

### Tool Progress (AI Streaming)

```tsx
// Show what the AI is doing
{currentTool && (
  <div className="flex items-center gap-2 text-muted-foreground">
    <Loader2 className="animate-spin h-4 w-4" />
    <span>Searching legal database...</span>
  </div>
)}
```

---

## Motion & Animation

### Principles

> "73% of users associate smooth animations with trust and quality."

**C.U.R.E. Framework:**
- **C**ontext - Does this motion make sense here?
- **U**sefulness - Does it help the user?
- **R**estraint - Less is more
- **E**motion - Does it feel right?

### Timing

| Duration | Use |
|----------|-----|
| 100-150ms | Micro-interactions (hover, focus) |
| 200-300ms | Standard transitions |
| 300-500ms | Complex animations (modals, pages) |

> "Under 100ms feels jumpy. Over 300ms feels sluggish."

### Spring Physics

> "Google's 2024 UX study: users perceive spring animations as 15-20% more responsive than linear."

```tsx
// Framer Motion spring config
const springConfig = {
  type: "spring",
  stiffness: 400,
  damping: 30
};

<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={springConfig}
/>
```

### Micro-interactions

| Element | Animation |
|---------|-----------|
| Button hover | Slight lift (y: -1px) + shadow increase |
| Button press | Scale down (0.98) |
| Card hover | Subtle shadow increase |
| Toggle | Spring bounce |
| Notification | Slide in from edge |

### Respect User Preferences

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Icons

### Recommended Library

**Lucide React** (shadcn/ui default)
- 1,450+ icons
- Stroke-based, consistent style
- Tree-shakable
- MIT licensed

```tsx
import { FileText, Building2, MessageSquare, Mail, Scale } from 'lucide-react';
```

### Icon Sizing

| Size | Use |
|------|-----|
| 16px | Inline with text, buttons |
| 20px | Default UI elements |
| 24px | Navigation, prominent actions |
| 32px+ | Feature icons, empty states |

### Icon + Text Alignment

```tsx
// Proper alignment
<button className="flex items-center gap-2">
  <FileText className="h-4 w-4" />
  <span>Analyze Contract</span>
</button>
```

### Icon-Only Buttons

**Always add accessible label:**

```tsx
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>
```

---

## Accessibility

### WCAG 2.1 AA Requirements

| Area | Requirement |
|------|-------------|
| **Contrast** | 4.5:1 for text, 3:1 for large text/UI |
| **Touch targets** | 44x44px minimum |
| **Focus indicators** | Visible on all interactive elements |
| **Keyboard** | All functionality accessible |
| **Screen readers** | Proper labels, roles, states |

### Critical Stats

> "Color contrast is the #1 accessibility violation - affecting 83.6% of websites."

> "4,605 ADA lawsuits filed in 2024. European Accessibility Act in force since June 2025."

### Checklist

- [ ] All text meets 4.5:1 contrast ratio
- [ ] Touch targets are 44x44px minimum
- [ ] Focus states are visible
- [ ] All images have alt text
- [ ] Forms have associated labels
- [ ] Errors announced to screen readers
- [ ] Skip to main content link
- [ ] Keyboard navigation works everywhere
- [ ] Motion respects `prefers-reduced-motion`

### Testing Tools

- **WebAIM Contrast Checker** - Color contrast
- **axe DevTools** - Automated accessibility testing
- **VoiceOver/NVDA** - Screen reader testing

---

## Dark Mode

### Critical Rules

> "Pure black (#000000) causes halation and eye strain. Pure white (#FFFFFF) is too harsh."

### Background Colors

```css
/* Dark mode backgrounds - NEVER pure black */
--background:      #0A0A0B;   /* Page background */
--card-background: #141415;   /* Elevated surfaces */
--input-background: #1A1A1C;  /* Form inputs */
--border:          #27272A;   /* Borders, dividers */
```

### Text Colors

```css
/* Dark mode text - NEVER pure white */
--text-primary:    #FAFAFA;   /* High emphasis */
--text-secondary:  #A1A1AA;   /* Medium emphasis */
--text-muted:      #71717A;   /* Low emphasis */
```

### Semantic Colors (Dark Mode)

- Reduce saturation for primary colors
- Maintain sufficient contrast
- Use lighter variants for backgrounds

```css
/* Error in dark mode */
--color-error:       #F87171;  /* Lighter red */
--color-error-bg:    #2D1F1F;  /* Dark red background */
```

### Implementation

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0A0A0B;
    --foreground: #FAFAFA;
    --card: #141415;
    --primary: #60A5FA;  /* Lighter blue for dark mode */
  }
}

/* Or with class-based toggle */
.dark {
  --background: #0A0A0B;
  /* ... */
}
```

---

## Inspiration

### Apps to Study

| App | What to Learn |
|-----|---------------|
| **Linear** | Speed, minimal UI, keyboard-first |
| **Stripe Dashboard** | Data clarity, whitespace, typography |
| **Notion** | Clean layout, content focus |
| **Arc Browser** | Modern aesthetics, smooth animations |

### Key Takeaways from Linear

> "Linear succeeds by stripping away friction. Every interaction feels fast. Dark UI tones, sharp typography, minimal ornamentation."

### Key Takeaways from Stripe

> "Despite being data-rich, the UI never feels dense. Crisp typography, generous whitespace, subtle color use."

---

## Quick Reference Card

### Do's

- Use Inter for UI text
- Blue primary color for trust
- 4.5:1 minimum contrast
- Generous whitespace
- Two-layer shadows
- One primary CTA per view
- Inline form validation
- Skeleton loaders for >0.5s waits
- Spring physics for animations
- Lucide icons (consistent set)

### Don'ts

- Pure black/white in dark mode
- More than 3 font weights
- Saturated colors at scale
- Borders when shadows work
- Multiple primary buttons
- Validation on every keystroke
- Animations over 300ms
- Icons from multiple libraries
- Line lengths over 80 chars
- Touch targets under 44px

---

## Sources

- [Refactoring UI](https://www.refactoringui.com/) - Adam Wathan & Steve Schoger
- [Nielsen Norman Group](https://www.nngroup.com/) - UX Research
- [Material Design 3](https://m3.material.io/) - Google Design System
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Modular Scale](https://www.modularscale.com/) - Typography Tool
- [Lucide Icons](https://lucide.dev/) - Icon Library

---

*Last Updated: December 2025*
