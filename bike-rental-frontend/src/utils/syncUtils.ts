// Cross-tab real-time event channel connecting Owner actions and Customer views
const syncChannel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("bike_rental_sync_channel") : null;

/**
 * Call when an owner sets/updates shift timings or registers a bike.
 */
export const notifyBikeUpdated = (bike?: any) => {
  try {
    window.dispatchEvent(new Event("custom_bikes_updated"));
    // Write a small payload to localStorage to trigger StorageEvent in other tabs
    try {
      localStorage.setItem("bike_rental_sync", JSON.stringify({ bike, ts: Date.now() }));
    } catch {
      // Ignore quota error
    }
    if (syncChannel) {
      syncChannel.postMessage({ type: "BIKE_TIMING_UPDATED", bike, timestamp: Date.now() });
    }
  } catch (e) {
    console.error("Sync notification error:", e);
  }
};

/**
 * Subscribe customer views to owner updates. Returns an unsubscribe function.
 */
export const subscribeBikeUpdates = (callback: () => void): (() => void) => {
  const handleUpdate = () => {
    try {
      callback();
    } catch {
      // Ignore subscriber error
    }
  };

  window.addEventListener("custom_bikes_updated", handleUpdate);
  window.addEventListener("storage", handleUpdate);
  window.addEventListener("focus", handleUpdate);

  let channelListener: any = null;
  if (syncChannel) {
    channelListener = () => handleUpdate();
    syncChannel.addEventListener("message", channelListener);
  }

  return () => {
    window.removeEventListener("custom_bikes_updated", handleUpdate);
    window.removeEventListener("storage", handleUpdate);
    window.removeEventListener("focus", handleUpdate);
    if (syncChannel && channelListener) {
      syncChannel.removeEventListener("message", channelListener);
    }
  };
};
