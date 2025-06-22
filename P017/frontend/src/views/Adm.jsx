import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../components/NotificationDropdown";
import "./Adm.css";

const Modal = ({ message, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <p>{message}</p>
      <button onClick={onClose}>OK</button>
    </div>
  </div>
);

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <p>{message}</p>
      <div style={{ marginTop: "20px" }}>
        <button
          className="dep-btn-save"
          onClick={onConfirm}
          style={{ marginRight: "10px" }}
        >
          Sim
        </button>
        <button className="dep-btn-cancel" onClick={onCancel}>
          Não
        </button>
      </div>
    </div>
  </div>
);

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

  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [idParaRemover, setIdParaRemover] = useState(null);

  const paginasPorMostrar = 8;

  const safeSubmissoes = Array.isArray(submissoes) ? submissoes : [];

  const totalPaginas = Math.ceil(safeSubmissoes.length / paginasPorMostrar);
  const paginacaoSubmissoes = safeSubmissoes.slice(
    (pagina - 1) * paginasPorMostrar,
    pagina * paginasPorMostrar
  );

  useEffect(() => {
    setCarregando(true);
    const token = localStorage.getItem('token');
    fetch("http://127.0.0.1:8000/api/users/list", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setSubmissoes(data);
        } else {
          setSubmissoes([]);
          abrirModal("Resposta do backend inesperada.");
          console.error("Resposta do backend inesperada:", data);
        }
        setCarregando(false);
      })
      .catch((err) => {
        setSubmissoes([]);
        setCarregando(false);
        abrirModal("Erro ao carregar utilizadores.");
        console.error("Erro ao buscar utilizadores:", err);
      });
  }, []);

  const abrirModal = (msg) => {
    setModalMessage(msg);
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
  };

  const pedirConfirmRemover = (id) => {
    setIdParaRemover(id);
    setConfirmModalOpen(true);
  };

  const cancelarRemover = () => {
    setIdParaRemover(null);
    setConfirmModalOpen(false);
  };

  const confirmarRemover = () => {
    // Implementar remoção se existir endpoint
    setConfirmModalOpen(false);
    abrirModal("Funcionalidade de remoção não implementada.");
  };

  const handleGerirUtilizadores = () => {
    setPaginaAtiva("gerirUtilizadores");
    navigate("/GerirUtilizadores");
  };

  const handleGerirEscolas = () => {
    setPaginaAtiva("gerirEscolas");
    navigate("/GerirEscolas");
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
    const submissao = paginacaoSubmissoes[index];
    const indiceGlobal = (pagina - 1) * paginasPorMostrar + index;
    const token = localStorage.getItem('token');

    if (!submissao || !submissao.id) {
      abrirModal("Erro: submissão não efetuada.");
      return;
    }

    fetch(`http://127.0.0.1:8000/api/user/tipo-conta/${submissao.id}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ tipo_conta: novoCargo.toLowerCase() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao alterar cargo");
        return res.json();
      })
      .then(() => {
        const novaLista = [...submissoes];
        novaLista[indiceGlobal].cargo = novoCargo.toLowerCase();
        setSubmissoes(novaLista);
        abrirModal(`Cargo alterado com sucesso! Novo tipo de conta: ${novoCargo}`);
      })
      .catch((error) => {
        console.error("Erro ao alterar cargo:", error);
        abrirModal("Erro ao alterar cargo: " + error.message);
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
        <div className="adm-user">
          <span>Olá, <strong>Administrador</strong></span>
          <div className="sidebar-actions">
            <NotificationDropdown />
          </div>
          <hr className="adm-divider" />
        </div>
        
        <nav className="adm-menu">
          <ul>
            <li
              onClick={() => {
                if (paginaAtiva !== "gerirUtilizadores") {
                  setPaginaAtiva("gerirUtilizadores");
                  navigate("/GerirUtilizadores");
                }
              }}
              className={
                paginaAtiva === "gerirUtilizadores"
                  ? "active adm-gerir-utilizadores"
                  : ""
              }
            >
              Gerir Utilizadores
            </li>

            <li
              onClick={handleGerirEscolas}
              className={paginaAtiva === "gerirEscolas" ? "active" : ""}
            >
              Gerir Escolas
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
                ‹<span className="tooltip">Página anterior</span>
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
                ›<span className="tooltip">Próxima página</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && <Modal message={modalMessage} onClose={fecharModal} />}

      {confirmModalOpen && (
        <ConfirmModal
          message="Tem certeza que deseja remover este utilizador?"
          onConfirm={confirmarRemover}
          onCancel={cancelarRemover}
        />
      )}
    </div>
  );
};

export default Adm;
