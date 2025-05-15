import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DocenteVisualizarHorario.css";

const DocenteVisualizarHorario = () => {
  const navigate = useNavigate();

  // Estado para guardar o nome do utilizador
  const [nomeUtilizador, setNomeUtilizador] = useState("");

  useEffect(() => {
    // Simula fetch do nome do utilizador
    setNomeUtilizador("Bruno Cunha");
  }, []);

  const baseDate = new Date("2025-09-14"); // Data base para cálculo das semanas

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
    navigate("/App");
  };

  const handleGerirPerfil = () => {
    navigate("/GerirPerfilDocente");
  };

  return (
    <div className="horario-container fade-in">
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
            <li className="active">Visualizar Horário</li>
            <li onClick={handleSubmeterDisponibilidade}>Submeter Disponibilidade</li>
            <li onClick={handleConsultarSubmissoes}>Consultar Submissões</li>
          </ul>
        </nav>

        <button onClick={handleLogout} className="logout">
          SAIR
        </button>
      </aside>

      <main className="horario-content">
        <div
          className="horario-header"
          style={{ alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}
        >
          <input
            type="date"
            value={selectedDate || ""}
            onChange={handleDateChange}
            className="date-picker"
            title="Selecionar data"
            max="2100-12-31"
            min="2000-01-01"
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          />
          <h2 className="horario-titulo" style={{ marginTop: "6px", color: "#112D4E" }}>
            Semana {formatarData(dataInicio)} - {formatarData(dataFim)}
          </h2>

          <div
            className="semana-navegacao"
            style={{ marginLeft: "auto", alignSelf: "center" }}
          >
            <button onClick={() => mudarSemana(-1)} className="btn-seta" title="Anterior">
              &#x276E;
            </button>

            <button onClick={voltarHoje}>Semana Atual</button>

            <button onClick={() => mudarSemana(1)} className="btn-seta" title="Próxima">
              &#x276F;
            </button>
          </div>
        </div>

        <div className="horario-tabela-wrapper">
          <table className="horario-tabela">
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
                  <td className="hora-coluna">{hora}</td>
                  {dias.map((dia) => {
                    const cellId = `${dia}-${hora.replace(":", "")}`;
                    return (
                      <td key={cellId} id={cellId} className="horario-celula">
                        -
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default DocenteVisualizarHorario;
