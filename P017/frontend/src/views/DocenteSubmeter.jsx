import React, { useState, forwardRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DocenteSubmeter.css";

const CustomYearInput = forwardRef(({ value, onClick }, ref) => (
  <button
    className="custom-year-input"
    onClick={onClick}
    ref={ref}
    type="button"
  >
    {value || "Escolha o ano letivo"}
  </button>
));

const Modal = ({ message, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

const DocenteSubmeter = () => {
  const navigate = useNavigate();

  const [nomeUtilizador, setNomeUtilizador] = useState("");

  useEffect(() => {
    setNomeUtilizador("Bruno Cunha");
  }, []);

  const [semestre, setSemestre] = useState("1");
  const [anoLetivo, setAnoLetivo] = useState("");
  const [selectedYearDate, setSelectedYearDate] = useState(null);

  const [selectedWeekDay, setSelectedWeekDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleYearSelect = (date) => {
    const selectedYear = date.getFullYear();
    const nextYear = selectedYear + 1;
    setAnoLetivo(`${selectedYear}/${nextYear}`);
    setSelectedYearDate(date);
  };

  const getNextDateOfWeekday = (weekday) => {
    // weekday: 1=segunda, 2=terça ... 5=sexta
    const today = new Date();
    const todayDay = today.getDay(); // domingo=0, segunda=1,... sábado=6
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

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const submeterDisponibilidade = () => {
    if (!selectedWeekDay || !selectedTime) {
      openModal("Por favor, selecione dia da semana e hora.");
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
    const hora_inicio = selectedTime;

    const horarios = [
      {
        dia,
        hora_inicio,
        hora_fim: hora_inicio,
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
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Erro ao submeter horários.");
        }

        openModal(data.message || "Horários submetidos com sucesso!");
      })
      .catch((error) => {
        openModal(error.message || "Erro ao submeter horários.");
      });
  };

  const handleVisualizarHorario = () => {
    navigate("/DocenteVisualizarHorario");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleConsultarSubmissoes = () => {
    navigate("/DocenteConsultarSubmissoes");
  };

  const handleGerirPerfil = () => {
    navigate("/GerirPerfilDocente");
  };

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
              <li onClick={handleVisualizarHorario}>Visualizar Horário</li>
              <li className="active">Submeter Disponibilidade</li>
              <li onClick={handleConsultarSubmissoes}>Consultar Submissões</li>
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
              <label>Escolha o ano letivo:</label>
              <DatePicker
                selected={selectedYearDate}
                onChange={handleYearSelect}
                showYearPicker
                dateFormat="yyyy"
                maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
                minDate={new Date(2000, 0, 1)}
                customInput={<CustomYearInput value={anoLetivo} />}
                popperPlacement="bottom"
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
              <label>Escolha o horário:</label>
              <input
                type="time"
                step="1800"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="hora-input"
                placeholder="HH:mm"
              />
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
