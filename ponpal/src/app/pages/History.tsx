import React, { useState } from "react";
import { Clock, Droplets, Thermometer, Wind, Eye, CloudRain, Power, Fish, Waves, ChevronDown, ChevronUp } from "lucide-react";
import { historyData, devices, getSensorStatus } from "../data/mockData";
import { useAppContext } from "../context/AppContext";

export function History() {
  const { thresholds } = useAppContext();
  const [selectedDevice, setSelectedDevice] = useState<string>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const deviceOptions = [
    { id: "all", name: "All Devices" },
    ...devices.map((d) => ({ id: d.id, name: d.name })),
  ];

  const filtered = historyData
    .filter((h) => selectedDevice === "all" || h.deviceId === selectedDevice)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  function formatDateTime(ts: string) {
    return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const sensorDefs = [
    { key: "ph" as const, label: "pH Level", unit: "", icon: <Droplets size={14} /> },
    { key: "temperature" as const, label: "Temperature", unit: "°C", icon: <Thermometer size={14} /> },
    { key: "dissolvedOxygen" as const, label: "Dissolved Oxygen", unit: "mg/L", icon: <Wind size={14} /> },
    { key: "turbidity" as const, label: "Turbidity", unit: "NTU", icon: <Eye size={14} /> },
    { key: "humidity" as const, label: "Humidity", unit: "%", icon: <CloudRain size={14} /> },
  ];

  const deviceInfo = (id: string) => devices.find((d) => d.id === id);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-aq-bg">
      {/* Header */}
      <div className="px-4 md:px-6 pt-4 pb-4 flex-shrink-0">
        <h1 className="text-aq-text">History</h1>
        <p className="text-aq-text-secondary text-sm">Sensor reading logs</p>

        <div className="mt-3 relative">
          <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full bg-aq-surface border border-aq-border text-aq-text text-sm rounded-xl px-4 py-2.5 appearance-none outline-none max-w-sm focus:border-cyan-500/60">
            {deviceOptions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-aq-text-secondary pointer-events-none" />
        </div>

        {/* Stats bar */}
        <div className="flex gap-2 mt-3">
          {[
            { value: filtered.length, label: "Records", color: "text-cyan-500" },
            {
              value: filtered.filter((h) => sensorDefs.some((s) => getSensorStatus(s.key, h.readings[s.key], thresholds) !== "normal")).length,
              label: "Alerts", color: "text-amber-500",
            },
            { value: filtered.filter((h) => h.deviceOn).length, label: "Device ON", color: "text-emerald-500" },
          ].map((s) => (
            <div key={s.label} className="flex-1 bg-aq-surface rounded-xl p-2.5 border border-aq-border text-center">
              <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
              <p className="text-aq-text-muted text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4" style={{ scrollbarWidth: "none" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-2">
            {filtered.map((entry) => {
              const dev = deviceInfo(entry.deviceId);
              const hasAlert = sensorDefs.some((s) => getSensorStatus(s.key, entry.readings[s.key], thresholds) !== "normal");
              const isExpanded = expandedIds.has(entry.id);
              return (
                <div key={entry.id} className="bg-aq-surface rounded-2xl border border-aq-border overflow-hidden transition-all">
                  {/* Header - always visible */}
                  <button
                    onClick={() => toggleExpand(entry.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-aq-overlay transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dev?.type === "pond" ? "bg-blue-500/15" : "bg-purple-500/15"}`}>
                        {dev?.type === "pond"
                          ? <Waves size={18} className="text-blue-500" />
                          : <Fish size={18} className="text-purple-500" />}
                      </div>
                      <div className="text-left">
                        <p className="text-aq-text text-sm font-medium">{entry.deviceName}</p>
                        <div className="flex items-center gap-1.5 text-aq-text-muted text-[11px] mt-0.5">
                          <Clock size={10} />{formatDateTime(entry.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasAlert && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                      <div className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${entry.deviceOn ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "bg-aq-overlay text-aq-text-muted"}`}>
                        <Power size={10} />{entry.deviceOn ? "ON" : "OFF"}
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-aq-text-secondary" /> : <ChevronDown size={16} className="text-aq-text-secondary" />}
                    </div>
                  </button>

                  {/* Expandable details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-aq-border-subtle">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        {sensorDefs.map((s) => {
                          const st = getSensorStatus(s.key, entry.readings[s.key], thresholds);
                          const statusColor = st === "critical" ? "text-red-600 dark:text-red-400" : st === "warning" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
                          const bgColor = st === "critical" ? "bg-red-500/10" : st === "warning" ? "bg-amber-500/10" : "bg-aq-overlay";
                          return (
                            <div key={s.key} className={`rounded-xl p-3 ${bgColor} border border-aq-border-subtle`}>
                              <div className="flex items-center gap-2 mb-2">
                                {s.icon}
                                <span className="text-aq-text text-xs font-medium">{s.label}</span>
                              </div>
                              <p className={`text-lg font-bold ${statusColor}`}>
                                {s.key === "ph" ? entry.readings.ph.toFixed(1)
                                  : s.key === "temperature" ? entry.readings.temperature.toFixed(1)
                                  : s.key === "dissolvedOxygen" ? entry.readings.dissolvedOxygen.toFixed(1)
                                  : s.key === "turbidity" ? entry.readings.turbidity.toFixed(1)
                                  : entry.readings.humidity.toFixed(0)}
                                <span className="text-sm ml-1">{s.unit}</span>
                              </p>
                              <p className="text-aq-text-muted text-[10px] mt-1">
                                Status: {st === "critical" ? "Critical" : st === "warning" ? "Warning" : "Normal"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
