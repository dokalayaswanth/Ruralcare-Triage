"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { EvidenceChunk } from "@/types";

export function EvidencePanel({ evidence }: { evidence: EvidenceChunk[] }) {
  const [open, setOpen] = useState(false);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-5 text-sm text-slate-500">
        No retrieved evidence available.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <h2 className="font-semibold text-slate-950">
            Retrieved Clinical Evidence
          </h2>
          <p className="text-sm text-slate-500">
            {evidence.length} guideline chunk
            {evidence.length > 1 ? "s" : ""} used by the AI pipeline.
          </p>
        </div>

        {open ? (
          <ChevronDown className="h-5 w-5 text-slate-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="space-y-4 border-t px-5 py-4">
          {evidence.map((item, index) => (
            <article
              key={`${item.source}-${index}`}
              className="rounded-lg border bg-slate-50 p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900">
                  {item.source}
                </h3>

                <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600">
                  Relevance: {Number(item.relevance_score).toFixed(3)}
                </span>
              </div>

              <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                {item.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}