import React, { ReactNode, useContext } from "react";
import { View, Text, Pressable, useColorScheme } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { NavigationContext } from "@react-navigation/native";
import { colors, darkColors, useTheme } from "../../theme";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  transparent?: boolean;
  className?: string;
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  transparent = false,
  className = "",
}: AppHeaderProps) {
  const navigation = useContext(NavigationContext);
  const { theme, isDark } = useTheme();
  const currentColors = theme;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation && typeof navigation.canGoBack === "function" && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3 ${
        transparent
          ? "bg-transparent"
          : "bg-card border-b border-border/80"
      } ${className}`}
    >
      <View className="flex-row items-center flex-1 gap-3">
        {showBack && (
          <Pressable
            onPress={handleBack}
            className="p-2 rounded-xl bg-muted/50 active:bg-muted border border-border/60 justify-center items-center"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={20} color={currentColors.foreground} />
          </Pressable>
        )}

        {title && (
          <View className="flex-1">
            <Text
              style={{ fontFamily: "Antic", color: currentColors.foreground }}
              className="text-lg font-bold text-foreground"
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={{ fontFamily: "Antic", color: currentColors.mutedForeground }}
                className="text-xs text-muted-foreground font-medium"
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </View>

      {rightAction && <View className="ml-2">{rightAction}</View>}
    </View>
  );
}

export default AppHeader;
