import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { verificarDepartamentoDocente } from "../utils/verificarDepartamento";
import LogoAgenda from '../assets/LogoAgenda.png';
import "./DocenteAguardarDepartamento.css";

function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (e) {
    console.error("Erro a ler token JWT:", e);
    return null;
  }
}

const DocenteAguardarDepartamento = () => {
  const navigate = useNavigate();
  const [nomeUtilizador, setNomeUtilizador] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const user = getUserFromToken();
    if (user && user.nome) {
      setNomeUtilizador(user.nome);
    } else {
      setNomeUtilizador("Docente");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? "." : d + "."));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const verificarDepartamento = async () => {
    setVerificando(true);
    try {
      const resultado = await verificarDepartamentoDocente(navigate);
      if (resultado.temDepartamento && !resultado.redirecionado) {
        // Se agora tem departamento, redirecionar para visualizar horário
        navigate("/DocenteVisualizarHorario");
      }
    } catch (error) {
      console.error("Erro ao verificar departamento:", error);
    } finally {
      setVerificando(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="aguardar-departamento-container fade-in">
      <div className="aguardar-illustration">
        <img src={LogoAgenda} alt="Logo Agenda" />
      </div>
      <div className="aguardar-content">
        <div className="aguardar-header">
          <div className="user-info">
            <button onClick={handleLogout} className="btn-logout">
              Sair
            </button>
          </div>
        </div>
        
        <div className="aguardar-main-content">
          <h2 className="aguardar-title">Aguardando Atribuição de Departamento</h2>
          <p className="aguardar-description">
            O seu perfil ainda não foi atribuído a nenhum departamento{dots}
          </p>
          <div className="progress-bar">
            <div className="progress-bar-fill"></div>
          </div>
          <p className="aguardar-subtitle">
            Por favor, aguarde que um administrador atribua o seu perfil a um departamento.
          </p>
          
          <div className="aguardar-actions">
            <button 
              onClick={verificarDepartamento} 
              className="btn-verificar"
              disabled={verificando}
            >
              {verificando ? "Verificando..." : "Verificar Novamente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocenteAguardarDepartamento;