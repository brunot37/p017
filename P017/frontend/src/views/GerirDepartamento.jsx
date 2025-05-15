import React, { useState } from "react";
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

// Modal para confirmar ação, com botões Sim / Não
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <p>{message}</p>
      <div style={{ marginTop: "20px" }}>
        <button className="dep-btn-save" onClick={onConfirm} style={{ marginRight: "10px" }}>
          Sim
        </button>
        <button className="dep-btn-cancel" onClick={onCancel}>
          Não
        </button>
      </div>
    </div>
  </div>
);

const GerirDepartamento = () => {
  const navigate = useNavigate();

  const [nomeDepartamento, setNomeDepartamento] = useState("");
  const [departamentos, setDepartamentos] = useState([
    { id: 1, nome: "Departamento Simulado" },
  ]);
  const [editandoId, setEditandoId] = useState(null);
  const [editandoNome, setEditandoNome] = useState("");

  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para modal de confirmação de remoção
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [idParaRemover, setIdParaRemover] = useState(null);

  const openModal = (msg) => {
    setModalMessage(msg);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  // Navegação sidebar
  const handleGerirUtilizadores = () => navigate("/ADM");
  const handleGerirDepartamento = () => navigate("/GerirDepartamento");
  const handleGerirCoordenadores = () => navigate("/GerirCoordenadores");
  const handleGerirDocentes = () => navigate("/GerirDocentes");
  const handleLogout = () => navigate("/");

  // Adicionar departamento simulado
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nomeDepartamento.trim()) {
      openModal("Por favor, introduza o nome do departamento.");
      return;
    }

    const novoDepartamento = {
      id: departamentos.length > 0 ? departamentos[departamentos.length - 1].id + 1 : 1,
      nome: nomeDepartamento.trim(),
    };

    setDepartamentos([...departamentos, novoDepartamento]);
    setNomeDepartamento("");
    openModal("Departamento guardado com sucesso!");
  };

  // Edição
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
      openModal("O nome do departamento não pode estar vazio.");
      return;
    }

    setDepartamentos((prev) =>
      prev.map((dep) => (dep.id === editandoId ? { ...dep, nome: editandoNome } : dep))
    );
    cancelEdit();
    openModal("Departamento atualizado com sucesso!");
  };

  // Abrir modal confirmação para remover
  const pedirConfirmRemover = (id) => {
    setIdParaRemover(id);
    setConfirmModalOpen(true);
  };

  // Cancelar remoção
  const cancelarRemover = () => {
    setIdParaRemover(null);
    setConfirmModalOpen(false);
  };

  // Confirmar remoção
  const confirmarRemover = () => {
    setDepartamentos((prev) => prev.filter((dep) => dep.id !== idParaRemover));
    setConfirmModalOpen(false);
    openModal("Departamento removido com sucesso!");
  };

  return (
    <>
      <div className="dep-container">
        <aside className="dep-sidebar">
          <nav className="dep-menu">
            <ul>
              <li onClick={handleGerirUtilizadores}>Gerir Utilizadores</li>
              <li className="active" onClick={handleGerirDepartamento}>Gerir Departamento</li>
              <li onClick={handleGerirCoordenadores}>Gerir Coordenadores</li>
              <li onClick={handleGerirDocentes}>Gerir Docentes</li>
            </ul>
          </nav>
          <button onClick={handleLogout} className="dep-logout">SAIR</button>
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
            <button type="submit" className="dep-btn-submeter">Submeter</button>
          </form>

          <h2 style={{ marginTop: "40px", color: "#112D4E" }}>Departamentos</h2>
          <table className="dep-table">
            <thead>
              <tr>
                <th>Nome do Departamento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {departamentos.map((dep) => (
                <tr key={dep.id}>
                  <td>
                    {editandoId === dep.id ? (
                      <input
                        type="text"
                        value={editandoNome}
                        onChange={(e) => setEditandoNome(e.target.value)}
                      />
                    ) : (
                      dep.nome
                    )}
                  </td>
                  <td>
                    {editandoId === dep.id ? (
                      <>
                        <button className="dep-btn-save" onClick={confirmarEdit}>Confirmar</button>
                        <button className="dep-btn-cancel" onClick={cancelEdit}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button className="dep-btn-edit" onClick={() => startEdit(dep.id, dep.nome)}>Editar</button>
                        <button className="dep-btn-delete" onClick={() => pedirConfirmRemover(dep.id)}>Remover</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {departamentos.length === 0 && (
                <tr>
                  <td colSpan="2" style={{ textAlign: "center", padding: "20px" }}>
                    Nenhum departamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
