import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { loginUser as apiLogin, registerUser as apiRegister } from '@/api/authApi';
import { tokenStore } from '@/api/tokenStore';
import axiosInstance from '@/api/axiosInstance';

const AuthContext = createContext(null);

// Helper to decode JWT without external libraries
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// User profile is kept in React state (not localStorage)
// Access token is kept in tokenStore (module-level memory, not localStorage)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);   // true until initial refresh attempt completes

  // ── On mount: try to restore session via HttpOnly refresh cookie ────────────
  useEffect(() => {
    axiosInstance.post('/auth/refresh')
      .then(({ data }) => {
        tokenStore.set(data.token);
        setUser(data);
      })
      .catch(() => {
        // No valid refresh cookie — user is not logged in, that's fine
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const data = await apiLogin(credentials);   // throws on error
    tokenStore.set(data.token);
    setUser(data);
    return data;
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (payload) => {
    const data = await apiRegister(payload);
    // Account created, but DO NOT log them in yet!
    return data;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/auth/logout');   // clears HttpOnly cookie on server
    } catch {
      // Even if the server call fails, clear client state
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const isAuthenticated = !!user && !!tokenStore.get();

  // ── Auto Logout Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    const token = tokenStore.get();
    if (!token || !user) return;

    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return;

    const expiresInMs = (decoded.exp * 1000) - Date.now();
    
    if (expiresInMs <= 0) {
      logout();
      return;
    }

    const timerId = setTimeout(() => {
      logout();
    }, expiresInMs);

    return () => clearTimeout(timerId);
  }, [user, logout]);

  // Show nothing while checking session on page load
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
