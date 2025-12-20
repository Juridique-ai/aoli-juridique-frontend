"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2 } from "lucide-react";

interface DocumentFile {
  uri: string;
  fileName: string;
  fileType: string;
}

interface ContractViewerProps {
  content: string;
  documentFile?: DocumentFile | null;
}

// Dynamic import the entire viewer component to avoid SSR issues
const DocumentViewerWrapper = dynamic(
  () => import("./document-viewer-wrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
);

export function ContractViewer({ content, documentFile }: ContractViewerProps) {
  // If we have a document file, show the document viewer
  if (documentFile) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {documentFile.fileName}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[500px] rounded-md border overflow-hidden">
            <DocumentViewerWrapper documentFile={documentFile} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback to text display for pasted content
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Contrat</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[500px] rounded-md border p-4">
          <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
            {content}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
