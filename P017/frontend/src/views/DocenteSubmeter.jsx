import React from "react";
import { Link } from "react-router-dom";
import "./DocenteSubmeter.css";

const SubmeterDisponibilidade = () => {
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
        <form className="availability-form">
          <label>Número da sala</label>
          <input type="text" className="room-number" placeholder="" />

          <label>Nome da Cadeira</label>
          <input type="text" className="course-name" placeholder="" />

          <div className="date-time-group">
            <div>
              <label>Dia</label>
              <select className="date-field">
                {[...Array(31).keys()].map((day) => (
                  <option key={day + 1}>{String(day + 1).padStart(2, "0")}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Mês</label>
              <select className="date-field">
                {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map(
                  (month, index) => (
                    <option key={index}>{month}</option>
                  )
                )}
              </select>
            </div>
            <div>
              <label>Ano</label>
              <select className="date-field">
                {[...Array(10).keys()].map((year) => (
                  <option key={2025 + year}>{2025 + year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="date-time-group">
            <div>
              <label>Hora de Início</label>
              <select className="time-field">
                {[...Array(34).keys()].map((hour) => {
                  const actualHour = 6 + Math.floor(hour / 2); 
                  const minutes = hour % 2 === 0 ? "00" : "30"; 
                  if (actualHour <= 22) {
                    return <option key={hour}>{`${String(actualHour).padStart(2, "0")}:${minutes}`}</option>;
                  }
                  return null; 
                })}
              </select>
            </div>
            <div>
              <label>Hora de Fim</label>
              <select className="time-field">
                {[...Array(34).keys()].map((hour) => {
                  const actualHour = 6 + Math.floor(hour / 2); 
                  const minutes = hour % 2 === 0 ? "00" : "30"; 
                  if (actualHour <= 22) {
                    return <option key={hour}>{`${String(actualHour).padStart(2, "0")}:${minutes}`}</option>;
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
