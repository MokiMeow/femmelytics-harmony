
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "femmelytics-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  // Apply theme immediately when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      
      // Apply a specific attribute for deeper dark mode customization
      if (systemTheme === "dark") {
        root.setAttribute("data-enhanced-dark", "true");
        document.body.style.backgroundColor = "#1A1F2C";
      } else {
        root.removeAttribute("data-enhanced-dark");
        document.body.style.backgroundColor = "";
      }
      return;
    }

    root.classList.add(theme);
    
    // Apply a specific attribute for deeper dark mode customization
    if (theme === "dark") {
      root.setAttribute("data-enhanced-dark", "true");
      document.body.style.backgroundColor = "#1A1F2C";
    } else {
      root.removeAttribute("data-enhanced-dark");
      document.body.style.backgroundColor = "";
    }
    
    // Save theme to localStorage for persistence
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  // Listen for changes to the prefers-color-scheme media query
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        root.classList.add(systemTheme);
        
        // Apply a specific attribute for deeper dark mode customization
        if (systemTheme === "dark") {
          root.setAttribute("data-enhanced-dark", "true");
          document.body.style.backgroundColor = "#1A1F2C";
        } else {
          root.removeAttribute("data-enhanced-dark");
          document.body.style.backgroundColor = "";
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
