"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  CheckCircle2,
  ClipboardCheck,
  FileClock,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

import { getAuditLog } from "@/lib/api";
import { AuditLogEntry } from "@/types";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { UrgencyBadge } from "@/components/triage/UrgencyBadge";

export function AuditLogPanel({ recordId }: { recordId: string }) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAuditLog() {
    try {
      setIsLoading(true);
      setError("");

      const response = await getAuditLog(recordId);
      setLogs(response.audit_log);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load audit log.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAuditLog();
  }, [recordId]);

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
            <FileClock className="h-5 w-5 text-blue-700" />
            Audit Log
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Full history of AI and clinician actions.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAuditLog}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {isLoading && <LoadingSpinner label="Loading audit history..." />}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!isLoading && !error && logs.length === 0 && (
        <div className="rounded-xl border bg-slate-50 p-5 text-sm text-slate-500">
          No audit entries found.
        </div>
      )}

      {!isLoading && !error && logs.length > 0 && (
        <div className="space-y-4">
          {logs.map((log) => (
            <AuditLogCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </section>
  );
}

function AuditLogCard({ log }: { log: AuditLogEntry }) {
  const [showRaw, setShowRaw] = useState(false);

  const details = log.details as Record<string, any>;

  const actionConfig = getActionConfig(log.action);

  const llmResult = details?.llm_result;
  const notificationResult = details?.notification_result;

  return (
    <article className="rounded-xl border bg-slate-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className={`rounded-lg p-2 ${actionConfig.iconClass}`}>
            {actionConfig.icon}
          </div>

          <div>
            <h3 className="font-semibold text-slate-950">
              {actionConfig.label}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {new Date(log.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          {log.action}
        </span>
      </div>

      <div className="mt-4">
        {log.action === "AI_TRIAGE" && llmResult && (
          <AITriageSummary details={details} llmResult={llmResult} />
        )}

        {log.action === "OVERRIDE" && (
          <OverrideSummary details={details} />
        )}

        {log.action === "RESOLVE" && (
          <ResolveSummary details={details} />
        )}

        {log.action === "CLINICIAN_REVIEW" && (
          <ClinicianReviewSummary notificationResult={notificationResult} />
        )}
      </div>

      {/* <div className="mt-4 border-t pt-4">
        <button
          type="button"
          onClick={() => setShowRaw((previous) => !previous)}
          className="text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          {showRaw ? "Hide raw details" : "View raw details"}
        </button>

        {showRaw && (
          <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">
            {JSON.stringify(log.details, null, 2)}
          </pre>
        )}
      </div> */}
    </article>
  );
}

function AITriageSummary({
  details,
  llmResult,
}: {
  details: Record<string, any>;
  llmResult: Record<string, any>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {llmResult.urgency_tier && (
          <UrgencyBadge tier={llmResult.urgency_tier} />
        )}

        <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-700">
          Score: {llmResult.urgency_score ?? "-"} / 100
        </span>

        <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-700">
          Confidence: {llmResult.confidence_level ?? "-"}
        </span>
      </div>

      <SummaryGrid
        items={[
          ["Model", details.llm_model || "Not recorded"],
          ["Pipeline", details.pipeline_stage || "Not recorded"],
          ["Retrieved Chunks", String(details.retrieved_chunks_count ?? "-")],
        ]}
      />

      {llmResult.ai_reasoning && (
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            AI Reasoning
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {llmResult.ai_reasoning}
          </p>
        </div>
      )}

      {llmResult.recommended_action && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase text-blue-700">
            Recommended Action
          </p>
          <p className="mt-2 text-sm leading-6 text-blue-900">
            {llmResult.recommended_action}
          </p>
        </div>
      )}
    </div>
  );
}

function OverrideSummary({ details }: { details: Record<string, any> }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="text-xs font-semibold uppercase text-amber-700">
        Clinician Override
      </p>

      <p className="mt-2 text-sm text-amber-900">
        Override tier:{" "}
        <span className="font-semibold">
          {details.override_tier || "Not recorded"}
        </span>
      </p>

      <p className="mt-2 text-sm leading-6 text-amber-900">
        Reason: {details.override_reason || "No reason recorded."}
      </p>
    </div>
  );
}

function ResolveSummary({ details }: { details: Record<string, any> }) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
      <p className="text-xs font-semibold uppercase text-green-700">
        Case Resolved
      </p>

      <p className="mt-2 text-sm text-green-900">
        This record was marked as resolved.
      </p>

      {details.timestamp && (
        <p className="mt-1 text-xs text-green-800">
          Timestamp: {details.timestamp}
        </p>
      )}
    </div>
  );
}

function ClinicianReviewSummary({
  notificationResult,
}: {
  notificationResult?: Record<string, any>;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">
        Clinician Review Event
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-700">
        A clinician review action was recorded.
      </p>

      {notificationResult && (
        <p className="mt-2 text-sm text-slate-700">
          Notification sent:{" "}
          <span className="font-semibold">
            {notificationResult.sent ? "Yes" : "No"}
          </span>
        </p>
      )}
    </div>
  );
}

function SummaryGrid({ items }: { items: string[][] }) {
  return (
    <dl className="grid gap-3 md:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border bg-white p-3">
          <dt className="text-xs font-semibold uppercase text-slate-500">
            {label}
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-800">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function getActionConfig(action: AuditLogEntry["action"]) {
  if (action === "AI_TRIAGE") {
    return {
      label: "AI Triage Completed",
      icon: <Brain className="h-5 w-5" />,
      iconClass: "bg-blue-100 text-blue-700",
    };
  }

  if (action === "OVERRIDE") {
    return {
      label: "Clinician Override",
      icon: <RotateCcw className="h-5 w-5" />,
      iconClass: "bg-amber-100 text-amber-700",
    };
  }

  if (action === "RESOLVE") {
    return {
      label: "Case Resolved",
      icon: <CheckCircle2 className="h-5 w-5" />,
      iconClass: "bg-green-100 text-green-700",
    };
  }

  return {
    label: "Clinician Review",
    icon: <ClipboardCheck className="h-5 w-5" />,
    iconClass: "bg-slate-200 text-slate-700",
  };
}