// src/components/auth/auth-provider.jsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { get, post } from "@/lib/api";
import { saveToken, clearToken, getToken } from "@/lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [initializing, setInitializing] = useState(true);

  function applyUser(data) {
    setUser(data);
    setRole(data?.role ?? null);
  }

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const token = getToken();
        if (!token) {
          if (!cancelled) {
            applyUser(null);
            setInitializing(false);
          }
          return;
        }

        const data = await get("/auth/me");
        if (!cancelled) {
          applyUser(data);
        }
      } catch (err) {
        if (!cancelled) {
          clearToken();
          applyUser(null);
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email, password) {
    const res = await post("/auth/login", { email, password });
    saveToken(res.token);
    applyUser(res.user);
    return res;
  }

  function logout() {
    clearToken();
    setRole(null);
    applyUser(null);
  }

  async function refreshUser() {
    const data = await get("/auth/me");
    applyUser(data);
    return data;
  }

  function updateUserContext(partial) {
    setUser((prev) => {
      const changes =
        typeof partial === "function" ? partial(prev || {}) : partial || {};
      const next = { ...(prev || {}), ...changes };
      setRole(next?.role ?? null);
      return next;
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        initializing,
        login,
        logout,
        refreshUser,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus digunakan di dalam <AuthProvider>");
  }
  return ctx;
}
