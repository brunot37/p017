import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Adm.css";

const Adm = () => {
  const navigate = useNavigate();

  const [submissoes, setSubmissoes] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [paginaAtiva, setPaginaAtiva] = useState("gerirUtilizadores");

  const paginasPorMostrar = 8;

  // Garantir que submissoes é array para evitar erro slice
  const safeSubmissoes = Array.isArray(submissoes) ? submissoes : [];

  const totalPaginas = Math.ceil(safeSubmissoes.length / paginasPorMostrar);
  const paginacaoSubmissoes = safeSubmissoes.slice(
    (pagina - 1) * paginasPorMostrar,
    pagina * paginasPorMostrar
  );

  useEffect(() => {
    setCarregando(true);
    fetch("http://127.0.0.1:8000/api/users/", {
      headers: {
        "Content-Type": "application/json",
        // Se usares autenticação JWT:
        // "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSubmissoes(data);
        } else {
          setSubmissoes([]);
          console.error("Resposta do backend inesperada:", data);
        }
        setCarregando(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar utilizadores:", err);
        setSubmissoes([]);
        setCarregando(false);
      });
  }, []);

  const handleGerirUtilizadores = () => {
    setPaginaAtiva("gerirUtilizadores");
    navigate("/GerirUtilizadores");
  };

  const handleLogout = () => {
    navigate("/");
  };

  const irParaPaginaAnterior = () => {
    if (pagina > 1) {
      setPagina(pagina - 1);
    }
  };

  const irParaProximaPagina = () => {
    if (pagina < totalPaginas) {
      setPagina(pagina + 1);
    }
  };

  const handleAlterarCargo = (index, novoCargo) => {
    const indiceGlobal = (pagina - 1) * paginasPorMostrar + index;
    const user = safeSubmissoes[indiceGlobal];

    fetch(`http://127.0.0.1:8000/api/user/${user.id}/tipo-conta/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ tipo_conta: novoCargo.toLowerCase() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao alterar cargo");
        return res.json();
      })
      .then(() => {
        const novaLista = [...safeSubmissoes];
        novaLista[indiceGlobal].cargo = novoCargo.toLowerCase();
        setSubmissoes(novaLista);
      })
      .catch((error) => {
        alert("Erro ao alterar cargo: " + error.message);
      });
  };

  return (
    <div className="horario-container fade-in">
      <aside className="horario-sidebar">
        <nav className="menu">
          <ul>
            <li
              onClick={handleGerirUtilizadores}
              className={
                paginaAtiva === "gerirUtilizadores"
                  ? "active gerir-utilizadores"
                  : ""
              }
            >
              Gerir Utilizadores
            </li>
            <li
              onClick={() => {
                setPaginaAtiva("gerirDepartamento");
                navigate("/GerirDepartamento");
              }}
              className={paginaAtiva === "gerirDepartamento" ? "active" : ""}
            >
              Gerir Departamento
            </li>
            <li
              onClick={() => {
                setPaginaAtiva("gerirCoordenadores");
                navigate("/GerirCoordenadores");
              }}
              className={paginaAtiva === "gerirCoordenadores" ? "active" : ""}
            >
              Gerir Coordenadores
            </li>
            <li
              onClick={() => {
                setPaginaAtiva("gerirDocentes");
                navigate("/GerirDocentes");
              }}
              className={paginaAtiva === "gerirDocentes" ? "active" : ""}
            >
              Gerir Docentes
            </li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout">
          SAIR
        </button>
      </aside>

      <main className="horario-content">
        <div className="horario-header">
          <div className="semana-navegacao">
            <button
              onClick={irParaPaginaAnterior}
              disabled={pagina === 1}
              className="btn-seta"
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              onClick={irParaProximaPagina}
              disabled={pagina === totalPaginas || totalPaginas === 0}
              className="btn-seta"
              aria-label="Próxima"
            >
              ›
            </button>
          </div>
        </div>

        {!carregando && safeSubmissoes.length === 0 && (
          <p>Ainda não há utilizadores para exibir.</p>
        )}

        {!carregando && safeSubmissoes.length > 0 && (
          <div className="horario-tabela-wrapper">
            <table className="horario-tabela">
              <thead>
                <tr>
                  <th>Utilizador</th>
                  <th>Cargo</th>
                  <th>Alterar Cargo</th>
                </tr>
              </thead>
              <tbody>
                {paginacaoSubmissoes.map((submissao, index) => (
                  <tr key={submissao.id}>
                    <td className="horario-celula">{submissao.utilizador}</td>
                    <td className="horario-celula">{submissao.cargo}</td>
                    <td className="horario-celula">
                      <select
                        value={
                          submissao.cargo.charAt(0).toUpperCase() +
                          submissao.cargo.slice(1)
                        }
                        onChange={(e) => handleAlterarCargo(index, e.target.value)}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Docente">Docente</option>
                        <option value="Coordenador">Coordenador</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {carregando && <p>Carregando dados...</p>}
      </main>
    </div>
  );
};

export default Adm;
