import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Adm.css";

const Adm = () => {
  const navigate = useNavigate();

  const [submissoes, setSubmissoes] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [paginaAtiva, setPaginaAtiva] = useState("gerirUtilizadores");

  useEffect(() => {
    setCarregando(true);
    const timer = setTimeout(() => {
      // Adiciona 1 utilizador simulado "User00"
      setSubmissoes([{ utilizador: "User00", cargo: "Pendente" }]);
      setCarregando(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleGerirUtilizadores = () => {
    setPaginaAtiva("gerirUtilizadores");
    navigate("/GerirUtilizadores");
  };
  

  const handleLogout = () => {
    navigate("/App");
  };

  const paginasPorMostrar = 8;
  const totalPaginas = Math.ceil(submissoes.length / paginasPorMostrar);
  const paginacaoSubmissoes = submissoes.slice(
    (pagina - 1) * paginasPorMostrar,
    pagina * paginasPorMostrar
  );

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
    const novaLista = [...submissoes];
    const indiceGlobal = (pagina - 1) * paginasPorMostrar + index;
    novaLista[indiceGlobal].cargo = novoCargo;
    setSubmissoes(novaLista);
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

        {!carregando && submissoes.length === 0 && (
          <p>Ainda não há utilizadores para exibir.</p>
        )}

        {!carregando && submissoes.length > 0 && (
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
                  <tr key={index}>
                    <td className="horario-celula">{submissao.utilizador}</td>
                    <td className="horario-celula">{submissao.cargo}</td>
                    <td className="horario-celula">
                      <select
                        value={submissao.cargo}
                        onChange={(e) =>
                          handleAlterarCargo(index, e.target.value)
                        }
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
