import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Droplets, Thermometer, Wind, Eye, CloudRain, Power,
  ArrowLeft, Pencil, Trash2, Fish, Waves, Wifi, WifiOff, X,
  Check, MapPin, Tag, Hash, TrendingUp, TrendingDown, Minus, Settings,
} from "lucide-react";
import { getSensorStatus, Device, getDeviceThresholds, Threshold, SensorHistory } from "../data/mockData";
import { SensorBadge } from "../components/SensorBadge";
import { useAppContext } from "../context/AppContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface FormState { name: string; type: "aquarium" | "pond"; location: string; deviceId: string; }

export function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { devices, setDevices, thresholds: globalThresholds } = useAppContext();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [thresholdOpen, setThresholdOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", type: "aquarium", location: "", deviceId: "" });

  const device = devices.find((d) => d.id === id);
  const [history, setHistory] = useState<SensorHistory[]>([]);
  const [previousReadings, setPreviousReadings] = useState<any>(null);

  // Generate initial 24 hour history
  useEffect(() => {
    if (!device) return;
    const now = Date.now();
    const initialHistory: SensorHistory[] = [];
    for (let i = 288; i >= 0; i--) { // 5-min intervals for 24h
      const timestamp = new Date(now - i * 5 * 60 * 1000).toISOString();
      const r = device.readings;
      initialHistory.push({
        timestamp,
        ph: Number((r.ph + (Math.random() - 0.5) * 0.8).toFixed(2)),
        temperature: Number((r.temperature + (Math.random() - 0.5) * 2).toFixed(2)),
        dissolvedOxygen: Number((r.dissolvedOxygen + (Math.random() - 0.5) * 1.5).toFixed(2)),
        turbidity: Number((r.turbidity + (Math.random() - 0.5) * 3).toFixed(2)),
        humidity: Number((r.humidity + (Math.random() - 0.5) * 8).toFixed(0)),
      });
    }
    setHistory(initialHistory);
    setPreviousReadings(device.readings);
  }, [device?.id]);

  // Live updates every 5 seconds
  useEffect(() => {
    if (!device) return;
    const interval = setInterval(() => {
      setPreviousReadings(device.readings);
      setDevices((prev) => prev.map((d) => {
        if (d.id === device.id && d.isOnline && d.deviceOn) {
          return {
            ...d,
            readings: {
              ph: Number(Math.max(5, Math.min(10, d.readings.ph + (Math.random() - 0.5) * 0.2)).toFixed(2)),
              temperature: Number(Math.max(18, Math.min(35, d.readings.temperature + (Math.random() - 0.5) * 0.5)).toFixed(2)),
              dissolvedOxygen: Number(Math.max(3, Math.min(12, d.readings.dissolvedOxygen + (Math.random() - 0.5) * 0.3)).toFixed(2)),
              turbidity: Number(Math.max(0, Math.min(50, d.readings.turbidity + (Math.random() - 0.5) * 1)).toFixed(2)),
              humidity: Math.round(Math.max(30, Math.min(95, d.readings.humidity + (Math.random() - 0.5) * 2))),
            },
            lastUpdated: "Just now",
          };
        }
        return d;
      }));
      
      // Add to history only if device is on
      if (device.deviceOn) {
        setHistory((prev) => {
          const newEntry: SensorHistory = {
            timestamp: new Date().toISOString(),
            ph: Number(device.readings.ph.toFixed(2)),
            temperature: Number(device.readings.temperature.toFixed(2)),
            dissolvedOxygen: Number(device.readings.dissolvedOxygen.toFixed(2)),
            turbidity: Number(device.readings.turbidity.toFixed(2)),
            humidity: Math.round(device.readings.humidity),
          };
          return [...prev.slice(-287), newEntry]; // Keep last 24 hours
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [device?.id, device?.isOnline, device?.deviceOn]);

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-aq-bg">
        <p className="text-aq-text-secondary">Device not found.</p>
        <button onClick={() => navigate("/dashboard")} className="text-cyan-500 text-sm flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    );
  }

  const thresholds = getDeviceThresholds(device, globalThresholds);
  const r = device.readings;
  const sensors = [
    { key: "ph" as const,              label: "pH Level",     value: r.ph.toFixed(1),              unit: "",     icon: <Droplets size={14} />, color: "#06b6d4" },
    { key: "temperature" as const,     label: "Temperature",  value: r.temperature.toFixed(1),     unit: "°C",   icon: <Thermometer size={14} />, color: "#f97316" },
    { key: "dissolvedOxygen" as const, label: "Dissolved O₂", value: r.dissolvedOxygen.toFixed(1), unit: "mg/L", icon: <Wind size={14} />, color: "#10b981" },
    { key: "turbidity" as const,       label: "Turbidity",    value: r.turbidity.toFixed(1),       unit: "NTU",  icon: <Eye size={14} />, color: "#8b5cf6" },
    { key: "humidity" as const,        label: "Humidity",     value: r.humidity.toFixed(0),        unit: "%",    icon: <CloudRain size={14} />, color: "#3b82f6" },
  ];

  const getTrend = (key: string) => {
    if (!previousReadings) return "stable";
    const current = r[key as keyof typeof r];
    const previous = previousReadings[key];
    const diff = current - previous;
    if (Math.abs(diff) < 0.1) return "stable";
    return diff > 0 ? "up" : "down";
  };

  const overallStatus = sensors.some((s) => getSensorStatus(s.key, r[s.key], thresholds) === "critical")
    ? "critical"
    : sensors.some((s) => getSensorStatus(s.key, r[s.key], thresholds) === "warning")
    ? "warning" : "normal";

  function toggleDevice() {
    setDevices((prev) => prev.map((d) => {
      if (d.id === device.id) {
        const newDeviceOn = !d.deviceOn;
        return {
          ...d,
          deviceOn: newDeviceOn,
          lastUpdated: newDeviceOn ? "Just now" : d.lastUpdated
        };
      }
      return d;
    }));
  }
  function openEdit() {
    setForm({ name: device.name, type: device.type, location: device.location, deviceId: device.id });
    setEditOpen(true);
  }
  function saveEdit() {
    if (!form.name.trim()) return;
    setDevices((prev) => prev.map((d) => d.id === device.id ? { ...d, name: form.name.trim(), type: form.type, location: form.location.trim() || d.location } : d));
    setEditOpen(false);
  }
  function confirmDelete() {
    setDevices((prev) => prev.filter((d) => d.id !== device.id));
    navigate("/dashboard");
  }

  // Format time for chart
  const chartData = history.slice(-48).map((h, idx) => ({ // Show last 4 hours
    id: idx,
    time: new Date(h.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    ...h,
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-aq-bg">
      {/* Header */}
      <div className="px-4 md:px-6 pt-4 pb-4 border-b border-aq-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-cyan-500 hover:text-cyan-600 transition-colors">
            <ArrowLeft size={18} /><span className="text-sm">All Devices</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setThresholdOpen(true)}
              className="w-8 h-8 rounded-xl bg-aq-overlay border border-aq-border flex items-center justify-center hover:bg-aq-overlay-2 transition-colors">
              <Settings size={14} className="text-purple-500" />
            </button>
            <button onClick={openEdit}
              className="w-8 h-8 rounded-xl bg-aq-overlay border border-aq-border flex items-center justify-center hover:bg-aq-overlay-2 transition-colors">
              <Pencil size={14} className="text-cyan-500" />
            </button>
            <button onClick={() => setDeleteOpen(true)}
              className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors">
              <Trash2 size={14} className="text-red-500" />
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${device.type === "pond" ? "bg-blue-500/15" : "bg-purple-500/15"}`}>
              {device.type === "pond" ? <Waves size={22} className="text-blue-500" /> : <Fish size={22} className="text-purple-500" />}
            </div>
            <div>
              <h1 className="text-aq-text">{device.name}</h1>
              <p className="text-aq-text-secondary text-sm flex items-center gap-1 mt-0.5">
                <MapPin size={12} />{device.type === "aquarium" ? "Aquarium" : "Pond"} · {device.location}
              </p>
            </div>
          </div>
          
        </div>

        <div className={`mt-3 rounded-xl px-3 py-2 text-xs flex items-center gap-2 ${
          !device.deviceOn ? "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/30"
          : overallStatus === "critical" ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
          : overallStatus === "warning" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
        }`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            !device.deviceOn ? "bg-gray-500"
            : overallStatus === "critical" ? "bg-red-500 animate-pulse" 
            : overallStatus === "warning" ? "bg-amber-500 animate-pulse" 
            : "bg-emerald-500"
          }`} />
          {!device.deviceOn ? "⏸ Device powered off — Readings paused at last known values"
            : overallStatus === "critical" ? "⚠ Critical alert — Check sensors immediately"
            : overallStatus === "warning" ? "⚠ One or more sensors out of range"
            : "✓ All sensors within normal range"}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4" style={{ scrollbarWidth: "none" }}>
        <div className="max-w-6xl mx-auto">
          {/* Device Power Control */}
          <div className="bg-aq-surface rounded-2xl p-4 mb-5 border border-aq-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-aq-text text-sm font-medium">Device Power</p>
                <p className="text-aq-text-secondary text-xs mt-0.5">
                  {device.deviceOn ? "Online — actively monitoring water quality" : "Offline — device powered off"}
                </p>
              </div>
              <button onClick={toggleDevice}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${device.deviceOn ? "bg-cyan-500" : "bg-aq-overlay-3"}`}>
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all duration-300 ${device.deviceOn ? "left-7" : "left-0.5"}`} />
              </button>
            </div>
            {device.deviceOn ? (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={`wave-${i}`} className="w-1 bg-cyan-500 rounded-full animate-pulse" style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="text-cyan-500 text-xs">Live Monitoring</span>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Power size={14} className="text-amber-500" />
                <span className="text-amber-600 dark:text-amber-400 text-xs">Sensor readings paused - Turn on device to resume monitoring</span>
              </div>
            )}
          </div>

          {/* Sensor readings with live status and trends */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-aq-text text-sm">
              {device.deviceOn ? "Live Sensor Readings" : "Last Sensor Readings"}
            </h2>
            {!device.deviceOn && (
              <span className="text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                Frozen
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            {sensors.map((s, idx) => {
              const status = getSensorStatus(s.key, r[s.key], thresholds);
              const trend = getTrend(s.key);
              return (
                <div key={`sensor-badge-${s.key}-${idx}`} className={`relative ${!device.deviceOn ? "opacity-60" : ""}`}>
                  <SensorBadge label={s.label} value={s.value} unit={s.unit} status={status} icon={s.icon} />
                  <div className="absolute top-2 right-2">
                    {device.deviceOn && trend === "up" && <TrendingUp size={12} className="text-red-500" />}
                    {device.deviceOn && trend === "down" && <TrendingDown size={12} className="text-blue-500" />}
                    {device.deviceOn && trend === "stable" && <Minus size={12} className="text-aq-text-subtle" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-aq-text text-sm">24-Hour Trends</h2>
            {!device.deviceOn && (
              <span className="text-aq-text-muted text-xs">Updates paused</span>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            {sensors.map((s, sIdx) => (
              <div key={`chart-${s.key}-${sIdx}`} className={`bg-aq-surface rounded-2xl p-4 border border-aq-border ${!device.deviceOn ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-2 mb-3">
                  {s.icon}
                  <h3 className="text-aq-text text-sm font-medium">{s.label}</h3>
                  <span className="text-aq-text-secondary text-xs ml-auto">{s.unit}</span>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="time" tick={{ fill: "#9ca3af", fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                      labelStyle={{ color: "#e5e7eb" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={s.key} 
                      stroke={s.color} 
                      strokeWidth={2} 
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>

          {/* Parameter Overview */}
          <h2 className="text-aq-text text-sm mb-3">Parameter Overview</h2>
          <div className="bg-aq-surface rounded-2xl p-4 border border-aq-border flex flex-col gap-3">
            {sensors.map((s, idx) => {
              const threshold = thresholds.find((t) => t.sensor === s.key);
              if (!threshold) return null;
              const pct = Math.min(100, Math.max(0, ((r[s.key] - threshold.min) / (threshold.max - threshold.min)) * 100));
              const status = getSensorStatus(s.key, r[s.key], thresholds);
              const barColor = status === "critical" ? "bg-red-500" : status === "warning" ? "bg-amber-500" : "bg-emerald-500";
              const valColor = status === "critical" ? "text-red-600 dark:text-red-400" : status === "warning" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
              return (
                <div key={`param-overview-${s.key}-${idx}`}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-aq-text-secondary">{s.label}</span>
                    <span className={valColor}>{s.value} {s.unit}</span>
                  </div>
                  <div className="h-1.5 bg-aq-overlay-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-aq-text-subtle mt-0.5">
                    <span>{threshold.min}{s.unit}</span><span>{threshold.max}{s.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && <EditModal device={device} form={form} setForm={setForm} onSave={saveEdit} onClose={() => setEditOpen(false)} />}

      {/* Threshold config modal */}
      {thresholdOpen && <ThresholdModal device={device} globalThresholds={globalThresholds} onClose={() => setThresholdOpen(false)} />}

      {/* Delete confirm */}
      {deleteOpen && (
        <div className="absolute inset-0 z-50 flex items-end md:items-center md:justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteOpen(false)} />
          <div className="relative bg-aq-surface rounded-t-3xl md:rounded-2xl border border-aq-border p-6 w-full md:max-w-sm mx-auto flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h2 className="text-aq-text text-center">Remove Device?</h2>
            <p className="text-aq-text-secondary text-sm text-center">
              Are you sure you want to remove <span className="text-aq-text font-medium">"{device.name}"</span>?
            </p>
            <div className="flex gap-2 w-full">
              <button onClick={() => setDeleteOpen(false)} className="flex-1 py-3 rounded-xl border border-aq-border text-aq-text-secondary text-sm">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-medium">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditModal({ device, form, setForm, onSave, onClose }: {
  device: Device; form: FormState; setForm: (f: FormState) => void; onSave: () => void; onClose: () => void;
}) {
  const isValid = form.name.trim().length > 0;

  return (
    <div className="absolute inset-0 z-50 flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-aq-surface rounded-t-3xl md:rounded-2xl border border-aq-border p-5 w-full md:max-w-lg mx-auto flex flex-col gap-4 max-h-[90vh] overflow-y-auto shadow-2xl" style={{ scrollbarWidth: "none" }}>
        <div className="w-10 h-1 bg-aq-overlay-3 rounded-full mx-auto md:hidden" />
        <div className="flex items-center justify-between">
          <h2 className="text-aq-text">Edit Device</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-aq-overlay flex items-center justify-center hover:bg-aq-overlay-2">
            <X size={16} className="text-aq-text-secondary" />
          </button>
        </div>
        <div>
          <label className="text-aq-text-secondary text-xs mb-1.5 flex items-center gap-1.5"><Hash size={11} /> Device ID</label>
          <input type="text" value={form.deviceId} onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
            className="w-full bg-aq-overlay border border-aq-border text-aq-text rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/60 font-mono" />
          <p className="text-aq-text-muted text-[10px] mt-1.5">Unique identifier for this device</p>
        </div>
        <div>
          <label className="text-aq-text-secondary text-xs mb-1.5 flex items-center gap-1.5"><Tag size={11} /> Device Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-aq-overlay border border-aq-border text-aq-text rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/60" />
        </div>
        <div>
          <label className="text-aq-text-secondary text-xs mb-1.5 block">Device Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(["aquarium", "pond"] as const).map((t) => (
              <button key={t} onClick={() => setForm({ ...form, type: t })}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm transition-all ${
                  form.type === t ? (t === "aquarium" ? "bg-purple-500/15 border-purple-500/50 text-purple-600 dark:text-purple-300" : "bg-blue-500/15 border-blue-500/50 text-blue-600 dark:text-blue-300") : "bg-aq-overlay border-aq-border text-aq-text-secondary"
                }`}>
                {t === "aquarium" ? <Fish size={16} /> : <Waves size={16} />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {form.type === t && <Check size={14} className="ml-auto" />}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-aq-text-secondary text-xs mb-1.5 flex items-center gap-1.5"><MapPin size={11} /> Location</label>
          <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full bg-aq-overlay border border-aq-border text-aq-text rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/60" />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-aq-border text-aq-text-secondary text-sm">Cancel</button>
          <button onClick={onSave} disabled={!isValid}
            className={`flex-1 py-3 rounded-xl text-sm font-medium ${isValid ? "bg-cyan-500 text-white hover:bg-cyan-600" : "bg-aq-overlay text-aq-text-muted cursor-not-allowed"}`}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function ThresholdModal({ device, globalThresholds, onClose }: {
  device: Device; globalThresholds: Threshold[]; onClose: () => void;
}) {
  const { setDevices } = useAppContext();
  const [localThresholds, setLocalThresholds] = useState<Threshold[]>(
    device.thresholds || JSON.parse(JSON.stringify(globalThresholds))
  );
  const [useCustom, setUseCustom] = useState(!!device.thresholds);
  const [saved, setSaved] = useState(false);

  function saveThresholds() {
    setDevices((prev) => prev.map((d) => 
      d.id === device.id ? { ...d, thresholds: useCustom ? localThresholds : undefined } : d
    ));
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1500);
  }

  const inputCls = "w-full bg-aq-overlay border border-aq-border text-aq-text placeholder-aq-text-subtle rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan-500/50";

  return (
    <div className="absolute inset-0 z-50 flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-aq-surface rounded-t-3xl md:rounded-2xl border border-aq-border p-5 w-full md:max-w-2xl mx-auto flex flex-col gap-4 max-h-[90vh] overflow-y-auto shadow-2xl" style={{ scrollbarWidth: "none" }}>
        <div className="w-10 h-1 bg-aq-overlay-3 rounded-full mx-auto md:hidden" />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-aq-text">Device Thresholds</h2>
            <p className="text-aq-text-secondary text-xs mt-1">{device.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-aq-overlay flex items-center justify-center hover:bg-aq-overlay-2">
            <X size={16} className="text-aq-text-secondary" />
          </button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-2">
          <div className="flex items-center gap-2 flex-1">
            <input type="checkbox" checked={useCustom} onChange={(e) => setUseCustom(e.target.checked)}
              className="w-4 h-4 rounded border-aq-border" />
            <div>
              <p className="text-aq-text text-sm">Use custom thresholds for this device</p>
              <p className="text-aq-text-secondary text-xs">Different fish species prefer different water parameters</p>
            </div>
          </div>
        </div>

        {useCustom && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localThresholds.map((t, idx) => (
              <div key={t.sensor} className="bg-aq-overlay rounded-xl border border-aq-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-aq-text text-sm font-medium">{t.label}</p>
                  {t.unit && <span className="text-aq-text-secondary text-xs bg-aq-surface px-2 py-0.5 rounded-full">{t.unit}</span>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-aq-text-muted text-xs mb-1 block">Min</label>
                    <input type="number" value={localThresholds[idx].min} step="0.1"
                      onChange={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) setLocalThresholds((p) => p.map((th, i) => i === idx ? { ...th, min: n } : th)); }}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="text-aq-text-muted text-xs mb-1 block">Max</label>
                    <input type="number" value={localThresholds[idx].max} step="0.1"
                      onChange={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) setLocalThresholds((p) => p.map((th, i) => i === idx ? { ...th, max: n } : th)); }}
                      className={inputCls} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-aq-border text-aq-text-secondary text-sm">Cancel</button>
          <button onClick={saveThresholds}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${saved ? "bg-emerald-500 text-white" : "bg-purple-500 text-white hover:bg-purple-600"}`}>
            {saved ? <span className="flex items-center justify-center gap-2"><Check size={16} /> Saved!</span> : "Save Thresholds"}
          </button>
        </div>
      </div>
    </div>
  );
}
