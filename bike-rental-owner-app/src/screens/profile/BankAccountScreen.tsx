import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Building2, CreditCard, ShieldCheck, Landmark } from "lucide-react-native";
import { OwnerStackParamList } from "../../navigation/types";
import { useOwnerEarnings } from "../../hooks/useOwnerEarnings";
import { useTheme } from "../../theme";
import AppScreen from "../../components/common/AppScreen";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppCard from "../../components/common/AppCard";
import AppInput from "../../components/common/AppInput";
import AppButton from "../../components/common/AppButton";
import AppLoader from "../../components/common/AppLoader";
import { BankAccountDTO } from "../../types/owner";

type Props = NativeStackScreenProps<OwnerStackParamList, "BankAccountScreen">;

export const BankAccountScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const {
    bankAccount,
    isLoadingBankAccount,
    updateBankAccount,
    isUpdatingBankAccount,
  } = useOwnerEarnings();

  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiId, setUpiId] = useState("");
  const [branchName, setBranchName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (bankAccount) {
      setAccountHolderName(bankAccount.accountHolderName || "");
      setBankName(bankAccount.bankName || "");
      setAccountNumber(bankAccount.accountNumber || "");
      setConfirmAccountNumber(bankAccount.accountNumber || "");
      setIfscCode(bankAccount.ifscCode || "");
      setUpiId(bankAccount.upiId || "");
      setBranchName(bankAccount.branchName || "");
    }
  }, [bankAccount]);

  const handleSave = async () => {
    if (
      !accountHolderName.trim() ||
      !bankName.trim() ||
      !accountNumber.trim() ||
      !ifscCode.trim()
    ) {
      setError("Please fill out all required fields marked with *");
      return;
    }

    if (accountNumber !== confirmAccountNumber) {
      setError("Account numbers do not match.");
      return;
    }

    setError("");

    try {
      const payload: Partial<BankAccountDTO> = {
        accountHolderName: accountHolderName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        upiId: upiId.trim() || undefined,
        branchName: branchName.trim() || undefined,
      };

      await updateBankAccount(payload);

      Alert.alert(
        "Bank Details Saved",
        "Your payout settlement bank account details have been updated successfully.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update bank details.";
      setError(msg);
    }
  };

  if (isLoadingBankAccount && !bankAccount) {
    return <AppLoader fullScreen message="Loading bank account details..." />;
  }

  return (
    <AppScreen withTopInset contentContainerStyle={styles.container}>
      <AppHeader
        title="Payout Bank Account"
        subtitle="Where your rental earnings will be deposited"
      />

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Verification banner */}
        <AppCard
          style={[
            styles.bannerCard,
            {
              backgroundColor: bankAccount?.isVerified
                ? isDark
                  ? "#1E2A22"
                  : "#DEF7EC"
                : isDark
                ? "#28282C"
                : "#F8F7F4",
            },
          ]}
        >
          <View style={styles.bannerRow}>
            <ShieldCheck
              size={22}
              color={bankAccount?.isVerified ? "#22C55E" : theme.primary}
              style={{ marginRight: 10 }}
            />
            <View style={{ flex: 1 }}>
              <AppText variant="bodySmall" weight="700">
                {bankAccount?.isVerified
                  ? "Verified Settlement Account"
                  : "Bank Settlement Details"}
              </AppText>
              <AppText variant="caption" color="muted">
                Earnings from completed rentals will be disbursed to this account.
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Form Fields */}
        <View style={styles.form}>
          <AppInput
            label="Account Holder Name *"
            placeholder="e.g. Ramesh Kumar"
            value={accountHolderName}
            onChangeText={setAccountHolderName}
            icon={<Landmark size={18} color={theme.mutedForeground} />}
          />

          <AppInput
            label="Bank Name *"
            placeholder="e.g. HDFC Bank, State Bank of India"
            value={bankName}
            onChangeText={setBankName}
            icon={<Building2 size={18} color={theme.mutedForeground} />}
          />

          <AppInput
            label="Account Number *"
            placeholder="e.g. 50100123456789"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="number-pad"
            icon={<CreditCard size={18} color={theme.mutedForeground} />}
          />

          <AppInput
            label="Confirm Account Number *"
            placeholder="e.g. 50100123456789"
            value={confirmAccountNumber}
            onChangeText={setConfirmAccountNumber}
            keyboardType="number-pad"
            icon={<CreditCard size={18} color={theme.mutedForeground} />}
          />

          <AppInput
            label="IFSC Code *"
            placeholder="e.g. HDFC0001234"
            value={ifscCode}
            onChangeText={setIfscCode}
            autoCapitalize="characters"
          />

          <AppInput
            label="Branch Name (Optional)"
            placeholder="e.g. Koramangala 5th Block"
            value={branchName}
            onChangeText={setBranchName}
          />

          <AppInput
            label="UPI ID (Optional for instant settlements)"
            placeholder="e.g. ramesh@okaxis"
            value={upiId}
            onChangeText={setUpiId}
            autoCapitalize="none"
          />

          {error ? (
            <AppText
              variant="bodySmall"
              color="destructive"
              style={styles.errorText}
            >
              {error}
            </AppText>
          ) : null}

          <AppButton
            title="Save Bank Details"
            size="lg"
            onPress={handleSave}
            loading={isUpdatingBankAccount}
            style={styles.saveBtn}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  scrollBody: {
    paddingHorizontal: 16,
  },
  bannerCard: {
    padding: 14,
    marginTop: 12,
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  form: {
    marginTop: 16,
  },
  errorText: {
    marginVertical: 10,
    textAlign: "center",
  },
  saveBtn: {
    marginTop: 16,
    marginBottom: 40,
  },
});

export default BankAccountScreen;
