"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, X, Loader2, Check, Sparkles, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import * as pdfjsLib from "pdfjs-dist";

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Extract text from PDF file
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    textParts.push(pageText);
  }

  return textParts.join('\n\n');
}

// Get MIME type for file
function getFileType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain',
    csv: 'text/csv',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

export interface DocumentFile {
  uri: string;
  fileName: string;
  fileType: string;
}

interface ContractUploadProps {
  onDocument: (content: string, file: DocumentFile | null) => void;
}

const SAMPLE_CONTRACTS = [
  { label: "Contrat de travail", type: "CDI" },
  { label: "Bail commercial", type: "Location" },
  { label: "Contrat de vente", type: "Commerce" },
];

export function ContractUpload({ onDocument }: ContractUploadProps) {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      setIsProcessing(true);

      try {
        setProcessingStep("Lecture du fichier...");

        // Create data URL for document viewer
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const documentFile: DocumentFile = {
          uri: dataUrl,
          fileName: file.name,
          fileType: getFileType(file),
        };

        // Extract text for AI analysis
        setProcessingStep("Extraction du texte...");
        let text: string;
        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          text = await extractTextFromPDF(file);
        } else {
          text = await file.text();
        }

        setProcessingStep("Prêt !");
        await new Promise(resolve => setTimeout(resolve, 500));

        onDocument(text, documentFile);
      } catch (error) {
        console.error("Error processing file:", error);
        onDocument("Erreur lors du traitement du fichier. Veuillez réessayer.", null);
      } finally {
        setIsProcessing(false);
        setProcessingStep("");
      }
    },
    [onDocument]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
  });

  const handlePasteSubmit = () => {
    if (pastedText.trim()) {
      onDocument(pastedText.trim(), null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            mode === "upload"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Upload className="h-4 w-4" />
          Importer
        </button>
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            mode === "paste"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ClipboardPaste className="h-4 w-4" />
          Coller
        </button>
      </div>

      {mode === "upload" ? (
        <div className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300",
              "group",
              isDragActive
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border/50 hover:border-primary/50 hover:bg-muted/30",
              isProcessing && "pointer-events-none opacity-75"
            )}
          >
            <input {...getInputProps()} />

            {/* Background gradient on drag */}
            <div className={cn(
              "absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 transition-opacity",
              isDragActive && "opacity-100"
            )} />

            <div className="relative z-10">
              {isProcessing ? (
                <>
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative p-4 rounded-full bg-primary/10">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                  </div>
                  <p className="text-lg font-medium">{processingStep}</p>
                  <p className="text-sm text-muted-foreground mt-1">{fileName}</p>
                </>
              ) : (
                <>
                  <div className="relative inline-block mb-4">
                    <div className={cn(
                      "absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 transition-opacity",
                      "group-hover:opacity-100",
                      isDragActive && "opacity-100"
                    )} />
                    <div className={cn(
                      "relative p-4 rounded-full transition-all duration-300",
                      isDragActive
                        ? "bg-primary text-primary-foreground scale-110"
                        : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      <Upload className="h-8 w-8" />
                    </div>
                  </div>
                  <p className="text-lg font-medium">
                    {isDragActive ? "Déposez ici" : "Glissez-déposez votre contrat"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou cliquez pour sélectionner
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {["PDF", "DOC", "DOCX", "TXT"].map((format) => (
                      <span
                        key={format}
                        className="px-2 py-0.5 text-xs rounded bg-muted/50 text-muted-foreground"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* File indicator */}
          {fileName && !isProcessing && (
            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl animate-fade-in">
              <div className="p-2 rounded-lg bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="flex-1 text-sm font-medium truncate">{fileName}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setFileName(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Paste area */}
          <div className="relative">
            <Textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Collez le texte de votre contrat ici...

Vous pouvez copier-coller directement depuis un document Word, PDF, ou tout autre source."
              className={cn(
                "min-h-[300px] font-mono text-sm resize-none",
                "bg-muted/30 border-border/50",
                "focus:border-primary/50 focus:bg-background",
                "transition-all duration-200"
              )}
            />
            {pastedText && (
              <div className="absolute bottom-3 right-3">
                <span className="text-xs text-muted-foreground">
                  {pastedText.length.toLocaleString()} caractères
                </span>
              </div>
            )}
          </div>

          <Button
            className="w-full shadow-lg shadow-primary/20"
            onClick={handlePasteSubmit}
            disabled={!pastedText.trim()}
          >
            <FileText className="h-4 w-4 mr-2" />
            Analyser ce texte
          </Button>
        </div>
      )}

      {/* Quick tips */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
        <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium mb-1">Conseil</p>
          <p className="text-muted-foreground">
            Pour une meilleure analyse, importez le contrat complet incluant toutes les annexes et signatures.
          </p>
        </div>
      </div>
    </div>
  );
}
