import React from "react";
import { Link } from "react-router-dom";
import "./ColaboradorConsultar.css";

const ColaboradorConsultar = () => {
  return (
    <div className="container">
      <div className="sidebar">
        <div className="user-info">
          <div className="user-avatar"></div>
          <p>User1</p>
        </div>
        <nav>
          <ul>
            <li className="active">Consultar Disponibilidades Docentes</li>
            <li>Consultar Submissões</li>
          </ul>
        </nav>
        <button className="logout">SAIR</button>
      </div>

      <div className="content">
        <form className="availability-form">
          <div className="input-group">
            <label>Docente</label>
            <select className="docente-select">
              <option>Docente 1</option>
              <option>Docente 2</option>
              <option>Docente 3</option>
            </select>
          </div>

          <div className="date-time-group">
            <div>
              <label>Data de Início</label>
              <div className="date-field-group">
                <select className="date-field">
                  {[...Array(31).keys()].map((day) => (
                    <option key={day + 1}>{String(day + 1).padStart(2, "0")}</option>
                  ))}
                </select>
                <select className="date-field">
                  {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map(
                    (month, index) => (
                      <option key={index}>{month}</option>
                    )
                  )}
                </select>
                <select className="date-field">
                  {[...Array(10).keys()].map((year) => (
                    <option key={2025 + year}>{2025 + year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label>Data de Fim</label>
              <div className="date-field-group">
                <select className="date-field">
                  {[...Array(31).keys()].map((day) => (
                    <option key={day + 1}>{String(day + 1).padStart(2, "0")}</option>
                  ))}
                </select>
                <select className="date-field">
                  {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map(
                    (month, index) => (
                      <option key={index}>{month}</option>
                    )
                  )}
                </select>
                <select className="date-field">
                  {[...Array(10).keys()].map((year) => (
                    <option key={2025 + year}>{2025 + year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="submit-button">Visualizar</button>
        </form>
      </div>
    </div>
  );
};


export default ColaboradorConsultar;
