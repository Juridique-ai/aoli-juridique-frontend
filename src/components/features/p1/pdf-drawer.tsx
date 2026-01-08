"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { X, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAnalysisLayout } from "./analysis-layout";

interface DocumentFile {
  uri: string;
  fileName: string;
  fileType: string;
}

interface PDFDrawerProps {
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

// Component to highlight text in plain text content
function HighlightedText({ content, searchText }: { content: string; searchText: string | null }) {
  const highlightedContent = useMemo(() => {
    if (!searchText) return content;

    const searchLower = searchText.toLowerCase();
    const words = searchLower.split(/\s+/).filter(w => w.length > 2);

    if (words.length === 0) return content;

    // Create regex pattern for all words
    const pattern = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = content.split(pattern);

    return parts.map((part, i) => {
      const isMatch = words.some(w => part.toLowerCase().includes(w));
      if (isMatch) {
        return (
          <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">
            {part}
          </mark>
        );
      }
      return part;
    });
  }, [content, searchText]);

  return (
    <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-muted-foreground">
      {highlightedContent}
    </pre>
  );
}

export function PDFDrawer({ documentFile, contractContent }: PDFDrawerProps) {
  const { closePDF, activeClause } = useAnalysisLayout();

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm text-foreground truncate max-w-[200px]">
            {documentFile?.fileName || "Document"}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={closePDF}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 min-h-0">
        {documentFile ? (
          <DocumentViewerWrapper
            documentFile={documentFile}
            searchText={activeClause}
          />
        ) : (
          <ScrollArea className="h-full p-4">
            <HighlightedText content={contractContent} searchText={activeClause} />
          </ScrollArea>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-border bg-muted/20 shrink-0">
        <p className="text-xs text-muted-foreground text-center">
          Cliquez sur les références de clause dans l'analyse pour les localiser
        </p>
      </div>
    </div>
  );
}
