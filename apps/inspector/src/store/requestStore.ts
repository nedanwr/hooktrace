import { create } from "zustand";

import type { CapturedRequest } from "~/lib/types";
import { fetchRequests, clearRequests as apiClear } from "~/lib/api";

interface RequestStore {
  requests: CapturedRequest[];
  loading: boolean;
  searchQuery: string;
  statusFilter: string;

  // Actions
  hydrate: () => Promise<void>;
  addRequest: (req: CapturedRequest) => void;
  updateRequest: (req: CapturedRequest) => void;
  clearRequests: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  setStatusFilter: (status: string) => void;
}

export const useRequestStore = create<RequestStore>((set, get) => ({
  requests: [],
  loading: true,
  searchQuery: "",
  statusFilter: "",

  hydrate: async () => {
    set({ loading: true });
    try {
      const { searchQuery, statusFilter } = get();
      const requests = await fetchRequests({
        q: searchQuery || undefined,
        status: statusFilter || undefined,
      });
      set({ requests, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addRequest: (req) => {
    set((state) => ({
      requests: [req, ...state.requests],
    }));
  },

  updateRequest: (req) => {
    set((state) => ({
      requests: state.requests.map((r) => (r.id === req.id ? req : r)),
    }));
  },

  clearRequests: async () => {
    await apiClear();
    set({ requests: [] });
  },

  setSearchQuery: (q) => {
    set({ searchQuery: q });
    get().hydrate();
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().hydrate();
  },
}));
