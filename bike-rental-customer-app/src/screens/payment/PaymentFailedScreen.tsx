import React from "react";
import { View, Text, ScrollView } from "react-native";
import { XCircle, RotateCcw, Home, AlertCircle } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import { useTheme } from "../../theme";

export default function PaymentFailedScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();

  const bookingId = route.params?.bookingId;
  const paymentId = route.params?.paymentId;
  const errorMessage =
    route.params?.message || "Your payment could not be verified by the bank.";

  return (
    <AppScreen edges={["top", "bottom"]} scrollable={false} className="p-6 justify-between">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ alignItems: "center", paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-24 h-24 rounded-full bg-rose-500/15 border-2 border-rose-500/30 items-center justify-center mb-6">
          <XCircle size={54} color="#E11D48" />
        </View>

        <Text
          style={{ fontFamily: "Antic" }}
          className="text-2xl font-black text-foreground text-center"
        >
          Payment Failed
        </Text>

        <Text
          style={{ fontFamily: "Antic" }}
          className="text-xs text-muted-foreground text-center mt-2 max-w-xs leading-relaxed"
        >
          We were unable to complete your transaction. No charges have been deducted from your account.
        </Text>

        {/* Error Info Card */}
        <View className="w-full bg-card rounded-3xl border border-destructive/20 shadow-xs p-5 mt-6 space-y-3">
          <View className="flex-row items-center gap-2 pb-2 border-b border-border/60">
            <AlertCircle size={16} color="#E11D48" />
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs font-bold text-destructive"
            >
              Failure Details
            </Text>
          </View>

          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs text-foreground/90 leading-relaxed"
          >
            {errorMessage}
          </Text>

          {bookingId && (
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-[10px] text-muted-foreground pt-1"
            >
              Booking Reference: BR-{bookingId}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Buttons */}
      <View className="space-y-3 pt-4">
        {bookingId && (
          <AppButton
            title="Try Payment Again"
            variant="primary"
            size="lg"
            leftIcon={<RotateCcw size={16} color="#FFFFFF" />}
            onPress={() =>
              navigation.replace("PaymentScreen", {
                bookingId,
                paymentId,
              })
            }
          />
        )}

        <AppButton
          title="Return to Home"
          variant="outline"
          size="lg"
          leftIcon={<Home size={16} color={theme.foreground} />}
          onPress={() => navigation.navigate("HomeTab")}
        />
      </View>
    </AppScreen>
  );
}
