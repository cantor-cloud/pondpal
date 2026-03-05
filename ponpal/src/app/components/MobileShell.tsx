import React from "react";

interface MobileShellProps {
  children: React.ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div
        className="relative bg-[#0a1628] w-full max-w-[390px] rounded-[40px] overflow-hidden shadow-2xl"
        style={{ minHeight: "844px", height: "844px" }}
      >
        {/* Status Bar */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <span className="text-white text-xs font-semibold">9:41</span>
          <div className="flex items-center gap-1">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
              <rect x="0" y="3" width="3" height="9" rx="1" />
              <rect x="4.5" y="2" width="3" height="10" rx="1" />
              <rect x="9" y="0" width="3" height="12" rx="1" />
              <rect x="13.5" y="0" width="3" height="12" rx="1" opacity="0.3" />
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
              <path d="M8 2.4C5.6 2.4 3.5 3.4 2 5L0.5 3.5C2.4 1.3 5 0 8 0s5.6 1.3 7.5 3.5L14 5c-1.5-1.6-3.6-2.6-6-2.6z" />
              <path d="M8 5.6c-1.5 0-2.9.6-3.9 1.6L2.6 5.7C4 4.1 5.9 3.2 8 3.2s4 .9 5.4 2.5l-1.5 1.5C10.9 6.2 9.5 5.6 8 5.6z" />
              <circle cx="8" cy="10" r="2" />
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="white" strokeOpacity="0.35" />
              <rect x="2" y="2" width="16" height="8" rx="2" fill="white" />
              <path d="M23 4v4a2 2 0 000-4z" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
        </div>
        <div className="h-full overflow-hidden flex flex-col" style={{ height: "calc(844px - 56px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
