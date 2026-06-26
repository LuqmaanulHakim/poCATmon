"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  darkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  // load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      setDarkMode(saved === "dark");
    }
  }, []);

  // apply theme to <html>
  // apply theme to <html>
  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", darkMode ? "dark" : "light");

    // Update Safari browser chrome color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", darkMode ? "#2b1f1a" : "#f5efe6");
    }
  }, [darkMode]);
  
  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}