import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Adm.css";

const cargosDisponiveis = [
  "Pendente",
  "Docente",
  "Coordenador",
  "Administrador",
];

const Adm = () => {
  const navigate = useNavigate();

  const [submissoes, setSubmissoes] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [paginaAtiva, setPaginaAtiva] = useState("gerirUtilizadores");

  const [cargoExemplo, setCargoExemplo] = useState("-");

  const paginasPorMostrar = 8;

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
    if (safeSubmissoes.length === 0) {
      setCargoExemplo(novoCargo);
      return;
    }

    const indiceGlobal = (pagina - 1) * paginasPorMostrar + index;
    const user = safeSubmissoes[indiceGlobal];

    fetch(`http://127.0.0.1:8000/api/user/${user.id}/tipo-conta/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
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

  const estiloSelect = {
    padding: "6px 10px",
    borderRadius: "5px",
    border: "1.5px solid #007bff",
    backgroundColor: "#f9f9f9",
    fontSize: "1rem",
    cursor: "pointer",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  return (
    <div className="adm-container fade-in">
      <aside className="adm-sidebar">
        <nav className="adm-menu">
          <ul>
            <li
              onClick={handleGerirUtilizadores}
              className={
                paginaAtiva === "gerirUtilizadores"
                  ? "active adm-gerir-utilizadores"
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
        <button onClick={handleLogout} className="adm-logout">
          SAIR
        </button>
      </aside>

      <main className="adm-content">
        {carregando ? (
          <p>Carregando dados...</p>
        ) : (
          <div className="adm-tabela-wrapper">
            <table className="adm-tabela">
              <thead>
                <tr>
                  <th>Utilizador</th>
                  <th>Cargo</th>
                  <th>Alterar Cargo</th>
                </tr>
              </thead>
              <tbody>
                {safeSubmissoes.length > 0 ? (
                  paginacaoSubmissoes.map((submissao, index) => (
                    <tr key={submissao.id}>
                      <td className="adm-celula">{submissao.utilizador}</td>
                      <td className="adm-celula">
                        {submissao.cargo.charAt(0).toUpperCase() +
                          submissao.cargo.slice(1)}
                      </td>
                      <td className="adm-celula">
                        <select
                          style={estiloSelect}
                          value={
                            submissao.cargo.charAt(0).toUpperCase() +
                            submissao.cargo.slice(1)
                          }
                          onChange={(e) =>
                            handleAlterarCargo(index, e.target.value)
                          }
                        >
                          {cargosDisponiveis.map((cargo) => (
                            <option key={cargo} value={cargo}>
                              {cargo}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="adm-celula"
                      style={{ fontStyle: "italic", color: "#666" }}
                    >
                      Ainda não há utilizadores para exibir.
                    </td>
                    <td className="adm-celula">{cargoExemplo}</td>
                    <td className="adm-celula">
                      <select
                        style={estiloSelect}
                        value={cargoExemplo}
                        onChange={(e) => handleAlterarCargo(0, e.target.value)}
                      >
                        {cargosDisponiveis.map((cargo) => (
                          <option key={cargo} value={cargo}>
                            {cargo}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            
            <div className="adm-tabela-navegacao-rodape">
              <button
                onClick={irParaPaginaAnterior}
                disabled={pagina === 1}
                className="adm-btn-seta"
                title="Página anterior"
                aria-label="Página anterior"
              >
                ‹
                <span className="tooltip">Página anterior</span>
              </button>
              <span className="pagina-atual">
                Página {pagina} de {totalPaginas}
              </span>
              <button
                onClick={irParaProximaPagina}
                disabled={pagina === totalPaginas || totalPaginas === 0}
                className="adm-btn-seta"
                title="Próxima página"
                aria-label="Próxima página"
              >
                ›
                <span className="tooltip">Próxima página</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Adm;
