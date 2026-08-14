import { useCallback, useEffect, useRef } from "react";

import { useLocationContext } from "@/context/LocationContext";
import { mapService } from "@/services/mapService";
import bikeService from "@/services/bikeService";
import { normalizeBike } from "@/utils/bikeUtils";
import { isBikeAvailableNow } from "@/utils/timeUtils";
import { subscribeBikeUpdates } from "@/utils/syncUtils";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE_URL;

export function useLocation() {

    const {
    currentLocation,
    setCurrentLocation,

    nearbyBikes,
    setNearbyBikes,

    route,
    setRoute,

    loading,
    setLoading,

    selectedBikeId,
    setSelectedBikeId,
} = useLocationContext();


const getRoute = async (bikeId: number) => {

    if (!currentLocation) return;

    try {

        const response = await mapService.getRoute(
            currentLocation.latitude,
            currentLocation.longitude,
            bikeId
        );

        setRoute(response.data);

    } catch (error) {

        console.error("Failed to fetch route:", error);

    }

};


    /**
     * Get browser location
     */
    const getCurrentLocation = useCallback(() => {
        const fallbackLocation = {
            latitude: 17.3850,
            longitude: 78.4867,
        };

        if (!navigator.geolocation) {
            setCurrentLocation(fallbackLocation);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.warn("Geolocation error or denied, using default location:", error);
                setCurrentLocation(fallbackLocation);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
            }
        );
    }, [setCurrentLocation]);

    /**
     * Fetch nearby bikes
     */
    const getNearbyBikes = useCallback(async () => {
        const loc = currentLocation || { latitude: 17.3850, longitude: 78.4867 };

        try {
            setLoading(true);

            const [response, allApiBikes] = await Promise.all([
                mapService.getNearbyBikes(loc.latitude, loc.longitude).catch(() => ({ data: [] })),
                bikeService.getAllBikes().catch(() => []),
            ]);

            // Unwrap possible API envelopes: response.data or response.data.data
            let serverMapBikes: any[] = [];
            const rawMapData = response?.data;
            if (Array.isArray(rawMapData)) serverMapBikes = rawMapData;
            else if (rawMapData && Array.isArray(rawMapData.data)) serverMapBikes = rawMapData.data;
            else serverMapBikes = [];

            const serverAllBikes = Array.isArray(allApiBikes) ? allApiBikes : (Array.isArray((allApiBikes as any)?.data) ? (allApiBikes as any).data : []);

            // Read local owner bikes & custom owner bikes to ensure instant sync across all pages
            let localOwnerBikes: any[] = [];
            let customOwnerBikes: any[] = [];
            let deletedKeys: string[] = [];
            try {
              localOwnerBikes = JSON.parse(localStorage.getItem("local_owner_bikes") || "[]");
              customOwnerBikes = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
              deletedKeys = JSON.parse(localStorage.getItem("deleted_bike_keys") || "[]");
            } catch (e) {}

            if (customOwnerBikes.length === 0) {
              customOwnerBikes = [
                {
                  bikeId: 101, id: 101, bikeName: "KTM Duke 390", brand: "KTM", model: "Duke 390",
                  registrationNumber: "TS09AB1234", rcNumber: "TS09AB1234", hourlyRate: 80, rentalPrice: 640,
                  location: "Hyderabad", bikeStatus: "AVAILABLE", rcVerified: true,
                  availableStartTime: "08:00", availableEndTime: "20:00", availableDate: new Date().toISOString().split("T")[0],
                  imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600",
                },
                {
                  bikeId: 102, id: 102, bikeName: "TVS Radeon", brand: "TVS", model: "Radeon",
                  registrationNumber: "TS09FK1234", rcNumber: "TS09FK1234", hourlyRate: 60, rentalPrice: 480,
                  location: "Hyderabad", bikeStatus: "AVAILABLE", rcVerified: true,
                  availableStartTime: "08:00", availableEndTime: "20:00", availableDate: new Date().toISOString().split("T")[0],
                  imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600",
                },
                {
                  bikeId: 103, id: 103, bikeName: "Yamaha R15 V4", brand: "Yamaha", model: "R15 V4",
                  registrationNumber: "TS09AB9999", rcNumber: "TS09AB9999", hourlyRate: 150, rentalPrice: 1200,
                  location: "Hyderabad", bikeStatus: "AVAILABLE", rcVerified: true,
                  availableStartTime: "17:00", availableEndTime: "21:00", availableDate: new Date().toISOString().split("T")[0],
                  imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600",
                },
              ];
              try {
                localStorage.setItem("custom_owner_bikes", JSON.stringify(customOwnerBikes));
              } catch (e) {}
            }

            const activeRegs = new Set<string>();
            const combinedMap = new Map<string, any>();
            serverMapBikes.forEach((b: any) => {
              if (b.registrationNumber && b.registrationNumber.trim()) activeRegs.add(b.registrationNumber.trim().toUpperCase());
            });
            serverAllBikes.forEach((b: any) => {
              if (b.registrationNumber && b.registrationNumber.trim()) activeRegs.add(b.registrationNumber.trim().toUpperCase());
            });
            [...localOwnerBikes, ...customOwnerBikes].forEach((b: any) => {
              if (b.registrationNumber && b.registrationNumber.trim()) activeRegs.add(b.registrationNumber.trim().toUpperCase());
            });

            const isDeleted = (b: any): boolean => {
              const reg = (b.registrationNumber || "").trim().toUpperCase();
              if (!reg) return false;
              if (activeRegs.has(reg)) return false;

              return deletedKeys.some((dk) => {
                const keyUpper = String(dk).trim().toUpperCase();
                return keyUpper === reg || keyUpper === `REG_${reg}`;
              });
            };

            const cleanStr = (s?: any) => (s ? String(s).replace(/\s+/g, "").toUpperCase() : "");
            const getBikeKey = (b: any): string => {
              const regClean = cleanStr(b.registrationNumber || b.rcNumber);
              if (regClean) return `REG_${regClean}`;
              const nameClean = cleanStr(b.bikeName || b.name);
              if (nameClean) return `NAME_${nameClean}`;
              return (b.bikeId || b.id || Math.random()).toString().toUpperCase();
            };

            // 1. Server allBikes FIRST
            serverAllBikes.forEach((b: any) => {
              if (!isDeleted(b)) {
                const key = getBikeKey(b);
                combinedMap.set(key, b);
              }
            });

            // 2. Server mapBikes SECOND
            serverMapBikes.forEach((b: any) => {
              if (!isDeleted(b)) {
                const key = getBikeKey(b);
                if (!combinedMap.has(key)) {
                  combinedMap.set(key, b);
                } else {
                  const existing = combinedMap.get(key);
                  combinedMap.set(key, { ...existing, ...b });
                }
              }
            });

            // 3. Owner local & custom added/edited bikes THIRD (overwrites server defaults with owner edits)
            [...customOwnerBikes, ...localOwnerBikes].forEach((lb) => {
              if (!isDeleted(lb)) {
                let key = getBikeKey(lb);
                const lbReg = cleanStr(lb.registrationNumber || lb.rcNumber);
                const lbName = cleanStr(lb.bikeName || lb.name);
                const lbId = lb.bikeId || lb.id;

                for (const [k, existing] of combinedMap.entries()) {
                  const exReg = cleanStr(existing.registrationNumber || existing.rcNumber);
                  const exName = cleanStr(existing.bikeName || existing.name);
                  const exId = existing.bikeId || existing.id;

                  const regMatch = lbReg && exReg && lbReg === exReg;
                  const idMatch = lbId && exId && Number(lbId) === Number(exId);
                  const nameMatch = lbName && exName && (lbName.includes(exName) || exName.includes(lbName));

                  if (regMatch || idMatch || nameMatch) {
                    key = k;
                    break;
                  }
                }

                if (!combinedMap.has(key)) {
                  combinedMap.set(key, lb);
                } else {
                  const existing = combinedMap.get(key);
                  // Ensure fresh server timings take precedence over stale local cache
                  const mergedTimings = {
                    availableStartTime: existing.availableStartTime || lb.availableStartTime,
                    availableEndTime: existing.availableEndTime || lb.availableEndTime,
                    availableDate: existing.availableDate || lb.availableDate,
                    bikeStatus: existing.bikeStatus || lb.bikeStatus,
                  };
                  combinedMap.set(key, { ...existing, ...lb, ...mergedTimings });
                }
              }
            });

            // Keep local owner bikes cache in sync with fresh server data
            if (serverAllBikes.length > 0 && customOwnerBikes.length > 0) {
              let updatedLocalCache = false;
              const syncedLocal = customOwnerBikes.map((lb: any) => {
                const lbReg = cleanStr(lb.registrationNumber || lb.rcNumber);
                const lbId = lb.bikeId || lb.id;
                const matchServer = serverAllBikes.find((sb: any) => {
                  const sbReg = cleanStr(sb.registrationNumber || sb.rcNumber);
                  const sbId = sb.bikeId || sb.id;
                  return (lbReg && sbReg && lbReg === sbReg) || (lbId && sbId && Number(lbId) === Number(sbId));
                });
                if (matchServer) {
                  updatedLocalCache = true;
                  return { ...lb, ...matchServer };
                }
                return lb;
              });
              if (updatedLocalCache) {
                try {
                  localStorage.setItem("custom_owner_bikes", JSON.stringify(syncedLocal));
                } catch (e) {}
              }
            }

            const isNotExpiredFromPast = (b: any): boolean => {
              try {
                const todayStr = new Date().toISOString().split("T")[0];
                if (b.availableDate) {
                  const bikeDateStr = String(b.availableDate).split("T")[0].trim();
                  if (bikeDateStr && bikeDateStr < todayStr) {
                    return false;
                  }
                }
                return true;
              } catch {
                return true;
              }
            };

            const merged = Array.from(combinedMap.values())
              .filter(isNotExpiredFromPast)
              .map((bikeItem, idx) => {
                const nb = normalizeBike(bikeItem, idx);
                // compute distance if latitude/longitude exist
                if (loc.latitude && loc.longitude && nb.latitude && nb.longitude) {
                  const d = Math.sqrt(
                    Math.pow(loc.latitude - nb.latitude, 2) + Math.pow(loc.longitude - nb.longitude, 2)
                  ) * 111.12; // approx km
                  nb.distance = Number(d.toFixed(1));
                } else if (nb.distance === undefined) {
                  nb.distance = 1.2;
                }
                return nb;
              });

            setNearbyBikes(merged);
        }
        catch (error) {
            console.error("Failed to fetch nearby bikes:", error);
            const localOwnerBikes: any[] = JSON.parse(localStorage.getItem("custom_owner_bikes") || "[]");
            setNearbyBikes(localOwnerBikes.map((b, idx) => normalizeBike(b, idx)));
        }
        finally {
            setLoading(false);
        }
    }, [
        currentLocation,
        setNearbyBikes,
        setLoading,
    ]);

    // Re-sync instantly on custom_bikes_updated, storage, or focus events
    // Keep a ref of last sync timestamp so we only show a toast when a
    // new owner update arrives (prevents repeated toasts from polling).
    const lastSyncTsRef = useRef<number | null>(null);

    useEffect(() => {
      getNearbyBikes();

      const handleSync = () => {
        try {
          const payload = localStorage.getItem("bike_rental_sync");
          if (payload) {
            try {
              const parsed = JSON.parse(payload);
              const ts = parsed?.ts ? Number(parsed.ts) : null;
              if (ts && lastSyncTsRef.current !== ts) {
                lastSyncTsRef.current = ts;
                toast.success("New bikes listed — refreshing");
              }
            } catch (e) {
              // ignore parse errors
            }
          }
        } catch (e) {}

        // Always refresh data when an update event is received
        getNearbyBikes();
      };

      const unsub = subscribeBikeUpdates(handleSync);
      const timer = setInterval(getNearbyBikes, 3000);
      return () => {
        unsub();
        clearInterval(timer);
      };
    }, [getNearbyBikes]);

    /**
     * Refresh current location
     */
    const refreshLocation = () => {

        getCurrentLocation();

    };

   return {
    currentLocation,
    nearbyBikes,
    route,
    loading,

     selectedBikeId,
    setSelectedBikeId,

    getCurrentLocation,
    getNearbyBikes,
    getRoute,
    refreshLocation,

     setRoute,
};

}