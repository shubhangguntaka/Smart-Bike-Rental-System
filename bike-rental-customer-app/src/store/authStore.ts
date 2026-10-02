import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { tokenService } from "../services/tokenService";
import { userService } from "../services/userService";
import { User } from "../types/auth";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (token: string, user: User, refreshToken?: string) => Promise<void>;
  setUser: (user: User) => void;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (token, user, refreshToken) => {
    // Customer-only enforcement
    const userRole = (user.role || "").toUpperCase();
    if (userRole !== "CUSTOMER") {
      console.warn("Attempted non-customer login in customer app. Rejecting.");
      await tokenService.removeToken();
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    await tokenService.saveToken(token);
    if (refreshToken) {
      await tokenService.saveRefreshToken(refreshToken);
    }

    set({
      token,
      user: { ...user, role: "CUSTOMER" },
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setUser: (user: User) => {
    set({ user: { ...user, role: "CUSTOMER" } });
  },

  refreshProfile: async () => {
    try {
      const profile = await userService.getProfile();
      if (profile) {
        set((state) => ({
          user: { ...state.user, ...profile, role: "CUSTOMER" },
        }));
      }
    } catch (err) {
      console.warn("Could not refresh profile:", err);
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
          // Check expiration if present
          if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            await tokenService.removeToken();
            set({ token: null, user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          const role = String(decoded.role || "CUSTOMER").toUpperCase();
          if (role !== "CUSTOMER" && role !== "ROLE_CUSTOMER") {
            await tokenService.removeToken();
            set({ token: null, user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          const user: User = {
            id: Number(decoded.userId || decoded.sub || 1),
            name: decoded.name || decoded.email?.split("@")[0] || "Customer",
            fullName: decoded.name || decoded.email?.split("@")[0] || "Customer",
            email: decoded.email || "customer@example.com",
            role: "CUSTOMER",
            phoneNumber: decoded.phoneNumber,
          };

          set({ token, user, isAuthenticated: true, isLoading: false });

          // Fetch fresh server profile in background
          try {
            const profile = await userService.getProfile();
            if (profile) {
              set({ user: { ...user, ...profile, role: "CUSTOMER" } });
            }
          } catch {
            // Keep local JWT decoded info if offline
          }
        } catch {
          await tokenService.removeToken();
          set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export default useAuthStore;