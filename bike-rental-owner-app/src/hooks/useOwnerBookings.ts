import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ownerService } from "../services/ownerService";
import { bookingService } from "../services/bookingService";
import { BookingRequestDTO } from "../types/owner";
import { OWNER_DASHBOARD_QUERY_KEY } from "./useOwnerDashboard";
import { OWNER_BIKES_QUERY_KEY } from "./useOwnerBikes";

export const OWNER_BOOKINGS_QUERY_KEY = ["ownerBookings"];

export function useOwnerBookings() {
  const queryClient = useQueryClient();

  const query = useQuery<BookingRequestDTO[]>({
    queryKey: OWNER_BOOKINGS_QUERY_KEY,
    queryFn: () => ownerService.getBookingRequests(),
    staleTime: 1000 * 60 * 1, // 1 min
  });

  const approveBookingMutation = useMutation({
    mutationFn: (bookingId: number) => ownerService.approveBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OWNER_BOOKINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: OWNER_DASHBOARD_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: OWNER_BIKES_QUERY_KEY });
    },
  });

  const rejectBookingMutation = useMutation({
    mutationFn: (bookingId: number) => ownerService.rejectBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OWNER_BOOKINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: OWNER_DASHBOARD_QUERY_KEY });
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: number; reason: string }) =>
      ownerService.cancelBooking(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OWNER_BOOKINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: OWNER_DASHBOARD_QUERY_KEY });
    },
  });

  const handoverBookingMutation = useMutation({
    mutationFn: (bookingId: number) => bookingService.handoverBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OWNER_BOOKINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: OWNER_DASHBOARD_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: OWNER_BIKES_QUERY_KEY });
    },
  });

  const returnBookingMutation = useMutation({
    mutationFn: (bookingId: number) => bookingService.returnBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OWNER_BOOKINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: OWNER_DASHBOARD_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: OWNER_BIKES_QUERY_KEY });
    },
  });

  return {
    ...query,
    bookings: query.data || [],
    approveBooking: approveBookingMutation.mutateAsync,
    isApproving: approveBookingMutation.isPending,
    rejectBooking: rejectBookingMutation.mutateAsync,
    isRejecting: rejectBookingMutation.isPending,
    cancelBooking: cancelBookingMutation.mutateAsync,
    isCancelling: cancelBookingMutation.isPending,
    handoverBooking: handoverBookingMutation.mutateAsync,
    isHandingOver: handoverBookingMutation.isPending,
    returnBooking: returnBookingMutation.mutateAsync,
    isReturning: returnBookingMutation.isPending,
    refetchBookings: query.refetch,
  };
}

export default useOwnerBookings;
