import React from "react";
import { Outlet } from "react-router";
import { AppProvider } from "./context/AppContext";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { BottomNav } from "./components/BottomNav";

function RootInner() {
  return (
    <div className="flex h-screen bg-aq-bg overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col md:pl-60 min-w-0">
        {/* Mobile top bar */}
        <TopBar />

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </div>
  );
}

export function Root() {
  return (
    <AppProvider>
      <RootInner />
    </AppProvider>
  );
}