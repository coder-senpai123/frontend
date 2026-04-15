import { useState, useCallback } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import FileUpload from "@/components/FileUpload";
import ParsingStatus from "@/components/ParsingStatus";
import PDFViewerWithOverlay from "@/components/PDFViewerWithOverlay";
import JSONViewerWithHover from "@/components/JSONViewerWithHover";
import { parseBill, type ParsedField, type ParsedBillResponse } from "@/lib/mockData";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type AppState = "upload" | "parsing" | "ready" | "error";

export default function Index() {
  const [state, setState] = useState<AppState>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ParsedBillResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [hoveredField, setHoveredField] = useState<ParsedField | null>(null);
  const [scrollTarget, setScrollTarget] = useState<ParsedField | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (f: File) => {
    setFile(f);
    setState("parsing");
    try {
      const res = await parseBill(f);
      if (res.status === "error") {
        setErrorMsg(res.error || "Parsing failed");
        setState("error");
      } else {
        setResult(res);
        setState("ready");
      }
    } catch {
      setErrorMsg("Network error — could not reach parser.");
      setState("error");
    }
  }, []);

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setState("upload");
    setHoveredField(null);
    setScrollTarget(null);
    setActiveKey(null);
  };

  const handleHover = (field: ParsedField | null) => {
    setHoveredField(field);
    if (field) {
      const key = Object.entries(result!.fields).find(([, f]) => f === field)?.[0] ?? null;
      setActiveKey(key);
    } else {
      setActiveKey(null);
    }
  };

  const handleClick = (field: ParsedField) => {
    setScrollTarget(field);
    setHoveredField(field);
    const key = Object.entries(result!.fields).find(([, f]) => f === field)?.[0] ?? null;
    setActiveKey(key);
  };

  const handleEditField = useCallback((key: string, newValue: string) => {
    setResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: {
          ...prev.fields,
          [key]: {
            ...prev.fields[key],
            value: newValue,
          },
        },
      };
    });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <img src="/carbontatva-logo.png" alt="CarbonTatva AI Logo" className="h-7 w-7 rounded" />
          <h1 className="text-base font-bold text-foreground tracking-tight">
            CarbonTatva AI
          </h1>
        </div>
        {state === "ready" && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            New File
          </Button>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        {state === "upload" && (
          <FileUpload onFileSelect={handleFileSelect} isLoading={false} />
        )}

        {state === "parsing" && <ParsingStatus />}

        {state === "error" && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-destructive font-medium">{errorMsg}</p>
            <Button variant="outline" onClick={handleReset}>
              Try Again
            </Button>
          </div>
        )}

        {state === "ready" && file && result && (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <PDFViewerWithOverlay
                file={file}
                highlightedField={hoveredField}
                scrollToField={scrollTarget}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={25}>
              <JSONViewerWithHover
                data={result}
                activeFieldKey={activeKey}
                onHoverField={handleHover}
                onClickField={handleClick}
                onEditField={handleEditField}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </main>
    </div>
  );
}
