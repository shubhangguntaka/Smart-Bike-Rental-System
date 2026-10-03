import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { tokenService } from "../services/tokenService";
import { ownerService } from "../services/ownerService";
import { User } from "../types/auth";
import { OwnerProfileDTO } from "../types/owner";

interface AuthState {
  token: string | null;
  user: User | null;
  ownerProfile: OwnerProfileDTO | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (token: string, user: User, refreshToken?: string) => Promise<boolean>;
  setUser: (user: User) => void;
  setOwnerProfile: (profile: OwnerProfileDTO) => void;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  ownerProfile: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (token, user, refreshToken) => {
    // OWNER-only role enforcement
    const userRole = (user.role || "").toUpperCase();
    if (userRole !== "OWNER" && userRole !== "ROLE_OWNER" && userRole !== "ADMIN") {
      console.warn("Attempted non-owner login in Owner App. Rejecting access.");
      await tokenService.removeToken();
      set({ token: null, user: null, ownerProfile: null, isAuthenticated: false, isLoading: false });
      return false;
    }

    await tokenService.saveToken(token);
    if (refreshToken) {
      await tokenService.saveRefreshToken(refreshToken);
    }

    set({
      token,
      user: { ...user, role: "OWNER" },
      isAuthenticated: true,
      isLoading: false,
    });

    // Fetch authoritative owner profile
    try {
      const profile = await ownerService.getProfile();
      if (profile) {
        set({
          ownerProfile: profile,
          user: {
            ...user,
            id: profile.ownerId || profile.id || user.id,
            fullName: profile.ownerName || profile.fullName || user.fullName,
            name: profile.ownerName || profile.fullName || user.name,
            email: profile.email || user.email,
            phone: profile.phone || profile.phoneNumber || user.phone,
            phoneNumber: profile.phone || profile.phoneNumber || user.phoneNumber,
            role: "OWNER",
          },
        });
      }
    } catch (err) {
      console.warn("Initial owner profile load:", err);
    }

    return true;
  },

  setUser: (user: User) => {
    set({ user: { ...user, role: "OWNER" } });
  },

  setOwnerProfile: (profile: OwnerProfileDTO) => {
    set((state) => ({
      ownerProfile: profile,
      user: state.user
        ? {
            ...state.user,
            id: profile.ownerId || profile.id || state.user.id,
            fullName: profile.ownerName || profile.fullName || state.user.fullName,
            name: profile.ownerName || profile.fullName || state.user.name,
            email: profile.email || state.user.email,
            phone: profile.phone || profile.phoneNumber || state.user.phone,
            phoneNumber: profile.phone || profile.phoneNumber || state.user.phoneNumber,
          }
        : state.user,
    }));
  },

  refreshProfile: async () => {
    try {
      const profile = await ownerService.getProfile();
      if (profile) {
        set((state) => ({
          ownerProfile: profile,
          user: state.user
            ? {
                ...state.user,
                id: profile.ownerId || profile.id || state.user.id,
                fullName: profile.ownerName || profile.fullName || state.user.fullName,
                name: profile.ownerName || profile.fullName || state.user.name,
                email: profile.email || state.user.email,
                phone: profile.phone || profile.phoneNumber || state.user.phone,
                phoneNumber: profile.phone || profile.phoneNumber || state.user.phoneNumber,
                role: "OWNER",
              }
            : null,
        }));
      }
    } catch (err) {
      console.warn("Could not refresh owner profile:", err);
    }
  },

  logout: async () => {
    const refreshToken = await tokenService.getRefreshToken();
    try {
      if (refreshToken) {
        const authApi = (await import("../api/authApi")).default;
        await authApi.logout(refreshToken).catch(() => {});
      }
    } catch {
      // Ignore network error on logout
    } finally {
      await tokenService.removeToken();
      set({
        token: null,
        user: null,
        ownerProfile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  initializeAuth: async () => {
    try {
      const token = await tokenService.getToken();
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            await tokenService.removeToken();
            set({ token: null, user: null, ownerProfile: null, isAuthenticated: false, isLoading: false });
            return;
          }

          const role = String(decoded.role || "OWNER").toUpperCase();
          if (role !== "OWNER" && role !== "ROLE_OWNER" && role !== "ADMIN") {
            await tokenService.removeToken();
            set({ token: null, user: null, ownerProfile: null, isAuthenticated: false, isLoading: false });
            return;
          }

          const user: User = {
            id: Number(decoded.userId || decoded.sub || 1),
            name: decoded.name || decoded.email?.split("@")[0] || "Owner",
            fullName: decoded.name || decoded.email?.split("@")[0] || "Owner",
            email: decoded.email || "owner@example.com",
            role: "OWNER",
            phoneNumber: decoded.phoneNumber || decoded.phone,
          };

          set({ token, user, isAuthenticated: true, isLoading: false });

          // Fetch fresh server profile in background
          try {
            const profile = await ownerService.getProfile();
            if (profile) {
              set({
                ownerProfile: profile,
                user: {
                  ...user,
                  id: profile.ownerId || profile.id || user.id,
                  fullName: profile.ownerName || profile.fullName || user.fullName,
                  name: profile.ownerName || profile.fullName || user.name,
                  email: profile.email || user.email,
                  phone: profile.phone || profile.phoneNumber || user.phone,
                  phoneNumber: profile.phone || profile.phoneNumber || user.phoneNumber,
                },
              });
            }
          } catch {
            // Keep local JWT decoded info if offline
          }
        } catch {
          await tokenService.removeToken();
          set({ token: null, user: null, ownerProfile: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ token: null, user: null, ownerProfile: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ token: null, user: null, ownerProfile: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export default useAuthStore;
