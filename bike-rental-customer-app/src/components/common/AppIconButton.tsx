import React, { ReactNode } from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

interface AppIconButtonProps extends Omit<PressableProps, "style"> {
  icon: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "muted";
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: StyleProp<ViewStyle>;
}

const variantStyles = {
  primary: "bg-primary active:opacity-85 border-transparent text-primary-foreground",
  secondary: "bg-secondary active:opacity-85 border-transparent text-secondary-foreground",
  outline: "bg-card border border-border active:bg-muted",
  ghost: "bg-transparent active:bg-muted/40 border-transparent",
  muted: "bg-muted/60 active:bg-muted border border-border/40",
};

const sizeStyles = {
  sm: "w-8 h-8 rounded-lg",
  md: "w-10 h-10 rounded-xl",
  lg: "w-12 h-12 rounded-2xl",
};

export function AppIconButton({
  icon,
  variant = "outline",
  size = "md",
  className = "",
  style,
  disabled,
  ...props
}: AppIconButtonProps) {
  return (
    <Pressable
      className={`items-center justify-center ${variantStyles[variant]} ${sizeStyles[size]} ${
        disabled ? "opacity-50" : ""
      } ${className}`}
      style={style}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      {...props}
    >
      {icon}
    </Pressable>
  );
}

export default AppIconButton;
