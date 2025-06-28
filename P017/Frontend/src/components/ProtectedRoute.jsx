import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUserInfo } from '../utils/navegacao';
import { isTokenExpired, isValidJWTFormat, clearAuthData, hasPermissionForRoute, getUserHomeRoute } from '../utils/tokenUtils';

/**
 * Componente de proteção de rotas
 * @param {Object} props
 * @param {React.Component} props.children - O componente a ser renderizado se autorizado
 * @param {Array<string>} props.allowedRoles - Array de tipos de conta permitidos ['docente', 'coordenador', 'adm']
 * @param {boolean} props.requireAuth - Se true, requer autenticação (default: true)
 * @param {string} props.redirectTo - Rota para redirecionamento se não autorizado
 */
const ProtectedRoute = ({
  children,
  allowedRoles = [],
  requireAuth = true,
  redirectTo = "/"
}) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Se não requer autenticação, permitir acesso
        if (!requireAuth) {
          setIsAuthorized(true);
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');

        // Verificações básicas do token
        if (!token || !isValidJWTFormat(token) || isTokenExpired(token)) {
          clearAuthData();
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        // Obter informações do usuário da API
        const userInfo = await getUserInfo();

        // Se não conseguiu obter informações do usuário, token inválido
        if (!userInfo) {
          clearAuthData();
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        setUser(userInfo);

        // Verificar permissões
        const hasPermission = hasPermissionForRoute(userInfo.tipo_conta, allowedRoles);
        setIsAuthorized(hasPermission);

      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        clearAuthData();
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles, requireAuth, location.pathname]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Verificando permissões...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthorized) {
    if (user) {
      const userHomeRoute = getUserHomeRoute(user.tipo_conta);
      return <Navigate to={userHomeRoute} replace />;
    }

    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
