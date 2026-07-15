"use client";

import { useEffect, useState } from "react";
import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function BackendHealthCard() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch(`${API_URL}/health`);

        if (!response.ok) {
          setStatus("offline");
          return;
        }

        setStatus("online");
      } catch {
        setStatus("offline");
      }
    }

    checkHealth();
  }, []);

  const config = {
    checking: {
      label: "Checking backend...",
      icon: Activity,
      className: "border-slate-200 bg-white text-slate-700",
    },
    online: {
      label: "Backend online",
      icon: CheckCircle2,
      className: "border-green-200 bg-green-50 text-green-800",
    },
    offline: {
      label: "Backend offline",
      icon: AlertCircle,
      className: "border-red-200 bg-red-50 text-red-800",
    },
  }[status];

  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${config.className}`}
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </div>
  );
}