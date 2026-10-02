import React, { ReactNode } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Source of truth: Existing website asset copied to assets/images/bike.jpeg
const BIKE_HERO_IMAGE = require("../../../assets/images/bike.jpeg");

interface AuthBackgroundProps {
  children: ReactNode;
  showTopBadge?: boolean;
}

export function AuthBackground({
  children,
  showTopBadge = true,
}: AuthBackgroundProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ImageBackground
        source={BIKE_HERO_IMAGE}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark Cinematic Vignette & Gradient Overlay */}
        <View style={styles.overlayGradientTop} />
        <View style={styles.overlayGradientBottom} />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: insets.top + 16,
                paddingBottom: insets.bottom + 16,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Top Floating Brand Badge */}
            {showTopBadge && (
              <View style={styles.topBadgeContainer}>
                <View style={styles.topBadge}>
                  <Text style={styles.topBadgeText}>
                    BIKE RENTAL SYSTEM
                  </Text>
                </View>
              </View>
            )}

            {/* Main Interactive Auth Card Content (Vertically & Horizontally Centered) */}
            <View style={styles.contentWrapper}>{children}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060C19",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlayGradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(6, 12, 25, 0.45)",
  },
  overlayGradientBottom: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(6, 12, 25, 0.55)",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  topBadgeContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  topBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: "rgba(124, 144, 130, 0.45)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  topBadgeText: {
    fontFamily: "Antic",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.5,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AuthBackground;
