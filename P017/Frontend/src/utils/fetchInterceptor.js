import { clearAuthData, isTokenExpired, isValidJWTFormat } from './tokenUtils';

/**
 * Interceptador global para requisições fetch
 * Adiciona automaticamente o token de autorização e trata erros 401
 */

// Verificar e limpar token inválido na inicialização
const initializeTokenValidation = () => {
  const token = localStorage.getItem('token');

  if (token) {
    if (!isValidJWTFormat(token) || isTokenExpired(token)) {
      console.log('Token inválido ou expirado detectado na inicialização, limpando...');
      clearAuthData();
    }
  }
};

// Executar verificação na inicialização
initializeTokenValidation();

// Salvar a função fetch original
const originalFetch = window.fetch;

// Criar uma versão interceptada do fetch
window.fetch = async (url, options = {}) => {
  // Adicionar token de autorização se disponível
  const token = localStorage.getItem('token');

  if (token && !options.headers?.Authorization) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  const response = await originalFetch(url, options);

  // Se receber 401, limpar dados de autenticação e redirecionar
  if (response.status === 401) {
    console.log('Token inválido ou expirado detectado em fetch, fazendo logout...');
    clearAuthData();

    // Redirecionar apenas se não estivermos já na página de login
    if (window.location.pathname !== '/' && window.location.pathname !== '/Login') {
      window.location.href = '/';
    }
  }

  return response;
};

/**
 * Função para restaurar o fetch original (útil para testes)
 */
export const restoreOriginalFetch = () => {
  window.fetch = originalFetch;
};

/**
 * Função helper para fazer requisições autenticadas com tratamento de erros
 * @param {string} url - URL da requisição
 * @param {Object} options - Opções da requisição
 * @returns {Promise} Resposta da requisição
 */
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, mergedOptions);

  if (response.status === 401) {
    clearAuthData();
    window.location.href = '/';
    throw new Error('Não autorizado');
  }

  return response;
};

/**
 * Função para verificar e limpar token manualmente
 * Pode ser chamada quando necessário
 */
export const validateAndCleanToken = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    clearAuthData();
    return false;
  }

  if (!isValidJWTFormat(token) || isTokenExpired(token)) {
    console.log('Token inválido detectado durante validação manual, limpando...');
    clearAuthData();
    return false;
  }

  return true;
};
