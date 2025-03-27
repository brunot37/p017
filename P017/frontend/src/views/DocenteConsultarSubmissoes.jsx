import React from "react";
import { Link } from "react-router-dom";
import "./DocenteConsultarSubmissoes.css";

const ConsultarHorario = () => {
  return (
    <div className="container">
      <div className="sidebar">
        <div className="user-info">
          <div className="user-avatar"></div>
          <p>User1</p>
        </div>
        <nav>
          <ul>
            <li>Visualizar Horário ></li>
            <li>Submeter Disponibilidade</li>
            <li>Consultar Submissões</li>
          </ul>
        </nav>
        <button className="logout">SAIR</button>
      </div>
      <div className="content">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Header</th>
                <th>Header</th>
                <th>Header</th>
                <th>Header</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, index) => (
                <tr key={index} className={index % 2 === 0 ? "even" : ""}>
                  <td>Data</td>
                  <td>Data</td>
                  <td>Data</td>
                  <td>Data</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-navigation">
            <button className="nav-button">Anterior</button>
            <button className="nav-button">Próximo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultarHorario;
