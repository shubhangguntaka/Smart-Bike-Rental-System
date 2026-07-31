import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { storage } from "@/utils/storage";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const getSystemTheme = (): "light" | "dark" => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = storage.getTheme();

    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    ) {
      return savedTheme;
    }

    return "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    getSystemTheme()
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const currentTheme =
        theme === "system" ? getSystemTheme() : theme;

      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(currentTheme);

      setResolvedTheme(currentTheme);
    };

    applyTheme();

    const handleChange = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    media.addEventListener("change", handleChange);

    storage.setTheme(theme);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      switch (prev) {
        case "system":
          return "light";
        case "light":
          return "dark";
        default:
          return "system";
      }
    });
  };

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
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