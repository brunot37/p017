import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GerirEscolas.css";

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
          className="add-esc-btn-save"
          onClick={onConfirm}
          style={{ marginRight: "10px" }}
        >
          Sim
        </button>
        <button className="add-esc-btn-cancel" onClick={onCancel}>
          Não
        </button>
      </div>
    </div>
  </div>
);

const ITEMS_PER_PAGE = 5;

const GerirEscolas = () => {
  const navigate = useNavigate();

  const [nomeEscola, setNomeEscola] = useState("");
  const [escolas, setEscolas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [editandoNome, setEditandoNome] = useState("");

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

  const handleGerirUtilizadores = () => navigate("/Adm");
  const handleGerirEscolas = () => navigate("/GerirEscolas");
  const handleGerirDepartamento = () => navigate("/GerirDepartamento");
  const handleGerirCoordenadores = () => navigate("/GerirCoordenadores");
  const handleLogout = () => navigate("/");

  useEffect(() => {
    fetch("/api/escolas")
      .then((res) => res.json())
      .then((data) => setEscolas(data))
      .catch(() => openModal("Erro ao carregar escolas."));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nomeEscola.trim()) {
      openModal("Por favor, introduza o nome da escola.");
      return;
    }

    fetch("/api/escolas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nomeEscola.trim() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((novaEscola) => {
        setEscolas((prev) => [...prev, novaEscola]);
        setNomeEscola("");
        openModal("Escola guardada com sucesso!");
      })
      .catch(() => openModal("Erro ao criar escola."));
  };

  const startEdit = (id, nome) => {
    setEditandoId(id);
    setEditandoNome(nome);
  };
  const cancelEdit = () => {
    setEditandoId(null);
    setEditandoNome("");
  };
  const confirmarEdit = () => {
    if (!editandoNome.trim()) {
      openModal("O nome da escola não pode estar vazio.");
      return;
    }
    const token = localStorage.getItem("token");

    fetch(`/api/escolas/${editandoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nome: editandoNome.trim() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((escolaAtualizada) => {
        setEscolas((prev) =>
          prev.map((esc) => (esc.id === editandoId ? escolaAtualizada : esc))
        );
        cancelEdit();
        openModal("Escola atualizada com sucesso!");
      })
      .catch(() => openModal("Erro ao atualizar escola."));
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
    fetch(`/api/escolas/${idParaRemover}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setEscolas((prev) => prev.filter((esc) => esc.id !== idParaRemover));
        setConfirmModalOpen(false);
        openModal("Escola removida com sucesso!");
        if (escolasPagina.length === 1 && pagina > 1) {
          setPagina(pagina - 1);
        }
      })
      .catch(() => {
        setConfirmModalOpen(false);
        openModal("Erro ao remover escola.");
      });
  };

  const irParaPaginaAnterior = () => {
    if (pagina > 1) setPagina(pagina - 1);
  };

  const irParaProximaPagina = () => {
    if (pagina < totalPaginas) setPagina(pagina + 1);
  };

  return (
    <>
      <div className="add-esc-container">
        <aside className="add-esc-sidebar">
          <nav className="add-esc-menu">
            <ul>
              <li onClick={handleGerirUtilizadores}>Gerir Utilizadores</li>
              <li className="active" onClick={handleGerirEscolas}>
                Gerir Escolas
              </li>
              <li onClick={handleGerirDepartamento}>Gerir Departamento</li>
              <li onClick={handleGerirCoordenadores}>Gerir Coordenadores</li>
            </ul>
          </nav>
          <button onClick={handleLogout} className="add-esc-logout">
            SAIR
          </button>
        </aside>

        <main className="add-esc-content">
          <h2 className="add-esc-titulo-form">Adicionar Escola</h2>
          <form onSubmit={handleSubmit} className="add-esc-form">
            <label htmlFor="nomeEscola">Nome da Escola:</label>
            <input
              type="text"
              id="nomeEscola"
              placeholder="Digite o nome da escola"
              value={nomeEscola}
              onChange={(e) => setNomeEscola(e.target.value)}
              required
            />
            <button type="submit" className="add-esc-btn-submeter">
              Submeter
            </button>
          </form>

          <h2 style={{ marginTop: "40px", color: "#112D4E" }}>Escolas</h2>
          <table className="add-esc-table">
            <thead>
              <tr>
                <th>Nome da Escola</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {escolasPagina.map((esc) => (
                <tr key={esc.id}>
                  <td>
                    {editandoId === esc.id ? (
                      <input
                        type="text"
                        value={editandoNome}
                        onChange={(e) => setEditandoNome(e.target.value)}
                      />
                    ) : (
                      esc.nome
                    )}
                  </td>
                  <td>
                    {editandoId === esc.id ? (
                      <>
                        <button
                          className="add-esc-btn-save"
                          onClick={confirmarEdit}
                        >
                          Confirmar
                        </button>
                        <button
                          className="add-esc-btn-cancel"
                          onClick={cancelEdit}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="add-esc-btn-edit"
                          onClick={() => startEdit(esc.id, esc.nome)}
                        >
                          Editar
                        </button>
                        <button
                          className="add-esc-btn-delete"
                          onClick={() => pedirConfirmRemover(esc.id)}
                        >
                          Remover
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {escolasPagina.length === 0 && (
                <tr>
                  <td colSpan="2" style={{ textAlign: "center", padding: "20px" }}>
                    Nenhuma escola encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="add-esc-paginacao">
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
          message="Tem certeza que deseja remover esta escola?"
          onConfirm={confirmarRemover}
          onCancel={cancelarRemover}
        />
      )}
    </>
  );
};

export default GerirEscolas;
