import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Share,
  Alert,
} from "react-native";
import {
  FileText,
  ShieldCheck,
  Calendar,
  CreditCard,
  Building2,
  CheckCircle2,
  Share2,
} from "lucide-react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { paymentService } from "../../services/paymentService";
import { InvoiceDTO } from "../../types/payment";
import AppHeader from "../../components/common/AppHeader";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import { useTheme } from "../../theme";

export default function InvoiceScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const paymentId = route.params?.paymentId;
  const { theme, isDark } = useTheme();

  const [invoice, setInvoice] = useState<InvoiceDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoice() {
      if (!paymentId) return;
      try {
        const data = await paymentService.getInvoice(Number(paymentId));
        setInvoice(data);
      } catch (err) {
        console.error("Failed to load invoice:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInvoice();
  }, [paymentId]);

  const handleShare = async () => {
    if (!invoice) return;
    try {
      const summary = `Smart Bike Rental - Tax Invoice\nInvoice: ${invoice.invoiceNumber || `#${invoice.paymentId}`}\nBooking: BR-${invoice.bookingId}\nCustomer: ${invoice.customerName || "Rider"}\nTotal Paid: ₹${invoice.finalAmount}\nMode: ${invoice.paymentMethod || "Online"}\nStatus: PAID IN FULL\nThank you for choosing Smart Bike Rental!`;
      await Share.share({
        message: summary,
        title: `Invoice ${invoice.invoiceNumber || `#${invoice.paymentId}`}`,
      });
    } catch (e) {
      console.warn("Share error:", e);
    }
  };

  if (loading || !invoice) {
    return (
      <AppScreen edges={["top", "bottom"]} scrollable={false} className="justify-center items-center">
        <ActivityIndicator size="large" color={theme.primary} />
      </AppScreen>
    );
  }

  const dateStr = invoice.paidAt || invoice.createdAt
    ? new Date(invoice.paidAt || invoice.createdAt!).toLocaleDateString("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Verified Rental";

  return (
    <AppScreen edges={["top", "bottom"]} scrollable={false}>
      <AppHeader
        title={`Tax Invoice • ${invoice.invoiceNumber || `#${invoice.paymentId}`}`}
        showBack
        rightAction={
          <Pressable
            onPress={handleShare}
            style={{ backgroundColor: isDark ? "#2A2A2A" : "#E8E6E1" }}
            className="p-2 rounded-xl items-center justify-center active:opacity-80 shadow-2xs"
          >
            <Share2 size={16} color={theme.foreground} />
          </Pressable>
        }
      />

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Printable styled receipt container */}
        <View
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
          className="rounded-3xl border shadow-md p-6 space-y-5"
        >
          {/* Header */}
          <View
            style={{ borderBottomColor: theme.border }}
            className="flex-row justify-between items-start border-b pb-4"
          >
            <View>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-lg font-black text-foreground"
              >
                Smart Bike Rental Ltd.
              </Text>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs text-muted-foreground mt-0.5"
              >
                GSTIN: 36AABCS1429B1Z
              </Text>
            </View>

            <View className="items-end">
              <View className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase"
                >
                  PAID IN FULL
                </Text>
              </View>
              <Text
                style={{ fontFamily: "JetBrainsMono" }}
                className="text-[10px] text-muted-foreground mt-1"
              >
                {dateStr}
              </Text>
            </View>
          </View>

          {/* Bill To Info */}
          <View className="space-y-1 text-xs">
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider"
            >
              Billed To
            </Text>
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-sm font-bold text-foreground"
            >
              {invoice.customerName || "Customer Rider"}
            </Text>
            {invoice.customerEmail && (
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs text-muted-foreground"
              >
                {invoice.customerEmail}
              </Text>
            )}
            {invoice.customerPhone && (
              <Text
                style={{ fontFamily: "JetBrainsMono" }}
                className="text-xs text-muted-foreground"
              >
                {invoice.customerPhone}
              </Text>
            )}
          </View>

          {/* Line Items Table */}
          <View
            style={{ borderTopColor: theme.border }}
            className="space-y-2.5 pt-2 border-t"
          >
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1"
            >
              Line Item Charges
            </Text>

            <View className="flex-row justify-between text-xs">
              <Text style={{ fontFamily: "Antic" }} className="text-foreground">
                Base Rental Booking (BR-{invoice.bookingId})
              </Text>
              <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
                ₹{invoice.baseRentalAmount}
              </Text>
            </View>

            {Number(invoice.lateCharge) > 0 && (
              <View className="flex-row justify-between text-xs">
                <Text style={{ fontFamily: "Antic" }} className="text-rose-600 font-bold">
                  Late Return Fee
                </Text>
                <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-rose-600">
                  ₹{invoice.lateCharge}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between text-xs">
              <Text style={{ fontFamily: "Antic" }} className="text-foreground">
                Platform Convenience Fee ({invoice.platformFeePercent}%)
              </Text>
              <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
                ₹{invoice.platformFeeAmount}
              </Text>
            </View>

            <View className="flex-row justify-between text-xs">
              <Text style={{ fontFamily: "Antic" }} className="text-foreground">
                GST (18% Integrated Tax)
              </Text>
              <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
                ₹{invoice.taxAmount}
              </Text>
            </View>
          </View>

          {/* Grand Total */}
          <View
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              borderColor: theme.border,
            }}
            className="pt-3 border p-3 rounded-2xl flex-row justify-between items-center"
          >
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-sm font-bold text-foreground"
            >
              Total Invoice Amount
            </Text>
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-2xl font-black text-foreground"
            >
              ₹{invoice.finalAmount}
            </Text>
          </View>

          {/* Payment metadata */}
          <View
            style={{ borderTopColor: theme.border }}
            className="pt-2 border-t text-xs space-y-1"
          >
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-[10px] text-muted-foreground"
            >
              Transaction Ref: {invoice.transactionId || invoice.invoiceNumber}
            </Text>
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-[10px] text-muted-foreground"
            >
              Mode: {invoice.paymentMethod || "Razorpay Verified"}
            </Text>
          </View>
        </View>

        <AppButton
          title="Share / Save Receipt"
          variant="primary"
          size="lg"
          leftIcon={<Share2 size={16} color="#FFFFFF" />}
          onPress={handleShare}
          className="mt-4"
        />
      </ScrollView>
    </AppScreen>
  );
}
