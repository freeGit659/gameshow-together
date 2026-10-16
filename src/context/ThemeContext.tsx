"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeColor = "yellow" | "pink" | "mint" | "sky" | "purple" | "orange";

interface ThemeContextType {
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  themesList: { id: ThemeColor; name: string; hex: string; bgClass: string; borderClass: string }[];
}

const THEMES_LIST: { id: ThemeColor; name: string; hex: string; bgClass: string; borderClass: string }[] = [
  { id: "yellow", name: "Vàng Bơ (Chuẩn)", hex: "#FDE047", bgClass: "bg-yellow-300", borderClass: "border-yellow-400" },
  { id: "pink", name: "Hồng Kẹo Ngọt", hex: "#F472B6", bgClass: "bg-pink-400", borderClass: "border-pink-500" },
  { id: "mint", name: "Xanh Bạc Hà", hex: "#86EFAC", bgClass: "bg-emerald-300", borderClass: "border-emerald-400" },
  { id: "sky", name: "Xanh Da Trời", hex: "#93C5FD", bgClass: "bg-sky-300", borderClass: "border-sky-400" },
  { id: "purple", name: "Tím Hoa Cà", hex: "#C084FC", bgClass: "bg-purple-300", borderClass: "border-purple-400" },
  { id: "orange", name: "Cam Đào Retro", hex: "#FB923C", bgClass: "bg-orange-300", borderClass: "border-orange-400" },
];

const ThemeContext = createContext<ThemeContextType>({
  theme: "yellow",
  setTheme: () => {},
  themesList: THEMES_LIST,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeColor>("yellow");

  useEffect(() => {
    const saved = localStorage.getItem("gst_theme_pastel") as ThemeColor;
    if (saved && THEMES_LIST.some((t) => t.id === saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "yellow");
    }
  }, []);

  const setTheme = (newTheme: ThemeColor) => {
    setThemeState(newTheme);
    localStorage.setItem("gst_theme_pastel", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themesList: THEMES_LIST }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
