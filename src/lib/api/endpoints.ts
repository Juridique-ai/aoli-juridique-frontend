export const endpoints = {
  health: "/health",
  p1: {
    analyze: "/p1/analyze",
    stream: "/p1/analyze/stream",
  },
  p2: {
    analyze: "/p2/analyze",
    stream: "/p2/analyze/stream",
  },
  p3: {
    advise: "/p3/advise",
    stream: "/p3/advise/stream",
  },
  p4: {
    draft: "/p4/draft",
    stream: "/p4/draft/stream",
  },
  p5: {
    draft: "/p5/draft",
    stream: "/p5/draft/stream",
  },
} as const;
