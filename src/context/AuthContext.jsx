import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token_mediaPila');
    const name = localStorage.getItem('nombre_usuario');
    return token ? { token, name } : null;
  });
  const [loading, setLoading] = useState(true);

  const loginUser = (token, name) => {
    localStorage.setItem('token_mediaPila', token);
    localStorage.setItem('nombre_usuario', name);
    setUser({ token, name });
  };

  const logoutUser = () => {
    localStorage.removeItem('token_mediaPila');
    localStorage.removeItem('nombre_usuario');
    setUser(null);
  };

  const validateSession = async () => {
    const token = localStorage.getItem('token_mediaPila');
    if (!token) {
      logoutUser();
      setLoading(false);
      return false;
    }

    try {
      const res = await api.validateToken(token);
      if (res.ok) {
        setLoading(false);
        return true;
      } else {
        logoutUser();
        setLoading(false);
        return false;
      }
    } catch (e) {
      // En caso de caída del servidor, permitimos seguir de forma temporal si es un token de demo local
      if (token && token.startsWith('token-')) {
        setLoading(false);
        return true;
      } else {
        logoutUser();
        setLoading(false);
        return false;
      }
    }
  };

  useEffect(() => {
    validateSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login: loginUser, logout: logoutUser, validateSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
