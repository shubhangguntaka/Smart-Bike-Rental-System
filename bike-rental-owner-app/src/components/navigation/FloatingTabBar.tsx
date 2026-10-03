import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  DeviceEventEmitter,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  LayoutDashboard,
  Bike,
  CalendarCheck,
  TrendingUp,
  User,
} from "lucide-react-native";
import { useTabBarAnimation } from "../../context/TabBarAnimationContext";
import { useTheme } from "../../theme";

interface TabItemConfig {
  label: string;
  accessibilityLabel: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
}

const TAB_CONFIG: Record<string, TabItemConfig> = {
  DashboardTab: {
    label: "Dashboard",
    accessibilityLabel: "Owner Dashboard tab",
    Icon: LayoutDashboard,
  },
  MyBikesTab: {
    label: "My Bikes",
    accessibilityLabel: "My Bikes tab",
    Icon: Bike,
  },
  BookingsTab: {
    label: "Bookings",
    accessibilityLabel: "Bookings requests tab",
    Icon: CalendarCheck,
  },
  EarningsTab: {
    label: "Earnings",
    accessibilityLabel: "Earnings & Payments tab",
    Icon: TrendingUp,
  },
  ProfileTab: {
    label: "Profile",
    accessibilityLabel: "Owner Profile tab",
    Icon: User,
  },
};

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { theme, isDark } = useTheme();

  const anim = useTabBarAnimation();
  const collapseProgress = anim?.collapseProgress;

  const expandedWidth = Math.min(screenWidth - 32, 440);
  const collapsedWidth = Math.min(screenWidth * 0.62, 260);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const p = collapseProgress ? collapseProgress.value : 0;
    const width = interpolate(p, [0, 1], [expandedWidth, collapsedWidth]);
    const height = interpolate(p, [0, 1], [64, 54]);
    const borderRadius = interpolate(p, [0, 1], [32, 27]);
    const paddingHorizontal = interpolate(p, [0, 1], [6, 4]);

    return {
      width,
      height,
      borderRadius,
      paddingHorizontal,
    };
  }, [expandedWidth, collapsedWidth]);

  const labelAnimatedStyle = useAnimatedStyle(() => {
    const p = collapseProgress ? collapseProgress.value : 0;
    const opacity = interpolate(p, [0, 0.5, 1], [1, 0, 0]);
    const scale = interpolate(p, [0, 1], [1, 0.7]);
    const height = interpolate(p, [0, 1], [14, 0]);
    const marginTop = interpolate(p, [0, 1], [2, 0]);

    return {
      opacity,
      height,
      marginTop,
      transform: [{ scale }],
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const p = collapseProgress ? collapseProgress.value : 0;
    const scale = interpolate(p, [0, 1], [1, 1.08]);
    return {
      transform: [{ scale }],
    };
  });

  const bottomOffset = Math.max(insets.bottom + 10, 16);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.outerContainer,
        {
          bottom: bottomOffset,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.pillContainer,
          containerAnimatedStyle,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: isDark ? "#000000" : "#1A1F2E",
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] || {
            label: route.name,
            accessibilityLabel: route.name,
            Icon: LayoutDashboard,
          };
          const IconComponent = config.Icon;

          const onPress = () => {
            if (collapseProgress) {
              collapseProgress.value = withTiming(0, { duration: 220 });
            }

            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (isFocused) {
              DeviceEventEmitter.emit("SCROLL_TO_TOP_TAB", route.name);
            } else if (!event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const activeColor = theme.primary;
          const inactiveColor = isDark ? "#8A94A6" : "#6B7280";
          const iconColor = isFocused ? activeColor : inactiveColor;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={config.accessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabButton,
                isFocused && {
                  backgroundColor: isDark
                    ? "rgba(124, 144, 130, 0.22)"
                    : "rgba(124, 144, 130, 0.14)",
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Animated.View style={[styles.iconWrapper, iconAnimatedStyle]}>
                <IconComponent
                  size={20}
                  color={iconColor}
                  strokeWidth={isFocused ? 2.4 : 1.9}
                />
              </Animated.View>

              <Animated.View style={[styles.labelContainer, labelAnimatedStyle]}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tabLabel,
                    {
                      color: iconColor,
                      fontWeight: isFocused ? "700" : "600",
                    },
                  ]}
                >
                  {config.label}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    zIndex: 99,
  },
  pillContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    height: "100%",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
  },
  labelContainer: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontFamily: "Antic",
    fontSize: 10,
    letterSpacing: 0.2,
  },
});

export default FloatingTabBar;
