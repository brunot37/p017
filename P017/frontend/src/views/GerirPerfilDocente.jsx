import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./GerirPerfilDocente.css";

const GerirPerfilDocente = () => {
  const navigate = useNavigate();

  const [nomeUtilizador, setNomeUtilizador] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [loading, setLoading] = useState(true);
  const [perfilData, setPerfilData] = useState({
    nome: "",
    email: "",
    cargo: "",
    departamento: "",
    escola: ""
  });

  useEffect(() => {
    buscarPerfilDocente();
  }, []);

  const buscarPerfilDocente = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch("/api/docente/perfil", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPerfilData(data);
        setNomeUtilizador(data.nome);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        toast.error("Erro ao carregar informações do perfil.");
      }
    } catch (error) {
      console.error("Erro ao buscar perfil do docente:", error);
      toast.error("Erro de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

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
    localStorage.removeItem('token');
    navigate("/");
  };

  const handleGerirPerfil = () => {};

  const handleAlterarNome = async () => {
    if (novoNome.trim().length < 3) {
      toast.error("Por favor, digite um nome válido com pelo menos 3 caracteres.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch("/api/docente/alterar-nome", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ novoNome: novoNome.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setNomeUtilizador(data.nome);
        setPerfilData(prev => ({ ...prev, nome: data.nome }));
        setNovoNome("");
        toast.success(data.message || "Nome alterado com sucesso!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Erro ao alterar nome.");
      }
    } catch (error) {
      console.error("Erro ao alterar nome:", error);
      toast.error("Erro de comunicação com o servidor.");
    }
  };

  if (loading) {
    return (
      <div className="docente-container fade-in">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px' 
        }}>
          Carregando...
        </div>
      </div>
    );
  }

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
                <th>Campo</th>
                <th>Informação</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Nome</strong></td>
                <td>{perfilData.nome}</td>
              </tr>
              <tr>
                <td><strong>Email</strong></td>
                <td>{perfilData.email}</td>
              </tr>
              <tr>
                <td><strong>Cargo</strong></td>
                <td>{perfilData.cargo}</td>
              </tr>
              <tr>
                <td><strong>Departamento</strong></td>
                <td>{perfilData.departamento}</td>
              </tr>
              <tr>
                <td><strong>Escola</strong></td>
                <td>{perfilData.escola}</td>
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

