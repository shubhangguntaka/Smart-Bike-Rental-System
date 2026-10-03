import React from "react";
import { View, ViewProps, StyleSheet, Pressable } from "react-native";
import { useTheme } from "../../theme";

export interface AppCardProps extends ViewProps {
  onPress?: () => void;
  elevated?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  style,
  onPress,
  elevated = true,
  ...props
}) => {
  const { theme, isDark } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.card,
      borderColor: theme.border,
      shadowColor: isDark ? "#000000" : "#1A1F2E",
    },
    elevated ? styles.elevated : null,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
        ]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginVertical: 6,
  },
  elevated: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
});

export default AppCard;
