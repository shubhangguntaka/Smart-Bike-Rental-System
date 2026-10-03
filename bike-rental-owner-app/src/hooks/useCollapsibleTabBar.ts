import {
  useSharedValue,
  useAnimatedScrollHandler,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import { useTabBarAnimation } from "../context/TabBarAnimationContext";

export function useCollapsibleTabBar() {
  const anim = useTabBarAnimation();
  const collapseProgress: SharedValue<number> = anim
    ? anim.collapseProgress
    : useSharedValue(0);

  const lastScrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      const diff = currentY - lastScrollY.value;

      if (currentY <= 15) {
        collapseProgress.value = withTiming(0, { duration: 220 });
      } else if (diff > 8) {
        collapseProgress.value = withTiming(1, { duration: 220 });
      } else if (diff < -8) {
        collapseProgress.value = withTiming(0, { duration: 220 });
      }

      lastScrollY.value = currentY;
    },
  });

  const expandTabBar = () => {
    if (collapseProgress) {
      collapseProgress.value = withTiming(0, { duration: 220 });
    }
  };

  const collapseTabBar = () => {
    if (collapseProgress) {
      collapseProgress.value = withTiming(1, { duration: 220 });
    }
  };

  return {
    onScroll,
    scrollHandler: onScroll,
    collapseProgress,
    expandTabBar,
    collapseTabBar,
  };
}

export default useCollapsibleTabBar;

