import React, { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { WebView } from "react-native-webview";
import { X, ShieldCheck } from "lucide-react-native";
import { useTheme } from "../../theme";

export interface RazorpaySuccessPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailurePayload {
  code?: string;
  description?: string;
  reason?: string;
}

interface RazorpayCheckoutModalProps {
  visible: boolean;
  keyId: string;
  orderId: string;
  amountInPaise: number;
  bookingId: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (payload: RazorpaySuccessPayload) => void;
  onFailure: (payload: RazorpayFailurePayload) => void;
  onDismiss: () => void;
}

export function RazorpayCheckoutModal({
  visible,
  keyId,
  orderId,
  amountInPaise,
  bookingId,
  customerName = "Customer Rider",
  customerEmail = "customer@example.com",
  customerPhone = "9999999999",
  onSuccess,
  onFailure,
  onDismiss,
}: RazorpayCheckoutModalProps) {
  const { theme, isDark } = useTheme();

  const checkoutHtml = useMemo(() => {
    const cleanKey = keyId.replace(/'/g, "\\'");
    const cleanOrder = orderId.replace(/'/g, "\\'");
    const cleanName = customerName.replace(/'/g, "\\'");
    const cleanEmail = customerEmail.replace(/'/g, "\\'");
    const cleanPhone = customerPhone.replace(/'/g, "\\'");
    const primaryColor = theme.primary || "#7C9082";

    return `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: ${isDark ? "#121212" : "#F8F7F4"};
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: ${isDark ? "#F5F5F5" : "#1A1F2E"};
      }
      .loader {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .spinner {
        width: 38px;
        height: 38px;
        border: 3px solid rgba(124, 144, 130, 0.2);
        border-top-color: ${primaryColor};
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .text {
        font-size: 14px;
        font-weight: 600;
        color: ${isDark ? "#A0A0A0" : "#6B7280"};
      }
    </style>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  </head>
  <body>
    <div class="loader">
      <div class="spinner"></div>
      <div class="text">Connecting to Secure Razorpay Gateway...</div>
    </div>

    <script>
      function postToNative(data) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }
      }

      function launchRazorpay() {
        if (!window.Razorpay) {
          postToNative({
            type: "FAILED",
            payload: { description: "Razorpay script failed to load." }
          });
          return;
        }

        var options = {
          key: '${cleanKey}',
          amount: ${amountInPaise},
          currency: 'INR',
          name: 'Smart Bike Rental',
          description: 'Bike Rental Checkout - Booking #${bookingId}',
          order_id: '${cleanOrder}',
          prefill: {
            name: '${cleanName}',
            email: '${cleanEmail}',
            contact: '${cleanPhone}'
          },
          theme: {
            color: '${primaryColor}'
          },
          handler: function(response) {
            postToNative({
              type: "SUCCESS",
              payload: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              }
            });
          },
          modal: {
            ondismiss: function() {
              postToNative({ type: "DISMISSED" });
            }
          }
        };

        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function(response) {
          postToNative({
            type: "FAILED",
            payload: {
              code: response.error ? response.error.code : undefined,
              description: response.error ? response.error.description : "Payment failed",
              reason: response.error ? response.error.reason : undefined
            }
          });
        });

        rzp.open();
      }

      window.onload = function() {
        setTimeout(launchRazorpay, 300);
      };
    </script>
  </body>
</html>
    `;
  }, [
    keyId,
    orderId,
    amountInPaise,
    bookingId,
    customerName,
    customerEmail,
    customerPhone,
    theme.primary,
    isDark,
  ]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "SUCCESS") {
        onSuccess(data.payload as RazorpaySuccessPayload);
      } else if (data.type === "FAILED") {
        onFailure(data.payload as RazorpayFailurePayload);
      } else if (data.type === "DISMISSED") {
        onDismiss();
      }
    } catch (e) {
      console.warn("Razorpay message parse error:", e);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {/* Header Bar */}
        <View
          style={[
            styles.header,
            { backgroundColor: theme.card, borderBottomColor: theme.border },
          ]}
        >
          <View style={styles.headerTitleRow}>
            <ShieldCheck size={18} color={theme.primary} />
            <Text
              style={[
                styles.headerTitle,
                { color: theme.foreground, fontFamily: "Antic" },
              ]}
            >
              Razorpay Secure Checkout
            </Text>
          </View>

          <Pressable
            onPress={onDismiss}
            style={[
              styles.closeButton,
              { backgroundColor: isDark ? "#2A2A2A" : "#E8E6E1" },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={18} color={theme.foreground} />
          </Pressable>
        </View>

        {/* In-App WebView */}
        <WebView
          originWhitelist={["*"]}
          source={{ html: checkoutHtml }}
          onMessage={handleMessage}
          style={[styles.webView, { backgroundColor: theme.background }]}
          startInLoadingState
          renderLoading={() => (
            <View
              style={[
                styles.loadingOverlay,
                { backgroundColor: theme.background },
              ]}
            >
              <ActivityIndicator size="large" color={theme.primary} />
              <Text
                style={[
                  styles.loadingText,
                  { color: theme.mutedForeground, fontFamily: "Antic" },
                ]}
              >
                Opening Razorpay Checkout...
              </Text>
            </View>
          )}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default RazorpayCheckoutModal;
