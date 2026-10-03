import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon, X, Plus } from "lucide-react-native";
import { useTheme } from "../../theme";
import AppText from "../common/AppText";

export interface ImageUploaderProps {
  label?: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label = "Bike Images",
  images,
  onChange,
  maxImages = 5,
}) => {
  const { theme, isDark } = useTheme();

  const handlePickImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert("Limit Reached", `You can only upload up to ${maxImages} images.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Camera roll permissions are required to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onChange([...images, result.assets[0].uri]);
    }
  };

  const handleTakeSelfie = async () => {
    if (images.length >= maxImages) {
      Alert.alert("Limit Reached", `You can only upload up to ${maxImages} images.`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Camera permissions are required to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onChange([...images, result.assets[0].uri]);
    }
  };

  const handleRemove = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" weight="600" style={styles.label}>
        {label} ({images.length}/{maxImages})
      </AppText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {images.map((uri, index) => (
          <View key={index} style={styles.previewBox}>
            <Image source={{ uri }} style={styles.previewImage} />
            <Pressable
              onPress={() => handleRemove(index)}
              style={styles.removeBtn}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <X size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        ))}

        {images.length < maxImages && (
          <View style={styles.buttonsRow}>
            <Pressable
              onPress={handlePickImage}
              style={[
                styles.uploadBox,
                {
                  backgroundColor: theme.input,
                  borderColor: theme.border,
                },
              ]}
            >
              <ImageIcon size={22} color={theme.primary} />
              <AppText variant="caption" color="muted" style={{ marginTop: 4 }}>
                Gallery
              </AppText>
            </Pressable>

            <Pressable
              onPress={handleTakeSelfie}
              style={[
                styles.uploadBox,
                {
                  backgroundColor: theme.input,
                  borderColor: theme.border,
                  marginLeft: 8,
                },
              ]}
            >
              <Camera size={22} color={theme.primary} />
              <AppText variant="caption" color="muted" style={{ marginTop: 4 }}>
                Camera
              </AppText>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 8,
  },
  scroll: {
    flexDirection: "row",
  },
  previewBox: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 10,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonsRow: {
    flexDirection: "row",
  },
  uploadBox: {
    width: 80,
    height: 90,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ImageUploader;
