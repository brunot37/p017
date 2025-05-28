import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HorarioDosDocentes.css";

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

const HorarioDosDocentes = () => {
  const navigate = useNavigate();
  const [nomeUtilizador, setNomeUtilizador] = useState("");
  const [docentes, setDocentes] = useState([]);
  const [docenteSelecionado, setDocenteSelecionado] = useState("");
  const [mostrarDropdownExport, setMostrarDropdownExport] = useState(false);
  const [popupMensagem, setPopupMensagem] = useState(null);

  useEffect(() => {
    const user = getUserFromToken();
    if (user && user.nome) {
      setNomeUtilizador(user.nome);
    } else {
      setNomeUtilizador("Coordenador");
    }

    setDocentes([
      { id: 1, nome: "Maria Fernandes" },
      { id: 2, nome: "João Oliveira" },
      { id: 3, nome: "Ana Costa" }
    ]);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleIrParaDisponibilidade = () => {
    navigate("/CoordenadorConsultar");
  };

  const handleIrGerirDocentes = () => {
    navigate("/GerirDocentes");
  };

  const exportarHorario = (formato) => {
    setMostrarDropdownExport(false);

    setTimeout(() => {
      const sucesso = Math.random() > 0.2;

      if (sucesso) {
        setPopupMensagem({ tipo: "sucesso", texto: `Horário exportado com sucesso em ${formato}!` });
      } else {
        setPopupMensagem({ tipo: "erro", texto: `Erro ao exportar horário em ${formato}. Tente novamente.` });
      }

      setTimeout(() => setPopupMensagem(null), 3000);
    }, 1000);
  };

  return (
    <div className="hd-container fade-in">
      <aside className="hd-sidebar">
        <div className="hd-user-greeting">
          <span>Olá, <strong>{nomeUtilizador}</strong></span>
          <button className="hd-gerir-perfil-btn" onClick={() => navigate("/GerirPerfilCoordenador")}>Gerir Perfil</button>
          <hr className="hd-divider" />
        </div>

        <nav className="hd-menu">
          <ul>
            <li onClick={handleIrGerirDocentes} style={{ cursor: "pointer" }}>Gerir Docentes</li>
            <li onClick={handleIrParaDisponibilidade}>Disponibilidade dos Docentes</li>
            <li className="active">Horário dos Docentes</li>
          </ul>
        </nav>

        <button onClick={handleLogout} className="hd-logout">SAIR</button>
      </aside>

      <main className="hd-content">
        <h2 className="hd-welcome">Olá, {nomeUtilizador}</h2>

        <div
          className="hd-header"
          style={{
            position: "relative",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            display: "flex",
          }}
        >
          <input
            type="date"
            value={selectedDate || ""}
            onChange={handleDateChange}
            className="hd-date-picker"
            title="Selecionar data"
            max="2100-12-31"
            min="2000-01-01"
          />

          <select
            value={docenteSelecionado}
            onChange={(e) => setDocenteSelecionado(e.target.value)}
            className="hd-select-docente"
            title="Selecionar docente"
          >
            <option value="">Selecionar docente</option>
            {docentes.map((docente) => (
              <option key={docente.id} value={docente.id}>
                {docente.nome}
              </option>
            ))}
          </select>

          {docenteSelecionado && (
            <div style={{ position: "relative", marginLeft: "auto" }}>
              <button
                onClick={() => setMostrarDropdownExport((prev) => !prev)}
                className="hd-export-btn"
                title="Exportar Horário"
              >
                Exportar Horário ▼
              </button>

              {mostrarDropdownExport && (
                <div className="hd-export-dropdown">
                  <button onClick={() => exportarHorario("Excel")}>Excel</button>
                  <button onClick={() => exportarHorario("PDF")}>PDF</button>
                </div>
              )}
            </div>
          )}
        </div>

        {docenteSelecionado ? (
          <>
            <h2 className="hd-titulo">
              Horário de: {
                docentes.find(d => d.id.toString() === docenteSelecionado)?.nome
              }<br />
              {formatarData(dataInicio)} - {formatarData(dataFim)}
            </h2>

            <div className="hd-tabela-wrapper">
              <table className="hd-tabela">
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
                      <td className="hd-hora-coluna">{hora}</td>
                      {dias.map((dia) => {
                        const cellId = `${dia}-${hora.replace(":", "")}`;
                        return (
                          <td key={cellId} id={cellId} className="hd-horario-celula">
                            -
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="hd-navegacao">
              <button onClick={() => mudarSemana(-1)} className="hd-btn-seta" title="Semana Anterior">
                &#x276E;
              </button>
              <button onClick={voltarHoje} className="hd-btn-semana-atual">
                Semana Atual
              </button>
              <button onClick={() => mudarSemana(1)} className="hd-btn-seta" title="Próxima Semana">
                &#x276F;
              </button>
            </div>
          </>
        ) : (
          <p className="hd-aviso">Selecione um docente para visualizar o horário.</p>
        )}
      </main>

      {popupMensagem && (
        <div className={`popup-msg ${popupMensagem.tipo}`}>
          {popupMensagem.texto}
        </div>
      )}
    </div>
  );
};

export default HorarioDosDocentes;
