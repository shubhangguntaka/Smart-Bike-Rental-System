import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { Eye, EyeOff, Lock } from "lucide-react-native";
import { useTheme } from "../../theme";

export interface PasswordInputProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

export function PasswordInput({
  label,
  error,
  required = false,
  placeholderTextColor,
  onFocus,
  onBlur,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          Boolean(error) && styles.inputWrapperError,
        ]}
      >
        <View style={styles.leftIcon}>
          <Lock size={16} color="rgba(255, 255, 255, 0.6)" />
        </View>

        <TextInput
          style={styles.input}
          secureTextEntry={!showPassword}
          placeholderTextColor={
            placeholderTextColor ?? "rgba(255, 255, 255, 0.45)"
          }
          selectionColor={theme.primary}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />

        <Pressable
          onPress={() => setShowPassword((prev) => !prev)}
          style={styles.visibilityToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {showPassword ? (
            <EyeOff size={18} color="#CED4BF" />
          ) : (
            <Eye size={18} color="rgba(255, 255, 255, 0.6)" />
          )}
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 14,
  },
  label: {
    fontFamily: "Antic",
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  requiredStar: {
    color: "#EF4444",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.20)",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
  },
  inputWrapperFocused: {
    borderColor: "#7C9082",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderWidth: 1.5,
  },
  inputWrapperError: {
    borderColor: "rgba(239, 68, 68, 0.8)",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
  leftIcon: {
    marginRight: 8,
  },
  visibilityToggle: {
    padding: 4,
    marginLeft: 6,
  },
  input: {
    flex: 1,
    fontFamily: "Antic",
    fontSize: 14,
    color: "#FFFFFF",
    paddingVertical: 0,
  },
  errorText: {
    fontFamily: "Antic",
    fontSize: 11,
    color: "#FCA5A5",
    marginTop: 4,
  },
});

export default PasswordInput;
