import React, { ReactNode } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
import { AppButton } from "./AppButton";
import { useTheme } from "../../theme";

interface AppEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function AppEmptyState({
  icon,
  title,
  description,
  actionTitle,
  onAction,
  className = "",
  style,
}: AppEmptyStateProps) {
  const { theme } = useTheme();
  return (
    <View
      className={`items-center justify-center p-8 rounded-2xl bg-card border border-border ${className}`}
      style={style}
    >
      {icon && <View className="mb-4">{icon}</View>}
      <Text
        style={{ fontFamily: "Antic", color: theme.foreground }}
        className="text-lg font-bold text-foreground text-center mb-1"
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{ fontFamily: "Antic", color: theme.mutedForeground }}
          className="text-sm text-muted-foreground text-center mb-5 max-w-[280px]"
        >
          {description}
        </Text>
      )}
      {actionTitle && onAction && (
        <AppButton
          title={actionTitle}
          variant="primary"
          size="sm"
          onPress={onAction}
        />
      )}
    </View>
  );
}

export default AppEmptyState;
