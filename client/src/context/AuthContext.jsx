import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('krishisetu_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const savedToken = localStorage.getItem('krishisetu_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        } catch (err) {
          console.error('Session verification failed:', err);
          localStorage.removeItem('krishisetu_token');
          localStorage.removeItem('krishisetu_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('krishisetu_token', newToken);
    localStorage.setItem('krishisetu_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('krishisetu_token', newToken);
    localStorage.setItem('krishisetu_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('krishisetu_token');
    localStorage.removeItem('krishisetu_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
