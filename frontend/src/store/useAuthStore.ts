import { create } from "zustand";

interface User {
  id: string;
  email: string;
  full_name?: string;
  plan_id?: string;
  subscription_plan?: {
    id: string;
    name: string;
    price: number;
    credits_included: number;
    features: string[];
    is_active: boolean;
    is_recommended: boolean;
  };
  credit_balance: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateCredits: (newBalance: number) => void;
  setLoginModalOpen: (isOpen: boolean) => void;
}

const getInitialToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
  isLoginModalOpen: false,
  setAuth: (user, token) => {
    localStorage.setItem("auth_token", token);
    set({ user, token, isAuthenticated: true, isLoginModalOpen: false });
  },
  logout: () => {
    localStorage.removeItem("auth_token");
    set({ user: null, token: null, isAuthenticated: false, isLoginModalOpen: true });
  },
  updateCredits: (newBalance) => {
    set((state) => ({
      user: state.user ? { ...state.user, credit_balance: newBalance } : null,
    }));
  },
  setLoginModalOpen: (isOpen) => {
    set({ isLoginModalOpen: isOpen });
  },
}));
