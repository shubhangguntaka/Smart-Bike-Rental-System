import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { OwnerTabParamList } from "./types";
import FloatingTabBar from "../components/navigation/FloatingTabBar";
import { TabBarAnimationProvider } from "../context/TabBarAnimationContext";
import { useTheme } from "../theme";

import OwnerDashboardScreen from "../screens/dashboard/OwnerDashboardScreen";
import MyBikesScreen from "../screens/bikes/MyBikesScreen";
import BookingRequestsScreen from "../screens/bookings/BookingRequestsScreen";
import EarningsScreen from "../screens/earnings/EarningsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

const Tab = createBottomTabNavigator<OwnerTabParamList>();

export function OwnerTabNavigator() {
  const { theme } = useTheme();

  return (
    <TabBarAnimationProvider>
      <Tab.Navigator
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: theme.background },
        }}
      >
        <Tab.Screen name="DashboardTab" component={OwnerDashboardScreen} />
        <Tab.Screen name="MyBikesTab" component={MyBikesScreen} />
        <Tab.Screen name="BookingsTab" component={BookingRequestsScreen} />
        <Tab.Screen name="EarningsTab" component={EarningsScreen} />
        <Tab.Screen name="ProfileTab" component={ProfileScreen} />
      </Tab.Navigator>
    </TabBarAnimationProvider>
  );
}

export default OwnerTabNavigator;
