import React, { useState, useEffect, useCallback } from "react";
import { View, Text, RefreshControl } from "react-native";
import Animated from "react-native-reanimated";
import { CreditCard, Receipt } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { paymentService } from "../../services/paymentService";
import { PaymentResponse } from "../../types/payment";
import AppHeader from "../../components/common/AppHeader";
import AppScreen from "../../components/common/AppScreen";
import PaymentCard from "../../components/cards/PaymentCard";
import useCollapsibleTabBar from "../../hooks/useCollapsibleTabBar";
import useTabScrollToTop from "../../hooks/useTabScrollToTop";
import { useTheme } from "../../theme";

export default function PaymentHistoryScreen() {
  const navigation = useNavigation<any>();
  const { scrollHandler } = useCollapsibleTabBar();
  const flatListRef = useTabScrollToTop<any>();
  const { theme } = useTheme();
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentService.getPaymentHistory();
      setPayments(data);
    } catch (err) {
      console.error("Failed to load payment history:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  return (
    <AppScreen edges={["top"]} scrollable={false}>
      <View className="px-5 pt-4 pb-2 space-y-3">
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-2xl font-black text-foreground"
        >
          Payment History
        </Text>
      </View>
      <Animated.FlatList
        ref={flatListRef}
        data={payments}
        keyExtractor={(item) => String(item.paymentId)}
        renderItem={({ item }) => (
          <View className="px-5">
            <PaymentCard
              payment={item}
              onPress={(p) =>
                navigation.navigate("InvoiceScreen", { paymentId: p.paymentId })
              }
              onInvoicePress={(p) =>
                navigation.navigate("InvoiceScreen", { paymentId: p.paymentId })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="p-12 items-center justify-center space-y-3">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
                <Receipt size={32} color={theme.primary} />
              </View>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-base font-bold text-foreground"
              >
                No Transactions Yet
              </Text>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs text-muted-foreground text-center"
              >
                Completed rental payments and official receipts will appear here.
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      />
    </AppScreen>
  );
}
