import React, { ReactNode } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";
import { useTheme } from "../../theme";

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "full";
}

export function AppModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
}: AppModalProps) {
  const { theme } = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/60 justify-center items-center p-4">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              className={`bg-card rounded-3xl border border-border overflow-hidden w-full max-w-lg shadow-2xl ${
                size === "full" ? "h-5/6" : "max-h-[90%]"
              }`}
            >
              {/* Header */}
              {(title || subtitle) && (
                <View className="flex-row items-center justify-between p-5 border-b border-border/70">
                  <View className="flex-1 pr-3">
                    {title && (
                      <Text
                        style={{ fontFamily: "Antic", color: theme.foreground }}
                        className="text-lg font-bold text-foreground"
                      >
                        {title}
                      </Text>
                    )}
                    {subtitle && (
                      <Text
                        style={{ fontFamily: "Antic", color: theme.mutedForeground }}
                        className="text-xs text-muted-foreground mt-0.5"
                      >
                        {subtitle}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    onPress={onClose}
                    className="p-1.5 rounded-xl bg-muted/60 active:bg-muted"
                  >
                    <X size={18} color={theme.foreground} />
                  </Pressable>
                </View>
              )}

              {/* Body */}
              <ScrollView
                className="p-5 flex-grow"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>

              {/* Footer */}
              {footer && (
                <View className="p-4 border-t border-border/70 bg-muted/20">
                  {footer}
                </View>
              )}
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export default AppModal;
