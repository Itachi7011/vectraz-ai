"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, ApiRequestError } from "@/lib/api";
import type { User } from "@/types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ requiresVerification?: boolean }>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, code: string, purpose: "EMAIL_VERIFICATION" | "LOGIN_2FA") => Promise<void>;
  resendOtp: (email: string, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET") => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await apiFetch<{ user: User }>("/api/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, []);

  const login: AuthContextValue["login"] = async (email, password) => {
    try {
      const data = await apiFetch<{ user: User }>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setUser(data.user);
      return {};
    } catch (err) {
      if (err instanceof ApiRequestError && (err.details as any)?.requiresVerification) {
        return { requiresVerification: true };
      }
      throw err;
    }
  };

  const signup: AuthContextValue["signup"] = async (name, email, password) => {
    await apiFetch("/api/auth/signup", { method: "POST", body: { name, email, password } });
  };

  const verifyOtp: AuthContextValue["verifyOtp"] = async (email, code, purpose) => {
    const data = await apiFetch<{ user: User }>("/api/auth/verify-otp", {
      method: "POST",
      body: { email, code, purpose },
    });
    setUser(data.user);
  };

  const resendOtp: AuthContextValue["resendOtp"] = async (email, purpose) => {
    await apiFetch("/api/auth/resend-otp", { method: "POST", body: { email, purpose } });
  };

  const forgotPassword: AuthContextValue["forgotPassword"] = async (email) => {
    await apiFetch("/api/auth/forgot-password", { method: "POST", body: { email } });
  };

  const resetPassword: AuthContextValue["resetPassword"] = async (email, code, newPassword) => {
    await apiFetch("/api/auth/reset-password", { method: "POST", body: { email, code, newPassword } });
  };

  const logout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, refreshUser, login, signup, verifyOtp, resendOtp, forgotPassword, resetPassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
