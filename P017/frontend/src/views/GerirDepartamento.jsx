import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GerirDepartamento.css";

// Modal popup simples embutido
const Modal = ({ message, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <p>{message}</p>
      <button onClick={onClose}>OK</button>
    </div>
  </div>
);

const GerirDepartamento = () => {
  const navigate = useNavigate();
  const [paginaAtiva, setPaginaAtiva] = useState("gerirDepartamento");
  const [nomeDepartamento, setNomeDepartamento] = useState("");

  // Estado modal
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (msg) => {
    setModalMessage(msg);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleGerirUtilizadores = () => {
    setPaginaAtiva("gerirUtilizadores");
    navigate("/ADM");
  };

  const handleGerirDepartamento = () => {
    setPaginaAtiva("gerirDepartamento");
    navigate("/GerirDepartamento");
  };

  const handleGerirCoordenadores = () => {
    setPaginaAtiva("gerirCoordenadores");
    navigate("/GerirCoordenadores");
  };

  const handleGerirDocentes = () => {
    setPaginaAtiva("gerirDocentes");
    navigate("/GerirDocentes");
  };

  const handleLogout = () => {
    navigate("/App");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nomeDepartamento.trim()) {
      openModal("Por favor, introduza o nome do departamento.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/departamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Se usares autenticação:
          // Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ nome: nomeDepartamento }),
      });

      const data = await response.json();

      if (!response.ok) {
        openModal(data.message || "Erro ao guardar departamento.");
      } else {
        openModal(data.message || "Departamento guardado com sucesso!");
        setNomeDepartamento("");
      }
    } catch (error) {
      openModal("Erro de comunicação com o servidor.");
    }
  };

  return (
    <>
      <div className="dep-container">
        <aside className="dep-sidebar">
          <nav className="dep-menu">
            <ul>
              <li
                onClick={handleGerirUtilizadores}
                className={paginaAtiva === "gerirUtilizadores" ? "active dep-gerir-utilizadores" : ""}
              >
                Gerir Utilizadores
              </li>
              <li
                onClick={handleGerirDepartamento}
                className={paginaAtiva === "gerirDepartamento" ? "active" : ""}
              >
                Gerir Departamento
              </li>
              <li
                onClick={handleGerirCoordenadores}
                className={paginaAtiva === "gerirCoordenadores" ? "active" : ""}
              >
                Gerir Coordenadores
              </li>
              <li
                onClick={handleGerirDocentes}
                className={paginaAtiva === "gerirDocentes" ? "active" : ""}
              >
                Gerir Docentes
              </li>
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
              name="nomeDepartamento"
              placeholder="Digite o nome do departamento"
              value={nomeDepartamento}
              onChange={(e) => setNomeDepartamento(e.target.value)}
              required
            />
            <button type="submit" className="dep-btn-submeter">
              Submeter
            </button>
          </form>
        </main>
      </div>

      {isModalOpen && <Modal message={modalMessage} onClose={closeModal} />}
    </>
  );
};

export default GerirDepartamento;
