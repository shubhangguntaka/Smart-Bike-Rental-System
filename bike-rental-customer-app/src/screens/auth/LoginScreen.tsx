import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Mail, ArrowRight } from "lucide-react-native";

import { AuthStackParamList } from "../../navigation/AuthNavigator";
import {
  AuthBackground,
  AuthCard,
  AuthInput,
  PasswordInput,
} from "../../components/auth";
import AppButton from "../../components/common/AppButton";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/authApi";

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, "Login">;

const schema = yup
  .object({
    email: yup
      .string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  })
  .required();

type LoginFormValues = yup.InferType<typeof schema>;

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await authApi.login({
        email: values.email.trim(),
        password: values.password,
      });

      const rawData = res.data as any;
      const data = rawData?.data || rawData;

      if (data && (data.accessToken || data.token)) {
        if (data.role && data.role !== "CUSTOMER") {
          setErrorMessage(
            "Only customer accounts can sign in to this mobile app."
          );
          return;
        }

        const displayName =
          data.name ??
          (`${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() ||
            "Customer");

        const accessToken = data.accessToken || data.token;

        await setAuth(
          accessToken,
          {
            id: data.userId ?? data.id ?? 1,
            name: displayName,
            email: data.email ?? values.email.trim(),
            role: "CUSTOMER",
            phoneNumber: data.phoneNumber,
          },
          data.refreshToken
        );
      } else {
        throw new Error("Invalid response received from authentication server.");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to sign in. Please check your credentials.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground showTopBadge>
      <AuthCard
        categoryBadge="PREMIUM BIKE RENTAL"
        title="Welcome Back"
        subtitle="Login to your Bike Rental account"
      >
        {/* Error Alert Banner */}
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Email Input Field */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              label="Email"
              placeholder="name@example.com"
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

        {/* Password Input Field with Eye Toggle */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              label="Password"
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              required
            />
          )}
        />

        {/* Forgot Password Link */}
        <View style={styles.forgotPasswordContainer}>
          <Pressable
            onPress={() => navigation.navigate("ForgotPassword")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </Pressable>
        </View>

        {/* Primary Sign In Button */}
        <AppButton
          title="SIGN IN"
          variant="primary"
          size="lg"
          loading={loading}
          onPress={handleSubmit(onSubmit)}
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
          className="w-full mt-2"
        />

        {/* Create Account Link */}
        <View style={styles.registerPromptContainer}>
          <Text style={styles.registerPromptText}>
            New to Bike Rental?{" "}
          </Text>
          <Pressable
            onPress={() => navigation.navigate("Register")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.registerLinkText}>Create an account</Text>
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
    lineHeight: 16,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 14,
    marginTop: -4,
  },
  forgotPasswordText: {
    fontFamily: "Antic",
    fontSize: 12,
    fontWeight: "600",
    color: "#CED4BF",
  },
  registerPromptContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  registerPromptText: {
    fontFamily: "Antic",
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.72)",
  },
  registerLinkText: {
    fontFamily: "Antic",
    fontSize: 13,
    fontWeight: "700",
    color: "#CED4BF",
    textDecorationLine: "underline",
  },
});