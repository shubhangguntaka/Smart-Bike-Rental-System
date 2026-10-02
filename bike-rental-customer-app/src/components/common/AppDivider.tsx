import React from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";

interface AppDividerProps {
  label?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function AppDivider({ label, className = "", style }: AppDividerProps) {
  if (label) {
    return (
      <View
        className={`flex-row items-center my-4 ${className}`}
        style={style}
      >
        <View className="flex-1 h-[1px] bg-border" />
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-xs uppercase tracking-wider text-muted-foreground px-3"
        >
          {label}
        </Text>
        <View className="flex-1 h-[1px] bg-border" />
      </View>
    );
  }

  return (
    <View
      className={`w-full h-[1px] bg-border my-3 ${className}`}
      style={style}
    />
  );
}

export default AppDivider;
