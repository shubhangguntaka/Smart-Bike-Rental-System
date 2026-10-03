import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { useTheme } from "../../theme";
import AppText from "./AppText";
import AppButton from "./AppButton";

export interface AppErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const AppErrorState: React.FC<AppErrorStateProps> = ({
  title = "Something went wrong",
  message = "Failed to load data. Please check your network connection and try again.",
  onRetry,
  style,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDark
              ? "rgba(239, 68, 68, 0.18)"
              : "#FDE8E8",
          },
        ]}
      >
        <AlertTriangle size={36} color={theme.destructive} />
      </View>
      <AppText variant="h3" weight="700" style={styles.title}>
        {title}
      </AppText>
      <AppText
        variant="body"
        color="muted"
        style={styles.description}
      >
        {message}
      </AppText>
      {onRetry && (
        <AppButton
          title="Try Again"
          onPress={onRetry}
          variant="outline"
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginVertical: 20,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    textAlign: "center",
    marginBottom: 20,
    maxWidth: 280,
  },
  retryButton: {
    minWidth: 140,
  },
});

export default AppErrorState;
