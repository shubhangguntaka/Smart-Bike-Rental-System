import React, { useState } from "react";
import { View, Text, useColorScheme } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Bike, Sparkles, CheckCircle2, Moon, Sun, ArrowRight } from "lucide-react-native";

import { AuthStackParamList } from "../navigation/AuthNavigator";
import {
  AppScreen,
  AppText,
  AppButton,
  AppInput,
  AppCard,
  AppBadge,
  AppLoader,
  AppDivider,
} from "../components/common";
import { colors, darkColors, useTheme } from "../theme";

type TestScreenProps = {
  navigation: any;
};

export default function TestScreen({ navigation }: TestScreenProps) {
  const [testInput, setTestInput] = useState("Sage Garden Theme Value");
  const [isLoading, setIsLoading] = useState(false);
  const { theme, isDark } = useTheme();

  return (
    <AppScreen scrollable className="px-5 py-4">
      {/* 1. Mandatory NativeWind Minimal Test */}
      <View className="items-center justify-center bg-primary/10 border border-primary/30 p-4 rounded-xl mb-6">
        <View className="flex-row items-center mb-1">
          <Sparkles size={20} color={theme.primary} />
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xl font-bold text-primary tracking-wide ml-2"
          >
            NativeWind Working
          </Text>
        </View>
        <Text
          style={{ fontFamily: "JetBrainsMono" }}
          className="text-xs text-muted-foreground"
        >
          Tailwind classes compiled & applied successfully
        </Text>
      </View>

      {/* 2. App Title & Display Heading */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3 border border-primary/30">
              <Bike size={22} color={theme.primary} />
            </View>
            <View>
              <AppText variant="label" color="primary">
                SAGE GARDEN DESIGN SYSTEM
              </AppText>
              <AppText variant="h2">
                Customer Mobile UI
              </AppText>
            </View>
          </View>
          <AppBadge
            label={isDark ? "Dark Mode" : "Light Mode"}
            variant="secondary"
            icon={
              isDark ? (
                <Moon size={12} color={theme.foreground} />
              ) : (
                <Sun size={12} color={theme.foreground} />
              )
            }
          />
        </View>
      </View>

      {/* 3. Typography & Body Text showcase */}
      <AppCard className="mb-6">
        <AppText variant="h3" className="mb-1">
          Typography Hierarchy
        </AppText>
        <AppText variant="body" color="muted" className="mb-3">
          This test screen validates typography using Antic for sans body, Signifier/Serif display fallback, and JetBrains Mono for monospace tokens.
        </AppText>
        <View className="bg-muted/40 p-3 rounded-lg border border-border mb-2">
          <AppText variant="mono" color="primary">
            oklch(0.6333 0.0309 154.9039) → #7C9082
          </AppText>
        </View>
      </AppCard>

      {/* 4. Badges & Chips */}
      <View className="mb-6">
        <AppText variant="h4" className="mb-2">
          Status Badges
        </AppText>
        <View className="flex-row flex-wrap gap-2">
          <AppBadge label="Primary Sage" variant="primary" />
          <AppBadge label="Secondary Warm" variant="secondary" />
          <AppBadge label="Accent Tint" variant="accent" />
          <AppBadge label="Destructive" variant="destructive" />
          <AppBadge label="Outline" variant="outline" />
        </View>
      </View>

      {/* 5. Text Input Showcase */}
      <View className="mb-6">
        <AppText variant="h4" className="mb-2">
          Form Input
        </AppText>
        <AppInput
          label="Test Input Label"
          placeholder="Type here..."
          value={testInput}
          onChangeText={setTestInput}
          helperText="Focus to see the active Sage Garden ring highlight"
        />
      </View>

      {/* 6. Button Showcase */}
      <View className="mb-6">
        <AppText variant="h4" className="mb-3">
          Action Buttons
        </AppText>
        <View className="gap-2.5">
          <AppButton
            title="Primary Button"
            variant="primary"
            size="md"
            rightIcon={<CheckCircle2 size={16} color="#FFFFFF" />}
            onPress={() => setIsLoading(!isLoading)}
          />
          <AppButton
            title="Secondary Button"
            variant="secondary"
            size="md"
            onPress={() => {}}
          />
          <AppButton
            title="Outline Button"
            variant="outline"
            size="md"
            onPress={() => {}}
          />
          <AppButton
            title="Destructive Button"
            variant="destructive"
            size="md"
            onPress={() => {}}
          />
        </View>
      </View>

      {/* 7. Loading State */}
      <AppCard className="mb-6">
        <AppText variant="h4" className="mb-2">
          Loading Indicator
        </AppText>
        <AppLoader size="small" message="Real-time loading state spinner" />
      </AppCard>

      <AppDivider label="Navigation Test" />

      {/* 8. Continue to Login Flow */}
      <AppButton
        title="Proceed to Customer Login"
        variant="primary"
        size="lg"
        rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
        onPress={() => navigation.navigate("Login")}
        className="mb-6"
      />
    </AppScreen>
  );
}
