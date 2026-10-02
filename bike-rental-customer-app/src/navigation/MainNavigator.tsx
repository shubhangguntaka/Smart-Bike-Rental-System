import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FloatingTabBar from "../components/navigation/FloatingTabBar";

// Screen Components
import HomeScreen from "../screens/home/HomeScreen";
import ExploreBikesScreen from "../screens/bikes/ExploreBikesScreen";
import BookingsScreen from "../screens/booking/BookingsScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import BikeDetailsScreen from "../screens/bikes/BikeDetailsScreen";
import BookingScreen from "../screens/booking/BookingScreen";
import BookingDetailsScreen from "../screens/booking/BookingDetailsScreen";
import BookingQRCodeScreen from "../screens/booking/BookingQRCodeScreen";
import PaymentScreen from "../screens/payment/PaymentScreen";
import PaymentSuccessScreen from "../screens/payment/PaymentSuccessScreen";
import PaymentFailedScreen from "../screens/payment/PaymentFailedScreen";
import PaymentHistoryScreen from "../screens/payment/PaymentHistoryScreen";
import PaymentDetailsScreen from "../screens/payment/PaymentDetailsScreen";
import InvoiceScreen from "../screens/payment/InvoiceScreen";
import MapExploreScreen from "../screens/maps/MapExploreScreen";
import LiveTrackingScreen from "../screens/maps/LiveTrackingScreen";
import RideHistoryScreen from "../screens/maps/RideHistoryScreen";
import VerificationScreen from "../screens/verification/VerificationScreen";
import ReviewsScreen from "../screens/reviews/ReviewsScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import ChangePasswordScreen from "../screens/profile/ChangePasswordScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";

// Types
import { Bike } from "../types/bike";
import { Booking } from "../types/booking";
import { PaymentResponse } from "../types/payment";

export type CustomerTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  BookingsTab: undefined;
  PaymentsTab: undefined;
  ProfileTab: undefined;
};

export type CustomerStackParamList = {
  CustomerTabs: undefined;
  NotificationsScreen: undefined;
  BikeDetailsScreen: { bikeId?: number; bike?: Bike };
  BookingScreen: { bikeId?: number; bike?: Bike };
  BookingDetailsScreen: { bookingId?: number; booking?: Booking };
  BookingQRCodeScreen: { bookingId?: number; booking?: Booking };
  PaymentScreen: { bookingId?: number; booking?: Booking };
  PaymentSuccessScreen: { payment?: PaymentResponse };
  PaymentFailedScreen: {
    paymentId?: number;
    bookingId?: number;
    message?: string;
  };
  PaymentHistoryScreen: undefined;
  PaymentDetailsScreen: { paymentId: number; payment?: PaymentResponse };
  InvoiceScreen: { paymentId: number };
  MapExploreScreen: undefined;
  LiveTrackingScreen: { bookingId?: number; booking?: Booking };
  RideHistoryScreen: undefined;
  VerificationScreen: undefined;
  ReviewsScreen: undefined;
  EditProfileScreen: undefined;
  ChangePasswordScreen: undefined;
  SettingsScreen: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const Stack = createNativeStackNavigator<CustomerStackParamList>();

import { useTheme } from "../theme";
import { TabBarAnimationProvider } from "../context/TabBarAnimationContext";

function CustomerTabNavigator() {
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
        <Tab.Screen name="HomeTab" component={HomeScreen} />
        <Tab.Screen name="SearchTab" component={ExploreBikesScreen} />
        <Tab.Screen name="BookingsTab" component={BookingsScreen} />
        <Tab.Screen name="PaymentsTab" component={PaymentHistoryScreen} />
        <Tab.Screen name="ProfileTab" component={ProfileScreen} />
      </Tab.Navigator>
    </TabBarAnimationProvider>
  );
}

export function MainNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="CustomerTabs"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      <Stack.Screen name="BikeDetailsScreen" component={BikeDetailsScreen} />
      <Stack.Screen name="BookingScreen" component={BookingScreen} />
      <Stack.Screen name="BookingDetailsScreen" component={BookingDetailsScreen} />
      <Stack.Screen name="BookingQRCodeScreen" component={BookingQRCodeScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} />
      <Stack.Screen name="PaymentFailedScreen" component={PaymentFailedScreen} />
      <Stack.Screen name="PaymentHistoryScreen" component={PaymentHistoryScreen} />
      <Stack.Screen name="PaymentDetailsScreen" component={PaymentDetailsScreen} />
      <Stack.Screen name="InvoiceScreen" component={InvoiceScreen} />
      <Stack.Screen name="MapExploreScreen" component={MapExploreScreen} />
      <Stack.Screen name="LiveTrackingScreen" component={LiveTrackingScreen} />
      <Stack.Screen name="RideHistoryScreen" component={RideHistoryScreen} />
      <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
      <Stack.Screen name="ReviewsScreen" component={ReviewsScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default MainNavigator;
