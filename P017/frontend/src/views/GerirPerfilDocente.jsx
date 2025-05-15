import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./GerirPerfilDocente.css";

const GerirPerfilDocente = () => {
  const navigate = useNavigate();

  const [nomeUtilizador, setNomeUtilizador] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novaPassword, setNovaPassword] = useState("");

  useEffect(() => {
    // Carrega o nome do utilizador atual (podes ajustar para vir da API)
    setNomeUtilizador("Bruno Cunha");
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
    navigate("/App");
  };

  const handleGerirPerfil = () => {
    // Estamos nesta página
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
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`, // se usares auth
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

  const handleAlterarPassword = async () => {
    if (novaPassword.length < 6) {
      toast.error("A password deve ter pelo menos 6 caracteres.");
      return;
    }
    try {
      const response = await fetch("/api/alterar-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ novaPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        setNovaPassword("");
        toast.success(data.message || "Password alterada com sucesso!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Erro ao alterar password.");
      }
    } catch (error) {
      toast.error("Erro de comunicação com o servidor.");
    }
  };

  return (
    <div className="horario-container fade-in">
      <aside className="horario-sidebar">
        <div className="user-greeting">
          <p>Olá, <strong>{nomeUtilizador || "Utilizador"}</strong></p>
          <button className="btn-gerir-perfil" onClick={handleGerirPerfil}>
            Gerir Perfil
          </button>
        </div>

        <nav className="menu">
          <ul>
            <li onClick={handleVisualizarHorario}>Visualizar Horário</li>
            <li onClick={handleSubmeterDisponibilidade}>Submeter Disponibilidade</li>
            <li onClick={handleConsultarSubmissoes}>Consultar Submissões</li>
          </ul>
        </nav>

        <button onClick={handleLogout} className="logout">
          SAIR
        </button>
      </aside>

      <main className="horario-content">
        <h2 className="horario-titulo">Gerir Perfil</h2>

        <div className="form-section">
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

        <div className="form-section">
          <h3>Alterar Password</h3>
          <input
            type="password"
            placeholder="Digite a password nova"
            value={novaPassword}
            onChange={(e) => setNovaPassword(e.target.value)}
            className="input-text"
          />
          <button onClick={handleAlterarPassword} className="action-btn">
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

export default GerirPerfilDocente;
