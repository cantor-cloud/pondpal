import React from "react";
import { useNavigate, useLocation } from "react-router";
import { LayoutDashboard, Bell, Clock, Settings, Droplets, Sun, Moon } from "lucide-react";
import { useAppContext } from "../context/AppContext";

type Tab = "dashboard" | "notifications" | "history" | "settings";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "history", label: "History", icon: Clock },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount, theme, toggleTheme } = useAppContext();
  const activeTab = (location.pathname.split("/")[1] as Tab) || "dashboard";

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-aq-surface border-r border-aq-border z-30">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-aq-border">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <Droplets size={18} className="text-cyan-500" />
        </div>
        <div>
          <p className="text-aq-text text-sm font-semibold">Pondpal</p>
          <p className="text-aq-text-muted text-[11px]">IoT Water Quality</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id ||
            (tab.id === "dashboard" && location.pathname.startsWith("/dashboard"));
          return (
            <button
              key={tab.id}
              onClick={() => navigate(`/${tab.id}`)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? "bg-cyan-500/15 text-cyan-500"
                  : "text-aq-text-secondary hover:bg-aq-overlay hover:text-aq-text"
              }`}
            >
              <div className="relative">
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                {tab.id === "notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span>{tab.label}</span>
              {tab.id === "notifications" && unreadCount > 0 && (
                <span className="ml-auto bg-red-500/15 text-red-500 text-[10px] px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: theme toggle + profile */}
      <div className="px-3 py-4 border-t border-aq-border flex flex-col gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-aq-text-secondary hover:bg-aq-overlay hover:text-aq-text transition-all"
        >
          {theme === "dark" ? (
            <>
              <Sun size={18} strokeWidth={1.5} />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={18} strokeWidth={1.5} />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-aq-overlay transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-cyan-500 text-xs font-bold">RC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-aq-text text-xs font-medium truncate">Rhodj Cantor</p>
            <p className="text-aq-text-muted text-[10px] truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
