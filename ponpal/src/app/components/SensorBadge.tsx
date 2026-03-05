import React from "react";
import { SensorStatus } from "../data/mockData";

interface SensorBadgeProps {
  label: string;
  value: string | number;
  unit: string;
  status: SensorStatus;
  icon: React.ReactNode;
}

const statusColors: Record<SensorStatus, { bg: string; text: string; border: string; dot: string }> = {
  normal: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  warning: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
  },
  critical: {
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-500",
  },
};

export function SensorBadge({ label, value, unit, status, icon }: SensorBadgeProps) {
  const colors = statusColors[status];
  return (
    <div className={`rounded-2xl border p-3 ${colors.bg} ${colors.border} flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="text-aq-text-muted text-[10px] uppercase tracking-wider">{label}</span>
        <span className={`w-2 h-2 rounded-full ${colors.dot} ${status !== "normal" ? "animate-pulse" : ""}`} />
      </div>
      <div className={`flex items-end gap-1 ${colors.text}`}>
        <span className="text-[18px] font-bold leading-none">{value}</span>
        <span className="text-[10px] pb-0.5 text-aq-text-muted">{unit}</span>
      </div>
      <div className={`${colors.text} opacity-70`}>{icon}</div>
    </div>
  );
}
