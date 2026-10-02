import api from "./axios";
import { ApiResponse } from "../types/auth";
import { Bike, BikeSearchParams } from "../types/bike";

export const bikeApi = {
  getAllBikes: () =>
    api.get<ApiResponse<Bike[]> | Bike[]>("/bikes"),

  getBikeById: (id: number) =>
    api.get<ApiResponse<Bike> | Bike>(`/bikes/${id}`),

  searchBikes: (params: BikeSearchParams) =>
    api.get<ApiResponse<Bike[]> | Bike[]>("/bikes/search", { params }),
};

export default bikeApi;
