"use client";

import { useState, createContext, useContext, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnalysisLayoutContextValue {
  isPDFOpen: boolean;
  openPDF: (scrollToClause?: string) => void;
  closePDF: () => void;
  activeClause: string | null;
}

const AnalysisLayoutContext = createContext<AnalysisLayoutContextValue | null>(null);

export function useAnalysisLayout() {
  const context = useContext(AnalysisLayoutContext);
  if (!context) {
    throw new Error("useAnalysisLayout must be used within AnalysisLayout");
  }
  return context;
}

interface AnalysisLayoutProps {
  header: ReactNode;
  results: ReactNode;
  navigation: ReactNode;
  pdfViewer: ReactNode;
  className?: string;
}

export function AnalysisLayout({
  header,
  results,
  navigation,
  pdfViewer,
  className,
}: AnalysisLayoutProps) {
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeClause, setActiveClause] = useState<string | null>(null);

  const openPDF = (scrollToClause?: string) => {
    if (scrollToClause) {
      setActiveClause(scrollToClause);
    }
    setIsPDFOpen(true);
    setIsMobileNavOpen(false);
  };

  const closePDF = () => {
    setIsPDFOpen(false);
    setActiveClause(null);
  };

  return (
    <AnalysisLayoutContext.Provider value={{ isPDFOpen, openPDF, closePDF, activeClause }}>
      <div className={cn("min-h-screen bg-gradient-to-b from-background to-muted/20", className)}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          {header}
        </div>

        {/* Main Content */}
        <div className="container py-6 max-w-7xl">
          {/* Desktop: 60/40 Split */}
          <div className="hidden lg:flex gap-6">
            {/* Left: Analysis Results (60%) */}
            <div className="w-[60%] min-w-0">
              {results}
            </div>

            {/* Right: Navigation / PDF Drawer (40%) */}
            <div className="w-[40%] relative">
              <div className="sticky top-[120px]">
                {/* Navigation - animate out when PDF opens */}
                <motion.div
                  initial={false}
                  animate={{
                    opacity: isPDFOpen ? 0 : 1,
                    x: isPDFOpen ? 20 : 0,
                    pointerEvents: isPDFOpen ? "none" : "auto"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {navigation}
                </motion.div>

                {/* PDF Viewer - always mounted, animate visibility */}
                <motion.div
                  initial={false}
                  animate={{
                    opacity: isPDFOpen ? 1 : 0,
                    x: isPDFOpen ? 0 : 40,
                    pointerEvents: isPDFOpen ? "auto" : "none"
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  {pdfViewer}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Mobile: Full width results */}
          <div className="lg:hidden">
            {results}
          </div>
        </div>

        {/* Mobile: Floating Navigation Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setIsMobileNavOpen(true)}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile: Bottom Sheet Navigation */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileNavOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
              />
              {/* Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-xl max-h-[80vh] overflow-auto"
              >
                <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-background">
                  <h3 className="font-semibold">Navigation</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-4">
                  {navigation}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile: PDF Bottom Sheet - always mounted for performance */}
        <motion.div
          initial={false}
          animate={{ opacity: isPDFOpen ? 1 : 0 }}
          className={cn(
            "lg:hidden fixed inset-0 bg-black/50 z-40",
            !isPDFOpen && "pointer-events-none"
          )}
        />
        <motion.div
          initial={false}
          animate={{ y: isPDFOpen ? 0 : "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-xl h-[85vh]"
        >
          {pdfViewer}
        </motion.div>
      </div>
    </AnalysisLayoutContext.Provider>
  );
}
