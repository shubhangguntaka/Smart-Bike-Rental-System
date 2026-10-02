import React from "react";
import { View, Text, ScrollView } from "react-native";
import {
  CheckCircle2,
  FileText,
  Home,
  Receipt,
  Sparkles,
  ShieldCheck,
} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { PaymentResponse } from "../../types/payment";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import { useTheme } from "../../theme";

export default function PaymentSuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();

  const payment = route.params?.payment as PaymentResponse;

  return (
    <AppScreen edges={["top", "bottom"]} scrollable={false} className="p-6 justify-between">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ alignItems: "center", paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Check Visual */}
        <View className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 items-center justify-center mb-6">
          <CheckCircle2 size={54} color="#059669" />
        </View>

        <Text
          style={{ fontFamily: "Antic" }}
          className="text-2xl font-black text-foreground text-center"
        >
          Payment Successful!
        </Text>

        <Text
          style={{ fontFamily: "Antic" }}
          className="text-xs text-muted-foreground text-center mt-2 max-w-xs leading-relaxed"
        >
          Your rental payment has been completed and verified. Thank you for riding with Smart Bike Rental!
        </Text>

        {/* Receipt Box */}
        <View className="w-full bg-card rounded-3xl border border-border/80 shadow-xs p-5 mt-6 space-y-3">
          <View className="flex-row items-center justify-between pb-3 border-b border-border/60">
            <View className="flex-row items-center gap-2">
              <Receipt size={16} color={theme.primary} />
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold text-foreground"
              >
                Payment Summary
              </Text>
            </View>
            <View className="px-2.5 py-0.5 rounded-md bg-emerald-500/10">
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase"
              >
                Verified
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              Booking ID
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
              BR-{payment?.bookingId}
            </Text>
          </View>

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              Payment ID
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
              #{payment?.paymentId}
            </Text>
          </View>

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              Method
            </Text>
            <Text style={{ fontFamily: "Antic" }} className="font-bold text-foreground">
              {payment?.paymentMethod || "Razorpay UPI"}
            </Text>
          </View>

          <View className="pt-2 border-t border-border/60 flex-row justify-between items-center">
            <Text style={{ fontFamily: "Antic" }} className="text-xs font-bold text-foreground">
              Total Amount Paid
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="text-xl font-black text-foreground">
              ₹{payment?.finalAmount}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View className="space-y-3 pt-4">
        {payment?.paymentId && (
          <AppButton
            title="View Official Invoice"
            variant="outline"
            size="lg"
            leftIcon={<FileText size={16} color={theme.foreground} />}
            onPress={() =>
              navigation.navigate("InvoiceScreen", {
                paymentId: payment.paymentId,
              })
            }
          />
        )}

        <AppButton
          title="Return to Home Dashboard"
          variant="primary"
          size="lg"
          leftIcon={<Home size={16} color="#FFFFFF" />}
          onPress={() => navigation.navigate("HomeTab")}
        />
      </View>
    </AppScreen>
  );
}
