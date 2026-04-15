import { useState } from "react";
import type { ParsedField, ParsedBillResponse } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileText, MapPin, Pencil, Check, X } from "lucide-react";

interface JSONViewerWithHoverProps {
  data: ParsedBillResponse;
  activeFieldKey: string | null;
  onHoverField: (field: ParsedField | null) => void;
  onClickField: (field: ParsedField) => void;
  onEditField: (key: string, newValue: string) => void;
}

function formatFieldName(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function confidenceColor(score: number): string {
  if (score >= 0.95) return "bg-green-100 text-green-700 border-green-200";
  if (score >= 0.85) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-red-100 text-red-700 border-red-200";
}

export default function JSONViewerWithHover({
  data,
  activeFieldKey,
  onHoverField,
  onClickField,
  onEditField,
}: JSONViewerWithHoverProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleStartEdit = (e: React.MouseEvent, key: string, value: any) => {
    e.stopPropagation();
    setEditingKey(key);
    setEditValue(String(value ?? ""));
  };

  const handleSave = (e: React.MouseEvent | React.KeyboardEvent, key: string) => {
    e.stopPropagation();
    onEditField(key, editValue);
    setEditingKey(null);
  };

  const handleCancel = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setEditingKey(null);
  };
  const fields = Object.entries(data.fields);

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Extracted Fields
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {fields.length} fields extracted · Hover to highlight source
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {fields.map(([key, field]) => (
          <div
            key={key}
            className={cn(
              "w-full text-left rounded-lg border p-3 transition-all duration-200 cursor-pointer group",
              activeFieldKey === key
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/40 hover:bg-muted/50"
            )}
            onMouseEnter={() => onHoverField(field)}
            onMouseLeave={() => onHoverField(null)}
            onClick={() => {
              if (editingKey !== key) onClickField(field);
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {formatFieldName(key)}
                </div>
                {editingKey === key ? (
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave(e, key);
                        if (e.key === "Escape") handleCancel(e);
                      }}
                      autoFocus
                    />
                    <button onClick={(e) => handleSave(e, key)} className="p-1 hover:text-green-600 text-muted-foreground transition-colors rounded">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={handleCancel} className="p-1 hover:text-red-600 text-muted-foreground transition-colors rounded">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-0.5 text-sm font-semibold text-foreground truncate flex items-center gap-2">
                    <span className="truncate">{String(field.value ?? "")}</span>
                    <button
                      onClick={(e) => handleStartEdit(e, key, field.value)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-primary transition-all rounded"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {field.confidence !== undefined && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      confidenceColor(field.confidence)
                    )}
                  >
                    {Math.round(field.confidence * 100)}%
                  </span>
                )}
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  p.{field.page}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
