import React from "react";
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from "react-native";
import { useTheme } from "../../theme";
import AppText from "./AppText";

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  leftIcon,
  rightIcon,
  className,
  style,
  textStyle,
}) => {
  const { theme, isDark } = useTheme();

  const actualLeftIcon = leftIcon || (iconPosition === "left" ? icon : null);
  const actualRightIcon = rightIcon || (iconPosition === "right" ? icon : null);

  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return isDark ? "#28282C" : "#EDEBE6";
    switch (variant) {
      case "primary":
        return pressed ? "#687D6E" : theme.primary;
      case "secondary":
        return pressed ? (isDark ? "#36363A" : "#DDE0D6") : theme.secondary;
      case "destructive":
        return pressed ? "#A8322E" : theme.destructive;
      case "outline":
      case "ghost":
        return pressed
          ? isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.04)"
          : "transparent";
      default:
        return theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return isDark ? "#666" : "#999";
    switch (variant) {
      case "primary":
      case "destructive":
        return "#FFFFFF";
      case "secondary":
        return theme.secondaryForeground;
      case "outline":
        return theme.primary;
      case "ghost":
        return theme.foreground;
      default:
        return "#FFFFFF";
    }
  };

  const getHeight = () => {
    switch (size) {
      case "sm":
        return 36;
      case "lg":
        return 52;
      case "md":
      default:
        return 44;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          height: getHeight(),
          backgroundColor: getBackgroundColor(pressed),
          borderColor: variant === "outline" ? theme.border : "transparent",
          borderWidth: variant === "outline" ? 1 : 0,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" || variant === "ghost" ? theme.primary : "#FFFFFF"}
        />
      ) : (
        <View style={styles.contentRow}>
          {actualLeftIcon && <View style={styles.iconLeft}>{actualLeftIcon}</View>}
          <AppText
            variant={size === "sm" ? "bodySmall" : "body"}
            weight="600"
            style={[{ color: getTextColor() }, textStyle]}
          >
            {title}
          </AppText>
          {actualRightIcon && <View style={styles.iconRight}>{actualRightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    flexDirection: "row",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default AppButton;
