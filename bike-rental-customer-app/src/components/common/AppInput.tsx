import React, { ReactNode, useState } from "react";
import {
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../theme";

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  className?: string;
}

export function AppInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  className = "",
  placeholderTextColor,
  onFocus,
  onBlur,
  ...props
}: AppInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { theme, isDark } = useTheme();

  const getBorderColor = () => {
    if (error) return theme.destructive || "#EF4444";
    if (isFocused) return theme.primary || "#7C9082";
    return theme.border || (isDark ? "#2A2A2A" : "#E5E7EB");
  };

  const getBackgroundColor = () => {
    if (error) return isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.05)";
    return theme.card || (isDark ? "#121212" : "#FFFFFF");
  };

  return (
    <View className={`w-full mb-4 ${className}`} style={containerStyle}>
      {label && (
        <Text
          style={{ fontFamily: "Antic", color: theme.foreground }}
          className="text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5"
        >
          {label}
        </Text>
      )}

      <View
        className="flex-row items-center rounded-xl px-3.5 py-2.5"
        style={{
          borderWidth: isFocused ? 1.5 : 1,
          borderColor: getBorderColor(),
          backgroundColor: getBackgroundColor(),
        }}
      >
        {leftIcon && <View className="mr-2.5">{leftIcon}</View>}

        <TextInput
          style={[
            {
              fontFamily: "Antic",
              color: theme.foreground,
              flex: 1,
              paddingVertical: 2,
              fontSize: 15,
            },
            inputStyle,
          ]}
          placeholderTextColor={placeholderTextColor ?? theme.mutedForeground}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />

        {rightIcon && <View className="ml-2.5">{rightIcon}</View>}
      </View>

      {error ? (
        <Text
          style={{ fontFamily: "Antic", color: theme.destructive || "#EF4444" }}
          className="text-xs text-destructive mt-1"
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text
          style={{ fontFamily: "Antic", color: theme.mutedForeground }}
          className="text-xs text-muted-foreground mt-1"
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

export default AppInput;
