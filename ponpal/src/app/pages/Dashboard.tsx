import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Power, ChevronRight, Fish, Waves, Plus,
  Pencil, Trash2, X, Check, MapPin, Tag, Hash,
  CheckCircle2,
} from "lucide-react";
import { Device, getSensorStatus } from "../data/mockData";
import { useAppContext } from "../context/AppContext";

type ModalMode = "add" | "edit" | null;
const emptyForm = { name: "", type: "aquarium" as "aquarium" | "pond", location: "", deviceId: "" };

export function Dashboard() {
  const navigate = useNavigate();
  const { devices, setDevices, thresholds } = useAppContext();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "pond" | "aquarium">("all");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedDeviceName, setAddedDeviceName] = useState("");

  function openAdd() { setForm(emptyForm); setEditingDevice(null); setModalMode("add"); }
  function openEdit(device: Device, e?: React.MouseEvent) {
    e?.stopPropagation();
    setForm({ name: device.name, type: device.type, location: device.location, deviceId: device.id });
    setEditingDevice(device); setModalMode("edit");
  }
  function closeModal() { setModalMode(null); setEditingDevice(null); setForm(emptyForm); }

  function handleSave() {
    if (!form.name.trim()) return;
    if (modalMode === "add") {
      const newDevice: Device = {
        id: form.deviceId.trim() || `d${Date.now()}`,
        name: form.name.trim(), type: form.type,
        location: form.location.trim() || "Unknown",
        isOnline: true, deviceOn: true, lastUpdated: "just now",
        readings: { ph: 7.0, temperature: 25.0, dissolvedOxygen: 7.0, turbidity: 10.0, humidity: 65 },
      };
      setDevices((prev) => [...prev, newDevice]);
      setAddedDeviceName(form.name.trim());
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } else if (modalMode === "edit" && editingDevice) {
      setDevices((prev) => prev.map((d) => d.id === editingDevice.id
        ? { ...d, name: form.name.trim(), type: form.type, location: form.location.trim() || d.location } : d));
    }
    closeModal();
  }

  function handleDelete(deviceId: string) {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    setDeleteConfirm(null);
  }

  const filteredDevices = devices.filter((d) => filterType === "all" || d.type === filterType);
  const onlineCount = devices.filter((d) => d.isOnline).length;
  const criticalCount = devices.filter((d) => {
    const keys = ["ph", "temperature", "dissolvedOxygen", "turbidity", "humidity"] as const;
    return keys.some((k) => getSensorStatus(k, d.readings[k], thresholds) === "critical");
  }).length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-aq-bg">
      {/* Header */}
      <div className="px-4 md:px-6 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-aq-text">My Devices</h1>
            <p className="text-aq-text-secondary text-sm">{onlineCount} of {devices.length} online</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openAdd}
              className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-3 py-2 rounded-xl transition-colors">
              <Plus size={14} /> Add Device
            </button>
            <div className="hidden md:flex w-9 h-9 rounded-full bg-cyan-500/20 items-center justify-center">
              <span className="text-cyan-500 text-sm font-bold">RC</span>
            </div>
          </div>
        </div>

        {/* Stats — desktop */}
        <div className="hidden md:grid grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total Devices", value: devices.length, color: "text-aq-text" },
            { label: "Online", value: onlineCount, color: "text-emerald-500" },
            { label: "Critical Alerts", value: criticalCount, color: "text-red-500" },
            { label: "Devices Active", value: devices.filter((d) => d.deviceOn).length, color: "text-cyan-500" },
          ].map((s) => (
            <div key={s.label} className="bg-aq-surface rounded-xl p-3 border border-aq-border">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-aq-text-muted text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          {([
            { id: "all", label: "All", count: devices.length },
            { id: "pond", label: "Ponds", count: devices.filter((d) => d.type === "pond").length },
            { id: "aquarium", label: "Aquariums", count: devices.filter((d) => d.type === "aquarium").length },
          ] as const).map((chip) => (
            <button key={chip.id} onClick={() => setFilterType(chip.id)}
              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                filterType === chip.id
                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-600 dark:text-cyan-400"
                  : "bg-aq-overlay border-aq-border text-aq-text-secondary hover:border-aq-border-subtle"
              }`}>
              {chip.label} ({chip.count})
            </button>
          ))}
          {criticalCount > 0 && (
            <div className="px-3 py-1 rounded-full text-xs border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              {criticalCount} Critical Alert{criticalCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Device grid */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4" style={{ scrollbarWidth: "none" }}>
        <div className="max-w-6xl mx-auto">
          {filteredDevices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-14 h-14 rounded-full bg-aq-overlay flex items-center justify-center">
                <Fish size={24} className="text-aq-text-muted" />
              </div>
              <p className="text-aq-text-muted text-sm">No devices found</p>
              <button onClick={openAdd} className="text-cyan-500 text-sm flex items-center gap-1.5">
                <Plus size={14} /> Add your first device
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
              {filteredDevices.map((device) => {
                const r = device.readings;
                const sensorKeys = ["ph", "temperature", "dissolvedOxygen", "turbidity", "humidity"] as const;
                const hasCritical = sensorKeys.some((k) => getSensorStatus(k, r[k], thresholds) === "critical");
                const hasWarning = sensorKeys.some((k) => getSensorStatus(k, r[k], thresholds) === "warning");
                const statusLabel = hasCritical ? "Critical" : hasWarning ? "Warning" : "Normal";
                const statusColor = hasCritical
                  ? "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30"
                  : hasWarning
                  ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30"
                  : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

                return (
                  <div key={device.id} className="relative group">
                    <div onClick={() => navigate(`/dashboard/device/${device.id}`)}
                      className="w-full text-left bg-aq-surface rounded-2xl p-4 border border-aq-border hover:border-cyan-500/40 hover:shadow-sm transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.type === "pond" ? "bg-blue-500/15" : "bg-purple-500/15"}`}>
                            {device.type === "pond"
                              ? <Waves size={20} className="text-blue-500" />
                              : <Fish size={20} className="text-purple-500" />}
                          </div>
                          <div>
                            <p className="text-aq-text text-sm font-medium">{device.name}</p>
                            <p className="text-aq-text-muted text-xs flex items-center gap-1">
                              <MapPin size={10} />{device.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor}`}>{statusLabel}</span>
                        </div>
                      </div>

                      {/* Mini sensor grid */}
                      <div className="grid grid-cols-5 gap-1 mb-3 relative">
                        {[
                          { label: "pH", value: r.ph.toFixed(1), key: "ph" as const },
                          { label: "Temp", value: `${r.temperature.toFixed(0)}°`, key: "temperature" as const },
                          { label: "DO", value: r.dissolvedOxygen.toFixed(1), key: "dissolvedOxygen" as const },
                          { label: "NTU", value: r.turbidity.toFixed(0), key: "turbidity" as const },
                          { label: "Hum", value: `${r.humidity}%`, key: "humidity" as const },
                        ].map((s) => {
                          const st = getSensorStatus(s.key, r[s.key], thresholds);
                          return (
                            <div key={s.key} className={`rounded-lg p-1.5 text-center ${st === "critical" ? "bg-red-500/10" : st === "warning" ? "bg-amber-500/10" : "bg-aq-overlay"} ${!device.deviceOn ? "opacity-50" : ""}`}>
                              <p className={`text-[11px] font-semibold ${st === "critical" ? "text-red-600 dark:text-red-400" : st === "warning" ? "text-amber-600 dark:text-amber-400" : "text-aq-text"}`}>{s.value}</p>
                              <p className="text-aq-text-subtle text-[9px]">{s.label}</p>
                            </div>
                          );
                        })}
                        {!device.deviceOn && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-aq-surface/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-aq-border">
                              <span className="text-aq-text-muted text-[9px]">Paused</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full ${device.deviceOn ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "bg-aq-overlay text-aq-text-muted"}`}>
                            <Power size={11} /> Device {device.deviceOn ? "ON" : "OFF"}
                          </div>
                          <span className="text-aq-text-subtle text-[10px]">{device.lastUpdated}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={(e) => openEdit(device, e)}
                            className="w-7 h-7 rounded-lg bg-aq-overlay border border-aq-border flex items-center justify-center hover:bg-aq-overlay-2 transition-colors">
                            <Pencil size={12} className="text-cyan-500" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(device.id); }}
                            className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                            <Trash2 size={12} className="text-red-500" />
                          </button>
                          <ChevronRight size={16} className="text-aq-text-subtle" />
                        </div>
                      </div>
                    </div>

                    {/* Delete confirm */}
                    {deleteConfirm === device.id && (
                      <div className="absolute inset-0 z-20 rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                        <div className="absolute bottom-0 left-0 right-0 bg-aq-surface rounded-2xl border border-red-500/30 p-4 flex flex-col gap-3">
                          <p className="text-aq-text text-sm font-medium">Remove "{device.name}"?</p>
                          <p className="text-aq-text-secondary text-xs">This action cannot be undone.</p>
                          <div className="flex gap-2">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-xl border border-aq-border text-aq-text-secondary text-sm">Cancel</button>
                            <button onClick={() => handleDelete(device.id)} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium">Remove</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add device card */}
              <button onClick={openAdd}
                className="py-8 rounded-2xl border border-dashed border-cyan-500/30 hover:border-cyan-500/60 flex flex-col items-center gap-2 transition-colors hover:bg-cyan-500/5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Plus size={20} className="text-cyan-500" />
                </div>
                <p className="text-cyan-500 text-sm">Add New Device</p>
                <p className="text-aq-text-muted text-xs">Register a new IoT device</p>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {(modalMode === "add" || modalMode === "edit") && (
        <DeviceFormSheet mode={modalMode} form={form} onChange={setForm} onSave={handleSave} onClose={closeModal} />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)} />
          <div className="relative bg-aq-surface rounded-2xl border border-emerald-500/30 p-6 w-full max-w-sm mx-4 flex flex-col items-center gap-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <div className="text-center">
              <h2 className="text-aq-text text-lg font-medium mb-1">Device Added Successfully!</h2>
              <p className="text-aq-text-secondary text-sm">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{addedDeviceName}</span> is now online and monitoring
              </p>
            </div>
            <button onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Device Form Sheet ──────────────────────────────────────────────────────

interface FormState { name: string; type: "aquarium" | "pond"; location: string; deviceId: string; }

function DeviceFormSheet({ mode, form, onChange, onSave, onClose }: {
  mode: "add" | "edit"; form: FormState; onChange: (f: FormState) => void; onSave: () => void; onClose: () => void;
}) {
  const isValid = form.name.trim().length > 0;

  return (
    <div className="absolute inset-0 z-50 flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-aq-surface rounded-t-3xl md:rounded-2xl border border-aq-border p-5 w-full md:max-w-lg mx-auto flex flex-col gap-4 max-h-[92vh] overflow-y-auto shadow-2xl" style={{ scrollbarWidth: "none" }}>
        <div className="w-10 h-1 bg-aq-overlay-3 rounded-full mx-auto -mt-1 md:hidden flex-shrink-0" />
        <div className="flex items-center justify-between flex-shrink-0">
          <h2 className="text-aq-text">{mode === "add" ? "Add New Device" : "Edit Device"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-aq-overlay flex items-center justify-center hover:bg-aq-overlay-2">
            <X size={16} className="text-aq-text-secondary" />
          </button>
        </div>

        {/* Device ID */}
        <div>
          <label className="text-aq-text-secondary text-xs mb-1.5 flex items-center gap-1.5"><Hash size={11} /> Device ID </label>
          <input type="text" placeholder="e.g. WQM-A3F9B2 or leave blank for auto-generate" value={form.deviceId}
            onChange={(e) => onChange({ ...form, deviceId: e.target.value })}
            className="w-full bg-aq-overlay border border-aq-border text-aq-text placeholder-aq-text-subtle rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/60 font-mono" />
          <p className="text-aq-text-muted text-[10px] mt-1.5">Leave blank to auto-generate a unique device ID</p>
        </div>

        {/* Name */}
        <div>
          <label className="text-aq-text-secondary text-xs mb-1.5 flex items-center gap-1.5"><Tag size={11} /> Device Name</label>
          <input type="text" placeholder="e.g. Main Koi Pond" value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            className="w-full bg-aq-overlay border border-aq-border text-aq-text placeholder-aq-text-subtle rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/60" />
        </div>

        {/* Type */}
        <div>
          <label className="text-aq-text-secondary text-xs mb-1.5 block">Device Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(["aquarium", "pond"] as const).map((t) => (
              <button key={t} onClick={() => onChange({ ...form, type: t })}
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

        {/* Location */}
        <div>
          <label className="text-aq-text-secondary text-xs mb-1.5 flex items-center gap-1.5"><MapPin size={11} /> Location</label>
          <input type="text" placeholder="e.g. Backyard, Living Room" value={form.location}
            onChange={(e) => onChange({ ...form, location: e.target.value })}
            className="w-full bg-aq-overlay border border-aq-border text-aq-text placeholder-aq-text-subtle rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/60" />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-aq-border text-aq-text-secondary text-sm hover:bg-aq-overlay transition-colors">Cancel</button>
          <button onClick={onSave} disabled={!isValid}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${isValid ? "bg-cyan-500 text-white hover:bg-cyan-600" : "bg-aq-overlay text-aq-text-muted cursor-not-allowed"}`}>
            {mode === "add" ? "Add Device" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
