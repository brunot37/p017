export const verificarDepartamentoDocente = async (navigate) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return { temDepartamento: false, redirecionado: true };
    }

    const response = await fetch("http://localhost:8000/api/verificar-departamento-docente", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (!data.tem_departamento) {
        navigate("/DocenteAguardarDepartamento");
        return { temDepartamento: false, redirecionado: true };
      }
      return { temDepartamento: true, redirecionado: false, departamento: data.departamento };
    } else if (response.status === 401) {
      navigate("/");
      return { temDepartamento: false, redirecionado: true };
    } else {
      console.error("Erro ao verificar departamento");
      return { temDepartamento: true, redirecionado: false }; // Em caso de erro, permitir acesso
    }
  } catch (error) {
    console.error("Erro ao verificar departamento:", error);
    return { temDepartamento: true, redirecionado: false }; // Em caso de erro de rede, permitir acesso
  }
};