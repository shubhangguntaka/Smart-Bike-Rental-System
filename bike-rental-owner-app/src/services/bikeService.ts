import bikeOwnerApi from "../api/bikeOwnerApi";
import { BikeDTO, ApprovedRcDTO } from "../types/bike";
import { BikeDocumentResponseDTO } from "../types/verification";

export const bikeService = {
  async getAllBikes(): Promise<BikeDTO[]> {
    const res = await bikeOwnerApi.getAllBikes();
    return res.data?.data || (res.data as any) || [];
  },

  async getBikeById(bikeId: number): Promise<BikeDTO> {
    const res = await bikeOwnerApi.getBikeById(bikeId);
    return res.data?.data || (res.data as any);
  },

  async getOwnerBikes(ownerId: number): Promise<BikeDTO[]> {
    const res = await bikeOwnerApi.getOwnerBikes(ownerId);
    return res.data?.data || (res.data as any) || [];
  },

  async addBike(bike: BikeDTO): Promise<BikeDTO> {
    const res = await bikeOwnerApi.addBike(bike);
    return res.data?.data || (res.data as any);
  },

  async updateBike(bikeId: number, bike: BikeDTO): Promise<BikeDTO> {
    const res = await bikeOwnerApi.updateBike(bikeId, bike);
    return res.data?.data || (res.data as any);
  },

  async deleteBike(bikeId: number): Promise<void> {
    await bikeOwnerApi.deleteBike(bikeId);
  },

  async checkOwnerVerification(ownerId?: number): Promise<boolean> {
    const res = await bikeOwnerApi.checkOwnerVerification(ownerId);
    return !!(res.data?.data ?? res.data);
  },

  async checkApprovedRc(registrationNumber: string): Promise<ApprovedRcDTO> {
    const res = await bikeOwnerApi.checkApprovedRc(registrationNumber);
    return res.data?.data || (res.data as any);
  },

  async getApprovedRcs(): Promise<ApprovedRcDTO[]> {
    const res = await bikeOwnerApi.getApprovedRcs();
    return res.data?.data || (res.data as any) || [];
  },

  async verifyBikeRC(formData: FormData): Promise<BikeDocumentResponseDTO> {
    const res = await bikeOwnerApi.verifyBikeRC(formData);
    return res.data?.data || (res.data as any);
  },
};

export default bikeService;
