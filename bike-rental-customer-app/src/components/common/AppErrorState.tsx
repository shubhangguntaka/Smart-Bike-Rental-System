import React from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
import { AlertCircle } from "lucide-react-native";
import { AppButton } from "./AppButton";
import { useTheme } from "../../theme";

interface AppErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function AppErrorState({
  title = "Something went wrong",
  message = "An error occurred while processing your request. Please try again.",
  onRetry,
  className = "",
  style,
}: AppErrorStateProps) {
  const { theme } = useTheme();
  return (
    <View
      className={`items-center justify-center p-6 rounded-2xl bg-destructive/5 border border-destructive/20 ${className}`}
      style={style}
    >
      <AlertCircle size={36} color={theme.destructive} className="mb-3" />
      <Text
        style={{ fontFamily: "Antic", color: theme.destructive }}
        className="text-base font-bold text-destructive text-center mb-1"
      >
        {title}
      </Text>
      <Text
        style={{ fontFamily: "Antic", color: theme.mutedForeground }}
        className="text-xs text-muted-foreground text-center mb-4 max-w-[260px]"
      >
        {message}
      </Text>
      {onRetry && (
        <AppButton
          title="Try Again"
          variant="outline"
          size="sm"
          onPress={onRetry}
        />
      )}
    </View>
  );
}

export default AppErrorState;
