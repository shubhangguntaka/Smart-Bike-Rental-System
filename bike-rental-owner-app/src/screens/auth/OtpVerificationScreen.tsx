import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { KeyRound, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react-native";

import { AuthStackParamList } from "../../navigation/types";
import {
  AuthBackground,
  AuthCard,
  AuthInput,
} from "../../components/auth";
import AppButton from "../../components/common/AppButton";
import { authApi } from "../../api/authApi";

type OtpVerificationProps = NativeStackScreenProps<
  AuthStackParamList,
  "OtpVerification"
>;

const schema = yup
  .object({
    otp: yup
      .string()
      .required("OTP code is required")
      .min(4, "Enter full OTP code"),
  })
  .required();

type OtpFormValues = yup.InferType<typeof schema>;

export default function OtpVerificationScreen({
  navigation,
  route,
}: OtpVerificationProps) {
  const email = route.params?.email || "";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { otp: "" },
  });

  const onSubmit = async (values: OtpFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await authApi.verifyOtp({
        email,
        otp: values.otp.trim(),
      });
      setSuccessMessage("Owner account verified successfully! Redirecting to login...");

      setTimeout(() => {
        navigation.navigate("Login");
      }, 1200);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Verification failed. Please check the code.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setResending(true);
    try {
      await authApi.resendOtp(email);
      setSuccessMessage(`A new verification code has been sent to ${email}.`);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not resend OTP. Please try again.";
      setErrorMessage(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthBackground showTopBadge topBadgeText="BIKE RENTAL OWNER PORTAL">
      <AuthCard
        categoryBadge="SECURITY VERIFICATION"
        title="Verify Code"
        subtitle={`Enter the code sent to ${email || "your email"}`}
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
              maxLength={6}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.otp?.message}
              leftIcon={<KeyRound size={16} color="rgba(255, 255, 255, 0.6)" />}
              required
            />
          )}
        />

        <AppButton
          title="VERIFY & CONTINUE"
          variant="primary"
          size="lg"
          loading={loading}
          onPress={handleSubmit(onSubmit)}
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
          className="w-full mt-2"
        />

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Pressable
            onPress={handleResend}
            disabled={resending}
            style={styles.resendButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <RefreshCw size={14} color="#CED4BF" />
            <Text style={styles.resendText}>
              {resending ? "Resending..." : "Didn't receive code? Resend"}
            </Text>
          </Pressable>
        </View>

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
  resendContainer: {
    alignItems: "center",
    marginTop: 14,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resendText: {
    fontFamily: "Antic",
    fontSize: 12,
    color: "#CED4BF",
    fontWeight: "600",
  },
  backContainer: {
    alignItems: "center",
    marginTop: 14,
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
