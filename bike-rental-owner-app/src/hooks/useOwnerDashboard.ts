import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ownerService } from "../services/ownerService";
import { OwnerDashboardDTO } from "../types/owner";

export const OWNER_DASHBOARD_QUERY_KEY = ["ownerDashboard"];

export function useOwnerDashboard() {
  const queryClient = useQueryClient();

  const query = useQuery<OwnerDashboardDTO>({
    queryKey: OWNER_DASHBOARD_QUERY_KEY,
    queryFn: () => ownerService.getDashboard(),
    staleTime: 1000 * 60 * 2, // 2 mins
  });

  const invalidateDashboard = () => {
    queryClient.invalidateQueries({ queryKey: OWNER_DASHBOARD_QUERY_KEY });
  };

  return {
    ...query,
    dashboardData: query.data,
    invalidateDashboard,
  };
}

export default useOwnerDashboard;
