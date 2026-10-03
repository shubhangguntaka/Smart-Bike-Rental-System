import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bikeService } from "../services/bikeService";
import { useAuthStore } from "../store/authStore";
import { BikeDTO } from "../types/bike";
import { OWNER_DASHBOARD_QUERY_KEY } from "./useOwnerDashboard";

export const OWNER_BIKES_QUERY_KEY = ["ownerBikes"];

export function useOwnerBikes() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const ownerId = user?.id;

  const query = useQuery<BikeDTO[]>({
    queryKey: [...OWNER_BIKES_QUERY_KEY, ownerId],
    queryFn: () => {
      if (!ownerId) return Promise.resolve([]);
      return bikeService.getOwnerBikes(ownerId);
    },
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 3,
  });

  const addBikeMutation = useMutation({
    mutationFn: (bike: BikeDTO) => bikeService.addBike(bike),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OWNER_BIKES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: OWNER_DASHBOARD_QUERY_KEY });
    },
  });

  const updateBikeMutation = useMutation({
    mutationFn: ({ bikeId, bike }: { bikeId: number; bike: BikeDTO }) =>
      bikeService.updateBike(bikeId, bike),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OWNER_BIKES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: OWNER_DASHBOARD_QUERY_KEY });
    },
  });

  const deleteBikeMutation = useMutation({
    mutationFn: (bikeId: number) => bikeService.deleteBike(bikeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OWNER_BIKES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: OWNER_DASHBOARD_QUERY_KEY });
    },
  });

  return {
    ...query,
    bikes: query.data || [],
    addBike: addBikeMutation.mutateAsync,
    isAdding: addBikeMutation.isPending,
    updateBike: updateBikeMutation.mutateAsync,
    isUpdating: updateBikeMutation.isPending,
    deleteBike: deleteBikeMutation.mutateAsync,
    isDeleting: deleteBikeMutation.isPending,
    refetchBikes: query.refetch,
  };
}

export default useOwnerBikes;
