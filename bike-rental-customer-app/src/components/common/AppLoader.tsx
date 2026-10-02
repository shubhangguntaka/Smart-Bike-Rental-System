import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useTheme } from "../../theme";

interface AppLoaderProps {
  message?: string;
  size?: "small" | "large";
  fullScreen?: boolean;
  color?: string;
  className?: string;
}

export function AppLoader({
  message,
  size = "large",
  fullScreen = false,
  color,
  className = "",
}: AppLoaderProps) {
  const { theme } = useTheme();
  const indicatorColor = color || theme.primary;
  const containerClass = fullScreen
    ? "flex-1 items-center justify-center bg-background p-6"
    : "items-center justify-center p-4";

  return (
    <View className={`${containerClass} ${className}`}>
      <ActivityIndicator size={size} color={indicatorColor} />
      {message && (
        <Text className="text-sm text-muted-foreground mt-3 text-center">
          {message}
        </Text>
      )}
    </View>
  );
}

export default AppLoader;
