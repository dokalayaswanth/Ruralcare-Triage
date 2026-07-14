import { SymptomForm } from "@/components/intake/SymptomForm";

export default function IntakePage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Patient Intake
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Submit a new triage record
        </h1>

        <p className="mt-2 max-w-2xl text-slate-600">
          Enter patient symptoms and available clinical context. The backend
          will retrieve relevant guidance and generate an AI-assisted triage
          recommendation for clinician review.
        </p>
      </div>

      <SymptomForm />
    </section>
  );
}