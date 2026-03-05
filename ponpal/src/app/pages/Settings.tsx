import React, { useState } from "react";
import { Sliders, Phone, Bell, Shield, ChevronRight, Plus, Trash2, Check, User, Moon, Info, ArrowLeft } from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface SmsContact { id: string; name: string; number: string; }
type Section = "main" | "thresholds" | "sms" | "notifications-settings" | "account";

export function Settings() {
  const { thresholds, setThresholds } = useAppContext();
  const [section, setSection] = useState<Section>("main");
  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [saved, setSaved] = useState(false);

  const [contacts, setContacts] = useState<SmsContact[]>([
    { id: "c1", name: "Rhodj Cantor", number: "+639171234567" },
    { id: "c2", name: "Dominique Bongansiso", number: "+639281234567" },
  ]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [addingContact, setAddingContact] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ critical: true, warning: true, info: false, smsOnCritical: true, smsOnWarning: false, deviceAutoResponse: true });

  function saveThresholds() {
    setThresholds(localThresholds);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
  function addContact() {
    if (!newNumber.trim()) return;
    setContacts((prev) => [...prev, { id: `c${Date.now()}`, name: newName || "Unknown", number: newNumber }]);
    setNewName(""); setNewNumber(""); setAddingContact(false);
  }
  function removeContact(id: string) { setContacts((prev) => prev.filter((c) => c.id !== id)); }

  const inputCls = "w-full bg-aq-overlay border border-aq-border text-aq-text placeholder-aq-text-subtle rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan-500/50";
  const backBtn = <button onClick={() => setSection("main")} className="flex items-center gap-1.5 text-cyan-500 text-sm mb-3 hover:text-cyan-600 transition-colors"><ArrowLeft size={18} /><span className="text-sm">Back</span></button>;

  if (section === "thresholds") {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-aq-bg">
        <div className="px-4 md:px-6 pt-4 pb-4 flex-shrink-0">{backBtn}<h1 className="text-aq-text">Sensor Thresholds</h1><p className="text-aq-text-secondary text-sm">Set safe min/max ranges for alerts</p></div>
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4" style={{ scrollbarWidth: "none" }}>
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localThresholds.map((t, idx) => (
                <div key={t.sensor} className="bg-aq-surface rounded-2xl border border-aq-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-aq-text text-sm font-medium">{t.label}</p>
                    {t.unit && <span className="text-aq-text-secondary text-xs bg-aq-overlay px-2 py-0.5 rounded-full">{t.unit}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-aq-text-muted text-xs mb-1 block">Minimum</label>
                      <input type="number" value={localThresholds[idx].min} step="0.1"
                        onChange={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) setLocalThresholds((p) => p.map((th, i) => i === idx ? { ...th, min: n } : th)); }}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="text-aq-text-muted text-xs mb-1 block">Maximum</label>
                      <input type="number" value={localThresholds[idx].max} step="0.1"
                        onChange={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) setLocalThresholds((p) => p.map((th, i) => i === idx ? { ...th, max: n } : th)); }}
                        className={inputCls} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="h-1.5 bg-aq-overlay-2 rounded-full relative">
                      <div className="absolute h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full" style={{ left: "10%", right: "10%" }} />
                    </div>
                    <p className="text-[10px] text-aq-text-subtle mt-1">Safe range: {localThresholds[idx].min} – {localThresholds[idx].max} {t.unit}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={saveThresholds}
              className={`w-full py-3.5 rounded-2xl text-sm font-medium transition-all ${saved ? "bg-emerald-500 text-white" : "bg-cyan-500 text-white hover:bg-cyan-600"}`}>
              {saved ? <span className="flex items-center justify-center gap-2"><Check size={16} /> Saved!</span> : "Save Thresholds"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (section === "sms") {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-aq-bg">
        <div className="px-4 md:px-6 pt-4 pb-4 flex-shrink-0">{backBtn}<h1 className="text-aq-text">SMS Contacts</h1><p className="text-aq-text-secondary text-sm">Receive alerts via text message</p></div>
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4" style={{ scrollbarWidth: "none" }}>
          <div className="max-w-2xl mx-auto flex flex-col gap-3">
            {contacts.map((c) => (
              <div key={c.id} className="bg-aq-surface rounded-2xl border border-aq-border p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-cyan-500" />
                </div>
                <div className="flex-1">
                  <p className="text-aq-text text-sm font-medium">{c.name}</p>
                  <p className="text-aq-text-secondary text-xs mt-0.5">{c.number}</p>
                </div>
                <button onClick={() => removeContact(c.id)} className="text-aq-text-subtle hover:text-red-500 p-1 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {addingContact ? (
              <div className="bg-aq-surface rounded-2xl border border-cyan-500/30 p-4 flex flex-col gap-3">
                <p className="text-aq-text text-sm font-medium">Add Contact</p>
                <div>
                  <label className="text-aq-text-muted text-xs mb-1 block">Name</label>
                  <input type="text" placeholder="Contact name" value={newName} onChange={(e) => setNewName(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-aq-text-muted text-xs mb-1 block">Phone Number</label>
                  <input type="tel" placeholder="+63 917 XXX XXXX" value={newNumber} onChange={(e) => setNewNumber(e.target.value)} className={inputCls} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAddingContact(false)} className="flex-1 py-2.5 rounded-xl text-sm text-aq-text-secondary border border-aq-border">Cancel</button>
                  <button onClick={addContact} className="flex-1 py-2.5 rounded-xl text-sm bg-cyan-500 text-white hover:bg-cyan-600">Add</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingContact(true)}
                className="w-full py-3.5 rounded-2xl border border-dashed border-cyan-500/40 text-cyan-500 text-sm flex items-center justify-center gap-2 hover:border-cyan-500/60 transition-colors">
                <Plus size={16} /> Add SMS Contact
              </button>
            )}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 flex gap-2">
              <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-blue-600 dark:text-blue-300 text-xs leading-relaxed">
                SMS alerts will be sent to all contacts listed here when a sensor reading exceeds threshold levels or a critical event is detected.
              </p>
            </div>
            
            <div className="bg-aq-surface rounded-2xl border border-aq-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <Phone size={14} className="text-emerald-500" />
                </div>
                <p className="text-aq-text text-sm font-medium">Sample Text Message</p>
              </div>
              <div className="bg-aq-overlay rounded-xl p-3 border border-aq-border-subtle">
                <p className="text-aq-text-secondary text-xs font-mono leading-relaxed">
                  <span className="text-red-500 font-bold">🚨 CRITICAL ALERT</span><br />
                  Device: Tropical Aquarium<br />
                  Sensor: pH Level<br />
                  Value: 4.2 (Critical)<br />
                  Threshold: 6.5-8.5<br />
                  Time: Mar 5, 2026 10:22 AM<br />
                  <br />
                  <span className="text-cyan-500">✓ Auto-response initiated</span><br />
                  <br />
                  Check your AquaMonitor app for details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section === "notifications-settings") {
    const toggles = [
      { key: "critical" as const, label: "Critical Alerts", desc: "Sensor values in danger zone" },
      { key: "warning" as const, label: "Warning Alerts", desc: "Sensor values near threshold" },
      { key: "info" as const, label: "Info Notifications", desc: "System updates and events" },
      { key: "smsOnCritical" as const, label: "SMS on Critical", desc: "Send SMS for critical events" },
      { key: "smsOnWarning" as const, label: "SMS on Warning", desc: "Send SMS for warnings" },
      { key: "deviceAutoResponse" as const, label: "Auto Response", desc: "Auto-adjust settings when critical" },
    ];
    return (
      <div className="flex flex-col h-full overflow-hidden bg-aq-bg">
        <div className="px-4 md:px-6 pt-4 pb-4 flex-shrink-0">{backBtn}<h1 className="text-aq-text">Notification Settings</h1><p className="text-aq-text-secondary text-sm">Configure when to get notified</p></div>
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4" style={{ scrollbarWidth: "none" }}>
          <div className="max-w-2xl mx-auto">
            <div className="bg-aq-surface rounded-2xl border border-aq-border overflow-hidden">
              {toggles.map((t, i) => (
                <div key={t.key} className={`flex items-center justify-between p-4 ${i < toggles.length - 1 ? "border-b border-aq-border-subtle" : ""}`}>
                  <div>
                    <p className="text-aq-text text-sm">{t.label}</p>
                    <p className="text-aq-text-muted text-xs mt-0.5">{t.desc}</p>
                  </div>
                  <button onClick={() => setNotifPrefs((prev) => ({ ...prev, [t.key]: !prev[t.key] }))}
                    className={`relative w-12 h-6 rounded-full transition-all ${notifPrefs[t.key] ? "bg-cyan-500" : "bg-aq-overlay-3"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifPrefs[t.key] ? "left-6" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main settings
  const menuItems = [
    { section: "thresholds" as Section, icon: <Sliders size={18} className="text-cyan-500" />, iconBg: "bg-cyan-500/15", label: "Sensor Thresholds", desc: "Set min/max alert ranges" },
    { section: "sms" as Section, icon: <Phone size={18} className="text-emerald-500" />, iconBg: "bg-emerald-500/15", label: "SMS Contacts", desc: "Phone numbers for alerts" },
    { section: "notifications-settings" as Section, icon: <Bell size={18} className="text-amber-500" />, iconBg: "bg-amber-500/15", label: "Notification Settings", desc: "Configure alert preferences" },
    { section: "account" as Section, icon: <User size={18} className="text-purple-500" />, iconBg: "bg-purple-500/15", label: "Account", desc: "Profile & preferences" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-aq-bg">
      <div className="px-4 md:px-6 pt-4 pb-4 flex-shrink-0">
        <h1 className="text-aq-text">Settings</h1>
        <p className="text-aq-text-secondary text-sm">App configuration</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4" style={{ scrollbarWidth: "none" }}>
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {/* Profile card */}
          <div className="bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-500/20 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-cyan-600 dark:text-cyan-300 font-bold">RC</span>
            </div>
            <div>
              <p className="text-aq-text font-medium">Rhodj Cantor</p>
              <p className="text-aq-text-secondary text-xs mt-0.5">Cantorrhodj@gmail.com</p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-aq-surface rounded-xl p-3 border border-aq-border text-center">
              <p className="text-cyan-500 text-sm font-bold">4</p>
              <p className="text-aq-text-muted text-[10px]">Devices</p>
            </div>
            <div className="bg-aq-surface rounded-xl p-3 border border-aq-border text-center">
              <p className="text-emerald-500 text-sm font-bold">{contacts.length}</p>
              <p className="text-aq-text-muted text-[10px]">SMS #'s</p>
            </div>
            <div className="bg-aq-surface rounded-xl p-3 border border-aq-border text-center">
              <p className="text-amber-500 text-sm font-bold">{thresholds.length}</p>
              <p className="text-aq-text-muted text-[10px]">Thresholds</p>
            </div>
          </div>

          {/* Menu */}
          <div className="bg-aq-surface rounded-2xl border border-aq-border overflow-hidden">
            {menuItems.map((item, i) => (
              <button key={item.section} onClick={() => setSection(item.section)}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-aq-overlay transition-colors ${i < menuItems.length - 1 ? "border-b border-aq-border-subtle" : ""}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.iconBg}`}>{item.icon}</div>
                <div className="flex-1">
                  <p className="text-aq-text text-sm">{item.label}</p>
                  <p className="text-aq-text-muted text-xs">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-aq-text-subtle" />
              </button>
            ))}
          </div>

          {/* App info */}
          <div className="bg-aq-surface rounded-2xl border border-aq-border overflow-hidden">
            {[
              { icon: <Shield size={16} className="text-aq-text-secondary" />, label: "Privacy Policy" },
              { icon: <Info size={16} className="text-aq-text-secondary" />, label: "App Version 1.0.0" },
              { icon: <Moon size={16} className="text-aq-text-secondary" />, label: "Pondpal IoT" },
            ].map((item, i) => (
              <div key={item.label} className={`flex items-center gap-3 p-4 ${i < 2 ? "border-b border-aq-border-subtle" : ""}`}>
                {item.icon}
                <span className="text-aq-text-secondary text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}