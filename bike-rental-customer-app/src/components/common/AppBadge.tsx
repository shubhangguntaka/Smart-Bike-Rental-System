import React, { ReactNode } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "destructive"
  | "outline"
  | "muted";

interface AppBadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

const variantStyles: Record<
  BadgeVariant,
  { container: string; text: string }
> = {
  primary: {
    container: "bg-primary/15 border-primary/30",
    text: "text-primary font-semibold",
  },
  secondary: {
    container: "bg-secondary border-secondary/40",
    text: "text-secondary-foreground font-semibold",
  },
  accent: {
    container: "bg-accent/20 border-accent/40",
    text: "text-accent-foreground font-semibold",
  },
  destructive: {
    container: "bg-destructive/15 border-destructive/30",
    text: "text-destructive font-semibold",
  },
  outline: {
    container: "bg-transparent border-border",
    text: "text-foreground font-medium",
  },
  muted: {
    container: "bg-muted border-border",
    text: "text-muted-foreground font-medium",
  },
};

export function AppBadge({
  label,
  variant = "primary",
  icon,
  className = "",
  style,
}: AppBadgeProps) {
  const { container, text } = variantStyles[variant];

  return (
    <View
      className={`flex-row items-center self-start border rounded-full px-2.5 py-0.5 ${container} ${className}`}
      style={style}
    >
      {icon && <View className="mr-1">{icon}</View>}
      <Text
        style={{ fontFamily: "Antic" }}
        className={`text-xs tracking-wider uppercase ${text}`}
      >
        {label}
      </Text>
    </View>
  );
}

export default AppBadge;
