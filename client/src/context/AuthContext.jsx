import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { generateKeyPair } from '../utils/encryption';

const AuthContext = createContext();

// Use an environment variable for the API base URL if available (production),
// otherwise use an empty string (development proxy)
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('token'));

  // Use interceptors for bearer token
  useEffect(() => {
    if (!accessToken) return;
    const interceptor = axios.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, [accessToken]);

  // Load user data on refresh
  useEffect(() => {
    const fetchUser = async () => {
      // If no token or if we already have user data (from login), don't fetch
      if (!accessToken || user) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get('/api/users/me');
        setUser(data);

        // --- NEW: Generate Encryption keys if not present ---
        if (!localStorage.getItem('privateKey') || !data.publicKey) {
          const keys = await generateKeyPair();
          localStorage.setItem('privateKey', keys.privateKey);
          // Update the server with the public key
          await axios.put('/api/users/update', { publicKey: keys.publicKey });
          setUser({ ...data, publicKey: keys.publicKey });
        }
        // ----------------------------------------------------
      } catch (err) {
        console.error('Auth refresh failed:', err);
        localStorage.removeItem('token');
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [accessToken, user]);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setAccessToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAccessToken(null);
    setUser(null);
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
       Notification.requestPermission();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
