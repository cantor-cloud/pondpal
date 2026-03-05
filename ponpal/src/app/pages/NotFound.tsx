import React from "react";
import { useNavigate } from "react-router";
import { Droplets, Home } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-aq-bg flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-3xl bg-cyan-500/20 flex items-center justify-center mb-6">
        <Droplets size={36} className="text-cyan-500" />
      </div>
      <h1 className="text-aq-text text-5xl font-bold mb-2">404</h1>
      <p className="text-cyan-500 font-medium mb-2">Page Not Found</p>
      <p className="text-aq-text-secondary text-sm mb-8 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-2xl text-sm font-medium transition-colors"
      >
        <Home size={16} />
        Back to Dashboard
      </button>
    </div>
  );
}