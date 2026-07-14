"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getRecord } from "@/lib/api";
import { PatientRecord } from "@/types";
import { TriageResultCard } from "@/components/triage/TriageResultCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function TriageResultPage() {
  const params = useParams();

  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecord() {
      try {
        setIsLoading(true);
        setError("");

        const idParam = params?.id;

        if (!idParam) {
          setError("Record ID is missing from the URL.");
          return;
        }

        const recordId = Array.isArray(idParam) ? idParam[0] : idParam;

        if (!recordId) {
          setError("Invalid record ID.");
          return;
        }

        const data = await getRecord(recordId);
        setRecord(data);
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unable to load triage result.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecord();
  }, [params]);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <LoadingSpinner label="Loading triage result..." />
        </div>
      </section>
    );
  }

  if (error || !record) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-2xl font-bold text-red-950">
            Could not load triage result
          </h1>

          <p className="mt-3 text-sm leading-6 text-red-800">
            {error || "Record was not found."}
          </p>

          <Link
            href="/intake"
            className="mt-5 inline-flex rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            Back to Intake
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <TriageResultCard record={record} />
    </section>
  );
}