import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";
import { colors, ThemeColors } from "../theme/colors";
import { darkColors } from "../theme/darkColors";
import { themeStorage, ThemeMode } from "../services/themeStorage";

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  theme: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  isDark: false,
  theme: colors,
  setThemeMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    themeStorage.getThemeMode().then((saved) => {
      setModeState(saved);
    });
  }, []);

  const isDark = useMemo(() => {
    if (mode === "dark") return true;
    if (mode === "light") return false;
    return deviceColorScheme === "dark";
  }, [mode, deviceColorScheme]);

  const theme: ThemeColors = useMemo(() => {
    return isDark ? darkColors : colors;
  }, [isDark]);

  const setThemeMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    themeStorage.setThemeMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark, theme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export default ThemeContext;
