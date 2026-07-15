"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";

import { PatientRecord } from "@/types";
import { resolveRecord } from "@/lib/api";
import { TriageResultCard } from "@/components/triage/TriageResultCard";
import { OverrideModal } from "@/components/specialist/OverrideModal";
import { AuditLogPanel } from "@/components/specialist/AuditLogPanel";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function SpecialistCaseDetail({
  initialRecord,
}: {
  initialRecord: PatientRecord;
}) {
  const [record, setRecord] = useState(initialRecord);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [actionError, setActionError] = useState("");

  async function handleResolve() {
    try {
      setIsResolving(true);
      setActionError("");

      const response = await resolveRecord(record.id);
      setRecord(response.record);
    } catch (resolveError) {
      const message =
        resolveError instanceof Error
          ? resolveError.message
          : "Failed to resolve record.";

      setActionError(message);
    } finally {
      setIsResolving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/specialist"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <h1 className="text-2xl font-bold text-slate-950">
            Specialist Case Review
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review the AI triage output, override if needed, and resolve the case.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setOverrideOpen(true)}
            disabled={record.status === "RESOLVED"}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw className="h-4 w-4" />
            Override
          </button>

          <button
            type="button"
            onClick={handleResolve}
            disabled={isResolving || record.status === "RESOLVED"}
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isResolving ? (
              <LoadingSpinner label="Resolving..." />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Mark Resolved
              </>
            )}
          </button>
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {actionError}
        </div>
      )}

      {record.status === "OVERRIDDEN" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-950">
            Clinician Override Applied
          </h2>
          <p className="mt-2 text-sm text-amber-900">
            Override tier:{" "}
            <span className="font-semibold">{record.override_tier}</span>
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            Reason: {record.override_reason}
          </p>
        </div>
      )}

      {record.status === "RESOLVED" && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <h2 className="font-semibold text-green-950">
            Case Resolved
          </h2>
          <p className="mt-1 text-sm text-green-900">
            This record has been marked as resolved.
          </p>
        </div>
      )}

      <TriageResultCard record={record} />

      <AuditLogPanel recordId={record.id} />

      <OverrideModal
        record={record}
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        onUpdated={(updatedRecord) => setRecord(updatedRecord)}
      />
    </div>
  );
}