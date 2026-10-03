import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OwnerStackParamList } from "./types";
import OwnerTabNavigator from "./OwnerTabNavigator";
import AddBikeScreen from "../screens/bikes/AddBikeScreen";
import EditBikeScreen from "../screens/bikes/EditBikeScreen";
import BikeDetailsScreen from "../screens/bikes/BikeDetailsScreen";
import BookingRequestsScreen from "../screens/bookings/BookingRequestsScreen";
import BookingDetailsScreen from "../screens/bookings/BookingDetailsScreen";
import CurrentRentalsScreen from "../screens/bookings/CurrentRentalsScreen";
import TrackBikeScreen from "../screens/tracking/TrackBikeScreen";
import QRScannerScreen from "../screens/bookings/QRScannerScreen";
import EarningsScreen from "../screens/earnings/EarningsScreen";
import TransactionHistoryScreen from "../screens/earnings/TransactionHistoryScreen";
import PaymentDetailsScreen from "../screens/earnings/PaymentDetailsScreen";
import ReviewsScreen from "../screens/reviews/ReviewsScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import BankAccountScreen from "../screens/profile/BankAccountScreen";
import VerificationScreen from "../screens/verification/VerificationScreen";
import DocumentsScreen from "../screens/verification/DocumentsScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import { useTheme } from "../theme";

const Stack = createNativeStackNavigator<OwnerStackParamList>();

export function OwnerMainNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="OwnerTabs"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="OwnerTabs" component={OwnerTabNavigator} />
      <Stack.Screen name="AddBikeScreen" component={AddBikeScreen} />
      <Stack.Screen name="EditBikeScreen" component={EditBikeScreen} />
      <Stack.Screen name="BikeDetailsScreen" component={BikeDetailsScreen} />
      <Stack.Screen name="BookingRequestsScreen" component={BookingRequestsScreen} />
      <Stack.Screen name="BookingDetailsScreen" component={BookingDetailsScreen} />
      <Stack.Screen name="CurrentRentalsScreen" component={CurrentRentalsScreen} />
      <Stack.Screen name="TrackBikeScreen" component={TrackBikeScreen} />
      <Stack.Screen name="QRScannerScreen" component={QRScannerScreen} />
      <Stack.Screen name="EarningsScreen" component={EarningsScreen} />
      <Stack.Screen name="TransactionHistoryScreen" component={TransactionHistoryScreen} />
      <Stack.Screen name="PaymentDetailsScreen" component={PaymentDetailsScreen} />
      <Stack.Screen name="ReviewsScreen" component={ReviewsScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="BankAccountScreen" component={BankAccountScreen} />
      <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
      <Stack.Screen name="DocumentsScreen" component={DocumentsScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default OwnerMainNavigator;
