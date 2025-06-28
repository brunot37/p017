import { useEffect } from 'react';
import { isTokenExpired, isValidJWTFormat, clearAuthData } from '../utils/tokenUtils';

/**
 * Componente para verificar e limpar tokens inválidos na inicialização da aplicação
 */
const TokenCleaner = () => {
  useEffect(() => {
    const cleanInvalidToken = () => {
      const token = localStorage.getItem('token');

      if (!token) {
        clearAuthData();
        return;
      }

      if (!isValidJWTFormat(token)) {
        console.log('Token com formato inválido detectado, limpando...');
        clearAuthData();
        return;
      }

      if (isTokenExpired(token)) {
        console.log('Token expirado detectado, limpando...');
        clearAuthData();
        return;
      }

      console.log('Token válido encontrado');
    };

    cleanInvalidToken();

    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        cleanInvalidToken();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return null;
};

export default TokenCleaner;
