import React from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme";

export interface AppScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  withTopInset?: boolean;
  withBottomInset?: boolean;
  onScroll?: any;
  scrollRef?: any;
}

export const AppScreen: React.FC<AppScreenProps> = ({
  children,
  scrollable = true,
  refreshing = false,
  onRefresh,
  style,
  contentContainerStyle,
  withTopInset = true,
  withBottomInset = false,
  onScroll,
  scrollRef,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: withTopInset ? insets.top : 0,
    paddingBottom: withBottomInset ? insets.bottom : 0,
  };

  if (scrollable) {
    return (
      <View style={[containerStyle, style]}>
        <Animated.ScrollView
          ref={scrollRef}
          onScroll={onScroll}
          scrollEventThrottle={onScroll ? 16 : undefined}
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.primary}
                colors={[theme.primary]}
              />
            ) : undefined
          }
        >
          {children}
        </Animated.ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[containerStyle, style]}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 90, // Leave room for floating bottom tab bar
  },
});

export default AppScreen;

