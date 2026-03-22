import { useRequestStore } from "~/store/requestStore";

export function useRequests() {
  const requests = useRequestStore((s) => s.requests);
  const loading = useRequestStore((s) => s.loading);
  const searchQuery = useRequestStore((s) => s.searchQuery);
  const statusFilter = useRequestStore((s) => s.statusFilter);
  const setSearchQuery = useRequestStore((s) => s.setSearchQuery);
  const setStatusFilter = useRequestStore((s) => s.setStatusFilter);
  const clearRequests = useRequestStore((s) => s.clearRequests);

  return {
    requests,
    loading,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    clearRequests,
  };
}
