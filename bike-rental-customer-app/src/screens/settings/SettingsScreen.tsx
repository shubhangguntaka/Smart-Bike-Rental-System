import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import {
  Sun,
  Moon,
  Tv,
  CheckCircle2,
  Bike,
  CreditCard,
  Bell,
  ShieldCheck,
  Smartphone,
  Mail,
  FileText,
  ShieldAlert,
  Sparkles,
  Volume2,
  MapPin,
  Clock,
  RotateCcw,
  Save,
  LogOut,
  ChevronRight,
  User,
  Lock,
  Headphones,
  Sliders,
  HelpCircle,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { themeStorage, AppCustomerSettings, DEFAULT_APP_SETTINGS, ThemeMode } from "../../services/themeStorage";
import { useAuthStore } from "../../store/authStore";
import AppHeader from "../../components/common/AppHeader";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";

type SettingsTab = "APPEARANCE" | "RENTAL" | "PAYMENTS" | "NOTIFICATIONS" | "SECURITY";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { themeMode, setThemeMode, theme, isDark } = useTheme();
  const { logout, user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("APPEARANCE");
  const [config, setConfig] = useState<AppCustomerSettings>(DEFAULT_APP_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load saved settings
  useEffect(() => {
    async function loadSettings() {
      const data = await themeStorage.getSettings();
      setConfig(data);
    }
    loadSettings();
  }, []);

  const updateField = <K extends keyof AppCustomerSettings>(
    key: K,
    value: AppCustomerSettings[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await themeStorage.saveSettings(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      Alert.alert("Error", "Failed to save customer settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to restore all settings and theme to factory defaults?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset All",
          style: "destructive",
          onPress: async () => {
            await themeStorage.resetSettings();
            await setThemeMode("system");
            setConfig(DEFAULT_APP_SETTINGS);
            Alert.alert("Success", "Settings restored to defaults.");
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out from your customer account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const tabs = [
    { id: "APPEARANCE" as SettingsTab, label: "Theme", icon: Sun },
    { id: "RENTAL" as SettingsTab, label: "Ride Defaults", icon: Bike },
    { id: "PAYMENTS" as SettingsTab, label: "Billing", icon: CreditCard },
    { id: "NOTIFICATIONS" as SettingsTab, label: "Alerts", icon: Bell },
    { id: "SECURITY" as SettingsTab, label: "Account", icon: ShieldCheck },
  ];

  return (
    <AppScreen edges={["top"]} scrollable={false}>
      <AppHeader
        title="Settings & Preferences"
        subtitle="Manage your theme, ride rules, and account"
        showBack
        rightAction={
          <Pressable
            onPress={handleSaveSettings}
            disabled={saving}
            className="px-3 py-1.5 rounded-xl bg-primary active:opacity-80 flex-row items-center gap-1.5 shadow-2xs"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Save size={13} color="#FFFFFF" />
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs font-bold text-white"
            >
              {saving ? "Saving..." : "Save"}
            </Text>
          </Pressable>
        }
      />

      {/* Tabs Navigation */}
      <View className="border-b border-border/80 bg-card px-4 py-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl border ${
                  isActive
                    ? "bg-primary border-primary"
                    : "bg-muted/40 border-border/70"
                }`}
              >
                <Icon
                  size={13}
                  color={isActive ? "#FFFFFF" : theme.mutedForeground}
                />
                <Text
                  style={{ fontFamily: "Antic" }}
                  className={`text-xs font-bold ${
                    isActive ? "text-white" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Save Success Banner */}
        {saveSuccess && (
          <View className="mb-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex-row items-center gap-2.5">
            <CheckCircle2 size={16} color="#059669" />
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex-1"
            >
              Preferences saved successfully!
            </Text>
          </View>
        )}

        {/* TAB 1: THEME & DISPLAY */}
        {activeTab === "APPEARANCE" && (
          <View className="space-y-5">
            {/* Theme Mode Selector Card */}
            <View className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
              <View className="flex-row items-center gap-2">
                <Sun size={18} color={theme.primary} />
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-sm font-bold text-foreground"
                >
                  Application Theme Mode
                </Text>
              </View>

              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs text-muted-foreground leading-relaxed"
              >
                Choose how the Smart Bike Rental mobile app adapts its color scheme and visual contrast.
              </Text>

              <View className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    mode: "light" as ThemeMode,
                    title: "Light Mode",
                    desc: "Sage Garden bright parchment theme",
                    icon: Sun,
                  },
                  {
                    mode: "dark" as ThemeMode,
                    title: "Dark Mode",
                    desc: "Sleek low-light dark theme",
                    icon: Moon,
                  },
                  {
                    mode: "system" as ThemeMode,
                    title: "System Sync",
                    desc: "Automatically follows device settings",
                    icon: Tv,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = themeMode === item.mode;
                  return (
                    <Pressable
                      key={item.mode}
                      onPress={() => setThemeMode(item.mode)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      className={`p-3.5 rounded-2xl border flex-row items-center justify-between transition ${
                        isSelected
                          ? "bg-primary/10 border-primary"
                          : "bg-muted/30 border-border/60"
                      }`}
                    >
                      <View className="flex-row items-center gap-3">
                        <View
                          className={`w-9 h-9 rounded-xl items-center justify-center ${
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon
                            size={18}
                            color={isSelected ? "#FFFFFF" : theme.mutedForeground}
                          />
                        </View>
                        <View>
                          <Text
                            style={{ fontFamily: "Antic" }}
                            className={`text-xs font-bold ${
                              isSelected ? "text-foreground" : "text-foreground/80"
                            }`}
                          >
                            {item.title}
                          </Text>
                          <Text
                            style={{ fontFamily: "Antic" }}
                            className="text-[11px] text-muted-foreground mt-0.5"
                          >
                            {item.desc}
                          </Text>
                        </View>
                      </View>

                      {isSelected && (
                        <CheckCircle2 size={18} color={theme.primary} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Display Localization */}
            <View className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
              <View className="flex-row items-center gap-2">
                <Clock size={16} color={theme.primary} />
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Regional & Display Preferences
                </Text>
              </View>

              {/* Time Format */}
              <View className="space-y-2">
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold text-foreground"
                >
                  Time Format
                </Text>
                <View className="flex-row gap-2">
                  {(["12h", "24h"] as const).map((fmt) => (
                    <Pressable
                      key={fmt}
                      onPress={() => updateField("timeFormat", fmt)}
                      className={`flex-1 p-2.5 rounded-xl border items-center ${
                        config.timeFormat === fmt
                          ? "bg-primary/10 border-primary"
                          : "bg-muted/30 border-border/60"
                      }`}
                    >
                      <Text
                        style={{ fontFamily: "Antic" }}
                        className={`text-xs font-bold ${
                          config.timeFormat === fmt
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {fmt === "12h" ? "12-Hour (09:30 AM)" : "24-Hour (21:30)"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Currency */}
              <View className="space-y-2">
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold text-foreground"
                >
                  Display Currency
                </Text>
                <View className="flex-row gap-2">
                  {[
                    { code: "INR", label: "INR (₹)" },
                    { code: "USD", label: "USD ($)" },
                    { code: "EUR", label: "EUR (€)" },
                  ].map((curr) => (
                    <Pressable
                      key={curr.code}
                      onPress={() => updateField("currency", curr.code)}
                      className={`flex-1 p-2.5 rounded-xl border items-center ${
                        config.currency === curr.code
                          ? "bg-primary/10 border-primary"
                          : "bg-muted/30 border-border/60"
                      }`}
                    >
                      <Text
                        style={{ fontFamily: "Antic" }}
                        className={`text-xs font-bold ${
                          config.currency === curr.code
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {curr.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Compact Tables */}
              <View className="pt-2 border-t border-border/60 flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text
                    style={{ fontFamily: "Antic" }}
                    className="text-xs font-bold text-foreground"
                  >
                    Compact List Density
                  </Text>
                  <Text
                    style={{ fontFamily: "Antic" }}
                    className="text-[11px] text-muted-foreground mt-0.5"
                  >
                    Dense padding in booking history and invoices
                  </Text>
                </View>
                <Switch
                  value={config.compactTables}
                  onValueChange={(val) => updateField("compactTables", val)}
                  trackColor={{ false: theme.muted, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: RIDE & BOOKING DEFAULTS */}
        {activeTab === "RENTAL" && (
          <View className="space-y-4">
            <View className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
              <View className="flex-row items-center gap-2">
                <Bike size={18} color={theme.primary} />
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-sm font-bold text-foreground"
                >
                  Ride & Rental Defaults
                </Text>
              </View>

              {/* Helmet Option */}
              <View className="space-y-2">
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold text-foreground"
                >
                  Default Helmet Preference
                </Text>
                {[
                  { id: "single", label: "Single Helmet (Rider Included)" },
                  { id: "dual", label: "Dual Helmets (Rider + Pillion)" },
                  { id: "none", label: "Bring Own Helmet" },
                ].map((opt) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => updateField("preferredHelmetOption", opt.id as any)}
                    className={`p-3 rounded-xl border flex-row items-center justify-between ${
                      config.preferredHelmetOption === opt.id
                        ? "bg-primary/10 border-primary"
                        : "bg-muted/30 border-border/60"
                    }`}
                  >
                    <Text
                      style={{ fontFamily: "Antic" }}
                      className={`text-xs font-bold ${
                        config.preferredHelmetOption === opt.id
                          ? "text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {opt.label}
                    </Text>
                    {config.preferredHelmetOption === opt.id && (
                      <CheckCircle2 size={16} color={theme.primary} />
                    )}
                  </Pressable>
                ))}
              </View>

              {/* Preferred Bike Category */}
              <View className="space-y-2 pt-2 border-t border-border/60">
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold text-foreground"
                >
                  Default Fleet Category Filter
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {[
                    { id: "all", label: "All Fleet" },
                    { id: "sports", label: "Sports" },
                    { id: "scooter", label: "Scooters" },
                    { id: "ev", label: "EV Fleet" },
                    { id: "cruiser", label: "Cruisers" },
                  ].map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => updateField("preferredBikeCategory", cat.id as any)}
                      className={`px-3 py-1.5 rounded-xl border ${
                        config.preferredBikeCategory === cat.id
                          ? "bg-primary border-primary"
                          : "bg-muted/40 border-border/60"
                      }`}
                    >
                      <Text
                        style={{ fontFamily: "Antic" }}
                        className={`text-xs font-bold ${
                          config.preferredBikeCategory === cat.id
                            ? "text-white"
                            : "text-muted-foreground"
                        }`}
                      >
                        {cat.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Instant Booking */}
              <View className="pt-2 border-t border-border/60 flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text
                    style={{ fontFamily: "Antic" }}
                    className="text-xs font-bold text-foreground"
                  >
                    Instant Auto-Confirmation
                  </Text>
                  <Text
                    style={{ fontFamily: "Antic" }}
                    className="text-[11px] text-muted-foreground mt-0.5"
                  >
                    Fast-track instant rental approvals without host wait
                  </Text>
                </View>
                <Switch
                  value={config.autoInstantBooking}
                  onValueChange={(val) => updateField("autoInstantBooking", val)}
                  trackColor={{ false: theme.muted, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        )}

        {/* TAB 3: PAYMENT & BILLING */}
        {activeTab === "PAYMENTS" && (
          <View className="space-y-4">
            <View className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
              <View className="flex-row items-center gap-2">
                <CreditCard size={18} color="#059669" />
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-sm font-bold text-foreground"
                >
                  Payment & Invoice Preferences
                </Text>
              </View>

              {/* Default Payment Method */}
              <View className="space-y-2">
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold text-foreground"
                >
                  Default Payment Mode
                </Text>
                {[
                  { id: "upi", label: "UPI (Google Pay, PhonePe, Paytm)" },
                  { id: "card", label: "Credit or Debit Card" },
                  { id: "wallet", label: "SmartBike Prepaid Wallet" },
                  { id: "netbanking", label: "Net Banking" },
                ].map((pm) => (
                  <Pressable
                    key={pm.id}
                    onPress={() => updateField("defaultPaymentMethod", pm.id as any)}
                    className={`p-3 rounded-xl border flex-row items-center justify-between ${
                      config.defaultPaymentMethod === pm.id
                        ? "bg-primary/10 border-primary"
                        : "bg-muted/30 border-border/60"
                    }`}
                  >
                    <Text
                      style={{ fontFamily: "Antic" }}
                      className={`text-xs font-bold ${
                        config.defaultPaymentMethod === pm.id
                          ? "text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {pm.label}
                    </Text>
                    {config.defaultPaymentMethod === pm.id && (
                      <CheckCircle2 size={16} color={theme.primary} />
                    )}
                  </Pressable>
                ))}
              </View>

              {/* Saved UPI ID */}
              <View className="space-y-1.5 pt-2 border-t border-border/60">
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold text-foreground"
                >
                  Saved UPI Handle
                </Text>
                <TextInput
                  value={config.savedUpiId}
                  onChangeText={(val) => updateField("savedUpiId", val)}
                  placeholder="e.g. yourname@okhdfcbank"
                  placeholderTextColor={theme.mutedForeground}
                  style={{ fontFamily: "JetBrainsMono" }}
                  className="p-3 rounded-xl bg-muted/40 border border-border/80 text-xs text-foreground font-bold"
                />
              </View>

              {/* Email Invoices */}
              <View className="pt-2 border-t border-border/60 flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text
                    style={{ fontFamily: "Antic" }}
                    className="text-xs font-bold text-foreground"
                  >
                    Email PDF Tax Invoices
                  </Text>
                  <Text
                    style={{ fontFamily: "Antic" }}
                    className="text-[11px] text-muted-foreground mt-0.5"
                  >
                    Automatically email receipt on trip completion
                  </Text>
                </View>
                <Switch
                  value={config.emailInvoicesOnCompletion}
                  onValueChange={(val) => updateField("emailInvoicesOnCompletion", val)}
                  trackColor={{ false: theme.muted, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        )}

        {/* TAB 4: NOTIFICATIONS & SMS */}
        {activeTab === "NOTIFICATIONS" && (
          <View className="space-y-4">
            <View className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
              <View className="flex-row items-center gap-2">
                <Bell size={18} color="#D97706" />
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-sm font-bold text-foreground"
                >
                  Notification & Alert Channels
                </Text>
              </View>

              {[
                {
                  key: "smsRideAlerts" as const,
                  title: "SMS Ride Alerts & Unlock PINs",
                  desc: "Receive pickup OTPs and unlock PINs via SMS",
                  icon: Smartphone,
                },
                {
                  key: "whatsappAlerts" as const,
                  title: "WhatsApp Live Trip Updates",
                  desc: "Live route directions and station reminders",
                  icon: Mail,
                },
                {
                  key: "emailDailyDigest" as const,
                  title: "Email Summary Digests",
                  desc: "Weekly rental statements and receipts",
                  icon: FileText,
                },
                {
                  key: "promoAlerts" as const,
                  title: "Promotional Discounts & Deals",
                  desc: "Weekend ride coupons and festival offers",
                  icon: Sparkles,
                },
                {
                  key: "soundAlertsEnabled" as const,
                  title: "In-App Audio Chimes",
                  desc: "Speed warning tones and smart lock chimes",
                  icon: Volume2,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isChecked = Boolean(config[item.key]);
                return (
                  <View
                    key={item.key}
                    className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-3 flex-1 pr-3">
                      <View className="w-8 h-8 rounded-xl bg-muted items-center justify-center">
                        <Icon size={15} color={theme.foreground} />
                      </View>
                      <View className="flex-1">
                        <Text
                          style={{ fontFamily: "Antic" }}
                          className="text-xs font-bold text-foreground"
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={{ fontFamily: "Antic" }}
                          className="text-[11px] text-muted-foreground mt-0.5"
                        >
                          {item.desc}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={isChecked}
                      onValueChange={(val) => updateField(item.key, val)}
                      trackColor={{ false: theme.muted, true: theme.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 5: PRIVACY & ACCOUNT */}
        {activeTab === "SECURITY" && (
          <View className="space-y-4">
            <View className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
              <View className="flex-row items-center gap-2">
                <ShieldCheck size={18} color="#059669" />
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-sm font-bold text-foreground"
                >
                  Account & Privacy Controls
                </Text>
              </View>

              {/* Navigation links */}
              <Pressable
                onPress={() => navigation.navigate("EditProfileScreen")}
                className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 flex-row items-center justify-between active:bg-muted"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                    <User size={15} color={theme.primary} />
                  </View>
                  <Text
                    style={{ fontFamily: "Antic" }}
                    className="text-xs font-bold text-foreground"
                  >
                    Edit Customer Profile
                  </Text>
                </View>
                <ChevronRight size={16} color={theme.mutedForeground} />
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("ChangePasswordScreen")}
                className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 flex-row items-center justify-between active:bg-muted"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-xl bg-purple-500/10 items-center justify-center">
                    <Lock size={15} color="#9333EA" />
                  </View>
                  <Text
                    style={{ fontFamily: "Antic" }}
                    className="text-xs font-bold text-foreground"
                  >
                    Change Account Password
                  </Text>
                </View>
                <ChevronRight size={16} color={theme.mutedForeground} />
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("VerificationScreen")}
                className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 flex-row items-center justify-between active:bg-muted"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-xl bg-emerald-500/10 items-center justify-center">
                    <ShieldCheck size={15} color="#059669" />
                  </View>
                  <Text
                    style={{ fontFamily: "Antic" }}
                    className="text-xs font-bold text-foreground"
                  >
                    Aadhaar & DL Verification
                  </Text>
                </View>
                <ChevronRight size={16} color={theme.mutedForeground} />
              </Pressable>

              {/* Live GPS Sharing */}
              <View className="pt-2 border-t border-border/60 flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text
                    style={{ fontFamily: "Antic" }}
                    className="text-xs font-bold text-foreground"
                  >
                    Live GPS Telemetry Sharing
                  </Text>
                  <Text
                    style={{ fontFamily: "Antic" }}
                    className="text-[11px] text-muted-foreground mt-0.5"
                  >
                    Stream real-time location to hub for safety and emergency dispatch
                  </Text>
                </View>
                <Switch
                  value={config.liveGpsSharingEnabled}
                  onValueChange={(val) => updateField("liveGpsSharingEnabled", val)}
                  trackColor={{ false: theme.muted, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        )}

        {/* Global Actions */}
        <View className="pt-4 space-y-3">
          <AppButton
            title="Restore Factory Defaults"
            variant="outline"
            size="md"
            leftIcon={<RotateCcw size={15} color={theme.mutedForeground} />}
            onPress={handleResetDefaults}
          />

          <AppButton
            title="Sign Out of Customer Account"
            variant="destructive"
            size="md"
            leftIcon={<LogOut size={15} color="#FFFFFF" />}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}
