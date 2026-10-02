import React, { useState } from "react";
import { View, Text, ScrollView, Image, Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { User, Mail, Phone, Camera, ArrowRight, CheckCircle2 } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";
import { userService } from "../../services/userService";
import AppHeader from "../../components/common/AppHeader";
import AppInput from "../../components/common/AppInput";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import { useTheme } from "../../theme";

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, setUser, refreshProfile } = useAuthStore();
  const { theme } = useTheme();

  const [fullName, setFullName] = useState(user?.fullName || user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [email] = useState(user?.email || "");

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pickProfileImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Gallery permission is required to update photo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingAvatar(true);
        const file = {
          uri: result.assets[0].uri,
          name: `profile_${Date.now()}.jpg`,
          type: "image/jpeg",
        };

        const updatedUser = await userService.uploadProfileImage(file);
        if (updatedUser) {
          setUser(updatedUser);
          setSuccessMessage("Profile photo updated successfully!");
        }
      }
    } catch (err: any) {
      setErrorMessage("Failed to upload profile photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setErrorMessage("Full name cannot be empty.");
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setSaving(true);
    try {
      const updated = await userService.updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      if (updated) {
        setUser(updated);
      }
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppScreen edges={["top", "bottom"]} scrollable={false}>
      <AppHeader title="Edit Profile" showBack />

      <ScrollView
        className="flex-1 px-5 py-4 space-y-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar change frame */}
        <View className="items-center py-4 space-y-2">
          <View className="relative">
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                className="w-24 h-24 rounded-3xl border-2 border-border"
              />
            ) : (
              <View className="w-24 h-24 rounded-3xl bg-primary/15 items-center justify-center border-2 border-primary/30">
                <User size={36} color={theme.primary} />
              </View>
            )}

            <Pressable
              onPress={pickProfileImage}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-primary border-2 border-background shadow-md active:opacity-90"
            >
              <Camera size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs text-muted-foreground"
          >
            {uploadingAvatar ? "Uploading photo..." : "Tap camera icon to change photo"}
          </Text>
        </View>

        {successMessage && (
          <View className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex-row items-center gap-2">
            <CheckCircle2 size={16} color="#059669" />
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs text-emerald-800 dark:text-emerald-300 font-medium"
            >
              {successMessage}
            </Text>
          </View>
        )}

        {errorMessage && (
          <View className="p-3 bg-destructive/10 border border-destructive/30 rounded-2xl">
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs text-destructive font-medium"
            >
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Inputs */}
        <View className="space-y-3">
          <AppInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="John Doe"
            leftIcon={<User size={18} color={theme.mutedForeground} />}
          />

          <AppInput
            label="Email Address"
            value={email}
            editable={false}
            leftIcon={<Mail size={18} color={theme.mutedForeground} />}
          />

          <AppInput
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="9876543210"
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={theme.mutedForeground} />}
          />
        </View>

        <AppButton
          title="Save Changes"
          variant="primary"
          size="lg"
          loading={saving}
          onPress={handleSave}
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
          className="mt-4"
        />
      </ScrollView>
    </AppScreen>
  );
}
