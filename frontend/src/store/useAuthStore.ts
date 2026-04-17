import { create } from "zustand";

interface User {
  id: string;
  email: string;
  subscription_tier: string;
  credit_balance: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateCredits: (newBalance: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    localStorage.setItem("auth_token", token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("auth_token");
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateCredits: (newBalance) => {
    set((state) => ({
      user: state.user ? { ...state.user, credit_balance: newBalance } : null,
    }));
  },
}));
