import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../utils/navegacao';

const AuthContext = createContext({});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
    navigate('/');
  }, [navigate]);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return false;
      }

      const userInfo = await getUserInfo();

      if (userInfo) {
        setUser(userInfo);
        setIsAuthenticated(true);
        // Sincronizar localStorage
        localStorage.setItem('userType', userInfo.tipo_conta);
        localStorage.setItem('userName', userInfo.nome || '');
        setLoading(false);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Erro na verificação de autenticação:', error);
      logout();
      return false;
    }
  }, [logout]);

  const login = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', userData.tipo_conta);
    localStorage.setItem('userName', userData.nome || '');
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const hasRole = useCallback((requiredRoles) => {
    if (!user) return false;

    // Admin sempre tem acesso
    if (user.tipo_conta === 'adm') return true;

    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.tipo_conta);
    }

    return user.tipo_conta === requiredRoles;
  }, [user]);

  const navigateToUserHome = useCallback(() => {
    if (!user) {
      navigate('/');
      return;
    }

    switch (user.tipo_conta) {
      case 'docente':
        navigate('/DocenteVisualizarHorario');
        break;
      case 'coordenador':
        navigate('/CoordenadorConsultar');
        break;
      case 'adm':
        navigate('/Adm');
        break;
      case 'pendente':
        navigate('/Pendente');
        break;
      default:
        navigate('/');
        break;
    }
  }, [user, navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        // Token foi removido em outra aba
        setUser(null);
        setIsAuthenticated(false);
        navigate('/');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const value = {
    user,
    loading,
    isAuthenticated,
    checkAuth,
    logout,
    login,
    hasRole,
    navigateToUserHome
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
