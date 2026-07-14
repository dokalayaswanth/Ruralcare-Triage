import { UrgencyTier } from "@/types";

const tierConfig = {
  EMERGENCY: {
    label: "Emergency",
    className: "bg-red-100 text-red-800 border border-red-300",
    pulse: true,
    icon: "🔴",
  },
  URGENT: {
    label: "Urgent",
    className: "bg-amber-100 text-amber-800 border border-amber-300",
    pulse: false,
    icon: "🟡",
  },
  ROUTINE: {
    label: "Routine",
    className: "bg-green-100 text-green-800 border border-green-300",
    pulse: false,
    icon: "🟢",
  },
};

export function UrgencyBadge({
  tier,
  size = "md",
}: {
  tier: UrgencyTier;
  size?: "sm" | "md" | "lg";
}) {
  const config = tierConfig[tier];

  const sizeClass = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${config.className} ${sizeClass} ${
        config.pulse ? "animate-pulse" : ""
      }`}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}