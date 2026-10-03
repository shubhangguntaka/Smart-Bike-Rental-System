import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { FileText, Camera, Upload, CheckCircle2, XCircle, Clock } from "lucide-react-native";
import { useTheme } from "../../theme";
import AppText from "../common/AppText";
import AppBadge from "../common/AppBadge";
import AppButton from "../common/AppButton";

export interface DocumentUploaderProps {
  title: string;
  subtitle?: string;
  documentType: "RC" | "AADHAAR" | "DRIVING_LICENSE" | "INSURANCE" | "POLLUTION";
  status?: "VERIFIED" | "APPROVED" | "PENDING" | "REJECTED" | "NOT_UPLOADED" | string;
  documentUri?: string | null;
  onUpload: (uri: string, fileType?: string) => Promise<void> | void;
  isUploading?: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  title,
  subtitle,
  documentType,
  status = "NOT_UPLOADED",
  documentUri,
  onUpload,
  isUploading = false,
}) => {
  const { theme, isDark } = useTheme();
  const [localUri, setLocalUri] = useState<string | null>(documentUri || null);

  const isVerified = status === "VERIFIED" || status === "APPROVED";
  const isPending = status === "PENDING";
  const isRejected = status === "REJECTED";

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setLocalUri(asset.uri);
        await onUpload(asset.uri, asset.mimeType);
      }
    } catch (err) {
      console.warn("Document pick error:", err);
    }
  };

  const handleCameraPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Camera permission is needed.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.85,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setLocalUri(uri);
        await onUpload(uri, "image/jpeg");
      }
    } catch (err) {
      console.warn("Camera photo error:", err);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: isVerified
            ? "#22C55E"
            : isRejected
            ? theme.destructive
            : theme.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <FileText
            size={20}
            color={isVerified ? "#22C55E" : theme.primary}
            style={{ marginRight: 8 }}
          />
          <View>
            <AppText variant="body" weight="700">
              {title}
            </AppText>
            {subtitle && (
              <AppText variant="caption" color="muted">
                {subtitle}
              </AppText>
            )}
          </View>
        </View>

        <AppBadge
          label={
            isVerified
              ? "VERIFIED"
              : isPending
              ? "PENDING"
              : isRejected
              ? "REJECTED"
              : "NOT UPLOADED"
          }
          variant={
            isVerified
              ? "success"
              : isPending
              ? "warning"
              : isRejected
              ? "error"
              : "neutral"
          }
          size="sm"
        />
      </View>

      {/* Preview or Upload Area */}
      {localUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: localUri }} style={styles.previewImage} resizeMode="cover" />
        </View>
      ) : null}

      {/* Action Buttons */}
      {!isVerified && (
        <View style={styles.actionsRow}>
          <AppButton
            title="Gallery / PDF"
            variant="outline"
            size="sm"
            onPress={handlePickDocument}
            loading={isUploading}
            style={styles.actionBtn}
          />
          <AppButton
            title="Scan Photo"
            variant="primary"
            size="sm"
            icon={<Camera size={14} color="#FFFFFF" />}
            onPress={handleCameraPhoto}
            loading={isUploading}
            style={[styles.actionBtn, { marginLeft: 8 }]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginVertical: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  previewContainer: {
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    height: 36,
  },
});

export default DocumentUploader;
