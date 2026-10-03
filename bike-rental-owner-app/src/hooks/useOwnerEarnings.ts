import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ownerService } from "../services/ownerService";
import { EarningsDTO, OwnerPaymentDTO, OwnerEarningsSummaryDTO, BankAccountDTO } from "../types/owner";

export const OWNER_EARNINGS_QUERY_KEY = ["ownerEarnings"];
export const OWNER_PAYMENTS_QUERY_KEY = ["ownerPayments"];
export const OWNER_BANK_ACCOUNT_QUERY_KEY = ["ownerBankAccount"];

export function useOwnerEarnings() {
  const queryClient = useQueryClient();

  const earningsQuery = useQuery<EarningsDTO>({
    queryKey: OWNER_EARNINGS_QUERY_KEY,
    queryFn: () => ownerService.getEarnings(),
    staleTime: 1000 * 60 * 3,
  });

  const summaryQuery = useQuery<OwnerEarningsSummaryDTO>({
    queryKey: [...OWNER_EARNINGS_QUERY_KEY, "summary"],
    queryFn: () => ownerService.getEarningsSummary(),
    staleTime: 1000 * 60 * 3,
  });

  const paymentsQuery = useQuery<OwnerPaymentDTO[]>({
    queryKey: OWNER_PAYMENTS_QUERY_KEY,
    queryFn: () => ownerService.getPayments(),
    staleTime: 1000 * 60 * 3,
  });

  const bankAccountQuery = useQuery<BankAccountDTO>({
    queryKey: OWNER_BANK_ACCOUNT_QUERY_KEY,
    queryFn: () => ownerService.getBankAccount(),
    staleTime: 1000 * 60 * 5,
  });

  const updateBankAccountMutation = useMutation({
    mutationFn: (data: Partial<BankAccountDTO>) => ownerService.updateBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OWNER_BANK_ACCOUNT_QUERY_KEY });
    },
  });

  return {
    earnings: earningsQuery.data,
    isLoadingEarnings: earningsQuery.isLoading,
    summary: summaryQuery.data,
    isLoadingSummary: summaryQuery.isLoading,
    payments: paymentsQuery.data || [],
    isLoadingPayments: paymentsQuery.isLoading,
    bankAccount: bankAccountQuery.data,
    isLoadingBankAccount: bankAccountQuery.isLoading,
    updateBankAccount: updateBankAccountMutation.mutateAsync,
    isUpdatingBankAccount: updateBankAccountMutation.isPending,
    refetchAll: () => {
      earningsQuery.refetch();
      summaryQuery.refetch();
      paymentsQuery.refetch();
      bankAccountQuery.refetch();
    },
  };
}

export default useOwnerEarnings;
