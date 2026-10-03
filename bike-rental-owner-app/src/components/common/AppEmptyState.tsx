import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Inbox } from "lucide-react-native";
import { useTheme } from "../../theme";
import AppText from "./AppText";
import AppButton from "./AppButton";

export interface AppEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  icon,
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.muted }]}>
        {icon || <Inbox size={36} color={theme.primary} />}
      </View>
      <AppText variant="h3" weight="700" style={styles.title}>
        {title}
      </AppText>
      {description && (
        <AppText
          variant="body"
          color="muted"
          style={styles.description}
        >
          {description}
        </AppText>
      )}
      {actionTitle && onAction && (
        <AppButton
          title={actionTitle}
          onPress={onAction}
          style={styles.actionButton}
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
  actionButton: {
    minWidth: 160,
  },
});

export default AppEmptyState;
