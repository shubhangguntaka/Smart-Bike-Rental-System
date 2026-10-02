import React from "react";
import { View, Text, Pressable } from "react-native";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ArrowUpRight,
} from "lucide-react-native";
import { PaymentResponse } from "../../types/payment";
import { useTheme } from "../../theme";

interface PaymentCardProps {
  payment: PaymentResponse;
  onPress: (payment: PaymentResponse) => void;
  onInvoicePress?: (payment: PaymentResponse) => void;
}

export function PaymentCard({
  payment,
  onPress,
  onInvoicePress,
}: PaymentCardProps) {
  const { theme, isDark } = useTheme();
  const isSuccess = payment.paymentStatus === "SUCCESS";
  const isFailed = payment.paymentStatus === "FAILED";

  const dateStr = payment.paidAt || payment.createdAt
    ? new Date(payment.paidAt || payment.createdAt!).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recent";

  return (
    <Pressable
      onPress={() => onPress(payment)}
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
      className="p-4 rounded-3xl border shadow-xs mb-3 space-y-3"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View
            className={`p-2.5 rounded-xl ${
              isSuccess
                ? "bg-emerald-500/10"
                : isFailed
                ? "bg-rose-500/10"
                : "bg-primary/10"
            }`}
          >
            <CreditCard
              size={18}
              color={isSuccess ? "#059669" : isFailed ? "#E11D48" : theme.primary}
            />
          </View>
          <View>
            <Text
              style={{ fontFamily: "JetBrainsMono", color: theme.foreground }}
              className="text-xs font-bold"
            >
              Txn #{payment.paymentId}
            </Text>
            <Text
              style={{ fontFamily: "Antic", color: theme.mutedForeground }}
              className="text-[10px]"
            >
              Booking #{payment.bookingId}
            </Text>
          </View>
        </View>

        <View
          className={`flex-row items-center gap-1 px-2.5 py-1 rounded-lg ${
            isSuccess
              ? "bg-emerald-500/10 border border-emerald-500/30"
              : isFailed
              ? "bg-rose-500/10 border border-rose-500/30"
              : "bg-amber-500/10 border border-amber-500/30"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 size={11} color="#059669" />
          ) : isFailed ? (
            <XCircle size={11} color="#E11D48" />
          ) : (
            <Clock size={11} color="#D97706" />
          )}
          <Text
            style={{
              fontFamily: "Antic",
              color: isSuccess
                ? isDark ? "#4ADE80" : "#059669"
                : isFailed
                ? isDark ? "#F87171" : "#E11D48"
                : isDark ? "#FBBF24" : "#D97706",
            }}
            className="text-[10px] font-bold uppercase tracking-wider"
          >
            {payment.paymentStatus}
          </Text>
        </View>
      </View>

      {/* Breakdown summary */}
      <View
        style={{
          backgroundColor: isDark ? "rgba(40, 40, 44, 0.6)" : "rgba(232, 230, 225, 0.35)",
          borderColor: theme.border,
        }}
        className="p-3 rounded-2xl border flex-row justify-between items-center text-xs"
      >
        <View>
          <Text
            style={{ fontFamily: "Antic", color: theme.mutedForeground }}
            className="text-[10px] uppercase font-bold"
          >
            Mode
          </Text>
          <Text
            style={{ fontFamily: "Antic", color: theme.foreground }}
            className="text-xs font-bold mt-0.5"
          >
            {payment.paymentMethod || "Razorpay UPI"}
          </Text>
        </View>

        <View className="text-right items-end">
          <Text
            style={{ fontFamily: "Antic", color: theme.mutedForeground }}
            className="text-[10px] uppercase font-bold"
          >
            Final Amount
          </Text>
          <Text
            style={{ fontFamily: "JetBrainsMono", color: theme.foreground }}
            className="text-base font-black mt-0.5"
          >
            ₹{payment.finalAmount || payment.baseRentalAmount}
          </Text>
        </View>
      </View>

      {/* Footer date & invoice action */}
      <View
        style={{ borderTopColor: theme.border }}
        className="flex-row items-center justify-between pt-1 border-t"
      >
        <Text
          style={{ fontFamily: "JetBrainsMono", color: theme.mutedForeground }}
          className="text-[10px]"
        >
          {dateStr}
        </Text>

        {isSuccess && onInvoicePress && (
          <Pressable
            onPress={() => onInvoicePress(payment)}
            className="flex-row items-center gap-1 py-1 px-2.5 rounded-lg bg-primary/10 active:bg-primary/20"
          >
            <FileText size={12} color={theme.primary} />
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs font-bold text-primary"
            >
              Invoice
            </Text>
            <ArrowUpRight size={11} color={theme.primary} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

export default PaymentCard;
