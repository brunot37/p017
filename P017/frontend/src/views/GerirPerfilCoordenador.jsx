import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./GerirPerfilCoordenador.css";

const GerirPerfilCoordenador = () => {
  const navigate = useNavigate();

  const [nomeUtilizador, setNomeUtilizador] = useState("");
  const [novoNome, setNovoNome] = useState("");

  useEffect(() => {
    setNomeUtilizador("Coordenador");
  }, []);

  const handleDisponibilidades = () => {
    navigate("/CoordenadorConsultar");
  };

  const handleHorarioDocentes = () => {
    navigate("/HorarioDosDocentes");
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleGerirPerfil = () => {
    // Página atual
  };

  const handleAlterarNome = async () => {
    if (novoNome.trim().length < 3) {
      toast.error("Por favor, digite um nome válido com pelo menos 3 caracteres.");
      return;
    }
    try {
      const response = await fetch("/api/alterar-nome", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
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
    <div className="coordenador-container fade-in">
      <aside className="coordenador-sidebar">
        <div className="user-greeting">
          <p>Olá, <strong>{nomeUtilizador || "Utilizador"}</strong></p>
          <div className="blue-line-top" />
          <button className="btn-gerir-perfil" onClick={handleGerirPerfil}>
            Gerir Perfil
          </button>
        </div>

        <nav className="menu">
          <ul>
            <li onClick={handleDisponibilidades}>Disponibilidades dos Docentes</li>
            <li onClick={handleHorarioDocentes}>Horário dos Docentes</li>
          </ul>
        </nav>

        <button onClick={handleLogout} className="logout">
          SAIR
        </button>
      </aside>

      <main className="coordenador-content">
        <h2 className="coordenador-titulo">Gerir Perfil</h2>

        <div className="coordenador-form-section">
          <h3>Alterar Nome</h3>
          <input
            type="text"
            placeholder="Digite o seu nome novo"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            className="input-text"
          />
          <button onClick={handleAlterarNome} className="action-btn">
            Fazer alteração
          </button>
        </div>
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

export default GerirPerfilCoordenador;
