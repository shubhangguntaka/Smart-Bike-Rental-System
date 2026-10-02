import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import {
  ShieldCheck,
  ShieldAlert,
  Upload,
  CheckCircle2,
  XCircle,
  FileText,
  Camera,
  AlertCircle,
  RefreshCw,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { verificationService } from "../../services/verificationService";
import { bookingService } from "../../services/bookingService";
import { useAuthStore } from "../../store/authStore";
import AppHeader from "../../components/common/AppHeader";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import { useTheme } from "../../theme";

export default function VerificationScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);
  const [uploadingDl, setUploadingDl] = useState(false);

  const [aadhaarData, setAadhaarData] = useState<any | null>(null);
  const [dlData, setDlData] = useState<any | null>(null);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [dlVerified, setDlVerified] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadVerificationStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const details = await bookingService.getVerificationDetails(Number(user.id));
      setAadhaarVerified(details.aadhaarVerified);
      setDlVerified(details.dlVerified);
      setAadhaarData(details.aadhaarData);
      setDlData(details.dlData);
    } catch (err) {
      console.error("Failed to load verification status:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadVerificationStatus();
  }, [loadVerificationStatus]);

  const pickImage = async (documentType: "AADHAAR" | "DL") => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Photo library access is needed to upload your identity documents."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileParam = {
          uri: asset.uri,
          name: `${documentType.toLowerCase()}_${Date.now()}.jpg`,
          type: "image/jpeg",
        };

        if (documentType === "AADHAAR") {
          handleUploadAadhaar(fileParam);
        } else {
          handleUploadDl(fileParam);
        }
      }
    } catch (err) {
      console.error("Image pick error:", err);
    }
  };

  const handleUploadAadhaar = async (file: any) => {
    try {
      setUploadingAadhaar(true);
      setFeedbackMessage(null);
      const res = await verificationService.verifyAadhaar(
        file,
        Number(user?.id),
        "CUSTOMER_KYC"
      );

      setAadhaarData(res);
      const isOk = res.status === "APPROVED" || res.status === "VERIFIED" || res.verified;
      setAadhaarVerified(Boolean(isOk));

      setFeedbackMessage({
        type: isOk ? "success" : "error",
        message: isOk
          ? "Aadhaar Card uploaded and verified successfully!"
          : res.rejectionReason || "Aadhaar card could not be automatically verified. Admin review requested.",
      });

      loadVerificationStatus();
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        message: err?.response?.data?.message || "Failed to upload Aadhaar card.",
      });
    } finally {
      setUploadingAadhaar(false);
    }
  };

  const handleUploadDl = async (file: any) => {
    try {
      setUploadingDl(true);
      setFeedbackMessage(null);
      const res = await verificationService.verifyDrivingLicense(
        file,
        Number(user?.id)
      );

      setDlData(res);
      const isOk = res.status === "APPROVED" || res.status === "VERIFIED" || res.verified;
      setDlVerified(Boolean(isOk));

      setFeedbackMessage({
        type: isOk ? "success" : "error",
        message: isOk
          ? "Driving License verified successfully!"
          : res.message || "Driving License could not be verified automatically.",
      });

      loadVerificationStatus();
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        message: err?.response?.data?.message || "Failed to upload Driving License.",
      });
    } finally {
      setUploadingDl(false);
    }
  };

  const isAllVerified = aadhaarVerified && dlVerified;

  return (
    <AppScreen edges={["top", "bottom"]} scrollable={false}>
      <AppHeader title="Identity & KYC Verification" showBack />

      <ScrollView
        className="flex-1 px-5 py-4 space-y-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Hero Card */}
        <View
          className={`p-5 rounded-3xl border shadow-xs space-y-2 ${
            isAllVerified
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-amber-500/10 border-amber-500/30"
          }`}
        >
          <View className="flex-row items-center gap-2">
            {isAllVerified ? (
              <ShieldCheck size={22} color="#059669" />
            ) : (
              <ShieldAlert size={22} color="#D97706" />
            )}
            <Text
              style={{ fontFamily: "Antic" }}
              className={`text-base font-black ${
                isAllVerified
                  ? "text-emerald-900 dark:text-emerald-300"
                  : "text-amber-900 dark:text-amber-300"
              }`}
            >
              {isAllVerified
                ? "Identity Verified & Ready to Ride"
                : "Verification Required for Rentals"}
            </Text>
          </View>

          <Text
            style={{ fontFamily: "Antic" }}
            className={`text-xs leading-relaxed ${
              isAllVerified
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-amber-700 dark:text-amber-400"
            }`}
          >
            {isAllVerified
              ? "Your Aadhaar and Driving License documents are verified. You have instant keyless access to all rental fleet bikes."
              : "In accordance with transport regulations, all riders must verify their government Aadhaar and valid Driving License."}
          </Text>
        </View>

        {/* Feedback alert */}
        {feedbackMessage && (
          <View
            className={`p-3.5 rounded-2xl border flex-row items-start gap-2.5 ${
              feedbackMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-destructive/10 border-destructive/30"
            }`}
          >
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 size={16} color="#059669" className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} color="#E11D48" className="shrink-0 mt-0.5" />
            )}
            <Text
              style={{ fontFamily: "Antic" }}
              className={`text-xs font-medium flex-1 ${
                feedbackMessage.type === "success"
                  ? "text-emerald-800 dark:text-emerald-300"
                  : "text-destructive"
              }`}
            >
              {feedbackMessage.message}
            </Text>
          </View>
        )}

        {/* 1. Aadhaar Card Upload Card */}
        <View className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View className="w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center">
                <FileText size={18} color={theme.primary} />
              </View>
              <View>
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-sm font-bold text-foreground"
                >
                  Aadhaar Card (Identity)
                </Text>
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs text-muted-foreground"
                >
                  Government ID document
                </Text>
              </View>
            </View>

            <View
              className={`px-2.5 py-0.5 rounded-md ${
                aadhaarVerified
                  ? "bg-emerald-500/10"
                  : aadhaarData?.status === "REJECTED"
                  ? "bg-rose-500/10"
                  : "bg-amber-500/10"
              }`}
            >
              <Text
                style={{ fontFamily: "Antic" }}
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  aadhaarVerified
                    ? "text-emerald-700 dark:text-emerald-400"
                    : aadhaarData?.status === "REJECTED"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {aadhaarVerified
                  ? "Verified"
                  : aadhaarData?.status || "Not Submitted"}
              </Text>
            </View>
          </View>

          {aadhaarData && (
            <View className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs space-y-1">
              <Text style={{ fontFamily: "Antic" }} className="text-xs font-bold text-foreground">
                Name: {aadhaarData.customerName || user?.fullName}
              </Text>
              {aadhaarData.aadhaarNumber && (
                <Text style={{ fontFamily: "JetBrainsMono" }} className="text-[11px] text-muted-foreground">
                  Number: •••• •••• {aadhaarData.aadhaarNumber.slice(-4)}
                </Text>
              )}
            </View>
          )}

          <AppButton
            title={
              uploadingAadhaar
                ? "Processing OCR..."
                : aadhaarVerified
                ? "Re-upload Aadhaar"
                : "Upload Aadhaar Card"
            }
            variant={aadhaarVerified ? "outline" : "primary"}
            size="md"
            loading={uploadingAadhaar}
            leftIcon={<Upload size={14} color={aadhaarVerified ? theme.foreground : "#FFFFFF"} />}
            onPress={() => pickImage("AADHAAR")}
          />
        </View>

        {/* 2. Driving License Upload Card */}
        <View className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View className="w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center">
                <FileText size={18} color={theme.primary} />
              </View>
              <View>
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-sm font-bold text-foreground"
                >
                  Driving License (DL)
                </Text>
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs text-muted-foreground"
                >
                  Valid 2-wheeler license
                </Text>
              </View>
            </View>

            <View
              className={`px-2.5 py-0.5 rounded-md ${
                dlVerified
                  ? "bg-emerald-500/10"
                  : dlData?.status === "REJECTED"
                  ? "bg-rose-500/10"
                  : "bg-amber-500/10"
              }`}
            >
              <Text
                style={{ fontFamily: "Antic" }}
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  dlVerified
                    ? "text-emerald-700 dark:text-emerald-400"
                    : dlData?.status === "REJECTED"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {dlVerified ? "Verified" : dlData?.status || "Not Submitted"}
              </Text>
            </View>
          </View>

          {dlData && (
            <View className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs space-y-1">
              <Text style={{ fontFamily: "Antic" }} className="text-xs font-bold text-foreground">
                Holder: {dlData.customerName || user?.fullName}
              </Text>
              {dlData.licenseNumber && (
                <Text style={{ fontFamily: "JetBrainsMono" }} className="text-[11px] text-muted-foreground">
                  DL Number: {dlData.licenseNumber}
                </Text>
              )}
            </View>
          )}

          <AppButton
            title={
              uploadingDl
                ? "Processing OCR..."
                : dlVerified
                ? "Re-upload Driving License"
                : "Upload Driving License"
            }
            variant={dlVerified ? "outline" : "primary"}
            size="md"
            loading={uploadingDl}
            leftIcon={<Upload size={14} color={dlVerified ? theme.foreground : "#FFFFFF"} />}
            onPress={() => pickImage("DL")}
          />
        </View>

        {isAllVerified && (
          <AppButton
            title="Browse & Rent Bikes Now"
            variant="primary"
            size="lg"
            onPress={() => navigation.navigate("SearchTab")}
            className="mt-4"
          />
        )}
      </ScrollView>
    </AppScreen>
  );
}
