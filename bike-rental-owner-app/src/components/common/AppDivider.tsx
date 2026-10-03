import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../theme";

export interface AppDividerProps {
  style?: ViewStyle;
  vertical?: boolean;
}

export const AppDivider: React.FC<AppDividerProps> = ({
  style,
  vertical = false,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        { backgroundColor: theme.border },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: "100%",
    marginVertical: 12,
  },
  vertical: {
    width: 1,
    height: "100%",
    marginHorizontal: 12,
  },
});

export default AppDivider;
