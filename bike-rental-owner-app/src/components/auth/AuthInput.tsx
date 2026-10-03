import React, { ReactNode, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../theme";

export interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  required?: boolean;
}

export function AuthInput({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  required = false,
  placeholderTextColor,
  onFocus,
  onBlur,
  ...props
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { theme } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
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
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={
            placeholderTextColor ?? "rgba(255, 255, 255, 0.45)"
          }
          selectionColor={theme.primary}
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

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
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
  rightIcon: {
    marginLeft: 8,
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

export default AuthInput;
