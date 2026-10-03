import React, { useState } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  Pressable,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useTheme } from "../../theme";
import AppText from "./AppText";

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  helperText,
  icon,
  isPassword = false,
  style,
  ...props
}) => {
  const { theme, isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <AppText variant="bodySmall" weight="600" style={styles.label}>
          {label}
        </AppText>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.input,
            borderColor: error
              ? theme.destructive
              : isFocused
              ? theme.primary
              : theme.border,
          },
        ]}
      >
        {icon && <View style={styles.leftIcon}>{icon}</View>}

        <TextInput
          placeholderTextColor={theme.mutedForeground}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            {
              color: theme.foreground,
            },
            style,
          ]}
          {...props}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            {showPassword ? (
              <EyeOff size={18} color={theme.mutedForeground} />
            ) : (
              <Eye size={18} color={theme.mutedForeground} />
            )}
          </Pressable>
        )}
      </View>

      {error ? (
        <AppText
          variant="caption"
          color="destructive"
          style={styles.feedbackText}
        >
          {error}
        </AppText>
      ) : helperText ? (
        <AppText
          variant="caption"
          color="muted"
          style={styles.feedbackText}
        >
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  label: {
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontFamily: "Antic",
    fontSize: 15,
    paddingVertical: 10,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
    padding: 4,
  },
  feedbackText: {
    marginTop: 4,
    marginLeft: 2,
  },
});

export default AppInput;
