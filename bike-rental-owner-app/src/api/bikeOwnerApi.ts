import api from "./axios";
import { ApiResponse } from "../types/auth";
import { BikeDTO, ApprovedRcDTO } from "../types/bike";
import { BikeDocumentResponseDTO } from "../types/verification";

export const bikeOwnerApi = {
  getAllBikes: () =>
    api.get<ApiResponse<BikeDTO[]>>("/bikes"),

  getBikeById: (bikeId: number) =>
    api.get<ApiResponse<BikeDTO>>(`/bikes/${bikeId}`),

  getOwnerBikes: (ownerId: number) =>
    api.get<ApiResponse<BikeDTO[]>>(`/bikes/owner/${ownerId}`),

  addBike: (bike: BikeDTO) =>
    api.post<ApiResponse<BikeDTO>>("/bikes", bike),

  updateBike: (bikeId: number, bike: BikeDTO) =>
    api.put<ApiResponse<BikeDTO>>(`/bikes/${bikeId}`, bike),

  deleteBike: (bikeId: number) =>
    api.delete<ApiResponse<string>>(`/bikes/${bikeId}`),

  checkOwnerVerification: (ownerId?: number) =>
    api.get<ApiResponse<boolean>>("/bikes/check-owner-verification", {
      params: ownerId ? { ownerId } : undefined,
    }),

  checkApprovedRc: (registrationNumber: string) =>
    api.get<ApiResponse<ApprovedRcDTO>>("/bikes/check-rc-verification", {
      params: { registrationNumber },
    }),

  getApprovedRcs: () =>
    api.get<ApiResponse<ApprovedRcDTO[]>>("/bikes/approved-rcs"),

  verifyBikeRC: (formData: FormData) =>
    api.post<ApiResponse<BikeDocumentResponseDTO>>("/bikes/verify-rc", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default bikeOwnerApi;
