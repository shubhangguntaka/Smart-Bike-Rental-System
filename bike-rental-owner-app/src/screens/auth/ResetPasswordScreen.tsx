import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { KeyRound, ArrowRight, ArrowLeft } from "lucide-react-native";

import { AuthStackParamList } from "../../navigation/types";
import {
  AuthBackground,
  AuthCard,
  AuthInput,
  PasswordInput,
} from "../../components/auth";
import AppButton from "../../components/common/AppButton";
import { authApi } from "../../api/authApi";

type ResetPasswordProps = NativeStackScreenProps<
  AuthStackParamList,
  "ResetPassword"
>;

const schema = yup
  .object({
    otp: yup.string().required("OTP code is required").min(4),
    newPassword: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .required("New password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("newPassword")], "Passwords must match")
      .required("Please confirm your password"),
  })
  .required();

type ResetPasswordFormValues = yup.InferType<typeof schema>;

export default function ResetPasswordScreen({
  navigation,
  route,
}: ResetPasswordProps) {
  const email = route.params?.email || "";
  const initialOtp = route.params?.otp || "";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { otp: initialOtp, newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await authApi.resetPassword({
        email,
        otp: values.otp.trim(),
        newPassword: values.newPassword,
      });

      setSuccessMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigation.navigate("Login");
      }, 1200);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to reset password. Please check your code.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground showTopBadge topBadgeText="BIKE RENTAL OWNER PORTAL">
      <AuthCard
        categoryBadge="SECURITY"
        title="Set New Password"
        subtitle={`Create a secure password for ${email || "your owner account"}`}
      >
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>{successMessage}</Text>
          </View>
        ) : null}

        <Controller
          control={control}
          name="otp"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              label="Verification Code (OTP)"
              placeholder="123456"
              keyboardType="number-pad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.otp?.message}
              leftIcon={<KeyRound size={16} color="rgba(255, 255, 255, 0.6)" />}
              required
            />
          )}
        />

        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              label="New Password"
              placeholder="Min 8 characters"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.newPassword?.message}
              required
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              label="Confirm New Password"
              placeholder="Repeat new password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
              required
            />
          )}
        />

        <AppButton
          title="SAVE NEW PASSWORD"
          variant="primary"
          size="lg"
          loading={loading}
          onPress={handleSubmit(onSubmit)}
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
          className="w-full mt-2"
        />

        <View style={styles.backContainer}>
          <Pressable
            onPress={() => navigation.navigate("Login")}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={16} color="#CED4BF" />
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </Pressable>
        </View>
      </AuthCard>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.45)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorBannerText: {
    fontFamily: "Antic",
    fontSize: 12,
    color: "#FCA5A5",
    textAlign: "center",
  },
  successBanner: {
    backgroundColor: "rgba(124, 144, 130, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(124, 144, 130, 0.6)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  successBannerText: {
    fontFamily: "Antic",
    fontSize: 12,
    color: "#E2E8F0",
    textAlign: "center",
  },
  backContainer: {
    alignItems: "center",
    marginTop: 18,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backButtonText: {
    fontFamily: "Antic",
    fontSize: 13,
    fontWeight: "700",
    color: "#CED4BF",
  },
});
