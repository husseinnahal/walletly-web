'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // On first load, check if we have a token or refresh the session
    checkSession();

    // Listen for background token refreshes from api.js
    const handleBackgroundRefresh = () => {
      const newToken = localStorage.getItem('accessToken');
      if (newToken) setAccessToken(newToken);
    };

    window.addEventListener('auth-token-refreshed', handleBackgroundRefresh);
    return () => window.removeEventListener('auth-token-refreshed', handleBackgroundRefresh);
  }, []);

  const checkSession = async () => {
    try {
      // First check local storage for access token
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        setAccessToken(storedToken);
      }

      // Automatically try to refresh session to get user latest data
      const data = await apiFetch('/auth/refresh', { method: 'POST' });
      
      if (data.success && data.accessToken) {
        persistSession(data.accessToken);
        // After refreshing token, fetch user profile
        fetchUserProfile();
      } else {
        clearSession();
      }
    } catch (error) {
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data } = await apiFetch('/users/profile');
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      clearSession();
    }
  };

  const persistSession = (token) => {
    setAccessToken(token);
    localStorage.setItem('accessToken', token);
  };

  const clearSession = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
  };

  const login = async (identifier, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    
    if (data.success) {
      persistSession(data.accessToken);
      setUser(data.data);
      return data.data; // Return user object for immediate routing decision
    }
    return null;
  };

  const register = async (userData) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.success) {
      persistSession(data.accessToken);
      setUser(data.data);
      return data.data;
    }
    
    return null;
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearSession();
      router.push('/');
    }
  };

  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      loading,
      role: user?.role || null,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
