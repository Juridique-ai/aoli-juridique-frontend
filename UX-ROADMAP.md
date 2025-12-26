# UX Roadmap - Juridique AI Frontend

## Overview
Complete UX redesign following 2025 best practices for legal tech applications.
Focus: Progressive disclosure, mobile-first, reduced cognitive load, guided experiences.

---

## P1 - Contract Analysis

### Current State
- Upload file → Select options → Click analyze → Split view results
- No guided experience, poor mobile UX

### UX Improvements
- [ ] **Drag-and-drop upload zone** with visual feedback + paste support
- [ ] **Progressive analysis display** - show results section by section as they stream
- [ ] **Mobile: Stacked view** with tabs (Document | Analysis)
- [ ] **Smart defaults** - auto-detect document type when possible
- [ ] **Empty state** with example/demo documents to try
- [ ] **Collapsible analysis sections** (Summary, Risks, Clauses, Recommendations)

### Implementation Priority: HIGH

---

## P2 - Business Creation Wizard

### Current State
- 5 fixed steps, basic progress indicator
- No conditional logic, can't easily review answers

### UX Improvements
- [ ] **Conditional logic** - skip irrelevant questions based on answers
- [ ] **Live summary sidebar/card** showing all selections
- [ ] **Enhanced stepper** with step titles always visible
- [ ] **Single-question-per-screen** on mobile for focus
- [ ] **Selection cards/chips** instead of dropdowns where appropriate
- [ ] **Estimated time indicator** ("~3 min") at wizard start
- [ ] **Edit previous answers** without losing progress

### Implementation Priority: MEDIUM

---

## P3 - Legal Advisor Chat

### Current State
- Basic chat interface with jurisdiction selector
- Plain empty state, no onboarding

### UX Improvements
- [ ] **Onboarding cards** showing question categories (Employment, Real Estate, Business, Family)
- [ ] **Quick-reply suggestion chips** after AI responses
- [ ] **Enhanced status indicators** ("Researching laws...", "Analyzing your case...")
- [ ] **Floating input** that stays at viewport bottom
- [ ] **Category/topic selection** before or during chat
- [ ] **Conversation starter suggestions** based on selected category

### Implementation Priority: HIGH

---

## P4 - Legal Correspondence

### Current State
- Complex split view with many form fields
- High cognitive load, poor mobile experience

### UX Improvements
- [ ] **Collapsible accordion sections** (Sender → Recipient → Content → Tone)
- [ ] **Templates gallery** at start (Mise en demeure, Résiliation, Réclamation, etc.)
- [ ] **Mobile: Tab-based view** or step-by-step instead of split
- [ ] **Guided mode vs Quick mode** toggle for different user expertise
- [ ] **Live preview** in modal/drawer on mobile
- [ ] **Auto-fill from previous letters** option
- [ ] **Progress indicator** showing completion percentage

### Implementation Priority: MEDIUM

---

## P5 - Procedural Documents

### Current State
- Most complex form with many fields
- Adding facts/claims is tedious
- Very poor mobile experience

### UX Improvements
- [ ] **Wizard-style flow** instead of single form:
  1. Document Type Selection
  2. Case Information
  3. Parties (Plaintiff/Defendant)
  4. Facts (with drag-to-reorder)
  5. Claims & Legal Basis
  6. Review & Generate
- [ ] **Inline help tooltips** explaining legal terminology
- [ ] **Drag-to-reorder** for facts and claims
- [ ] **Document type templates** with pre-filled structures
- [ ] **Mobile: Full wizard** with one section per screen
- [ ] **Draft auto-save** with visual indicator
- [ ] **Recent documents** quick access

### Implementation Priority: HIGH

---

## Global UX Patterns

### Mobile-First Design
- Single column layouts on mobile
- Touch-friendly tap targets (min 44px)
- Bottom-anchored primary actions
- Swipe gestures where appropriate
- Collapsible sections by default

### Progressive Disclosure
- Show only essential fields first
- Expand for advanced options
- Contextual help via tooltips
- Step-by-step for complex tasks

### Feedback & Status
- Loading states with context ("Analyzing clause 3...")
- Success/error states with clear messaging
- Progress indicators for multi-step processes
- Undo capabilities where possible

### Accessibility
- Reduced motion support
- Keyboard navigation
- Screen reader labels
- Color contrast compliance

---

## Implementation Order

1. **Phase 1**: P3 (Chat) + P1 (Contract) - Most used features
2. **Phase 2**: P5 (Procedural) - Most complex, biggest improvement potential
3. **Phase 3**: P2 (Wizard) + P4 (Correspondence) - Polish existing flows

---

## References
- [UX/UI Design Principles in Legal Tech](https://www.lazarev.agency/articles/legaltech-design)
- [Multi-Step Form Best Practices](https://www.webstacks.com/blog/multi-step-form)
- [Wizard UI Pattern Guide](https://www.eleken.co/blog-posts/wizard-ui-pattern-explained)
- [AI Chatbot UX Best Practices 2025](https://www.letsgroto.com/blog/ux-best-practices-for-ai-chatbots)
- [Progressive Disclosure in UX](https://www.interaction-design.org/literature/topics/progressive-disclosure)
- [Mobile UX Design Guide 2025](https://www.webstacks.com/blog/mobile-ux-design)
- [Conversational UI Best Practices](https://www.willowtreeapps.com/insights/willowtrees-7-ux-ui-rules-for-designing-a-conversational-ai-assistant)
