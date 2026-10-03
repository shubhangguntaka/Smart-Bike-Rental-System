import "./global.css";

import React, { useEffect, useMemo } from "react";
import { View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts, Antic_400Regular } from "@expo-google-fonts/antic";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  DefaultTheme,
  DarkTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";

import RootNavigator from "./src/navigation/RootNavigator";
import ErrorBoundary from "./src/components/common/ErrorBoundary";
import { ThemeProvider, useTheme } from "./src/theme";

// Configure Reanimated Logger to suppress strict-mode render warnings
try {
  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
  });
} catch {
  // Ignore if unsupported in environment
}

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function AppContent() {
  const { isDark, theme } = useTheme();

  const customTheme = useMemo(
    () =>
      isDark
        ? {
            ...DarkTheme,
            colors: {
              ...DarkTheme.colors,
              background: theme.background,
              card: theme.card,
              text: theme.foreground,
              border: theme.border,
              primary: theme.primary,
              notification: theme.primary,
            },
          }
        : {
            ...DefaultTheme,
            colors: {
              ...DefaultTheme.colors,
              background: theme.background,
              card: theme.card,
              text: theme.foreground,
              border: theme.border,
              primary: theme.primary,
              notification: theme.primary,
            },
          },
    [isDark, theme]
  );

  return (
    <View
      className={isDark ? "dark flex-1" : "flex-1"}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <SafeAreaProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <QueryClientProvider client={queryClient}>
          <NavigationContainer theme={customTheme}>
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Antic: Antic_400Regular,
    JetBrainsMono: JetBrainsMono_400Regular,
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded || fontError) {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn("Failed to hide splash screen:", e);
        }
      }
    }
    prepare();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
