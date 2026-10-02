import React, { createContext, useContext, useMemo } from "react";
import { useSharedValue, type SharedValue } from "react-native-reanimated";

export interface TabBarAnimationContextType {
  collapseProgress: SharedValue<number>;
  previousScrollY: SharedValue<number>;
}

const TabBarAnimationContext = createContext<TabBarAnimationContextType | null>(null);

export function TabBarAnimationProvider({ children }: { children: React.ReactNode }) {
  const collapseProgress = useSharedValue(0);
  const previousScrollY = useSharedValue(0);

  const value = useMemo(
    () => ({ collapseProgress, previousScrollY }),
    [collapseProgress, previousScrollY]
  );

  return (
    <TabBarAnimationContext.Provider value={value}>
      {children}
    </TabBarAnimationContext.Provider>
  );
}

export function useTabBarAnimation() {
  return useContext(TabBarAnimationContext);
}
