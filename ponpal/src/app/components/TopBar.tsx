import React from "react";
import { useLocation } from "react-router";
import { Droplets, Sun, Moon } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  notifications: "Alerts",
  history: "History",
  settings: "Settings",
};

export function TopBar() {
  const location = useLocation();
  const { unreadCount, theme, toggleTheme } = useAppContext();
  const segment = location.pathname.split("/")[1] || "dashboard";
  const isDeviceDetail = location.pathname.startsWith("/dashboard/device/");
  const title = isDeviceDetail ? "Device Detail" : (pageTitles[segment] || "AquaMonitor");

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-aq-surface border-b border-aq-border flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <Droplets size={14} className="text-cyan-500" />
        </div>
        <span className="text-aq-text text-sm font-semibold">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-[10px] rounded-full px-2 py-0.5 font-bold">
            {unreadCount} alert{unreadCount > 1 ? "s" : ""}
          </span>
        )}
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-xl bg-aq-overlay flex items-center justify-center transition-colors hover:bg-aq-overlay-2"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun size={15} className="text-aq-text-secondary" />
          ) : (
            <Moon size={15} className="text-aq-text-secondary" />
          )}
        </button>
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
          <span className="text-cyan-500 text-xs font-bold">RC</span>
        </div>
      </div>
    </header>
  );
}
