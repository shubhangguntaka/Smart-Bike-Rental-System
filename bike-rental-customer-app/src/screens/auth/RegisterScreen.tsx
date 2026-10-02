import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { User, Mail, Phone, ArrowRight } from "lucide-react-native";

import { AuthStackParamList } from "../../navigation/AuthNavigator";
import {
  AuthBackground,
  AuthCard,
  AuthInput,
  PasswordInput,
} from "../../components/auth";
import AppButton from "../../components/common/AppButton";
import { authApi } from "../../api/authApi";

type RegisterScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  "Register"
>;

const schema = yup
  .object({
    firstName: yup
      .string()
      .required("First name is required")
      .max(50, "Max 50 characters"),
    lastName: yup
      .string()
      .required("Last name is required")
      .max(50, "Max 50 characters"),
    email: yup
      .string()
      .email("Please enter a valid email")
      .required("Email is required"),
    phoneNumber: yup
      .string()
      .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
      .required("Phone number is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password cannot exceed 20 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Please confirm your password"),
  })
  .required();

type RegisterFormValues = yup.InferType<typeof schema>;

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await authApi.register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
        password: values.password,
        role: "CUSTOMER",
      });

      navigation.navigate("OtpVerification", {
        email: values.email.trim(),
        purpose: "registration",
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground showTopBadge>
      <AuthCard
        categoryBadge="JOIN THE FLEET"
        title="Create Account"
        subtitle="Register for on-demand smart bike rentals"
      >
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* First & Last Name Row */}
        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  label="First Name"
                  placeholder="Rahul"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.firstName?.message}
                  leftIcon={
                    <User size={16} color="rgba(255, 255, 255, 0.6)" />
                  }
                  required
                />
              )}
            />
          </View>

          <View style={styles.halfCol}>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  label="Last Name"
                  placeholder="Sharma"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.lastName?.message}
                  leftIcon={
                    <User size={16} color="rgba(255, 255, 255, 0.6)" />
                  }
                  required
                />
              )}
            />
          </View>
        </View>

        {/* Email Address */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              label="Email Address"
              placeholder="rahul@example.com"
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

        {/* Mobile Phone Number */}
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              label="Phone Number"
              placeholder="9876543210"
              keyboardType="phone-pad"
              maxLength={10}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phoneNumber?.message}
              leftIcon={<Phone size={16} color="rgba(255, 255, 255, 0.6)" />}
              required
            />
          )}
        />

        {/* Password */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              label="Password"
              placeholder="Min 8 characters"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              required
            />
          )}
        />

        {/* Confirm Password */}
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              label="Confirm Password"
              placeholder="Repeat password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
              required
            />
          )}
        />

        {/* Submit Register Button */}
        <AppButton
          title="CREATE ACCOUNT"
          variant="primary"
          size="lg"
          loading={loading}
          onPress={handleSubmit(onSubmit)}
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
          className="w-full mt-2"
        />

        {/* Already have an account */}
        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>Already have an account? </Text>
          <Pressable
            onPress={() => navigation.navigate("Login")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.promptLinkText}>Sign In</Text>
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
  row: {
    flexDirection: "row",
    gap: 10,
  },
  halfCol: {
    flex: 1,
  },
  promptContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  promptText: {
    fontFamily: "Antic",
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.72)",
  },
  promptLinkText: {
    fontFamily: "Antic",
    fontSize: 13,
    fontWeight: "700",
    color: "#CED4BF",
    textDecorationLine: "underline",
  },
});