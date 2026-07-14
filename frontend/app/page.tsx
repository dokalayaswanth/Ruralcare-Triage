import Link from "next/link";
import { Activity, ClipboardList, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700">
            AI-powered rural healthcare triage
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Faster symptom intake and smarter specialist review.
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            RuralCare Triage collects patient symptoms, retrieves relevant
            clinical guidance, and generates a structured urgency
            recommendation for clinician review.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/intake"
              className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
            >
              Start Patient Intake
            </Link>

            <Link
              href="/specialist"
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Open Specialist Dashboard
            </Link>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Educational portfolio project only. Not a replacement for licensed
            clinical judgment or emergency care.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="grid gap-4">
            <FeatureCard
              icon={<ClipboardList className="h-5 w-5" />}
              title="Structured intake"
              description="Collect symptoms, severity, onset, duration, vitals, and history."
            />

            <FeatureCard
              icon={<Activity className="h-5 w-5" />}
              title="AI triage"
              description="RAG + Groq LLM generates urgency tier, reasoning, confidence, and next steps."
            />

            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Clinician oversight"
              description="Specialists can review, override, resolve, and inspect audit logs."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
        {icon}
      </div>
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}