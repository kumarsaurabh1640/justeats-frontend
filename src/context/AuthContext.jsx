import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';

function decodeToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initFromStorage = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    const decoded = decodeToken(token);
    if (decoded && decoded.exp * 1000 > Date.now()) {
      setUser(decoded);
      setLoading(false);
      return;
    }

    // Token expired — attempt silent refresh
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const { data } = await authApi.refresh(refreshToken);
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
        setUser(decodeToken(data.access_token));
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  const login = async (email, password) => {
    const { data } = await authApi.login(email, password);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    const decoded = decodeToken(data.access_token);
    setUser(decoded);
    return decoded;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    return data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // ignore errors on logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
