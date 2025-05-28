import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./GerirPerfilDocente.css";

const GerirPerfilDocente = () => {
  const navigate = useNavigate();

  const [nomeUtilizador, setNomeUtilizador] = useState("");
  const [novoNome, setNovoNome] = useState("");

  // Exemplo estático de departamento e escola
  const [departamento, setDepartamento] = useState("Departamento de Matemática");
  const [escola, setEscola] = useState("Escola Superior de Ciências");

  useEffect(() => {
    setNomeUtilizador("Docente");
  }, []);

  const handleSubmeterDisponibilidade = () => {
    navigate("/DocenteSubmeter");
  };

  const handleConsultarSubmissoes = () => {
    navigate("/DocenteConsultarSubmissoes");
  };

  const handleVisualizarHorario = () => {
    navigate("/DocenteVisualizarHorario");
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleGerirPerfil = () => {};

  const handleAlterarNome = async () => {
    if (novoNome.trim().length < 3) {
      toast.error("Por favor, digite um nome válido com pelo menos 3 caracteres.");
      return;
    }
    try {
      const response = await fetch("/api/alterar-nome", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ novoNome }),
      });

      if (response.ok) {
        const data = await response.json();
        setNomeUtilizador(novoNome);
        setNovoNome("");
        toast.success(data.message || "Nome alterado com sucesso!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Erro ao alterar nome.");
      }
    } catch (error) {
      toast.error("Erro de comunicação com o servidor.");
    }
  };

  return (
    <div className="docente-container fade-in">
      <aside className="docente-sidebar">
        <div className="user-greeting">
          <p>
            Olá, <strong>{nomeUtilizador || "Utilizador"}</strong>
          </p>
          <button className="btn-gerir-perfil" onClick={handleGerirPerfil}>
            Gerir Perfil
          </button>
        </div>

        <nav className="menu">
          <ul>
            <li onClick={handleSubmeterDisponibilidade}>Submeter Disponibilidade</li>
            <li onClick={handleConsultarSubmissoes}>Consultar Submissões</li>
            <li onClick={handleVisualizarHorario}>Visualizar Horário</li>
          </ul>
        </nav>

        <button onClick={handleLogout} className="logout">
          SAIR
        </button>
      </aside>

      <main className="docente-content">
        <h2 className="docente-titulo">Gerir Perfil</h2>

        <div className="docente-form-section">
          <h3>Alterar Nome</h3>
          <input
            type="text"
            placeholder="Digite o seu novo nome"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            className="input-text"
          />
          <button onClick={handleAlterarNome} className="action-btn">
            Fazer alteração
          </button>
        </div>

        {/* Tabela informativa */}
        <section className="docente-info-section">
          <h3>Informações do Perfil</h3>
          <table className="docente-table">
            <thead>
              <tr>
                <th>Departamento</th>
                <th>Escola</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{departamento}</td>
                <td>{escola}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default GerirPerfilDocente;

