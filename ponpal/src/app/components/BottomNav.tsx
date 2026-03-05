import React from "react";
import { useNavigate, useLocation } from "react-router";
import { LayoutDashboard, Bell, Clock, Settings } from "lucide-react";
import { useAppContext } from "../context/AppContext";

type Tab = "dashboard" | "notifications" | "history" | "settings";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "history", label: "History", icon: Clock },
  { id: "settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useAppContext();
  const activeSegment = (location.pathname.split("/")[1] as Tab) || "dashboard";

  return (
    <div className="md:hidden flex items-center bg-aq-surface border-t border-aq-border px-2 py-2 pb-5 flex-shrink-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          activeSegment === tab.id ||
          (tab.id === "dashboard" && location.pathname.startsWith("/dashboard"));
        return (
          <button
            key={tab.id}
            onClick={() => navigate(`/${tab.id}`)}
            className="flex-1 flex flex-col items-center gap-1 py-1 relative"
          >
            <div className={`relative p-2 rounded-xl transition-all ${isActive ? "bg-cyan-500/15" : ""}`}>
              <Icon
                size={22}
                className={isActive ? "text-cyan-500" : "text-aq-text-muted"}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              {tab.id === "notifications" && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] ${isActive ? "text-cyan-500" : "text-aq-text-muted"}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
