import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DocenteVisualizarHorario.css";

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

const DocenteVisualizarHorario = () => {
  const navigate = useNavigate();

  const [nomeUtilizador, setNomeUtilizador] = useState("");

  useEffect(() => {
    const user = getUserFromToken();
    if (user && user.nome) {
      setNomeUtilizador(user.nome);
    } else {
      setNomeUtilizador("Docente");
    }
  }, [navigate]);

  const baseDate = new Date("2025-09-14");

  const calcularSemanaAtual = () => {
    const hoje = new Date();
    const diffDias = Math.floor((hoje - baseDate) / (1000 * 60 * 60 * 24));
    return Math.floor(diffDias / 7);
  };

  const calcularSemanaPorData = (data) => {
    const diffDias = Math.floor((data - baseDate) / (1000 * 60 * 60 * 24));
    return Math.floor(diffDias / 7);
  };

  const [semanaIndex, setSemanaIndex] = useState(calcularSemanaAtual());
  const [selectedDate, setSelectedDate] = useState(null);

  const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  const gerarHoras = () => {
    const horas = [];
    let hora = 8;
    let minuto = 0;
    while (hora < 20 || (hora === 20 && minuto === 0)) {
      const h = hora.toString().padStart(2, "0");
      const m = minuto.toString().padStart(2, "0");
      horas.push(`${h}:${m}`);
      minuto += 30;
      if (minuto === 60) {
        minuto = 0;
        hora += 1;
      }
    }
    return horas;
  };

  const horas = gerarHoras();

  const dataInicio = new Date(baseDate);
  dataInicio.setDate(baseDate.getDate() + semanaIndex * 7);
  const dataFim = new Date(dataInicio);
  dataFim.setDate(dataInicio.getDate() + 6);

  const formatarData = (data) => data.toLocaleDateString("pt-PT");

  const handleDateChange = (e) => {
    if (!e.target.value) return;
    const novaData = new Date(e.target.value);
    setSelectedDate(e.target.value);
    setSemanaIndex(calcularSemanaPorData(novaData));
  };

  const mudarSemana = (direcao) => {
    setSemanaIndex((prev) => prev + direcao);
    setSelectedDate(null);
  };

  const voltarHoje = () => {
    setSemanaIndex(calcularSemanaAtual());
    setSelectedDate(null);
  };

  const handleSubmeterDisponibilidade = () => {
    navigate("/DocenteSubmeter");
  };

  const handleConsultarSubmissoes = () => {
    navigate("/DocenteConsultarSubmissoes");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleGerirPerfil = () => {
    navigate("/GerirPerfilDocente");
  };

  return (
    <div className="docente-horario-container fade-in">
      <aside className="horario-sidebar">
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
            <li className="active">Visualizar Horário</li>
          </ul>
        </nav>

        <button onClick={handleLogout} className="logout">
          SAIR
        </button>
      </aside>

      <main className="docente-horario-content">
        <div className="docente-horario-header">
          <input
            type="date"
            value={selectedDate || ""}
            onChange={handleDateChange}
            className="docente-date-picker"
            title="Selecionar data"
            max="2100-12-31"
            min="2000-01-01"
          />
          <h2 className="docente-horario-titulo">
            Semana {formatarData(dataInicio)} - {formatarData(dataFim)}
          </h2>
        </div>

        <div className="docente-horario-tabela-wrapper">
          <table className="docente-horario-tabela">
            <thead>
              <tr>
                <th>Hora</th>
                {dias.map((dia) => (
                  <th key={dia}>{dia}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horas.map((hora) => (
                <tr key={hora}>
                  <td className="docente-hora-coluna">{hora}</td>
                  {dias.map((dia) => {
                    const cellId = `${dia}-${hora.replace(":", "")}`;
                    return (
                      <td key={cellId} id={cellId} className="docente-horario-celula">
                        -
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="docente-semana-navegacao-rodape">
          <button
            onClick={() => mudarSemana(-1)}
            className="docente-btn-seta"
            title="Semana Anterior"
          >
            &#x276E;
          </button>

          <button onClick={voltarHoje} className="docente-btn-semana-atual">
            Semana Atual
          </button>

          <button
            onClick={() => mudarSemana(1)}
            className="docente-btn-seta"
            title="Próxima Semana"
          >
            &#x276F;
          </button>
        </div>
      </main>
    </div>
  );
};

export default DocenteVisualizarHorario;
