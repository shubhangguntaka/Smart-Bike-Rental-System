import React from "react";
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from "react-native";
import { useTheme } from "../../theme";

export interface AppTextProps extends RNTextProps {
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "body"
    | "bodySmall"
    | "caption"
    | "mono";
  color?: "foreground" | "muted" | "primary" | "destructive" | "cardForeground" | string;
  weight?: "400" | "500" | "600" | "700";
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  variant = "body",
  color = "foreground",
  weight,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const getTextColor = () => {
    switch (color) {
      case "foreground":
        return theme.foreground;
      case "muted":
        return theme.mutedForeground;
      case "primary":
        return theme.primary;
      case "destructive":
        return theme.destructive;
      case "cardForeground":
        return theme.cardForeground;
      default:
        return color;
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case "h1":
        return { fontFamily: "Antic", fontSize: 26, lineHeight: 32, fontWeight: "700" as const };
      case "h2":
        return { fontFamily: "Antic", fontSize: 20, lineHeight: 26, fontWeight: "700" as const };
      case "h3":
        return { fontFamily: "Antic", fontSize: 17, lineHeight: 22, fontWeight: "600" as const };
      case "bodySmall":
        return { fontFamily: "Antic", fontSize: 13, lineHeight: 18, fontWeight: "400" as const };
      case "caption":
        return { fontFamily: "Antic", fontSize: 11, lineHeight: 15, fontWeight: "400" as const };
      case "mono":
        return { fontFamily: "JetBrainsMono", fontSize: 13, lineHeight: 18, fontWeight: "400" as const };
      case "body":
      default:
        return { fontFamily: "Antic", fontSize: 15, lineHeight: 20, fontWeight: "400" as const };
    }
  };

  return (
    <RNText
      style={[
        getVariantStyle(),
        { color: getTextColor() },
        weight ? { fontWeight: weight } : null,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

export default AppText;
