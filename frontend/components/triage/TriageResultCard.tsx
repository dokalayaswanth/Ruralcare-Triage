import Link from "next/link";
import { CalendarClock, ClipboardList, UserRound } from "lucide-react";

import { PatientRecord } from "@/types";
import { UrgencyBadge } from "@/components/triage/UrgencyBadge";
import { ConfidenceMeter } from "@/components/triage/ConfidenceMeter";
import { EvidencePanel } from "@/components/triage/EvidencePanel";

export function TriageResultCard({ record }: { record: PatientRecord }) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3">
              <UrgencyBadge tier={record.urgency_tier} size="lg" />
            </div>

            <h1 className="text-3xl font-bold text-slate-950">
              Triage Result
            </h1>

            <p className="mt-2 text-slate-600">
              AI-assisted recommendation for clinician review.
            </p>
          </div>

          <ScoreCircle score={record.urgency_score} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoTile
            icon={<UserRound className="h-4 w-4" />}
            label="Patient"
            value={`${record.patient_name}, ${record.patient_age}, ${record.patient_gender}`}
          />

          <InfoTile
            icon={<ClipboardList className="h-4 w-4" />}
            label="Chief Complaint"
            value={record.chief_complaint}
          />

          <InfoTile
            icon={<CalendarClock className="h-4 w-4" />}
            label="Status"
            value={record.status}
          />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            AI Reasoning
          </h2>

          <p className="mt-3 leading-7 text-slate-700">
            {record.ai_reasoning}
          </p>

          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-950">
              Recommended Action
            </h3>
            <p className="mt-2 text-sm leading-6 text-blue-900">
              {record.recommended_action}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Confidence
          </h2>

          <div className="mt-3">
            <ConfidenceMeter confidence={record.confidence_level} />
          </div>

          <div className="mt-6 border-t pt-5">
            <h3 className="font-semibold text-slate-950">Symptoms</h3>

            <div className="mt-3 space-y-2">
              {record.symptoms.map((symptom, index) => (
                <div
                  key={`${symptom.symptom}-${index}`}
                  className="rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  <strong>{symptom.symptom}</strong> — {symptom.severity},{" "}
                  {symptom.duration}, {symptom.onset}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <VitalsAndHistory record={record} />

      <EvidencePanel evidence={record.retrieved_evidence} />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/intake"
          className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Submit Another Intake
        </Link>

        <Link
          href="/specialist"
          className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          Open Specialist Dashboard
        </Link>
      </div>
    </div>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
        />
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="#2563eb"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 55 55)"
        />
        <text
          x="55"
          y="51"
          textAnchor="middle"
          className="fill-slate-950 text-xl font-bold"
        >
          {score}
        </text>
        <text
          x="55"
          y="70"
          textAnchor="middle"
          className="fill-slate-500 text-xs"
        >
          /100
        </text>
      </svg>

      <div>
        <p className="text-sm font-medium text-slate-500">Urgency Score</p>
        <p className="text-sm text-slate-700">
          Higher score means more urgent review priority.
        </p>
      </div>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
        {icon}
        {label}
      </div>
      <p className="font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function VitalsAndHistory({ record }: { record: PatientRecord }) {
  const vitals = record.vitals;

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Vitals</h2>

        <dl className="mt-4 grid gap-3 text-sm">
          <DetailRow
            label="Blood Pressure"
            value={
              vitals?.blood_pressure_systolic
                ? `${vitals.blood_pressure_systolic}/${
                    vitals.blood_pressure_diastolic || "?"
                  } mmHg`
                : "Not recorded"
            }
          />
          <DetailRow
            label="Heart Rate"
            value={
              vitals?.heart_rate ? `${vitals.heart_rate} bpm` : "Not recorded"
            }
          />
          <DetailRow
            label="Temperature"
            value={
              vitals?.temperature_f
                ? `${vitals.temperature_f} °F`
                : "Not recorded"
            }
          />
          <DetailRow
            label="Oxygen Saturation"
            value={
              vitals?.oxygen_saturation
                ? `${vitals.oxygen_saturation}%`
                : "Not recorded"
            }
          />
        </dl>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">History</h2>

        <dl className="mt-4 grid gap-3 text-sm">
          <DetailRow
            label="Medical History"
            value={record.medical_history || "None reported"}
          />
          <DetailRow
            label="Current Medications"
            value={record.current_medications || "None reported"}
          />
          <DetailRow
            label="Allergies"
            value={record.allergies || "None reported"}
          />
        </dl>
      </div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 px-3 py-2">
      <dt className="text-xs font-medium uppercase text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-slate-800">{value}</dd>
    </div>
  );
}