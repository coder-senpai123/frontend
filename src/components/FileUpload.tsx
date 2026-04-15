import { useCallback, useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export default function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported.");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError("File size must be under 20 MB.");
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex flex-col items-center justify-center w-full max-w-lg rounded-2xl border-2 border-dashed p-12 transition-all duration-200 cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
        onClick={() => {
          if (isLoading) return;
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".pdf";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFile(file);
          };
          input.click();
        }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          {isLoading ? (
            <FileText className="h-8 w-8 text-primary animate-pulse" />
          ) : (
            <Upload className="h-8 w-8 text-primary" />
          )}
        </div>
        <p className="text-lg font-semibold text-foreground">
          {isLoading ? "Processing..." : "Drop your PDF bill here"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLoading ? "Please wait while we parse your document" : "or click to browse · PDF only · max 20 MB"}
        </p>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
