import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Device,
  Threshold,
  Notification,
  defaultThresholds,
  devices as initialDevices,
  notifications as initialNotifications,
} from "../data/mockData";

interface AppContextValue {
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  thresholds: Threshold[];
  setThresholds: React.Dispatch<React.SetStateAction<Threshold[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  unreadCount: number;
  markAllRead: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [thresholds, setThresholds] = useState<Threshold[]>(defaultThresholds);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return (localStorage.getItem("aq-theme") as "dark" | "light") ?? "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try { localStorage.setItem("aq-theme", theme); } catch {}
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <AppContext.Provider value={{ devices, setDevices, thresholds, setThresholds, notifications, setNotifications, unreadCount, markAllRead, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}