import React, { ReactNode } from "react";
import { StyleProp, Text, TextProps, TextStyle } from "react-native";
import { useTheme } from "../../theme";

export type TextVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body"
  | "bodySm"
  | "caption"
  | "mono"
  | "label";

interface AppTextProps extends TextProps {
  children: ReactNode;
  variant?: TextVariant;
  className?: string;
  style?: StyleProp<TextStyle>;
  color?: "foreground" | "muted" | "primary" | "secondary" | "destructive" | "accent";
}

const variantStyles: Record<TextVariant, string> = {
  display: "text-4xl font-bold font-sans tracking-tight leading-tight",
  h1: "text-3xl font-bold font-sans tracking-tight",
  h2: "text-2xl font-bold font-sans",
  h3: "text-xl font-semibold font-sans",
  h4: "text-lg font-semibold font-sans",
  body: "text-base font-normal font-sans leading-relaxed",
  bodySm: "text-sm font-normal font-sans",
  caption: "text-xs font-normal font-sans text-muted-foreground",
  mono: "text-sm font-mono tracking-wide",
  label: "text-xs font-semibold uppercase tracking-widest text-primary",
};

const colorStyles: Record<NonNullable<AppTextProps["color"]>, string> = {
  foreground: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  secondary: "text-secondary-foreground",
  destructive: "text-destructive",
  accent: "text-accent-foreground",
};

export function AppText({
  children,
  variant = "body",
  color = "foreground",
  className = "",
  style,
  ...props
}: AppTextProps) {
  const { theme } = useTheme();
  const variantClass = variantStyles[variant];

  const getTextColor = () => {
    switch (color) {
      case "foreground":
        return theme.foreground;
      case "muted":
        return theme.mutedForeground;
      case "primary":
        return theme.primary;
      case "secondary":
        return theme.secondaryForeground;
      case "destructive":
        return theme.destructive;
      case "accent":
        return theme.accentForeground;
      default:
        return theme.foreground;
    }
  };

  return (
    <Text
      style={[
        {
          fontFamily: variant === "mono" ? "JetBrainsMono" : "Antic",
          color: getTextColor(),
        },
        style,
      ]}
      className={`${variantClass} ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}

export default AppText;
