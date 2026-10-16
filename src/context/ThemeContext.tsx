"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeColor = "purple" | "gold" | "blue" | "emerald" | "rose" | "orange";

interface ThemeContextType {
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  themesList: { id: ThemeColor; name: string; hex: string; bgClass: string; borderClass: string }[];
}

const THEMES_LIST: { id: ThemeColor; name: string; hex: string; bgClass: string; borderClass: string }[] = [
  { id: "purple", name: "Tím Neon (Chuẩn)", hex: "#8B5CF6", bgClass: "bg-violet-500", borderClass: "border-violet-500" },
  { id: "gold", name: "Vàng Hoàng Kim", hex: "#EAB308", bgClass: "bg-yellow-500", borderClass: "border-yellow-500" },
  { id: "blue", name: "Xanh Cyberpunk", hex: "#3B82F6", bgClass: "bg-blue-500", borderClass: "border-blue-500" },
  { id: "emerald", name: "Xanh Ngọc Lục", hex: "#10B981", bgClass: "bg-emerald-500", borderClass: "border-emerald-500" },
  { id: "rose", name: "Hồng Neon", hex: "#F43F5E", bgClass: "bg-rose-500", borderClass: "border-rose-500" },
  { id: "orange", name: "Cam Sunset", hex: "#F97316", bgClass: "bg-orange-500", borderClass: "border-orange-500" },
];

const ThemeContext = createContext<ThemeContextType>({
  theme: "purple",
  setTheme: () => {},
  themesList: THEMES_LIST,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeColor>("purple");

  useEffect(() => {
    const saved = localStorage.getItem("gst_theme") as ThemeColor;
    if (saved && THEMES_LIST.some((t) => t.id === saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "purple");
    }
  }, []);

  const setTheme = (newTheme: ThemeColor) => {
    setThemeState(newTheme);
    localStorage.setItem("gst_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themesList: THEMES_LIST }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
