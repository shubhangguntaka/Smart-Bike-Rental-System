import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { colors, darkColors } from "../theme";
import type { ThemeColors } from "../theme/colors";
import { themeStorage, ThemeMode } from "../services/themeStorage";

interface ThemeContextType {
  themeMode: ThemeMode;
  resolvedTheme: "light" | "dark";
  isDark: boolean;
  theme: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [themeMode, setLocalThemeMode] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    async function loadTheme() {
      const saved = await themeStorage.getThemeMode();
      setLocalThemeMode(saved);
      setIsLoaded(true);
    }
    loadTheme();
  }, []);

  const resolvedTheme: "light" | "dark" = useMemo(() => {
    if (themeMode === "system") {
      return systemColorScheme === "dark" ? "dark" : "light";
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  // Sync NativeWind color scheme
  useEffect(() => {
    setColorScheme(themeMode === "system" ? "system" : resolvedTheme);
  }, [themeMode, resolvedTheme, setColorScheme]);

  const isDark = resolvedTheme === "dark";
  const theme = isDark ? darkColors : colors;

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setLocalThemeMode(mode);
    await themeStorage.setThemeMode(mode);
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextMode: ThemeMode =
      themeMode === "light"
        ? "dark"
        : themeMode === "dark"
        ? "system"
        : "light";
    await setThemeMode(nextMode);
  }, [themeMode, setThemeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      resolvedTheme,
      isDark,
      theme,
      setThemeMode,
      toggleTheme,
    }),
    [themeMode, resolvedTheme, isDark, theme, setThemeMode, toggleTheme]
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
    // Fallback safe defaults if used outside provider
    return {
      themeMode: "system" as ThemeMode,
      resolvedTheme: "light" as const,
      isDark: false,
      theme: colors,
      setThemeMode: async () => {},
      toggleTheme: async () => {},
    };
  }
  return context;
}

export default ThemeContext;
