import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";

export type ButtonVariant = "primary" | "secondary" | "outline" | "destructive" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface AppButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

const variantContainerStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary active:opacity-90 border-transparent",
  secondary: "bg-secondary active:opacity-90 border-transparent",
  outline: "bg-transparent border border-border active:bg-muted/40",
  destructive: "bg-destructive active:opacity-90 border-transparent",
  ghost: "bg-transparent active:bg-muted/30 border-transparent",
};

const variantTextStyles: Record<ButtonVariant, string> = {
  primary: "text-primary-foreground font-semibold",
  secondary: "text-secondary-foreground font-semibold",
  outline: "text-foreground font-semibold",
  destructive: "text-destructive-foreground font-semibold",
  ghost: "text-foreground font-medium",
};

const sizeContainerStyles: Record<ButtonSize, string> = {
  sm: "py-2 px-3 rounded-md",
  md: "py-3 px-5 rounded-lg",
  lg: "py-4 px-6 rounded-xl",
};

const sizeTextStyles: Record<ButtonSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function AppButton({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = "",
  style,
  ...props
}: AppButtonProps) {
  const containerClass = variantContainerStyles[variant];
  const textClass = variantTextStyles[variant];
  const sizeContClass = sizeContainerStyles[size];
  const sizeTxtClass = sizeTextStyles[size];
  const isDisabled = disabled || loading;

  const spinnerColor =
    variant === "primary"
      ? "#FFFFFF"
      : variant === "destructive"
      ? "#FFFFFF"
      : "#7C9082";

  return (
    <Pressable
      disabled={isDisabled}
      className={`flex-row items-center justify-center ${containerClass} ${sizeContClass} ${
        isDisabled ? "opacity-60" : ""
      } ${className}`}
      style={style}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} className="mr-2" />
      ) : (
        leftIcon && <View className="mr-2">{leftIcon}</View>
      )}
      <Text
        style={{ fontFamily: "Antic" }}
        className={`${textClass} ${sizeTxtClass} text-center`}
      >
        {title}
      </Text>
      {!loading && rightIcon && <View className="ml-2">{rightIcon}</View>}
    </Pressable>
  );
}

export default AppButton;
