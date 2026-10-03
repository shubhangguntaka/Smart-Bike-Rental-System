import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { User, Mail, Phone, MapPin } from "lucide-react-native";
import { OwnerStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { ownerService } from "../../services/ownerService";
import { useTheme } from "../../theme";
import AppScreen from "../../components/common/AppScreen";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppInput from "../../components/common/AppInput";
import AppButton from "../../components/common/AppButton";

type Props = NativeStackScreenProps<OwnerStackParamList, "EditProfileScreen">;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, ownerProfile, setOwnerProfile } = useAuthStore();

  const [ownerName, setOwnerName] = useState(
    ownerProfile?.ownerName || user?.fullName || user?.name || ""
  );
  const [email, setEmail] = useState(ownerProfile?.email || user?.email || "");
  const [phone, setPhone] = useState(
    ownerProfile?.phone || ownerProfile?.phoneNumber || user?.phoneNumber || user?.phone || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!ownerName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const updated = await ownerService.updateProfile({
        ownerName: ownerName.trim(),
        fullName: ownerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        phoneNumber: phone.trim(),
      });

      if (updated) {
        setOwnerProfile(updated);
      }

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not update profile.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen withTopInset contentContainerStyle={styles.container}>
      <AppHeader title="Edit Profile" subtitle="Update your personal details" />

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <AppInput
            label="Full Name *"
            placeholder="e.g. Ramesh Kumar"
            value={ownerName}
            onChangeText={setOwnerName}
            icon={<User size={18} color={theme.mutedForeground} />}
          />

          <AppInput
            label="Email Address"
            placeholder="owner@example.com"
            value={email}
            onChangeText={setEmail}
            editable={false}
            icon={<Mail size={18} color={theme.mutedForeground} />}
            helperText="Email address cannot be changed directly."
          />

          <AppInput
            label="Phone Number"
            placeholder="9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            icon={<Phone size={18} color={theme.mutedForeground} />}
          />

          {error ? (
            <AppText
              variant="bodySmall"
              color="destructive"
              style={styles.errorText}
            >
              {error}
            </AppText>
          ) : null}

          <AppButton
            title="Save Profile"
            size="lg"
            onPress={handleSave}
            loading={loading}
            style={styles.saveBtn}
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
  form: {
    marginTop: 16,
  },
  errorText: {
    marginVertical: 10,
    textAlign: "center",
  },
  saveBtn: {
    marginTop: 20,
  },
});

export default EditProfileScreen;
