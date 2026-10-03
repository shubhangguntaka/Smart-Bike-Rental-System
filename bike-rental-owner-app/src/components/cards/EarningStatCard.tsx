import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../theme";
import AppText from "../common/AppText";
import AppCard from "../common/AppCard";
import { formatCurrency } from "../../utils/formatters";

export interface EarningStatCardProps {
  title: string;
  amount?: number | string;
  icon?: React.ReactNode;
  subtitle?: string;
  variant?: "primary" | "secondary" | "neutral" | "accent";
  style?: ViewStyle;
}

export const EarningStatCard: React.FC<EarningStatCardProps> = ({
  title,
  amount,
  icon,
  subtitle,
  variant = "neutral",
  style,
}) => {
  const { theme, isDark } = useTheme();

  const formattedAmount =
    typeof amount === "number" ? formatCurrency(amount) : amount || "₹0";

  return (
    <AppCard style={[styles.card, style]}>
      <View style={styles.topRow}>
        <AppText variant="caption" color="muted" weight="600">
          {title}
        </AppText>
        {icon && <View style={styles.icon}>{icon}</View>}
      </View>
      <AppText variant="h2" weight="700" color="primary" style={styles.amount}>
        {formattedAmount}
      </AppText>
      {subtitle && (
        <AppText variant="caption" color="muted">
          {subtitle}
        </AppText>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  icon: {
    opacity: 0.85,
  },
  amount: {
    marginBottom: 4,
  },
});

export default EarningStatCard;
