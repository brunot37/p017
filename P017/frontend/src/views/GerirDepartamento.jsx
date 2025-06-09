import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GerirDepartamento.css";

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

const ITEMS_PER_PAGE = 5;

const GerirDepartamento = () => {
  const navigate = useNavigate();

  const [nomeDepartamento, setNomeDepartamento] = useState("");
  const [departamentos, setDepartamentos] = useState([
    { id: 1, nome: "Departamento Simulado", escolaId: null },
  ]);
  const [escolas, setEscolas] = useState([{ id: 1, nome: "Escola Simulada" }]);
  const [alteracoesDepartamento, setAlteracoesDepartamento] = useState({});

  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [idParaRemover, setIdParaRemover] = useState(null);

  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.ceil(escolas.length / ITEMS_PER_PAGE);

  const escolasPagina = escolas.slice(
    (pagina - 1) * ITEMS_PER_PAGE,
    pagina * ITEMS_PER_PAGE
  );

  const openModal = (msg) => {
    setModalMessage(msg);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const handleGerirUtilizadores = () => navigate("/ADM");
  const handleGerirEscolas = () => navigate("/GerirEscolas");
  const handleGerirDepartamento = () => navigate("/GerirDepartamento");
  const handleGerirCoordenadores = () => navigate("/GerirCoordenadores");
  const handleLogout = () => navigate("/");

  const token = localStorage.getItem("token");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nomeDepartamento.trim()) {
      openModal("Por favor, introduza o nome do departamento.");
      return;
    }

    fetch("/api/departamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nomeDepartamento.trim() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((novoDepartamento) => {
        setDepartamentos((prev) => [...prev, novoDepartamento]);
        setNomeDepartamento("");
        openModal("Departamento guardado com sucesso!");
      })
      .catch(() => openModal("Erro ao criar departamento."));
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
    fetch(`/api/departamentos/${idParaRemover}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setDepartamentos((prev) => prev.filter((dep) => dep.id !== idParaRemover));
        setConfirmModalOpen(false);
        openModal("Departamento removido com sucesso!");
      })
      .catch((err) => {
        setConfirmModalOpen(false);
        if (err.response && err.response.status === 401) {
          openModal("Sessão expirada. Faça login novamente.");
          navigate("/login");
        } else {
          openModal("Erro ao remover departamento.");
        }
      });
  };

  const handleDepartamentoChange = (idEscola, novoDepartamentoId) => {
    setAlteracoesDepartamento((prev) => ({
      ...prev,
      [idEscola]: novoDepartamentoId === "" ? null : Number(novoDepartamentoId),
    }));
  };

  const confirmarAlteracaoDepartamento = (idEscola) => {
    if (!(idEscola in alteracoesDepartamento)) {
      openModal("Por favor, selecione um departamento antes de confirmar.");
      return;
    }

    const novoDepartamentoId = alteracoesDepartamento[idEscola];

    // Atualizar o departamento com a nova escola
    setDepartamentos((prev) =>
      prev.map((dep) =>
        dep.id === novoDepartamentoId ? { ...dep, escolaId: idEscola } : dep
      )
    );

    const escola = escolas.find((e) => e.id === idEscola);
    const departamento = departamentos.find((d) => d.id === novoDepartamentoId);

    openModal(
      `Departamento "${departamento?.nome || "Nenhum"}" atribuído à escola "${escola.nome}".`
    );

    setAlteracoesDepartamento((prev) => {
      const copy = { ...prev };
      delete copy[idEscola];
      return copy;
    });
  };

  const getDepartamentoAtribuido = (idEscola) => {
    const departamento = departamentos.find(dep => dep.escolaId === idEscola);
    return departamento ? departamento.id : null;
  };

  const irParaPaginaAnterior = () => {
    if (pagina > 1) setPagina(pagina - 1);
  };

  const irParaProximaPagina = () => {
    if (pagina < totalPaginas) setPagina(pagina + 1);
  };

  useEffect(() => {
    fetch("/api/departamentos")
      .then((res) => res.json())
      .then((data) => setDepartamentos(data))
      .catch(() => openModal("Erro ao carregar departamentos."));

    fetch("/api/escolas")
      .then((res) => res.json())
      .then((data) => setEscolas(data))
      .catch(() => openModal("Erro ao carregar escolas."));
  }, []);

  return (
    <>
      <div className="dep-container">
        <aside className="dep-sidebar">
          <nav className="dep-menu">
            <ul>
              <li onClick={handleGerirUtilizadores}>Gerir Utilizadores</li>
              <li onClick={handleGerirEscolas}>Gerir Escolas</li>
              <li className="active" onClick={handleGerirDepartamento}>
                Gerir Departamento
              </li>
              <li onClick={handleGerirCoordenadores}>Gerir Coordenadores</li>
            </ul>
          </nav>
          <button onClick={handleLogout} className="dep-logout">
            SAIR
          </button>
        </aside>

        <main className="dep-content">
          <h2 className="dep-titulo-form">Adicionar Departamento</h2>
          <form onSubmit={handleSubmit} className="dep-form">
            <label htmlFor="nomeDepartamento">Nome do Departamento:</label>
            <input
              type="text"
              id="nomeDepartamento"
              placeholder="Digite o nome do departamento"
              value={nomeDepartamento}
              onChange={(e) => setNomeDepartamento(e.target.value)}
              required
            />
            <button type="submit" className="dep-btn-submeter">
              Submeter
            </button>
          </form>

          <h2 style={{ marginTop: "40px", color: "#112D4E" }}>Atribuir Departamentos às Escolas</h2>
          <table className="dep-table">
            <thead>
              <tr>
                <th>Nome da Escola</th>
                <th>Departamento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {escolasPagina.map((escola) => (
                <tr key={escola.id}>
                  <td>{escola.nome}</td>
                  <td>
                    <select
                      value={
                        alteracoesDepartamento[escola.id] !== undefined
                          ? alteracoesDepartamento[escola.id] || ""
                          : getDepartamentoAtribuido(escola.id) || ""
                      }
                      onChange={(e) => handleDepartamentoChange(escola.id, e.target.value)}
                    >
                      <option value="">Selecionar Departamento</option>
                      {departamentos.map((dep) => (
                        <option key={dep.id} value={dep.id}>
                          {dep.nome}
                        </option>
                      ))}
                    </select>
                    <button
                      className="dep-btn-save"
                      type="button"
                      onClick={() => confirmarAlteracaoDepartamento(escola.id)}
                    >
                      Confirmar
                    </button>
                  </td>
                  <td>
                    <button
                      className="dep-btn-delete"
                      onClick={() => {
                        const departamentoAtribuido = departamentos.find(dep => dep.escolaId === escola.id);
                        if (departamentoAtribuido) {
                          pedirConfirmRemover(departamentoAtribuido.id);
                        } else {
                          openModal("Nenhum departamento atribuído a esta escola.");
                        }
                      }}
                    >
                      Remover Departamento
                    </button>
                  </td>
                </tr>
              ))}
              {escolasPagina.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                    Nenhuma escola encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="dep-paginacao">
            <button
              onClick={irParaPaginaAnterior}
              disabled={pagina === 1}
              className="btn-seta"
              title="Página anterior"
              aria-label="Página anterior"
            >
              &#x276E;
              <span className="tooltip">Página anterior</span>
            </button>

            <span className="pagina-atual">
              Página {pagina} de {totalPaginas}
            </span>

            <button
              onClick={irParaProximaPagina}
              disabled={pagina === totalPaginas || totalPaginas === 0}
              className="btn-seta"
              title="Próxima página"
              aria-label="Próxima página"
            >
              &#x276F;
              <span className="tooltip">Próxima página</span>
            </button>
          </div>
        </main>
      </div>

      {isModalOpen && <Modal message={modalMessage} onClose={closeModal} />}

      {confirmModalOpen && (
        <ConfirmModal
          message="Tem certeza que deseja remover este departamento?"
          onConfirm={confirmarRemover}
          onCancel={cancelarRemover}
        />
      )}
    </>
  );
};

export default GerirDepartamento;
