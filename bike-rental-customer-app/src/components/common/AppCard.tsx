import React, { ReactNode } from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { shadows, useTheme } from "../../theme";

interface AppCardProps extends Omit<PressableProps, "style"> {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  interactive?: boolean;
  elevation?: "none" | "xs" | "sm" | "md" | "lg";
}

export function AppCard({
  children,
  className = "",
  style,
  interactive = false,
  elevation = "sm",
  ...props
}: AppCardProps) {
  const { theme } = useTheme();
  const shadowStyle = elevation !== "none" ? shadows[elevation] : {};

  const baseStyle: ViewStyle = {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: 1,
  };

  if (interactive) {
    return (
      <Pressable
        className={`rounded-xl p-4 active:opacity-95 ${className}`}
        style={[baseStyle, shadowStyle, style]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      className={`rounded-xl p-4 ${className}`}
      style={[baseStyle, shadowStyle, style]}
    >
      {children}
    </View>
  );
}

export default AppCard;

