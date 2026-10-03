import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../theme";
import AppText from "./AppText";

export interface AppBadgeProps {
  label: string;
  variant?: "success" | "warning" | "error" | "info" | "neutral" | "primary";
  size?: "sm" | "md";
  style?: ViewStyle;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  variant = "neutral",
  size = "md",
  style,
}) => {
  const { theme, isDark } = useTheme();

  const getColors = () => {
    switch (variant) {
      case "success":
        return {
          bg: isDark ? "rgba(34, 197, 94, 0.18)" : "#DEF7EC",
          text: isDark ? "#4ADE80" : "#03543F",
        };
      case "warning":
        return {
          bg: isDark ? "rgba(234, 179, 8, 0.18)" : "#FEF3C7",
          text: isDark ? "#FACC15" : "#92400E",
        };
      case "error":
        return {
          bg: isDark ? "rgba(239, 68, 68, 0.18)" : "#FDE8E8",
          text: isDark ? "#F87171" : "#9B1C1C",
        };
      case "info":
        return {
          bg: isDark ? "rgba(59, 130, 246, 0.18)" : "#E1EFFE",
          text: isDark ? "#60A5FA" : "#1E429F",
        };
      case "primary":
        return {
          bg: isDark ? "rgba(124, 144, 130, 0.22)" : "#E6E9DF",
          text: theme.primary,
        };
      case "neutral":
      default:
        return {
          bg: isDark ? "#28282C" : "#EDEBE6",
          text: theme.mutedForeground,
        };
    }
  };

  const { bg, text } = getColors();

  return (
    <View
      style={[
        styles.badge,
        size === "sm" ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: bg },
        style,
      ]}
    >
      <AppText
        variant={size === "sm" ? "caption" : "bodySmall"}
        weight="600"
        style={{ color: text }}
      >
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});

export default AppBadge;
