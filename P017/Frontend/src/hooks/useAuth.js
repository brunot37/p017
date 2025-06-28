import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../utils/navegacao';

/**
 * Hook personalizado para gerenciar autenticação
 * @returns {Object} Estado e funções de autenticação
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  /**
   * Verifica se o usuário está autenticado
   */
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }

      const userInfo = await getUserInfo();

      if (userInfo) {
        setUser(userInfo);
        setIsAuthenticated(true);
        // Atualizar localStorage com dados mais recentes
        localStorage.setItem('userType', userInfo.tipo_conta);
        localStorage.setItem('userName', userInfo.nome || '');
        return true;
      } else {
        // Token inválido, limpar dados
        logout();
        return false;
      }
    } catch (error) {
      console.error('Erro na verificação de autenticação:', error);
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  /**
   * Faz logout do usuário
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  }, [navigate]);

  /**
   * Verifica se o usuário tem uma role específica
   * @param {string|Array<string>} requiredRoles - Role(s) necessária(s)
   * @returns {boolean} Se o usuário tem a role
   */
  const hasRole = useCallback((requiredRoles) => {
    if (!user) return false;

    // Admin sempre tem acesso
    if (user.tipo_conta === 'adm') return true;

    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.tipo_conta);
    }

    return user.tipo_conta === requiredRoles;
  }, [user]);

  /**
   * Navega para a página inicial do usuário baseada em seu tipo
   */
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

  /**
   * Verifica se o token ainda é válido periodicamente
   */
  useEffect(() => {
    checkAuth();

    // Verificar token a cada 5 minutos
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && isAuthenticated) {
        checkAuth();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [checkAuth, isAuthenticated]);

  /**
   * Listener para mudanças no localStorage (múltiplas abas)
   */
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          // Token foi removido em outra aba
          setUser(null);
          setIsAuthenticated(false);
          navigate('/');
        } else if (!isAuthenticated) {
          // Token foi adicionado em outra aba
          checkAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth, isAuthenticated, navigate]);

  return {
    user,
    loading,
    isAuthenticated,
    checkAuth,
    logout,
    hasRole,
    navigateToUserHome
  };
};

/**
 * Hook para obter dados básicos do usuário do token (sem fazer requisição à API)
 * @returns {Object|null} Dados básicos do usuário ou null
 */
export const useTokenUser = () => {
  const [tokenUser, setTokenUser] = useState(null);

  useEffect(() => {
    const getTokenUser = () => {
      const token = localStorage.getItem('token');
      if (!token) return null;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
      } catch (e) {
        console.error('Erro ao ler token JWT:', e);
        return null;
      }
    };

    setTokenUser(getTokenUser());
  }, []);

  return tokenUser;
};
