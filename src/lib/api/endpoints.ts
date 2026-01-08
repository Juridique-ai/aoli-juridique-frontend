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
} as const;
