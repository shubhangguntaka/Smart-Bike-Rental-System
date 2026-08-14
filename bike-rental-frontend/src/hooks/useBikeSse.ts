import { useEffect, useRef } from "react";
import env from "@/config/env";
import toast from "react-hot-toast";

/**
 * Subscribes to backend SSE `/api/stream/bikes` and triggers a localStorage
 * write so other tabs refresh. Shows a toast when an update is received.
 */
export default function useBikeSse() {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (esRef.current) return;

    const base = env.API_BASE_URL || "/api";
    const url = `${base.replace(/\/$/, "")}/stream/bikes`;

    try {
      const connect = () => {
        try {
          const es = new EventSource(url);

          const handleMessage = (e: MessageEvent) => {
            try {
              const data = e.data ? JSON.parse(e.data) : null;
              const ts = Date.now();
              try {
                localStorage.setItem("bike_rental_sync", JSON.stringify({ bike: data, ts }));
              } catch (err) {}
              toast.success("New bikes listed — refreshing");
            } catch (err) {
              // ignore
            }
          };

          es.addEventListener("bike-update", handleMessage as EventListener);
          es.onmessage = handleMessage;

          es.onerror = () => {
            try {
              es.close();
            } catch (e) {}
            if (esRef.current === es) esRef.current = null;
            setTimeout(() => connect(), 5000);
          };

          esRef.current = es;
        } catch (err) {
          // retry after delay
          setTimeout(() => connect(), 5000);
        }
      };

      connect();
    } catch (e) {
      // ignore if EventSource not supported or endpoint unavailable
    }

    return () => {
      if (esRef.current) {
        try {
          esRef.current.close();
        } catch (e) {}
        esRef.current = null;
      }
    };
  }, []);
}
