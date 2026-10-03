import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useSharedValue, SharedValue } from "react-native-reanimated";

export interface TabBarAnimationContextValue {
  collapseProgress: SharedValue<number>;
  previousScrollY: SharedValue<number>;
}

const TabBarAnimationContext = createContext<TabBarAnimationContextValue | null>(
  null
);

export function TabBarAnimationProvider({ children }: { children: ReactNode }) {
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

export function useTabBarAnimation(): TabBarAnimationContextValue | null {
  return useContext(TabBarAnimationContext);
}

export default TabBarAnimationContext;
