import { AlertTriangle } from "lucide-react";

export function SafetyBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-6xl gap-3 px-4 py-3 text-sm text-amber-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          RuralCare Triage is a clinical decision-support demo. It does not
          provide diagnosis or emergency care. All AI recommendations require
          review by a licensed clinician.
        </p>
      </div>
    </div>
  );
}