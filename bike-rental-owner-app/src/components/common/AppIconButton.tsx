import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../theme";

export interface AppIconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  badge?: number;
  style?: ViewStyle;
}

export const AppIconButton: React.FC<AppIconButtonProps> = ({
  icon,
  onPress,
  size = 40,
  style,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: pressed
            ? isDark
              ? "#28282C"
              : "#EDEBE6"
            : "transparent",
        },
        style,
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {icon}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AppIconButton;
