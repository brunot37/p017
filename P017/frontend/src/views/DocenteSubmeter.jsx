import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./DocenteSubmeter.css";

const SubmeterDisponibilidade = () => {
  const navigate = useNavigate(); 

  const [formData, setFormData] = useState({
    roomNumber: "",
    courseName: "",
    day: "",
    month: "",
    year: "",
    startTime: "",
    endTime: "",
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  
  const handleSubmit = (e) => {
    e.preventDefault();
   
    
    navigate("/DocenteVizualizarHorario");
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="user-info">
          <div className="user-avatar"></div>
          <p>User1</p>
        </div>
        <nav>
          <ul>
            <li>Visualizar Horário</li>
            <li className="active">Submeter Disponibilidade</li>
            <li>Consultar Submissões</li>
          </ul>
        </nav>
        <button className="logout">SAIR</button>
      </div>

      <div className="content">
        <form className="availability-form" onSubmit={handleSubmit}>
          <label>Número da sala</label>
          <input
            type="text"
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleChange}
            className="room-number"
            placeholder=""
            required
          />

          <label>Nome da Cadeira</label>
          <input
            type="text"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            className="course-name"
            placeholder=""
            required
          />

          <div className="date-time-group">
            <div>
              <label>Dia</label>
              <select
                name="day"
                value={formData.day}
                onChange={handleChange}
                className="date-field"
                required
              >
                {[...Array(31).keys()].map((day) => (
                  <option key={day + 1} value={String(day + 1).padStart(2, "0")}>
                    {String(day + 1).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Mês</label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="date-field"
                required
              >
                {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map(
                  (month, index) => (
                    <option key={index} value={String(index + 1).padStart(2, "0")}>
                      {month}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label>Ano</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="date-field"
                required
              >
                {[...Array(10).keys()].map((year) => (
                  <option key={2025 + year} value={2025 + year}>
                    {2025 + year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="date-time-group">
            <div>
              <label>Hora de Início</label>
              <select
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="time-field"
                required
              >
                {[...Array(34).keys()].map((hour) => {
                  const actualHour = 6 + Math.floor(hour / 2); 
                  const minutes = hour % 2 === 0 ? "00" : "30"; 
                  if (actualHour <= 22) {
                    return (
                      <option key={hour} value={`${String(actualHour).padStart(2, "0")}:${minutes}`}>
                        {`${String(actualHour).padStart(2, "0")}:${minutes}`}
                      </option>
                    );
                  }
                  return null;
                })}
              </select>
            </div>

            <div>
              <label>Hora de Fim</label>
              <select
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="time-field"
                required
              >
                {[...Array(34).keys()].map((hour) => {
                  const actualHour = 6 + Math.floor(hour / 2); 
                  const minutes = hour % 2 === 0 ? "00" : "30"; 
                  if (actualHour <= 22) {
                    return (
                      <option key={hour} value={`${String(actualHour).padStart(2, "0")}:${minutes}`}>
                        {`${String(actualHour).padStart(2, "0")}:${minutes}`}
                      </option>
                    );
                  }
                  return null;
                })}
              </select>
            </div>
          </div>

          <button type="submit" className="submit-button">Submeter</button>
        </form>
      </div>
    </div>
  );
};

export default SubmeterDisponibilidade;
