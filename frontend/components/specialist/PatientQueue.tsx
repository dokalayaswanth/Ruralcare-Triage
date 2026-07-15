"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Wifi } from "lucide-react";

import { getRecords } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { PatientRecord, UrgencyTier } from "@/types";
import { CaseCard } from "@/components/specialist/CaseCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {getCurrentSession} from "@/lib/auth";

type FilterValue = "ALL" | UrgencyTier;
type StatusFilterValue = "ALL" | "PENDING" | "OVERRIDDEN" | "RESOLVED";

function sortRecords(records: PatientRecord[]) {
  return [...records].sort((a, b) => {
    if (b.urgency_score !== a.urgency_score) {
      return b.urgency_score - a.urgency_score;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function PatientQueue() {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [tierFilter, setTierFilter] = useState<FilterValue>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  async function loadRecords(showMainLoader = false) {
    try {
      if (showMainLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setError("");

      const response = await getRecords();
      setRecords(sortRecords(response.records));
      setLastUpdated(new Date());
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load records.";

      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

useEffect(() => {
  let channel: ReturnType<typeof supabase.channel> | null = null;
  let isMounted = true;

  async function setupRealtime() {
    await loadRecords(true);

    const session = await getCurrentSession();

    if (!session?.access_token) {
      console.log("No Supabase session found for realtime.");
      setRealtimeStatus("disconnected");
      return;
    }

    if (!isMounted) {
      return;
    }

    channel = supabase
      .channel(`records_realtime_${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "records",
        },
        async (payload) => {
          console.log("Realtime payload received:", payload);
          await loadRecords(false);
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);

        if (status === "SUBSCRIBED") {
          setRealtimeStatus("connected");
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setRealtimeStatus("disconnected");
        } else {
          setRealtimeStatus("connecting");
        }
      });
  }

  setupRealtime();

  return () => {
    isMounted = false;

    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const tierMatches =
        tierFilter === "ALL" || record.urgency_tier === tierFilter;

      const statusMatches =
        statusFilter === "ALL" || record.status === statusFilter;

      return tierMatches && statusMatches;
    });
  }, [records, tierFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: records.length,
      emergency: records.filter((record) => record.urgency_tier === "EMERGENCY")
        .length,
      urgent: records.filter((record) => record.urgency_tier === "URGENT").length,
      routine: records.filter((record) => record.urgency_tier === "ROUTINE")
        .length,
      pending: records.filter((record) => record.status === "PENDING").length,
      overridden: records.filter((record) => record.status === "OVERRIDDEN")
        .length,
      resolved: records.filter((record) => record.status === "RESOLVED").length,
    };
  }, [records]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <LoadingSpinner label="Loading specialist queue..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-950">
          Could not load specialist queue
        </h2>
        <p className="mt-2 text-sm text-red-800">{error}</p>

        <button
          type="button"
          onClick={() => loadRecords(true)}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsBar stats={stats} />

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">Patient Queue</h2>

            <p className="text-sm text-slate-500">
              Sorted by urgency score, highest first. Updates live using
              Supabase Realtime.
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
              <RealtimeBadge status={realtimeStatus} />

              {lastUpdated && (
                <span className="text-slate-400">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadRecords(false)}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <div className="mt-5 space-y-4 border-t pt-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Filter by urgency
            </p>

            <div className="flex flex-wrap gap-2">
              <FilterButton
                label="All"
                active={tierFilter === "ALL"}
                onClick={() => setTierFilter("ALL")}
              />
              <FilterButton
                label="Emergency"
                active={tierFilter === "EMERGENCY"}
                onClick={() => setTierFilter("EMERGENCY")}
              />
              <FilterButton
                label="Urgent"
                active={tierFilter === "URGENT"}
                onClick={() => setTierFilter("URGENT")}
              />
              <FilterButton
                label="Routine"
                active={tierFilter === "ROUTINE"}
                onClick={() => setTierFilter("ROUTINE")}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Filter by status
            </p>

            <div className="flex flex-wrap gap-2">
              <FilterButton
                label="All"
                active={statusFilter === "ALL"}
                onClick={() => setStatusFilter("ALL")}
              />
              <FilterButton
                label="Pending"
                active={statusFilter === "PENDING"}
                onClick={() => setStatusFilter("PENDING")}
              />
              <FilterButton
                label="Overridden"
                active={statusFilter === "OVERRIDDEN"}
                onClick={() => setStatusFilter("OVERRIDDEN")}
              />
              <FilterButton
                label="Resolved"
                active={statusFilter === "RESOLVED"}
                onClick={() => setStatusFilter("RESOLVED")}
              />
            </div>
          </div>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
          No records found for the selected filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <CaseCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}

function RealtimeBadge({
  status,
}: {
  status: "connecting" | "connected" | "disconnected";
}) {
  const config = {
    connecting: "border-amber-200 bg-amber-50 text-amber-800",
    connected: "border-green-200 bg-green-50 text-green-800",
    disconnected: "border-red-200 bg-red-50 text-red-800",
  }[status];

  const label = {
    connecting: "Realtime connecting",
    connected: "Realtime connected",
    disconnected: "Realtime disconnected",
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold ${config}`}
    >
      <Wifi className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function StatsBar({
  stats,
}: {
  stats: {
    total: number;
    emergency: number;
    urgent: number;
    routine: number;
    pending: number;
    overridden: number;
    resolved: number;
  };
}) {
  return (
    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
      <StatCard label="Total" value={stats.total} />
      <StatCard label="Pending" value={stats.pending} />
      <StatCard label="Emergency" value={stats.emergency} tone="red" />
      <StatCard label="Urgent" value={stats.urgent} tone="amber" />
      <StatCard label="Routine" value={stats.routine} tone="green" />
      <StatCard label="Overridden" value={stats.overridden} tone="amber" />
      <StatCard label="Resolved" value={stats.resolved} tone="green" />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "slate" | "red" | "amber" | "green";
}) {
  const toneClass = {
    slate: "bg-white text-slate-950",
    red: "bg-red-50 text-red-900 border-red-200",
    amber: "bg-amber-50 text-amber-900 border-amber-200",
    green: "bg-green-50 text-green-900 border-green-200",
  }[tone];

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClass}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white"
          : "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
      }
    >
      {label}
    </button>
  );
}