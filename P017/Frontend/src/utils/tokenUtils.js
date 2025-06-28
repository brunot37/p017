/**
 * Utilitários para validação e manipulação de tokens JWT
 */

/**
 * Verifica se um token JWT está expirado
 * @param {string} token - Token JWT
 * @returns {boolean} True se o token estiver expirado
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp) {
      return payload.exp < currentTime;
    }

    const tokenAge = currentTime - (payload.iat || 0);
    return tokenAge > 24 * 60 * 60; // 24 horas em segundos
  } catch (error) {
    console.error('Erro ao verificar expiração do token:', error);
    return true;
  }
};

/**
 * Obtém dados básicos do payload do token sem validar na API
 * @param {string} token - Token JWT
 * @returns {Object|null} Dados do payload ou null se inválido
 */
export const getTokenPayload = (token) => {
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
};

/**
 * Valida se o token tem o formato correto de JWT
 * @param {string} token - Token para validar
 * @returns {boolean} True se o formato estiver correto
 */
export const isValidJWTFormat = (token) => {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    // Tentar decodificar header e payload
    JSON.parse(atob(parts[0]));
    JSON.parse(atob(parts[1]));
    return true;
  } catch {
    return false;
  }
};

/**
 * Limpa todos os dados de autenticação do localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
  localStorage.removeItem('userName');
};

/**
 * Verifica se o usuário tem permissão para acessar uma rota
 * @param {string} userType - Tipo de conta do usuário
 * @param {Array<string>} allowedRoles - Roles permitidas para a rota
 * @returns {boolean} True se tem permissão
 */
export const hasPermissionForRoute = (userType, allowedRoles) => {
  if (!userType) return false;

  if (userType === 'adm') return true;

  if (!allowedRoles || allowedRoles.length === 0) return true;

  return allowedRoles.includes(userType);
};

/**
 * Obtém a rota inicial baseada no tipo de usuário
 * @param {string} userType - Tipo de conta do usuário
 * @returns {string} Rota inicial
 */
export const getUserHomeRoute = (userType) => {
  switch (userType) {
    case 'docente':
      return '/DocenteVisualizarHorario';
    case 'coordenador':
      return '/CoordenadorConsultar';
    case 'adm':
      return '/Adm';
    case 'pendente':
      return '/Pendente';
    default:
      return '/';
  }
};
