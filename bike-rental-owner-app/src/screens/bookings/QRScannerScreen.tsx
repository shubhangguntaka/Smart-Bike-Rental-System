import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import { QrCode, Flashlight, ChevronLeft, CheckCircle2, User, Bike } from "lucide-react-native";
import { OwnerStackParamList } from "../../navigation/types";
import { bookingService } from "../../services/bookingService";
import { useTheme } from "../../theme";
import AppScreen from "../../components/common/AppScreen";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppCard from "../../components/common/AppCard";
import AppButton from "../../components/common/AppButton";
import AppModal from "../../components/common/AppModal";
import { BookingResponse } from "../../types/booking";

type Props = NativeStackScreenProps<OwnerStackParamList, "QRScannerScreen">;

export const QRScannerScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [scannedBooking, setScannedBooking] = useState<BookingResponse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const result = await bookingService.scanQRCode(data);
      if (result) {
        setScannedBooking(result);
        setModalVisible(true);
      } else {
        throw new Error("Invalid booking QR code.");
      }
    } catch (err: any) {
      Alert.alert(
        "Invalid QR Code",
        err.response?.data?.message ||
          "Could not validate this QR code with our server. Please ensure customer presents a valid booking QR.",
        [{ text: "Scan Again", onPress: () => setScanned(false) }]
      );
    }
  };

  const handleHandover = async () => {
    if (!scannedBooking) return;
    setActionLoading(true);
    try {
      await bookingService.handoverBooking(scannedBooking.bookingId);
      setModalVisible(false);
      Alert.alert(
        "Ride Started!",
        `Bike handed over to ${scannedBooking.customerName || "customer"}. Rental is now active.`,
        [
          {
            text: "View Rentals",
            onPress: () => navigation.navigate("CurrentRentalsScreen"),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Handover Failed", err.response?.data?.message || "Could not start ride.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!scannedBooking) return;
    setActionLoading(true);
    try {
      await bookingService.returnBooking(scannedBooking.bookingId);
      setModalVisible(false);
      Alert.alert(
        "Rental Completed!",
        "Bike return confirmed. Backend has calculated final charges for customer checkout.",
        [
          {
            text: "View Dashboard",
            onPress: () => navigation.navigate("OwnerTabs"),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Return Failed", err.response?.data?.message || "Could not complete return.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!permission) {
    return (
      <AppScreen withTopInset>
        <AppHeader title="QR Verification" />
        <View style={styles.centerContainer}>
          <AppText variant="body">Requesting camera permissions...</AppText>
        </View>
      </AppScreen>
    );
  }

  if (!permission.granted) {
    return (
      <AppScreen withTopInset>
        <AppHeader title="QR Verification" />
        <View style={styles.centerContainer}>
          <QrCode size={54} color={theme.primary} style={{ marginBottom: 16 }} />
          <AppText variant="h3" weight="700" style={{ marginBottom: 8 }}>
            Camera Access Required
          </AppText>
          <AppText variant="body" color="muted" style={{ textAlign: "center", marginBottom: 20 }}>
            We need camera access to scan customer booking QR codes during pickup and return.
          </AppText>
          <AppButton title="Grant Permission" onPress={requestPermission} />
        </View>
      </AppScreen>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Overlay controls */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </Pressable>
        <AppText variant="h3" weight="700" style={{ color: "#FFFFFF" }}>
          Scan Booking QR
        </AppText>
        <Pressable onPress={() => setTorch(!torch)} style={styles.iconCircle}>
          <Flashlight size={20} color={torch ? "#FACC15" : "#FFFFFF"} />
        </Pressable>
      </View>

      {/* Center scan frame */}
      <View style={styles.frameContainer}>
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <AppText variant="bodySmall" weight="600" style={styles.instruction}>
          Align customer QR code within the frame
        </AppText>
      </View>

      {/* Scanned Result Modal */}
      {scannedBooking && (
        <AppModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setScanned(false);
          }}
          title="Booking Verified"
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <CheckCircle2 size={28} color="#22C55E" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <AppText variant="body" weight="700">
                  {scannedBooking.bikeName || "Bike"}
                </AppText>
                <AppText variant="caption" color="muted">
                  Booking #{scannedBooking.bookingId} • Status: {scannedBooking.bookingStatus}
                </AppText>
              </View>
            </View>

            <View style={[styles.infoBox, { backgroundColor: isDark ? "#28282C" : "#F8F7F4" }]}>
              <View style={styles.infoRow}>
                <User size={15} color={theme.primary} style={{ marginRight: 8 }} />
                <AppText variant="bodySmall" weight="600">
                  Customer: {scannedBooking.customerName || "Customer"}
                </AppText>
              </View>
              {scannedBooking.registrationNumber && (
                <View style={[styles.infoRow, { marginTop: 6 }]}>
                  <Bike size={15} color={theme.primary} style={{ marginRight: 8 }} />
                  <AppText variant="bodySmall">
                    Reg: {scannedBooking.registrationNumber}
                  </AppText>
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <AppButton
                title="Handover (Start Ride)"
                size="md"
                onPress={handleHandover}
                loading={actionLoading}
                style={[styles.modalBtn, { marginBottom: 8 }]}
              />
              <AppButton
                title="Confirm Return"
                variant="outline"
                size="md"
                onPress={handleReturn}
                loading={actionLoading}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </AppModal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  topBar: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  frameContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: "#7C9082",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  instruction: {
    color: "#FFFFFF",
    marginTop: 24,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
  modalContent: {
    paddingTop: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  infoBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalActions: {
    width: "100%",
  },
  modalBtn: {
    width: "100%",
  },
});

export default QRScannerScreen;
