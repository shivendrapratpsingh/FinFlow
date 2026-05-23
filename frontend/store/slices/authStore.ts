import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";

interface User {
  id: string;
  email?: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  is_verified: boolean;
  language: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  businessId: string | null;
  isAuthenticated: boolean;

  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  setBusinessId: (id: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      businessId: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setTokens: (access, refresh) => {
        // Store access token in cookie (for middleware)
        Cookies.set("access_token", access, {
          expires: 1,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
      },

      setBusinessId: (id) => set({ businessId: id }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      logout: () => {
        Cookies.remove("access_token");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          businessId: null,
          isAuthenticated: false,
        });
        window.location.href = "/login";
      },
    }),
    {
      name: "finflow-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
        businessId: state.businessId,
      }),
    }
  )
);
