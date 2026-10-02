import { useEffect, useRef } from "react";
import { DeviceEventEmitter } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useScrollToTop } from "@react-navigation/native";

/**
 * Hook to automatically scroll any ScrollView / FlatList / SectionList to top
 * when the user taps the already active tab button in the bottom floating tab bar.
 */
export function useTabScrollToTop<T = any>(customTabName?: string) {
  const ref = useRef<T>(null);
  const navigation = useNavigation<any>();
  let routeName = customTabName;
  try {
    const route = useRoute<any>();
    if (!routeName && route?.name) {
      routeName = route.name;
    }
  } catch {
    // Route context might not exist if used outside screen
  }

  // Attach standard React Navigation scroll-to-top handler
  useScrollToTop(ref as any);

  const performScrollToTop = () => {
    const node: any = ref.current;
    if (!node) return;

    try {
      if (typeof node.scrollTo === "function") {
        node.scrollTo({ y: 0, x: 0, animated: true });
      } else if (typeof node.scrollToOffset === "function") {
        node.scrollToOffset({ offset: 0, animated: true });
      } else if (typeof node.scrollToIndex === "function") {
        node.scrollToOffset?.({ offset: 0, animated: true });
      } else if (typeof node.scrollToLocation === "function") {
        node.scrollToLocation({ itemIndex: 0, sectionIndex: 0, animated: true });
      } else if (typeof node.getNode === "function") {
        const inner = node.getNode();
        if (typeof inner?.scrollTo === "function") {
          inner.scrollTo({ y: 0, x: 0, animated: true });
        } else if (typeof inner?.scrollToOffset === "function") {
          inner.scrollToOffset({ offset: 0, animated: true });
        }
      } else if (typeof node.getScrollResponder === "function") {
        const responder = node.getScrollResponder();
        if (typeof responder?.scrollTo === "function") {
          responder.scrollTo({ y: 0, x: 0, animated: true });
        }
      }
    } catch (err) {
      console.warn("Could not scroll to top:", err);
    }
  };

  useEffect(() => {
    // 1. Direct event from FloatingTabBar when active tab is re-pressed
    const sub = DeviceEventEmitter.addListener("SCROLL_TO_TOP_TAB", (targetTabName?: string) => {
      if (!targetTabName || targetTabName === routeName || navigation.isFocused()) {
        performScrollToTop();
      }
    });

    // 2. Navigation tabPress listener
    const unsubTabPress = navigation.addListener("tabPress", () => {
      if (navigation.isFocused()) {
        performScrollToTop();
      }
    });

    return () => {
      sub.remove();
      unsubTabPress();
    };
  }, [navigation, routeName]);

  return ref;
}

export default useTabScrollToTop;
