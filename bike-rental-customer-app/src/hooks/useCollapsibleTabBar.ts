import { useAnimatedScrollHandler, withTiming } from "react-native-reanimated";
import { useTabBarAnimation } from "../context/TabBarAnimationContext";

export function useCollapsibleTabBar() {
  const anim = useTabBarAnimation();
  const collapseProgress = anim?.collapseProgress;
  const previousScrollY = anim?.previousScrollY;

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        if (!collapseProgress || !previousScrollY) return;
        const currentY = event.contentOffset.y;
        const diff = currentY - previousScrollY.value;

        if (currentY <= 15) {
          // At the top -> expand
          collapseProgress.value = withTiming(0, { duration: 240 });
        } else if (diff > 8) {
          // Scrolling down -> collapse to icon-only pill
          collapseProgress.value = withTiming(1, { duration: 240 });
        } else if (diff < -8) {
          // Scrolling up -> expand back to full pill
          collapseProgress.value = withTiming(0, { duration: 240 });
        }

        previousScrollY.value = currentY;
      },
    },
    [collapseProgress, previousScrollY]
  );

  const expandTabBar = () => {
    if (collapseProgress) {
      collapseProgress.value = withTiming(0, { duration: 240 });
    }
  };

  const collapseTabBar = () => {
    if (collapseProgress) {
      collapseProgress.value = withTiming(1, { duration: 240 });
    }
  };

  return {
    scrollHandler,
    expandTabBar,
    collapseTabBar,
  };
}

export default useCollapsibleTabBar;
