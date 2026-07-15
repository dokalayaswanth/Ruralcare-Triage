import Link from "next/link";
import { Clock, UserRound } from "lucide-react";

import { PatientRecord } from "@/types";
import { UrgencyBadge } from "@/components/triage/UrgencyBadge";

export function CaseCard({ record }: { record: PatientRecord }) {
  return (
    <Link
      href={`/specialist/case/${record.id}`}
      className="block rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-3">
            <UrgencyBadge tier={record.urgency_tier} />
          </div>

          <h2 className="text-lg font-bold text-slate-950">
            {record.patient_name}
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            {record.patient_age} years · {record.patient_gender}
          </p>

          <p className="mt-3 text-sm font-medium text-slate-900">
            {record.chief_complaint}
          </p>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {record.ai_reasoning}
          </p>
        </div>

        <div className="min-w-36 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <UserRound className="h-4 w-4" />
            Status
          </div>

          <p className="mt-1 font-semibold text-slate-900">
            {record.status}
          </p>

          <div className="mt-4 flex items-center gap-2 text-slate-500">
            <Clock className="h-4 w-4" />
            Score
          </div>

          <p className="mt-1 font-semibold text-slate-900">
            {record.urgency_score}/100
          </p>
        </div>
      </div>
    </Link>
  );
}