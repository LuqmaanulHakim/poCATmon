"use client";

import { useTheme } from "../context/ThemeContext";

export default function Toolbar() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div
      className="absolute top-3 left-3 right-3 z-50 flex items-center justify-between px-4 py-2.5 rounded-2xl"
      style={{
        backgroundColor: "var(--background)",
        border: "1px solid var(--card-border)",
      }}
    >
      {/* App name */}
      <span
        className="text-[13px] font-semibold tracking-wide select-none"
        style={{ color: "var(--foreground)" }}
      >
        PoCATmon
      </span>

      {/* Segmented toggle */}
      <div
        className="flex items-center gap-0.5 rounded-full p-1"
        style={{ background: "var(--card-border)" }}
      >
        {[
          { label: "Light", icon: "☀️", value: false },
          { label: "Dark",  icon: "🌙", value: true  },
        ].map(({ label, icon, value }) => {
          const active = darkMode === value;
          return (
            <button
              key={label}
              onClick={() => { if (!active) toggleTheme(); }}
              className="flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-full transition-all duration-150"
              style={{
                background: active ? "var(--background)" : "transparent",
                color: active ? "var(--foreground)" : "var(--muted)",
                border: "none",
                cursor: active ? "default" : "pointer",
                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <span>{icon}</span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}