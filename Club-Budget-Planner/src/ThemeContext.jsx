import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const THEMES = ["light", "dark", "light-dark-sidebar"];

function getInitialTheme() {
  const saved = localStorage.getItem("cv-theme");

  if (THEMES.includes(saved)) {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cv-theme", theme);
  }, [theme]);

  // Cycles:
  // light → dark → light-dark-sidebar → light
  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const currentIndex = THEMES.indexOf(currentTheme);
      const nextIndex = (currentIndex + 1) % THEMES.length;

      return THEMES[nextIndex];
    });
  };

  const setThemeMode = (newTheme) => {
    if (THEMES.includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: setThemeMode,
        toggleTheme,
        themes: THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error("useTheme must be used inside a <ThemeProvider>");
  }

  return ctx;
}