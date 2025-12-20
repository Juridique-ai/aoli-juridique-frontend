"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function ContractUpload({ onDocument }: ContractUploadProps) {
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      setIsProcessing(true);

      try {
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
        let text: string;
        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          text = await extractTextFromPDF(file);
        } else {
          text = await file.text();
        }

        onDocument(text, documentFile);
      } catch (error) {
        console.error("Error processing file:", error);
        onDocument("Erreur lors du traitement du fichier. Veuillez réessayer.", null);
      } finally {
        setIsProcessing(false);
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
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload">Importer un fichier</TabsTrigger>
        <TabsTrigger value="paste">Coller le texte</TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="mt-4">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">
            {isDragActive ? "Déposez le fichier ici" : "Glissez-déposez votre contrat"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            ou cliquez pour sélectionner un fichier
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Formats acceptés: PDF, TXT, DOC, DOCX
          </p>
        </div>
        {fileName && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-muted rounded-lg">
            {isProcessing ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <FileText className="h-5 w-5 text-primary" />
            )}
            <span className="flex-1 text-sm font-medium">
              {isProcessing ? `Extraction du texte de ${fileName}...` : fileName}
            </span>
            {!isProcessing && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setFileName(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="paste" className="mt-4">
        <Textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Collez le texte de votre contrat ici..."
          className="min-h-[300px] font-mono text-sm"
        />
        <Button
          className="mt-4 w-full"
          onClick={handlePasteSubmit}
          disabled={!pastedText.trim()}
        >
          <FileText className="h-4 w-4 mr-2" />
          Utiliser ce texte
        </Button>
      </TabsContent>
    </Tabs>
  );
}
