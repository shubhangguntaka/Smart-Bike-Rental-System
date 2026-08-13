import api from "../api/axios";
import type { Bike, BikeSearchParams } from "../types/bike";
import type { BikeDocumentVerificationResult } from "../types/verification";

const BASE = "/bikes";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApprovedRc {
  verified: boolean;
  message: string;
  documentId?: number;
  ownerId?: number;
  ownerName?: string;
  registrationNumber?: string;
  makerName?: string;
  model?: string;
  vehicleClass?: string;
  status?: string;
  alreadyListed: boolean;
}

const unwrap = <T>(payload: ApiResponse<T> | T): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as object) &&
    "success" in (payload as object)
  ) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

const bikeService = {
  getAllBikes: async (): Promise<Bike[]> => {
    let serverBikes: Bike[] = [];
    try {
      const res = await api.get<ApiResponse<Bike[]> | Bike[]>(BASE);
      serverBikes = unwrap(res.data) ?? [];
    } catch (err) {
      console.error("Error fetching server bikes:", err);
    }

    const localCached: Bike[] = JSON.parse(
      localStorage.getItem("custom_owner_bikes") || "[]"
    );
    const deletedKeys: string[] = JSON.parse(
      localStorage.getItem("deleted_bike_keys") || "[]"
    );

    // Self-healing: Clean up old numeric/generic entries from deleted_bike_keys
    const cleanedDeletedKeys = deletedKeys.filter(
      (k) => typeof k === "string" && k.trim().length > 4 && !/^\d+$/.test(k.trim())
    );
    if (cleanedDeletedKeys.length !== deletedKeys.length) {
      localStorage.setItem("deleted_bike_keys", JSON.stringify(cleanedDeletedKeys));
    }

    // Active registration numbers in server API or local owner cache are never deleted
    const activeRegs = new Set<string>();
    (serverBikes || []).forEach((b) => {
      if (b.registrationNumber && b.registrationNumber.trim()) {
        activeRegs.add(b.registrationNumber.trim().toUpperCase());
      }
    });
    localCached.forEach((b) => {
      if (b.registrationNumber && b.registrationNumber.trim()) {
        activeRegs.add(b.registrationNumber.trim().toUpperCase());
      }
    });

    const isDeleted = (b: Bike): boolean => {
      const reg = (b.registrationNumber || "").trim().toUpperCase();
      if (!reg) return false;
      if (activeRegs.has(reg)) return false;

      return deletedKeys.some((dk) => {
        const keyUpper = String(dk).trim().toUpperCase();
        return keyUpper === reg || keyUpper === `REG_${reg}`;
      });
    };

    const mergedMap = new Map<string, Bike>();

    const getBikeKey = (b: Bike): string => {
      if (b.registrationNumber && b.registrationNumber.trim()) {
        return b.registrationNumber.trim().toUpperCase();
      }
      if (b.bikeId) return `ID_${b.bikeId}`;
      if (b.id) return `ID_${b.id}`;
      if (b.bikeName) return `NAME_${b.bikeName.trim().toUpperCase()}`;
      return `RANDOM_${Math.random()}`;
    };

    // 1. Put server bikes first
    (serverBikes || []).forEach((b) => {
      if (!isDeleted(b)) {
        const key = getBikeKey(b);
        mergedMap.set(key, b);
      }
    });

    // 2. Put local cached bikes SECOND (owner edits override server defaults)
    localCached.forEach((b) => {
      if (!isDeleted(b)) {
        const primaryKey = getBikeKey(b);
        let matchedKey = primaryKey;
        let existingServer: Bike | undefined = mergedMap.get(primaryKey);

        if (!existingServer) {
          for (const [k, existing] of mergedMap.entries()) {
            const idMatch = (b.bikeId && (b.bikeId === existing.bikeId || b.bikeId === existing.id)) ||
                            (b.id && (b.id === existing.id || b.id === existing.bikeId));
            const regMatch = b.registrationNumber && existing.registrationNumber &&
                              b.registrationNumber.trim().toUpperCase() === existing.registrationNumber.trim().toUpperCase();
            if (idMatch || regMatch) {
              matchedKey = k;
              existingServer = existing;
              break;
            }
          }
        }

        mergedMap.set(matchedKey, existingServer ? { ...existingServer, ...b } : b);
      }
    });

    return Array.from(mergedMap.values()).filter((b) => !isDeleted(b));
  },

  getBikeById: async (id: number): Promise<Bike> => {
    const res = await api.get<ApiResponse<Bike> | Bike>(`${BASE}/${id}`);
    return unwrap(res.data);
  },

  getOwnerBikes: async (ownerId: number): Promise<Bike[]> => {
    let serverBikes: Bike[] = [];
    try {
      const res = await api.get<ApiResponse<Bike[]> | Bike[]>(
        `${BASE}/owner/${ownerId}`
      );
      serverBikes = unwrap(res.data) ?? [];
    } catch (err) {
      console.error("Error fetching owner bikes from API:", err);
    }

    const localCached: Bike[] = JSON.parse(
      localStorage.getItem("custom_owner_bikes") || "[]"
    );
    const deletedKeys: string[] = JSON.parse(
      localStorage.getItem("deleted_bike_keys") || "[]"
    );

    const activeRegs = new Set<string>();
    serverBikes.forEach((b) => {
      if (b.registrationNumber && b.registrationNumber.trim()) {
        activeRegs.add(b.registrationNumber.trim().toUpperCase());
      }
    });
    localCached.forEach((b) => {
      if (b.registrationNumber && b.registrationNumber.trim()) {
        activeRegs.add(b.registrationNumber.trim().toUpperCase());
      }
    });

    const isDeleted = (b: Bike): boolean => {
      const reg = (b.registrationNumber || "").trim().toUpperCase();
      if (!reg) return false;
      if (activeRegs.has(reg)) return false;

      return deletedKeys.some((dk) => {
        const keyUpper = String(dk).trim().toUpperCase();
        return keyUpper === reg || keyUpper === `REG_${reg}`;
      });
    };

    const mergedMap = new Map<string, Bike>();

    const getBikeKey = (b: Bike): string => {
      if (b.registrationNumber && b.registrationNumber.trim()) {
        return b.registrationNumber.trim().toUpperCase();
      }
      if (b.bikeId) return `ID_${b.bikeId}`;
      if (b.id) return `ID_${b.id}`;
      if (b.bikeName) return `NAME_${b.bikeName.trim().toUpperCase()}`;
      return `RANDOM_${Math.random()}`;
    };

    // 1. Put server bikes first
    serverBikes.forEach((b) => {
      if (!isDeleted(b)) {
        const key = getBikeKey(b);
        mergedMap.set(key, b);
      }
    });

    // 2. Put local cached bikes SECOND (ONLY if strictly matching ownerId)
    localCached.forEach((b) => {
      if (
        !isDeleted(b) &&
        ownerId &&
        b.ownerId &&
        Number(b.ownerId) === Number(ownerId)
      ) {
        const primaryKey = getBikeKey(b);
        let matchedKey = primaryKey;
        let existingServer: Bike | undefined = mergedMap.get(primaryKey);

        if (!existingServer) {
          for (const [k, existing] of mergedMap.entries()) {
            const idMatch = (b.bikeId && (b.bikeId === existing.bikeId || b.bikeId === existing.id)) ||
                            (b.id && (b.id === existing.id || b.id === existing.bikeId));
            const nameMatch = b.bikeName && existing.bikeName &&
                              b.bikeName.trim().toUpperCase() === existing.bikeName.trim().toUpperCase();
            if (idMatch || nameMatch) {
              matchedKey = k;
              existingServer = existing;
              break;
            }
          }
        }

        mergedMap.set(matchedKey, existingServer ? { ...existingServer, ...b } : b);
      }
    });

    return Array.from(mergedMap.values()).filter((b) => !isDeleted(b));
  },

  checkOwnerVerification: async (ownerId: number): Promise<boolean> => {
    const res = await api.get<ApiResponse<boolean> | boolean>(
      `${BASE}/check-owner-verification`,
      { params: { ownerId } }
    );
    return Boolean(unwrap(res.data));
  },

  /** Same bike already RC-verified for this owner? */
  checkApprovedRc: async (registrationNumber: string): Promise<ApprovedRc> => {
    const res = await api.get<ApiResponse<ApprovedRc> | ApprovedRc>(
      `${BASE}/check-rc-verification`,
      { params: { registrationNumber } }
    );
    return unwrap(res.data);
  },

  /** Owner's previously approved RCs (for re-list). */
  getApprovedRcs: async (): Promise<ApprovedRc[]> => {
    const res = await api.get<ApiResponse<ApprovedRc[]> | ApprovedRc[]>(
      `${BASE}/approved-rcs`
    );
    return unwrap(res.data) ?? [];
  },

  verifyBikeRC: async (
    file: File,
    ownerId: number,
    bikeId?: number,
    registrationNumber?: string
  ): Promise<BikeDocumentVerificationResult> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("ownerId", String(ownerId));
    if (bikeId !== undefined) {
      formData.append("bikeId", String(bikeId));
    }
    if (registrationNumber) {
      formData.append("registrationNumber", registrationNumber);
    }

    const res = await api.post<
      ApiResponse<BikeDocumentVerificationResult> | BikeDocumentVerificationResult
    >(`${BASE}/verify-rc`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap(res.data);
  },

  uploadBikeRC: async (file: File, ownerId: number, bikeId?: number, registrationNumber?: string) => {
    return bikeService.verifyBikeRC(file, ownerId, bikeId, registrationNumber);
  },

  addBike: async (bike: Bike): Promise<Bike> => {
    const res = await api.post<ApiResponse<Bike> | Bike>(BASE, bike);
    return unwrap(res.data);
  },

  updateBike: async (id: number, bike: Bike): Promise<Bike> => {
    const res = await api.put<ApiResponse<Bike> | Bike>(`${BASE}/${id}`, bike);
    return unwrap(res.data);
  },

  deleteBike: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },

  searchBike: async (params: BikeSearchParams): Promise<Bike[]> => {
    const res = await api.get<ApiResponse<Bike[]> | Bike[]>(`${BASE}/search`, {
      params: {
        location: params.location || undefined,
        brand: params.brand || undefined,
        bikeStatus: params.bikeStatus || params.status || undefined,
      },
    });
    return unwrap(res.data) ?? [];
  },
};

export default bikeService;
