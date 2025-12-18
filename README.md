# Juridique AI - Frontend

> AI-powered legal assistant for French-speaking professionals

## Overview

This is the frontend application for Juridique AI, providing 5 AI-powered legal tools:

| Tool | Description | UI Pattern |
|------|-------------|------------|
| **P1** | Contract Analysis | Split View |
| **P2** | Business Formation | Wizard |
| **P3** | Legal Advisor | Chat |
| **P4** | Legal Correspondence | Form + Preview |
| **P5** | Procedural Documents | Form + Preview |

## Documentation

- [Frontend Specification](./FRONTEND-SPEC.md) - Complete technical spec
- [Design Guidelines](./DESIGN-GUIDELINES.md) - UI/UX best practices
- [Development Roadmap](./ROADMAP.md) - Step-by-step implementation guide
- [API Documentation](./API-DOCUMENTATION.md) - Backend API reference

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york)
- **State**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Animation**: Framer Motion

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://aoli-juridique-dev-func.azurewebsites.net
NEXT_PUBLIC_API_KEY=your-function-key-here
```

## Backend Repository

The backend API is maintained separately: [aoli-juridique](https://github.com/yet-market/aoli-juridique)

## License

Private - AOLI
