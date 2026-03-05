import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { Root } from "./Root";
import { Dashboard } from "./pages/Dashboard";
import { DeviceDetail } from "./pages/DeviceDetail";
import { Notifications } from "./pages/Notifications";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", Component: Dashboard },
      { path: "dashboard/device/:id", Component: DeviceDetail },
      { path: "notifications", Component: Notifications },
      { path: "history", Component: History },
      { path: "settings", Component: Settings },
    ],
  },
  { path: "*", Component: NotFound },
]);
