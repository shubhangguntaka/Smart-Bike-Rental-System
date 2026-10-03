import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "../../theme";
import AppText from "./AppText";

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightAction,
}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.header, { borderBottomColor: theme.border }]}>
      <View style={styles.leftContainer}>
        {showBack && (
          <Pressable
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color={theme.foreground} />
          </Pressable>
        )}
        <View style={styles.titleContainer}>
          <AppText variant="h3" weight="700" numberOfLines={1}>
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="caption" color="muted" numberOfLines={1}>
              {subtitle}
            </AppText>
          )}
        </View>
      </View>
      {rightAction && <View style={styles.rightContainer}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  titleContainer: {
    flex: 1,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
});

export default AppHeader;
