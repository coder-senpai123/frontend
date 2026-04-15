import { useEffect, useRef, useState, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import type { ParsedField } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFViewerWithOverlayProps {
  file: File;
  highlightedField: ParsedField | null;
  scrollToField: ParsedField | null;
}

export default function PDFViewerWithOverlay({
  file,
  highlightedField,
  scrollToField,
}: PDFViewerWithOverlayProps) {
  const [numPages, setNumPages] = useState(0);
  const [containerWidth, setContainerWidth] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const fileUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerWidth(w - 32);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Scroll to field page
  useEffect(() => {
    if (!scrollToField) return;
    const pageEl = pageRefs.current.get(scrollToField.page);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [scrollToField]);

  const renderOverlay = (pageNumber: number) => {
    const field = highlightedField;
    if (!field || field.page !== pageNumber) return null;
    const [x1, y1, x2, y2] = field.bbox;
    return (
      <div
        className="absolute pointer-events-none transition-all duration-300 ease-out rounded-sm"
        style={{
          left: `${x1}%`,
          top: `${y1}%`,
          width: `${x2 - x1}%`,
          height: `${y2 - y1}%`,
          backgroundColor: "hsl(var(--primary) / 0.15)",
          border: "2px solid hsl(var(--primary) / 0.6)",
          boxShadow: "0 0 12px hsl(var(--primary) / 0.2)",
        }}
      />
    );
  };

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto bg-muted/30 p-4"
    >
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        loading={
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Loading PDF...
          </div>
        }
        error={
          <div className="flex items-center justify-center h-64 text-destructive text-sm">
            Failed to load PDF
          </div>
        }
      >
        {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
          <div
            key={pageNum}
            ref={(el) => {
              if (el) pageRefs.current.set(pageNum, el);
            }}
            className="relative mb-4 shadow-md rounded-lg overflow-hidden bg-card"
          >
            <div className="px-3 py-1.5 text-xs text-muted-foreground bg-muted border-b border-border">
              Page {pageNum} of {numPages}
            </div>
            <div className="relative flex justify-center bg-muted/10">
              <Page
                pageNumber={pageNum}
                width={containerWidth}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="relative shadow-sm"
              >
                {renderOverlay(pageNum)}
              </Page>
            </div>
          </div>
        ))}
      </Document>
    </div>
  );
}
