import React from "react";
import { View, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../theme";
import AppText from "./AppText";

export interface AppLoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: "small" | "large";
  style?: ViewStyle;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  message,
  fullScreen = false,
  size = "large",
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        fullScreen ? styles.fullScreen : styles.container,
        { backgroundColor: fullScreen ? theme.background : "transparent" },
        style,
      ]}
    >
      <ActivityIndicator size={size} color={theme.primary} />
      {message && (
        <AppText
          variant="bodySmall"
          color="muted"
          style={styles.message}
        >
          {message}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    marginTop: 12,
    textAlign: "center",
  },
});

export default AppLoader;
