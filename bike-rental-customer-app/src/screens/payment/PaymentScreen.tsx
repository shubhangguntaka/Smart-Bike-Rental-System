import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Receipt,
  ArrowRight,
  Info,
} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { paymentService } from "../../services/paymentService";
import { PaymentResponse } from "../../types/payment";
import AppHeader from "../../components/common/AppHeader";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import RazorpayCheckoutModal, {
  RazorpaySuccessPayload,
  RazorpayFailurePayload,
} from "../../components/payment/RazorpayCheckoutModal";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../theme";

export default function PaymentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuthStore();
  const { theme, isDark } = useTheme();

  const bookingId = Number(route.params?.bookingId || route.params?.booking?.bookingId);

  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function prepareBill() {
      if (!bookingId) {
        setErrorMessage("Booking ID is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErrorMessage(null);
        const result = await paymentService.preparePayment(bookingId);
        setPayment(result);

        if (result.paymentStatus === "SUCCESS") {
          navigation.replace("PaymentSuccessScreen", { payment: result });
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to prepare payment bill. Please check vehicle return status.";
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
    }
    prepareBill();
  }, [bookingId, navigation]);

  const handleInitiatePayment = () => {
    if (!payment) return;

    if (!payment.razorpayOrderId) {
      Alert.alert(
        "Order Unavailable",
        "Backend did not return a valid Razorpay order. Please try again."
      );
      return;
    }

    if (!payment.finalAmount || payment.finalAmount <= 0) {
      Alert.alert("Invalid Amount", "Final payable amount is not valid.");
      return;
    }

    setShowRazorpayModal(true);
  };

  const handleRazorpaySuccess = async (payload: RazorpaySuccessPayload) => {
    setShowRazorpayModal(false);
    if (!payment) return;

    try {
      setProcessing(true);
      setErrorMessage(null);

      // Verify signature on backend
      const verified = await paymentService.processPayment({
        paymentId: payment.paymentId,
        paymentMethod: "RAZORPAY",
        razorpayOrderId: payload.razorpay_order_id,
        razorpayPaymentId: payload.razorpay_payment_id,
        razorpaySignature: payload.razorpay_signature,
      });

      if (verified.paymentStatus === "SUCCESS") {
        navigation.replace("PaymentSuccessScreen", { payment: verified });
      } else {
        navigation.replace("PaymentFailedScreen", {
          paymentId: payment.paymentId,
          bookingId: payment.bookingId,
          message: "Payment signature verification did not succeed.",
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Payment verification failed on backend.";
      navigation.replace("PaymentFailedScreen", {
        paymentId: payment?.paymentId,
        bookingId: payment?.bookingId,
        message: msg,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRazorpayFailure = (payload: RazorpayFailurePayload) => {
    setShowRazorpayModal(false);
    const msg = payload.description || "Razorpay transaction was not completed.";
    Alert.alert("Payment Cancelled / Failed", msg);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-6 space-y-3">
        <ActivityIndicator size="large" color={theme.primary} />
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-xs text-muted-foreground font-semibold text-center mt-3"
        >
          Preparing final billing from backend...
        </Text>
      </View>
    );
  }

  if (errorMessage && !payment) {
    return (
      <AppScreen edges={["top", "bottom"]} scrollable={false}>
        <AppHeader title="Checkout" showBack />
        <View className="flex-1 p-6 justify-center items-center space-y-4">
          <View className="w-16 h-16 rounded-full bg-destructive/10 items-center justify-center">
            <AlertCircle size={32} color="#E11D48" />
          </View>
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-lg font-black text-foreground text-center"
          >
            Payment Bill Unavailable
          </Text>
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs text-muted-foreground text-center leading-relaxed"
          >
            {errorMessage}
          </Text>
          <AppButton
            title="Go Back"
            variant="outline"
            onPress={() => navigation.goBack()}
            className="mt-4 px-6"
          />
        </View>
      </AppScreen>
    );
  }

  if (!payment) return null;

  const amountInPaise = Math.round(Number(payment.finalAmount) * 100);

  return (
    <AppScreen edges={["top", "bottom"]} scrollable={false}>
      <AppHeader title={`Checkout • Booking #${payment.bookingId}`} showBack />

      <ScrollView
        className="flex-1 px-5 py-4 space-y-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Return confirmed notification card */}
        <View
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
          className="p-4 rounded-3xl border shadow-xs flex-row items-center gap-3"
        >
          <View className="w-10 h-10 rounded-2xl bg-emerald-500/10 items-center justify-center">
            <CheckCircle2 size={20} color="#059669" />
          </View>
          <View className="flex-1">
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-sm font-bold text-foreground"
            >
              Vehicle Return Confirmed
            </Text>
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs text-muted-foreground mt-0.5"
            >
              Final payable total calculated directly by the backend.
            </Text>
          </View>
        </View>

        {/* Bill Breakdown Card */}
        <View
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
          className="p-5 rounded-3xl border shadow-xs space-y-3"
        >
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Final Fare Breakdown
          </Text>

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              Base Rental Amount
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
              ₹{payment.baseRentalAmount}
            </Text>
          </View>

          {Number(payment.lateCharge) > 0 && (
            <View className="flex-row justify-between text-xs">
              <Text style={{ fontFamily: "Antic" }} className="text-rose-600 font-bold">
                Late Return Surcharge
              </Text>
              <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-rose-600">
                + ₹{payment.lateCharge}
              </Text>
            </View>
          )}

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              Platform & Tech Fee ({payment.platformFeePercent}%)
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
              ₹{payment.platformFeeAmount}
            </Text>
          </View>

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              GST / Taxes
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
              ₹{payment.taxAmount}
            </Text>
          </View>

          <View
            style={{ borderTopColor: theme.border }}
            className="pt-3 border-t flex-row justify-between items-center"
          >
            <View>
              <Text style={{ fontFamily: "Antic" }} className="text-xs text-muted-foreground">
                Total Payable Amount
              </Text>
              <Text style={{ fontFamily: "JetBrainsMono" }} className="text-2xl font-black text-foreground">
                ₹{payment.finalAmount}
              </Text>
            </View>
            <View
              style={{ borderColor: theme.primary }}
              className="px-3 py-1 rounded-xl bg-primary/10 border"
            >
              <Text style={{ fontFamily: "Antic" }} className="text-xs font-bold text-primary">
                Razorpay Checkout
              </Text>
            </View>
          </View>
        </View>

        {/* Security Assurance */}
        <View
          style={{ borderColor: theme.border }}
          className="p-4 rounded-2xl bg-primary/5 border flex-row items-start gap-3"
        >
          <ShieldCheck size={18} color={theme.primary} className="shrink-0 mt-0.5" />
          <View className="flex-1">
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs font-bold text-foreground"
            >
              100% Authentic Razorpay Gateway
            </Text>
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-[11px] text-muted-foreground leading-relaxed mt-0.5"
            >
              Payment totals and signatures are verified directly on the backend before completing the transaction.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Pay Button */}
      <View
        style={{ backgroundColor: theme.card, borderTopColor: theme.border }}
        className="p-4 border-t"
      >
        <AppButton
          title={`Pay ₹${payment.finalAmount} via Razorpay`}
          variant="primary"
          size="lg"
          loading={processing}
          onPress={handleInitiatePayment}
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
        />
      </View>

      {/* Real In-App Razorpay Modal Bridge */}
      <RazorpayCheckoutModal
        visible={showRazorpayModal}
        keyId={payment.razorpayKeyId || "rzp_test_TU4lU75r4fP9AF"}
        orderId={payment.razorpayOrderId || ""}
        amountInPaise={amountInPaise}
        bookingId={payment.bookingId}
        customerName={user?.name || "Customer Rider"}
        customerEmail={user?.email || "customer@example.com"}
        customerPhone={user?.phoneNumber || "9999999999"}
        onSuccess={handleRazorpaySuccess}
        onFailure={handleRazorpayFailure}
        onDismiss={() => setShowRazorpayModal(false)}
      />
    </AppScreen>
  );
}
