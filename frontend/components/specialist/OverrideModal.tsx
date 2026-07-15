"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";

import { overrideRecord } from "@/lib/api";
import { PatientRecord, UrgencyTier } from "@/types";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function OverrideModal({
  record,
  open,
  onClose,
  onUpdated,
}: {
  record: PatientRecord;
  open: boolean;
  onClose: () => void;
  onUpdated: (updatedRecord: PatientRecord) => void;
}) {
  const [overrideTier, setOverrideTier] = useState<UrgencyTier>(
    record.override_tier || record.urgency_tier
  );
  const [overrideReason, setOverrideReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!overrideReason.trim()) {
      setError("Override reason is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const response = await overrideRecord(record.id, {
        override_tier: overrideTier,
        override_reason: overrideReason.trim(),
      });

      onUpdated(response.record);
      onClose();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to override record.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Override AI Triage
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Document the clinician decision for this record.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="rounded-xl border bg-slate-50 p-4 text-sm text-black">
            <p className="text-slate-500">Current AI tier</p>
            <p className="mt-1 font-semibold text-slate-950">
              {record.urgency_tier} — {record.urgency_score}/100
            </p>
          </div>

          <label className="block text-black">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Override Tier
            </span>
            <select
              value={overrideTier}
              onChange={(event) =>
                setOverrideTier(event.target.value as UrgencyTier)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-200 focus:border-blue-600 focus:ring-2"
            >
              <option value="ROUTINE">ROUTINE</option>
              <option value="URGENT">URGENT</option>
              <option value="EMERGENCY">EMERGENCY</option>
            </select>
          </label>

          <label className="block text-black">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Override Reason
            </span>
            <textarea
              value={overrideReason}
              onChange={(event) => setOverrideReason(event.target.value)}
              rows={4}
              placeholder="Explain why the clinician changed the AI triage recommendation..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2"
            />
          </label>

          <div className="flex items-center justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-70"
            >
              {isSubmitting ? (
                <LoadingSpinner label="Saving override..." />
              ) : (
                "Save Override"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}