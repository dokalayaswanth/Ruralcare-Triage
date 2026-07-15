import { PatientQueue } from "@/components/specialist/PatientQueue";

export default function SpecialistDashboardPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Specialist Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          RuralCare Triage Queue
        </h1>

        <p className="mt-2 max-w-2xl text-slate-600">
          Review AI-triaged patient records, prioritize urgent cases, and open
          case details for override or resolution.
        </p>
      </div>

      <PatientQueue />
    </section>
  );
}