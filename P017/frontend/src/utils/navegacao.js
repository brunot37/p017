/**
 * Utility functions for navigation based on user type
 */

/**
 * Get user info from token stored in localStorage
 * @returns {Object|null} User info with tipo_conta or null if not found
 */
export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (e) {
    console.error("Erro ao ler token JWT:", e);
    return null;
  }
};

/**
 * Get user info from API
 * @returns {Promise<Object|null>} User info or null if error
 */
export const getUserInfo = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    const response = await fetch("/api/user/info", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Erro ao obter informações do usuário:", error);
    return null;
  }
};

/**
 * Navigate to the correct profile page based on user type
 * @param {Function} navigate - React Router navigate function
 */
export const navegarParaPerfilCorreto = async (navigate) => {
  try {
    const userInfo = await getUserInfo();
    
    if (!userInfo || !userInfo.tipo_conta) {
      console.error("Não foi possível obter o tipo de conta do usuário");
      // Fallback: try to get from localStorage
      const userType = localStorage.getItem('userType');
      if (userType) {
        navegarPorTipo(userType, navigate);
        return;
      }
      // Se não conseguir determinar o tipo, redirecionar para login
      navigate("/");
      return;
    }
    
    navegarPorTipo(userInfo.tipo_conta, navigate);
  } catch (error) {
    console.error("Erro ao navegar para perfil:", error);
    // Fallback para localStorage
    const userType = localStorage.getItem('userType');
    if (userType) {
      navegarPorTipo(userType, navigate);
    } else {
      navigate("/");
    }
  }
};

/**
 * Navigate based on user type
 * @param {string} tipoUtilizador - User type (docente, coordenador, adm)
 * @param {Function} navigate - React Router navigate function
 */
const navegarPorTipo = (tipoUtilizador, navigate) => {
  switch (tipoUtilizador) {
    case 'docente':
      navigate("/GerirPerfilDocente");
      break;
    case 'coordenador':
      navigate("/GerirPerfilCoordenador");
      break;
    case 'adm':
      // Admins podem não ter uma página de perfil específica
      // ou podem usar a mesma dos coordenadores
      navigate("/GerirPerfilCoordenador");
      break;
    default:
      console.warn(`Tipo de usuário não reconhecido: ${tipoUtilizador}`);
      navigate("/");
      break;
  }
};

/**
 * Verify if user has permission to access a specific page
 * @param {string} requiredType - Required user type for the page
 * @param {Function} navigate - React Router navigate function
 * @returns {Promise<boolean>} True if user has permission, false otherwise
 */
export const verificarPermissaoAcesso = async (requiredType, navigate) => {
  try {
    const userInfo = await getUserInfo();
    
    if (!userInfo) {
      navigate("/");
      return false;
    }
    
    // Admin tem acesso a todas as páginas
    if (userInfo.tipo_conta === 'adm') {
      return true;
    }
    
    // Verificar se o tipo do usuário corresponde ao exigido
    if (userInfo.tipo_conta !== requiredType) {
      // Redirecionar para a página correta baseada no tipo do usuário
      switch (userInfo.tipo_conta) {
        case 'docente':
          navigate("/DocenteVisualizarHorario");
          break;
        case 'coordenador':
          navigate("/CoordenadorConsultar");
          break;
        default:
          navigate("/");
          break;
      }
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    navigate("/");
    return false;
  }
};
