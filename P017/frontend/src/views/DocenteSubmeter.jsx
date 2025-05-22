import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DocenteSubmeter.css";

const Modal = ({ message, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {message.split("\n").map((line, i) => (
        <p key={i}>{line}</p>
      ))}
      <button onClick={onClose}>OK</button>
    </div>
  </div>
);

const DocenteSubmeter = () => {
  const navigate = useNavigate();

  const [nomeUtilizador, setNomeUtilizador] = useState("");
  const [semestre, setSemestre] = useState("1");
  const [anoLetivo, setAnoLetivo] = useState("");

  useEffect(() => {
    setNomeUtilizador("Docente");
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth(); // 0=jan, 8=setembro

    const anoInicio = mes >= 8 ? ano : ano - 1;
    setAnoLetivo(`${anoInicio}/${anoInicio + 1}`);
  }, []);

  const [selectedWeekDay, setSelectedWeekDay] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getNextDateOfWeekday = (weekday) => {
    const today = new Date();
    const todayDay = today.getDay();
    let diff = weekday - todayDay;
    if (diff <= 0) diff += 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);
    return nextDate;
  };

  const openModal = (msg) => {
    setModalMessage(msg);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const criarMensagemSucesso = () =>
    `Disponibilidade submetida com sucesso.\n` +
    `Ano letivo: ${anoLetivo}\n` +
    `Semestre: ${semestre === "1" ? "1º Semestre" : "2º Semestre"}\n` +
    `Dia da semana: ${selectedWeekDay}\n` +
    `Horário: ${horaInicio} até ${horaFim}`;

  const generateTimeOptions = () => {
    const times = [];
    const start = 8 * 60;
    const end = 20 * 60;
    for (let mins = start; mins <= end; mins += 30) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      times.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const submeterDisponibilidade = () => {
    if (!anoLetivo) {
      openModal("Ano letivo inválido.");
      return;
    }
    if (!semestre) {
      openModal("Por favor, selecione o semestre.");
      return;
    }
    if (!selectedWeekDay) {
      openModal("Por favor, selecione o dia da semana.");
      return;
    }
    if (!horaInicio || !horaFim) {
      openModal("Por favor, selecione o intervalo de horário completo.");
      return;
    }
    if (horaFim <= horaInicio) {
      openModal("O horário de fim deve ser posterior ao horário de início.");
      return;
    }

    const weekDayMap = {
      Segunda: 1,
      Terça: 2,
      Quarta: 3,
      Quinta: 4,
      Sexta: 5,
    };

    const weekdayNum = weekDayMap[selectedWeekDay];
    if (!weekdayNum) {
      openModal("Dia da semana inválido.");
      return;
    }

    const dateObj = getNextDateOfWeekday(weekdayNum);
    const dia = dateObj.toISOString().split("T")[0];

    const horarios = [
      {
        dia,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        semestre,
        ano_letivo: anoLetivo,
      },
    ];

    fetch("http://localhost:8000/api/submeter-horario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ horarios }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Erro ao submeter horários.");
        }
        openModal(criarMensagemSucesso());
      })
      .catch((error) => {
        openModal(error.message || "Erro ao submeter horários.");
      });
  };

  const handleVisualizarHorario = () => navigate("/DocenteVisualizarHorario");
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  const handleConsultarSubmissoes = () => navigate("/DocenteConsultarSubmissoes");
  const handleGerirPerfil = () => navigate("/GerirPerfilDocente");

  return (
    <>
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
              <li className="active">Submeter Disponibilidade</li>
              <li onClick={handleConsultarSubmissoes}>Consultar Submissões</li>
              <li onClick={handleVisualizarHorario}>Visualizar Horário</li>
            </ul>
          </nav>

          <button onClick={handleLogout} className="logout">
            SAIR
          </button>
        </aside>

        <main className="horario-content">
          <div className="horario-header">
            <h2 className="horario-titulo">Submeter Disponibilidade</h2>
          </div>

          <div className="disponibilidade-form">
            <div className="ano-letivo-selector">
              <label>Ano letivo:</label>
              <input
                type="text"
                readOnly
                value={anoLetivo}
                className="semestre-select"
                style={{ cursor: "default", backgroundColor: "#eee" }}
              />
            </div>

            <div className="semestre-selector">
              <label>Escolha o semestre:</label>
              <select
                value={semestre}
                onChange={(e) => setSemestre(e.target.value)}
                className="semestre-select"
              >
                <option value="1">1º Semestre</option>
                <option value="2">2º Semestre</option>
              </select>
            </div>

            <div className="horarios-selector">
              <label>Escolha o dia da semana:</label>
              <select
                className="semestre-select"
                value={selectedWeekDay}
                onChange={(e) => setSelectedWeekDay(e.target.value)}
              >
                <option value="">-- Selecionar dia --</option>
                <option value="Segunda">Segunda-feira</option>
                <option value="Terça">Terça-feira</option>
                <option value="Quarta">Quarta-feira</option>
                <option value="Quinta">Quinta-feira</option>
                <option value="Sexta">Sexta-feira</option>
              </select>
            </div>

            <div className="horarios-selector">
              <label>Escolha o intervalo de horário:</label>
              <div style={{ display: "flex", gap: "16px" }}>
                <select
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="hora-input"
                >
                  <option value="">Início</option>
                  {generateTimeOptions().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <span style={{ alignSelf: "center" }}>até</span>
                <select
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  className="hora-input"
                >
                  <option value="">Fim</option>
                  {generateTimeOptions().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="submeter-container">
              <button
                onClick={submeterDisponibilidade}
                className="semana-atual-btn"
              >
                Submeter
              </button>
            </div>
          </div>
        </main>
      </div>

      {isModalOpen && <Modal message={modalMessage} onClose={closeModal} />}
    </>
  );
};

export default DocenteSubmeter;