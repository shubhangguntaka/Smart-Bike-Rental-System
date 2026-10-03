import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Bike,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react-native";
import { OwnerStackParamList } from "../../navigation/types";
import { verificationService } from "../../services/verificationService";
import { bikeService } from "../../services/bikeService";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../theme";
import AppScreen from "../../components/common/AppScreen";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppCard from "../../components/common/AppCard";
import AppBadge from "../../components/common/AppBadge";
import AppButton from "../../components/common/AppButton";
import AppLoader from "../../components/common/AppLoader";
import DocumentUploader from "../../components/forms/DocumentUploader";
import { AadhaarVerificationDTO } from "../../types/verification";
import { ApprovedRcDTO } from "../../types/bike";
import { maskAadhaar } from "../../utils/formatters";

type Props = NativeStackScreenProps<OwnerStackParamList, "VerificationScreen">;

export const VerificationScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user, refreshProfile } = useAuthStore();

  const [aadhaarStatus, setAadhaarStatus] = useState<AadhaarVerificationDTO | null>(null);
  const [approvedRcs, setApprovedRcs] = useState<ApprovedRcDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadVerificationData = async () => {
    try {
      const [aadhaar, rcs] = await Promise.all([
        verificationService.getAadhaarStatus(user?.id),
        bikeService.getApprovedRcs().catch(() => []),
      ]);
      setAadhaarStatus(aadhaar);
      setApprovedRcs(rcs);
    } catch (err) {
      console.warn("Could not load verification data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVerificationData();
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVerificationData();
    await refreshProfile();
  };

  const handleUploadAadhaar = async (uri: string, fileType?: string) => {
    setUploadingAadhaar(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "aadhaar_card.jpg",
        type: fileType || "image/jpeg",
      } as any);

      if (user?.id) {
        formData.append("customerId", String(user.id));
      }
      formData.append("purpose", "BIKE_OWNER");

      const res = await verificationService.verifyAadhaar(formData);
      setAadhaarStatus(res);
      await refreshProfile();

      Alert.alert(
        "Aadhaar Verified!",
        "Your Aadhaar document has been successfully processed by OCR verification."
      );
    } catch (err: any) {
      Alert.alert(
        "Verification Error",
        err.response?.data?.message || "Could not verify Aadhaar image. Please ensure photo is clear."
      );
    } finally {
      setUploadingAadhaar(false);
    }
  };

  if (loading) {
    return <AppLoader fullScreen message="Checking verification status..." />;
  }

  const isAadhaarVerified =
    aadhaarStatus?.isVerified ||
    aadhaarStatus?.verificationStatus === "APPROVED" ||
    aadhaarStatus?.verificationStatus === "VERIFIED";

  return (
    <AppScreen
      refreshing={refreshing}
      onRefresh={handleRefresh}
      withTopInset
      contentContainerStyle={styles.container}
    >
      <AppHeader
        title="Owner KYC & Verification"
        subtitle="Government identity & vehicle RC validation"
      />

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Status Header Banner */}
        <AppCard
          style={[
            styles.bannerCard,
            {
              backgroundColor: isAadhaarVerified
                ? isDark
                  ? "#1E2A22"
                  : "#DEF7EC"
                : isDark
                ? "#2E2A1E"
                : "#FEF3C7",
              borderColor: isAadhaarVerified ? "#22C55E" : "#F59E0B",
            },
          ]}
        >
          <View style={styles.bannerRow}>
            {isAadhaarVerified ? (
              <ShieldCheck size={28} color="#22C55E" style={{ marginRight: 12 }} />
            ) : (
              <ShieldAlert size={28} color="#F59E0B" style={{ marginRight: 12 }} />
            )}
            <View style={{ flex: 1 }}>
              <AppText variant="h3" weight="700">
                {isAadhaarVerified
                  ? "Identity Verification Complete"
                  : "Owner Identity Verification Pending"}
              </AppText>
              <AppText variant="caption" color="muted" style={{ marginTop: 2 }}>
                {isAadhaarVerified
                  ? "Your Aadhaar identity has been verified. Your listed bikes can be approved."
                  : "Please upload your Aadhaar card to unlock full fleet listing capabilities."}
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Owner Aadhaar Card */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            1. Owner Aadhaar Card (KYC)
          </AppText>

          <DocumentUploader
            title="Aadhaar Card"
            subtitle="Auto-read via OCR (Purpose: Bike Owner)"
            documentType="AADHAAR"
            status={isAadhaarVerified ? "VERIFIED" : "NOT_UPLOADED"}
            onUpload={handleUploadAadhaar}
            isUploading={uploadingAadhaar}
          />

          {aadhaarStatus?.aadhaarNumber && (
            <AppCard style={styles.extractedCard}>
              <AppText variant="caption" color="muted" weight="700">
                EXTRACTED AADHAAR DETAILS
              </AppText>
              <View style={[styles.extractedRow, { marginTop: 6 }]}>
                <AppText variant="bodySmall" color="muted">
                  Aadhaar Number:
                </AppText>
                <AppText variant="bodySmall" weight="700">
                  {maskAadhaar(aadhaarStatus.aadhaarNumber)}
                </AppText>
              </View>
              {aadhaarStatus.fullName && (
                <View style={[styles.extractedRow, { marginTop: 4 }]}>
                  <AppText variant="bodySmall" color="muted">
                    Name on Document:
                  </AppText>
                  <AppText variant="bodySmall" weight="700">
                    {aadhaarStatus.fullName}
                  </AppText>
                </View>
              )}
            </AppCard>
          )}
        </View>

        {/* Fleet Vehicle RC Verification */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="h3" weight="700">
              2. Vehicle RC Documents
            </AppText>
            <AppButton
              title="Upload New RC"
              size="sm"
              variant="outline"
              onPress={() => navigation.navigate("DocumentsScreen", {})}
            />
          </View>

          {approvedRcs.length === 0 ? (
            <AppCard style={styles.emptyCard}>
              <Bike size={32} color={theme.primary} style={{ marginBottom: 6 }} />
              <AppText variant="body" weight="700">
                No approved RC records yet
              </AppText>
              <AppText variant="caption" color="muted" style={{ textAlign: "center", marginTop: 4 }}>
                Upload your Registration Certificate (RC) for each bike when adding vehicles or via the Documents tab.
              </AppText>
            </AppCard>
          ) : (
            approvedRcs.map((rc, idx) => (
              <AppCard key={idx} style={styles.rcItemCard}>
                <View style={styles.rcItemRow}>
                  <FileText size={18} color="#22C55E" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodySmall" weight="700">
                      Reg: {rc.registrationNumber}
                    </AppText>
                    {rc.rcNumber && (
                      <AppText variant="caption" color="muted">
                        RC #{rc.rcNumber}
                      </AppText>
                    )}
                  </View>
                  <AppBadge label="RC APPROVED" variant="success" size="sm" />
                </View>
              </AppCard>
            ))
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  scrollBody: {
    paddingHorizontal: 16,
  },
  bannerCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  extractedCard: {
    padding: 12,
    marginTop: 8,
  },
  extractedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emptyCard: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  rcItemCard: {
    padding: 12,
    marginVertical: 4,
  },
  rcItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default VerificationScreen;
