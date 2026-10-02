import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { userService } from "../../services/userService";
import AppHeader from "../../components/common/AppHeader";
import AppInput from "../../components/common/AppInput";
import AppButton from "../../components/common/AppButton";
import { useTheme } from "../../theme";

export default function ChangePasswordScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      await userService.changePassword({
        oldPassword,
        newPassword,
      });

      setSuccessMessage("Password changed successfully!");
      setTimeout(() => {
        navigation.goBack();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to change password. Please check your current password."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <AppHeader title="Change Password" showBack />

      <ScrollView
        className="flex-1 px-5 py-4 space-y-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-xs text-muted-foreground leading-relaxed"
        >
          Ensure your account is using a strong password with at least 8 characters.
        </Text>

        {successMessage && (
          <View className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex-row items-center gap-2">
            <CheckCircle2 size={16} color="#059669" />
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs text-emerald-800 dark:text-emerald-300 font-medium"
            >
              {successMessage}
            </Text>
          </View>
        )}

        {errorMessage && (
          <View className="p-3 bg-destructive/10 border border-destructive/30 rounded-2xl">
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs text-destructive font-medium"
            >
              {errorMessage}
            </Text>
          </View>
        )}

        <View className="space-y-3">
          <AppInput
            label="Current Password"
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="••••••••"
            secureTextEntry
            leftIcon={<Lock size={18} color={theme.mutedForeground} />}
          />

          <AppInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Min 8 characters"
            secureTextEntry
            leftIcon={<Lock size={18} color={theme.mutedForeground} />}
          />

          <AppInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter new password"
            secureTextEntry
            leftIcon={<Lock size={18} color={theme.mutedForeground} />}
          />
        </View>

        <AppButton
          title="Update Password"
          variant="primary"
          size="lg"
          loading={saving}
          onPress={handleSubmit}
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
          className="mt-4"
        />
      </ScrollView>
    </View>
  );
}
