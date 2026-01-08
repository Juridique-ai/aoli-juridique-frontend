"use client";

import dynamic from "next/dynamic";
import { X, Loader2, FileText, ExternalLink } from "lucide-react";
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

      {/* Active clause indicator */}
      {activeClause && (
        <div className="px-4 py-2 bg-primary/5 border-b border-border shrink-0">
          <p className="text-xs text-primary flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Clause référencée: <span className="font-medium">{activeClause}</span>
          </p>
        </div>
      )}

      {/* Document Viewer */}
      <div className="flex-1 min-h-0">
        {documentFile ? (
          <DocumentViewerWrapper documentFile={documentFile} />
        ) : (
          <ScrollArea className="h-full p-4">
            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-muted-foreground">
              {contractContent}
            </pre>
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
