import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  categoryBadge?: string;
  children: ReactNode;
}

export function AuthCard({
  title,
  subtitle,
  categoryBadge = "PREMIUM BIKE RENTAL",
  children,
}: AuthCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {categoryBadge ? (
          <Text style={styles.badgeText}>{categoryBadge}</Text>
        ) : null}

        <Text style={styles.titleText}>{title}</Text>

        {subtitle ? (
          <Text style={styles.subtitleText}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "rgba(10, 18, 36, 0.82)",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  badgeText: {
    fontFamily: "Antic",
    fontSize: 10,
    fontWeight: "700",
    color: "#CED4BF",
    letterSpacing: 2.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  titleText: {
    fontFamily: "Antic",
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  subtitleText: {
    fontFamily: "Antic",
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.72)",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  body: {
    width: "100%",
  },
});

export default AuthCard;
