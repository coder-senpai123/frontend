import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = [
  "Uploading PDF...",
  "Parsing document...",
  "Extracting fields...",
  "Mapping sources...",
];

export default function ParsingStatus() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <div className="flex flex-col gap-2">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className="flex items-center gap-2 text-sm transition-opacity duration-300"
            style={{ opacity: i <= currentStep ? 1 : 0.3 }}
          >
            {i < currentStep ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : i === currentStep ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-border" />
            )}
            <span className={i <= currentStep ? "text-foreground" : "text-muted-foreground"}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
