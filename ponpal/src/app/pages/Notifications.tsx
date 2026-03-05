import React, { useState } from "react";
import { Bell, AlertTriangle, Info, AlertOctagon, CheckCheck, Trash2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export function Notifications() {
  const { notifications, setNotifications, markAllRead: ctxMarkAllRead } = useAppContext();
  const [filter, setFilter] = useState<"all" | "unread" | "critical" | "warning">("all");

  function markAllRead() {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    ctxMarkAllRead();
  }
  function markRead(id: string) {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }
  function deleteNotification(id: string) {
    setNotifications(notifications.filter((n) => n.id !== id));
  }

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "critical") return n.type === "critical";
    if (filter === "warning") return n.type === "warning";
    return true;
  });
  const unreadCount = notifications.filter((n) => !n.read).length;

  function formatTime(ts: string) {
    const d = new Date(ts);
    const now = new Date("2026-03-03T10:30:00");
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  }

  const typeConfig = {
    critical: {
      icon: <AlertOctagon size={16} />,
      bg: "bg-red-500/10", border: "border-red-500/25",
      text: "text-red-600 dark:text-red-400", iconBg: "bg-red-500/15",
    },
    warning: {
      icon: <AlertTriangle size={16} />,
      bg: "bg-amber-500/10", border: "border-amber-500/25",
      text: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-500/15",
    },
    info: {
      icon: <Info size={16} />,
      bg: "bg-blue-500/10", border: "border-blue-500/20",
      text: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-500/15",
    },
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-aq-bg">
      {/* Header */}
      <div className="px-4 md:px-6 pt-4 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h1 className="text-aq-text">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[11px] rounded-full px-2 py-0.5 font-bold">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 text-cyan-500 text-xs hover:text-cyan-600">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>
        <p className="text-aq-text-secondary text-sm">System alerts & sensor events</p>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {(["all", "unread", "critical", "warning"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs border transition-all ${
                filter === f
                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-600 dark:text-cyan-400"
                  : "bg-aq-overlay border-aq-border text-aq-text-secondary hover:bg-aq-overlay-2"
              }`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4" style={{ scrollbarWidth: "none" }}>
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-14 h-14 rounded-full bg-aq-overlay flex items-center justify-center">
                <Bell size={24} className="text-aq-text-muted" />
              </div>
              <p className="text-aq-text-muted text-sm">No notifications</p>
            </div>
          ) : (
            filtered.map((notif) => {
              const cfg = typeConfig[notif.type];
              return (
                <div key={notif.id} onClick={() => markRead(notif.id)}
                  className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                    notif.read ? "bg-aq-surface border-aq-border hover:border-aq-overlay-3" : `${cfg.bg} ${cfg.border}`
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
                      <span className={cfg.text}>{cfg.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                            {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                          </span>
                          <span className="text-aq-text-muted text-[11px]">{notif.sensor}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                          className="text-aq-text-subtle hover:text-red-500 flex-shrink-0 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-aq-text mb-1">{notif.deviceName}</p>
                      <p className="text-aq-text-secondary text-xs leading-relaxed">{notif.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-aq-text-subtle text-[11px]">{formatTime(notif.timestamp)}</span>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-cyan-500" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
