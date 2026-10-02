import React, { ReactNode } from "react";
import {
  Platform,
  RefreshControlProps,
  ScrollView,
  StatusBar,
  StatusBarStyle,
  StyleProp,
  StyleSheet,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, darkColors, useTheme } from "../../theme";

export interface AppScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: ("top" | "bottom" | "left" | "right")[];
  statusBarStyle?: StatusBarStyle;
  statusBarBg?: string;
  className?: string;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export function AppScreen({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  edges = ["top", "bottom", "left", "right"],
  statusBarStyle,
  statusBarBg,
  className = "",
  refreshControl,
}: AppScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const currentColors = theme;
  const barStyle: StatusBarStyle =
    statusBarStyle ?? (isDark ? "light-content" : "dark-content");

  const safePadding = {
    paddingTop: edges.includes("top") ? insets.top : 0,
    paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
    paddingLeft: edges.includes("left") ? insets.left : 0,
    paddingRight: edges.includes("right") ? insets.right : 0,
  };

  const backgroundColor = statusBarBg ?? currentColors.background;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        safePadding,
        style,
      ]}
      className={`flex-1 bg-background ${className}`}
    >
      <StatusBar
        barStyle={barStyle}
        backgroundColor="transparent"
        translucent
      />
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flexContent, contentContainerStyle]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  flexContent: {
    flex: 1,
  },
});

export default AppScreen;
