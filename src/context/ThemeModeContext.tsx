"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeMode = "dark" | "light";

interface ThemeModeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextType>({
  mode: "dark",
  toggleMode: () => {},
  setMode: () => {},
});

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("gst_theme_mode") as ThemeMode;
    if (saved === "light" || saved === "dark") {
      setModeState(saved);
      applyMode(saved);
    } else {
      // Mặc định dark mode cho gaming
      setModeState("dark");
      applyMode("dark");
    }
  }, []);

  const applyMode = (newMode: ThemeMode) => {
    const root = document.documentElement;
    root.setAttribute("data-mode", newMode);
    if (newMode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  };

  const toggleMode = () => {
    const newMode: ThemeMode = mode === "dark" ? "light" : "dark";
    setModeState(newMode);
    localStorage.setItem("gst_theme_mode", newMode);
    applyMode(newMode);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("gst_theme_mode", newMode);
    applyMode(newMode);
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeModeContext);
