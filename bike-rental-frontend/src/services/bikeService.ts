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
    const res = await api.get<ApiResponse<Bike[]> | Bike[]>(BASE);
    return unwrap(res.data) ?? [];
  },

  getBikeById: async (id: number): Promise<Bike> => {
    const res = await api.get<ApiResponse<Bike> | Bike>(`${BASE}/${id}`);
    return unwrap(res.data);
  },

  getOwnerBikes: async (ownerId: number): Promise<Bike[]> => {
    const res = await api.get<ApiResponse<Bike[]> | Bike[]>(
      `${BASE}/owner/${ownerId}`
    );
    return unwrap(res.data) ?? [];
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
    bikeId?: number
  ): Promise<BikeDocumentVerificationResult> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("ownerId", String(ownerId));
    if (bikeId !== undefined) {
      formData.append("bikeId", String(bikeId));
    }

    const res = await api.post<
      ApiResponse<BikeDocumentVerificationResult> | BikeDocumentVerificationResult
    >(`${BASE}/verify-rc`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap(res.data);
  },

  uploadBikeRC: async (file: File, ownerId: number, bikeId?: number) => {
    return bikeService.verifyBikeRC(file, ownerId, bikeId);
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
