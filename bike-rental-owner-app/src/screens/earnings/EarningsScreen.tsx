import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  TrendingUp,
  Wallet,
  Building2,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
} from "lucide-react-native";
import { useTheme } from "../../theme";
import { useOwnerEarnings } from "../../hooks/useOwnerEarnings";
import AppScreen from "../../components/common/AppScreen";
import { useCollapsibleTabBar } from "../../hooks/useCollapsibleTabBar";
import { useTabScrollToTop } from "../../hooks/useTabScrollToTop";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppCard from "../../components/common/AppCard";
import AppBadge from "../../components/common/AppBadge";
import AppButton from "../../components/common/AppButton";
import AppLoader from "../../components/common/AppLoader";
import EarningStatCard from "../../components/cards/EarningStatCard";
import PaymentCard from "../../components/cards/PaymentCard";
import { formatCurrency, maskAccountNumber } from "../../utils/formatters";

export const EarningsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const { onScroll } = useCollapsibleTabBar();
  const scrollRef = useTabScrollToTop<any>();

  const {
    earnings,
    summary,
    payments,
    bankAccount,
    isLoadingEarnings,
    refetchAll,
  } = useOwnerEarnings();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchAll();
    setRefreshing(false);
  };

  if (isLoadingEarnings && !earnings) {
    return <AppLoader fullScreen message="Loading earnings data..." />;
  }

  return (
    <AppScreen
      onScroll={onScroll}
      scrollRef={scrollRef}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      withTopInset
      contentContainerStyle={styles.container}
    >
      <AppHeader
        title="Earnings & Payouts"
        subtitle="Authoritative Revenue & Settlement Hub"
        showBack={false}
      />

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Total Net Balance Hero Card */}
        <AppCard
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? "#1E2A22" : "#EAF0EC",
              borderColor: theme.primary,
            },
          ]}
        >
          <View style={styles.heroTop}>
            <View>
              <AppText variant="caption" color="primary" weight="700">
                LIFETIME EARNINGS
              </AppText>
              <AppText variant="h1" weight="700" color="primary" style={styles.heroAmount}>
                {formatCurrency(earnings?.total || summary?.totalEarnings || 0)}
              </AppText>
            </View>
            <View style={[styles.heroIconCircle, { backgroundColor: theme.primary }]}>
              <Wallet size={24} color="#FFFFFF" />
            </View>
          </View>

          <View style={[styles.heroDivider, { borderTopColor: "rgba(124,144,130,0.2)" }]} />

          <View style={styles.heroRow}>
            <View style={styles.heroCol}>
              <AppText variant="caption" color="muted">
                Pending Settlement
              </AppText>
              <AppText variant="h3" weight="700">
                {formatCurrency(earnings?.pendingPayments || summary?.totalPendingPayments || 0)}
              </AppText>
            </View>
            <View style={styles.heroCol}>
              <AppText variant="caption" color="muted">
                Successful Payments
              </AppText>
              <AppText variant="h3" weight="700">
                {summary?.totalSuccessfulPayments || payments.length}
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Time Period Breakdown */}
        <View style={styles.sectionHeader}>
          <AppText variant="h3" weight="700">
            Earnings Breakdown
          </AppText>
        </View>

        <View style={styles.gridRow}>
          <EarningStatCard
            title="Today"
            amount={earnings?.today || 0}
            icon={<Calendar size={16} color={theme.primary} />}
            subtitle="Past 24 hours"
            style={styles.gridCol}
          />
          <EarningStatCard
            title="This Week"
            amount={earnings?.weekly || 0}
            icon={<TrendingUp size={16} color={theme.primary} />}
            subtitle="Past 7 days"
            style={styles.gridCol}
          />
        </View>

        <View style={styles.gridRow}>
          <EarningStatCard
            title="This Month"
            amount={earnings?.monthly || 0}
            icon={<TrendingUp size={16} color={theme.primary} />}
            subtitle="Current calendar month"
            style={styles.gridCol}
          />
          <EarningStatCard
            title="Total Late Charges"
            amount={summary?.totalLateCharges || 0}
            icon={<TrendingUp size={16} color={theme.primary} />}
            subtitle="Collected penalties"
            style={styles.gridCol}
          />
        </View>

        {/* Linked Bank Account Card */}
        <View style={styles.sectionHeader}>
          <AppText variant="h3" weight="700">
            Payout Bank Account
          </AppText>
        </View>

        <AppCard
          onPress={() => navigation.navigate("BankAccountScreen")}
          style={styles.bankCard}
        >
          <View style={styles.bankRow}>
            <View style={[styles.bankIconCircle, { backgroundColor: theme.muted }]}>
              <Building2 size={22} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.bankTitleRow}>
                <AppText variant="body" weight="700">
                  {bankAccount?.bankName || "Bank Account"}
                </AppText>
                {bankAccount?.isVerified ? (
                  <ShieldCheck size={16} color="#22C55E" style={{ marginLeft: 6 }} />
                ) : null}
              </View>
              <AppText variant="caption" color="muted">
                {bankAccount?.maskedAccountNumber ||
                  maskAccountNumber(bankAccount?.accountNumber)}
                {bankAccount?.ifscCode ? ` • IFSC: ${bankAccount.ifscCode}` : ""}
              </AppText>
            </View>
            <ChevronRight size={18} color={theme.mutedForeground} />
          </View>
        </AppCard>

        {/* Recent Transactions Section */}
        <View style={styles.sectionHeader}>
          <View>
            <AppText variant="h3" weight="700">
              Recent Transactions
            </AppText>
            <AppText variant="caption" color="muted">
              {payments.length} payout records
            </AppText>
          </View>
          <Pressable
            onPress={() => navigation.navigate("TransactionHistoryScreen")}
            style={styles.viewAllBtn}
          >
            <AppText variant="bodySmall" color="primary" weight="600">
              View All
            </AppText>
            <ChevronRight size={16} color={theme.primary} />
          </Pressable>
        </View>

        <View style={styles.paymentsList}>
          {payments.length === 0 ? (
            <AppCard style={styles.emptyCard}>
              <AppText variant="body" weight="700">
                No transactions yet
              </AppText>
              <AppText variant="caption" color="muted" style={{ textAlign: "center", marginTop: 4 }}>
                When customers complete rentals and payments, your payouts will be listed here.
              </AppText>
            </AppCard>
          ) : (
            payments.slice(0, 4).map((payment) => (
              <PaymentCard
                key={payment.paymentId}
                payment={payment}
                onPress={() =>
                  navigation.navigate("PaymentDetailsScreen", {
                    paymentId: payment.paymentId,
                    payment,
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  scrollBody: {
    paddingHorizontal: 16,
  },
  heroCard: {
    padding: 18,
    borderRadius: 16,
    marginTop: 12,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroAmount: {
    fontSize: 32,
    lineHeight: 38,
    marginTop: 4,
  },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  heroDivider: {
    borderTopWidth: 1,
    marginVertical: 14,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroCol: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  gridCol: {
    flex: 0.485,
  },
  bankCard: {
    padding: 14,
  },
  bankRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bankIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bankTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentsList: {
    marginBottom: 20,
  },
  emptyCard: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default EarningsScreen;
