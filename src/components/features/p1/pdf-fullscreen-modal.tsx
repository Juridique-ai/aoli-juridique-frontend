"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalysisLayout } from "./analysis-layout";

interface DocumentFile {
  uri: string;
  fileName: string;
  fileType: string;
}

interface PDFFullscreenModalProps {
  documentFile: DocumentFile | null;
  contractContent: string;
}

// Dynamic import to avoid SSR issues
const DocumentViewerWrapper = dynamic(
  () => import("./document-viewer-wrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

// Plain text viewer with highlighting for non-PDF content
function PlainTextViewer({ content, searchText }: { content: string; searchText: string | null }) {
  if (!searchText) {
    return (
      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-muted-foreground p-6">
        {content}
      </pre>
    );
  }

  const searchLower = searchText.toLowerCase();
  const words = searchLower.split(/\s+/).filter(w => w.length > 2);

  if (words.length === 0) {
    return (
      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-muted-foreground p-6">
        {content}
      </pre>
    );
  }

  const pattern = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = content.split(pattern);

  return (
    <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-muted-foreground p-6">
      {parts.map((part, i) => {
        const isMatch = words.some(w => part.toLowerCase().includes(w));
        if (isMatch) {
          return (
            <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">
              {part}
            </mark>
          );
        }
        return part;
      })}
    </pre>
  );
}

export function PDFFullscreenModal({ documentFile, contractContent }: PDFFullscreenModalProps) {
  const { isFullscreen, closeFullscreen, activeClause } = useAnalysisLayout();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        closeFullscreen();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFullscreen, closeFullscreen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  return (
    <AnimatePresence>
      {isFullscreen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeFullscreen}
            className="fixed inset-0 bg-black/80 z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-4 md:inset-8 lg:inset-12 z-[101] bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">
                  {documentFile?.fileName || "Document"}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeFullscreen}
                className="h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-auto">
              {documentFile ? (
                <DocumentViewerWrapper
                  documentFile={documentFile}
                  searchText={activeClause}
                />
              ) : (
                <PlainTextViewer content={contractContent} searchText={activeClause} />
              )}
            </div>

            {/* Footer hint */}
            <div className="px-6 py-3 border-t border-border bg-muted/20 shrink-0">
              <p className="text-sm text-muted-foreground text-center">
                Appuyez sur <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">Échap</kbd> pour fermer
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
