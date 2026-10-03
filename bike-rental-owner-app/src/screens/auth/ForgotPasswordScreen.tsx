import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react-native";

import { AuthStackParamList } from "../../navigation/types";
import {
  AuthBackground,
  AuthCard,
  AuthInput,
} from "../../components/auth";
import AppButton from "../../components/common/AppButton";
import { authApi } from "../../api/authApi";

type ForgotPasswordProps = NativeStackScreenProps<
  AuthStackParamList,
  "ForgotPassword"
>;

const schema = yup
  .object({
    email: yup
      .string()
      .email("Please enter a valid email address")
      .required("Email is required"),
  })
  .required();

type ForgotPasswordFormValues = yup.InferType<typeof schema>;

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: values.email.trim() });
      setSuccessMessage("Password reset OTP has been sent to your email.");
      setTimeout(() => {
        navigation.navigate("ResetPassword", {
          email: values.email.trim(),
        });
      }, 1200);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to send reset code. Please try again.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground showTopBadge topBadgeText="BIKE RENTAL OWNER PORTAL">
      <AuthCard
        categoryBadge="ACCOUNT RECOVERY"
        title="Forgot Password"
        subtitle="Enter your email to receive an Owner account recovery code"
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
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              label="Registered Email"
              placeholder="owner@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              leftIcon={<Mail size={16} color="rgba(255, 255, 255, 0.6)" />}
              required
            />
          )}
        />

        <AppButton
          title="SEND RECOVERY CODE"
          variant="primary"
          size="lg"
          loading={loading}
          onPress={handleSubmit(onSubmit)}
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
          className="w-full mt-2"
        />

        <View style={styles.backContainer}>
          <Pressable
            onPress={() => navigation.goBack()}
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
