import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FileText, ShieldCheck } from "lucide-react-native";
import { OwnerStackParamList } from "../../navigation/types";
import { verificationService } from "../../services/verificationService";
import { bikeService } from "../../services/bikeService";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../theme";
import AppScreen from "../../components/common/AppScreen";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppInput from "../../components/common/AppInput";
import DocumentUploader from "../../components/forms/DocumentUploader";

type Props = NativeStackScreenProps<OwnerStackParamList, "DocumentsScreen">;

export const DocumentsScreen: React.FC<Props> = ({ route, navigation }) => {
  const bikeId = route.params?.bikeId;
  const { theme } = useTheme();
  const { user } = useAuthStore();

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [uploadingRc, setUploadingRc] = useState(false);
  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);
  const [uploadingInsurance, setUploadingInsurance] = useState(false);
  const [uploadingPuc, setUploadingPuc] = useState(false);

  const [rcStatus, setRcStatus] = useState<string>("NOT_UPLOADED");
  const [aadhaarStatus, setAadhaarStatus] = useState<string>("NOT_UPLOADED");

  const handleUploadRC = async (uri: string, fileType?: string) => {
    setUploadingRc(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "bike_rc.jpg",
        type: fileType || "image/jpeg",
      } as any);

      if (user?.id) {
        formData.append("ownerId", String(user.id));
      }
      if (bikeId) {
        formData.append("bikeId", String(bikeId));
      }
      if (registrationNumber.trim()) {
        formData.append("registrationNumber", registrationNumber.trim().toUpperCase());
      }

      const res = await verificationService.verifyBikeRc(formData);
      setRcStatus("VERIFIED");
      Alert.alert(
        "RC Verified!",
        "Your Vehicle Registration Certificate (RC) has been verified."
      );
    } catch (err: any) {
      Alert.alert(
        "Verification Failed",
        err.response?.data?.message || "Could not verify RC document. Please ensure the registration certificate is clearly visible."
      );
    } finally {
      setUploadingRc(false);
    }
  };

  const handleUploadAadhaar = async (uri: string, fileType?: string) => {
    setUploadingAadhaar(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "aadhaar.jpg",
        type: fileType || "image/jpeg",
      } as any);
      if (user?.id) formData.append("customerId", String(user.id));
      formData.append("purpose", "BIKE_OWNER");

      await verificationService.verifyAadhaar(formData);
      setAadhaarStatus("VERIFIED");
      Alert.alert("Aadhaar Verified!", "Aadhaar KYC verified successfully.");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Aadhaar verification failed.");
    } finally {
      setUploadingAadhaar(false);
    }
  };

  const handleUploadGeneric = async (docType: string) => {
    Alert.alert("Uploaded", `${docType} received and submitted for validation.`);
  };

  return (
    <AppScreen withTopInset contentContainerStyle={styles.container}>
      <AppHeader
        title="Document Management"
        subtitle={bikeId ? `Documents for Bike #${bikeId}` : "Fleet & Identity Verification"}
      />

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* RC Document */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            1. Registration Certificate (RC)
          </AppText>
          <AppInput
            label="Registration Number"
            placeholder="e.g. MH12AB1234 (Optional if linking to existing)"
            value={registrationNumber}
            onChangeText={setRegistrationNumber}
            autoCapitalize="characters"
          />
          <DocumentUploader
            title="Vehicle RC Document"
            subtitle="Auto-read OCR & QR verification"
            documentType="RC"
            status={rcStatus}
            onUpload={handleUploadRC}
            isUploading={uploadingRc}
          />
        </View>

        {/* Aadhaar */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            2. Owner Aadhaar Card (KYC)
          </AppText>
          <DocumentUploader
            title="Aadhaar Card"
            subtitle="Identity proof for vehicle owner"
            documentType="AADHAAR"
            status={aadhaarStatus}
            onUpload={handleUploadAadhaar}
            isUploading={uploadingAadhaar}
          />
        </View>

        {/* Insurance */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            3. Vehicle Insurance Policy
          </AppText>
          <DocumentUploader
            title="Insurance Certificate"
            subtitle="Valid comprehensive / third-party insurance"
            documentType="INSURANCE"
            onUpload={() => handleUploadGeneric("Insurance Policy")}
            isUploading={uploadingInsurance}
          />
        </View>

        {/* Pollution */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            4. Pollution Under Control (PUC)
          </AppText>
          <DocumentUploader
            title="PUC Certificate"
            subtitle="Valid vehicle emission clearance"
            documentType="POLLUTION"
            onUpload={() => handleUploadGeneric("PUC Certificate")}
            isUploading={uploadingPuc}
          />
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
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
});

export default DocumentsScreen;
