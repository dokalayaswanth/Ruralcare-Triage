import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { ConfidenceLevel } from "@/types";

const confidenceConfig = {
  LOW: {
    label: "Low Confidence",
    icon: AlertTriangle,
    className: "border-orange-200 bg-orange-50 text-orange-800",
  },
  MEDIUM: {
    label: "Medium Confidence",
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-800",
  },
  HIGH: {
    label: "High Confidence",
    icon: CheckCircle2,
    className: "border-green-200 bg-green-50 text-green-800",
  },
};

export function ConfidenceMeter({
  confidence,
}: {
  confidence: ConfidenceLevel;
}) {
  const config = confidenceConfig[confidence];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${config.className}`}
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </div>
  );
}