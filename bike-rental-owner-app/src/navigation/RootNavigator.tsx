import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { useAuthStore } from "../store/authStore";
import AuthNavigator from "./AuthNavigator";
import OwnerMainNavigator from "./OwnerMainNavigator";
import AppLoader from "../components/common/AppLoader";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return <AppLoader fullScreen message="Loading Bike Rental Owner..." />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={OwnerMainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default RootNavigator;
