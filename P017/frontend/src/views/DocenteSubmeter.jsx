import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DocenteSubmeter.css";

const DocenteSubmeter = () => {
  const navigate = useNavigate();

  const [semestre, setSemestre] = useState("1");
  const [horasSelecionadas, setHorasSelecionadas] = useState({});
  const [anoLetivo, setAnoLetivo] = useState(""); 
  const [selectedDate, setSelectedDate] = useState(null); 
  const [selectedTime, setSelectedTime] = useState("");

  const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
  
  const horas = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
  ];

  const handleHoraChange = (hora) => {
    setSelectedTime(hora);
    setHorasSelecionadas((prev) => ({
      ...prev,
      [selectedDate]: hora
    }));
  };

  const submeterDisponibilidade = () => {
    const horarios = [];
    Object.keys(horasSelecionadas).forEach((data) => {
      horarios.push({
        dia: data,
        hora_inicio: horasSelecionadas[data],
        hora_fim: horasSelecionadas[data],
        semestre: semestre,
        ano_letivo: anoLetivo, 
      });
    });

    fetch("http://localhost:8000/api/submeter-horario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ horarios }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Horários submetidos com sucesso!");
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Erro ao submeter horários.");
      });
  };

  const handleVisualizarHorario = () => {
    navigate('/DocenteVisualizarHorario');
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/App");
  };

  const handleConsultarSubmissoes = () => {
    navigate('/DocenteConsultarSubmissoes');
  };

  const handleYearSelect = (date) => {
    const selectedYear = date.getFullYear();
    const nextYear = selectedYear + 1;
    setAnoLetivo(`${selectedYear}/${nextYear}`);
    setSelectedDate(date); 
  };

  return (
    <div className="horario-container fade-in">
      <aside className="horario-sidebar">
        <nav className="menu">
          <ul>
            <li onClick={handleVisualizarHorario}>Visualizar Horário</li>
            <li className="active">Submeter Disponibilidade</li>
            <li onClick={handleConsultarSubmissoes}>Consultar Submissões</li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout">SAIR</button>
      </aside>

      <main className="horario-content">
        <div className="horario-header">
          <h2 className="horario-titulo">Submeter Disponibilidade</h2>
        </div>

        <div className="disponibilidade-form">
          <div className="ano-letivo-selector">
            <label>Escolha o ano letivo:</label>
            <DatePicker
              selected={selectedDate}
              onChange={handleYearSelect}
              showYearPicker
              dateFormat="yyyy"
              className="ano-picker" 
              popperPlacement="bottom"
            />
            <input 
              type="text" 
              value={anoLetivo} 
              readOnly
              className="ano-input" 
              placeholder="Escolha o ano letivo" 
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
            <p>Escolha a data e o horário:</p>
            <DatePicker
              selected={selectedDate}
              onChange={handleYearSelect}
              className="calendar-selector"
              dateFormat="dd/MM/yyyy"
              placeholderText="Escolha a data"
            />

            <div className="hora-selector">
              <label>Escolha o horário:</label>
              <select 
                value={selectedTime} 
                onChange={(e) => handleHoraChange(e.target.value)} 
                className="hora-select"
              >
                <option value="">Selecione o horário</option>
                {horas.map((hora, index) => (
                  <option key={index} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="submeter-container">
            <button onClick={submeterDisponibilidade} className="semana-atual-btn">
              Submeter
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocenteSubmeter;
