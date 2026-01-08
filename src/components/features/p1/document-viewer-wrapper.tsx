"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader2, ZoomIn, ZoomOut, ChevronUp, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentFile {
  uri: string;
  fileName: string;
  fileType: string;
}

interface DocumentViewerWrapperProps {
  documentFile: DocumentFile;
  searchText?: string | null;
}

export default function DocumentViewerWrapper({
  documentFile,
  searchText
}: DocumentViewerWrapperProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (err: Error) => {
    setError("Impossible de charger le document");
    setIsLoading(false);
    console.error("PDF load error:", err);
  };

  // Highlight search text in text layer
  const highlightText = useCallback(() => {
    if (!searchText || !containerRef.current) return;

    // Clear previous highlights
    const existingHighlights = containerRef.current.querySelectorAll(".search-highlight");
    existingHighlights.forEach((el) => el.classList.remove("search-highlight"));

    // Find and highlight matching text
    const textLayers = containerRef.current.querySelectorAll(".react-pdf__Page__textContent span");
    let foundMatch = false;
    let matchedPage = 0;

    textLayers.forEach((span) => {
      const text = span.textContent?.toLowerCase() || "";
      const search = searchText.toLowerCase();

      if (text.includes(search) || search.split(/\s+/).some(word => text.includes(word))) {
        span.classList.add("search-highlight");
        if (!foundMatch) {
          foundMatch = true;
          // Find which page this span belongs to
          const page = span.closest(".react-pdf__Page");
          if (page) {
            const pageNum = parseInt(page.getAttribute("data-page-number") || "1", 10);
            matchedPage = pageNum;
          }
        }
      }
    });

    // Scroll to first match
    if (foundMatch && matchedPage > 0) {
      const pageElement = pageRefs.current.get(matchedPage);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setCurrentPage(matchedPage);
      }
    }
  }, [searchText]);

  // Re-highlight when searchText changes or pages load
  useEffect(() => {
    if (searchText && !isLoading) {
      // Delay to ensure text layers are rendered
      const timer = setTimeout(highlightText, 500);
      return () => clearTimeout(timer);
    }
  }, [searchText, isLoading, highlightText]);

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 2.5));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page);
      const pageElement = pageRefs.current.get(page);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn} disabled={scale >= 2.5}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {currentPage} / {numPages || "..."}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= numPages}>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search indicator */}
      {searchText && (
        <div className="px-3 py-1.5 bg-primary/5 border-b border-border flex items-center gap-2 shrink-0">
          <Search className="h-3 w-3 text-primary" />
          <span className="text-xs text-primary">Recherche: "{searchText}"</span>
        </div>
      )}

      {/* Document */}
      <ScrollArea className="flex-1" ref={containerRef}>
        <div className="p-4 flex flex-col items-center gap-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12 text-destructive">
              <p>{error}</p>
            </div>
          )}

          <Document
            file={documentFile.uri}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className={cn("pdf-document", isLoading && "hidden")}
          >
            {Array.from(new Array(numPages), (_, index) => (
              <div
                key={`page_${index + 1}`}
                ref={(el) => {
                  if (el) pageRefs.current.set(index + 1, el);
                }}
                className="mb-4 shadow-md"
              >
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="pdf-page"
                />
              </div>
            ))}
          </Document>
        </div>
      </ScrollArea>

      {/* CSS for highlighting */}
      <style jsx global>{`
        .search-highlight {
          background-color: rgba(var(--primary-rgb, 34, 197, 94), 0.3) !important;
          border-radius: 2px;
          padding: 1px 0;
          animation: highlight-pulse 1s ease-in-out 2;
        }

        @keyframes highlight-pulse {
          0%, 100% { background-color: rgba(var(--primary-rgb, 34, 197, 94), 0.3); }
          50% { background-color: rgba(var(--primary-rgb, 34, 197, 94), 0.6); }
        }

        .react-pdf__Page__textContent {
          user-select: text;
        }

        .react-pdf__Page__textContent span {
          cursor: text;
        }
      `}</style>
    </div>
  );
}
