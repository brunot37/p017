import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./DocenteConsultarSubmissoes.css";

const ConsultarHorario = () => {
  const navigate = useNavigate();  

  const goToPreviousPage = () => {
    navigate("/pagina-anterior");  
  };

  const goToNextPage = () => {
    navigate("/pagina-proxima");
  };

  return (
    <div className="container">
      <div className="sidebar">
        <nav>
          <ul>
            <li>Visualizar Horário</li>
            <li>Submeter Disponibilidade</li>
            <li className="active" id="consultar-submissoes">Consultar Submissões</li> 
          </ul>
        </nav>
        <button className="logout">SAIR</button>
      </div>
      <div className="content">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Hora Início</th>
                <th>Hora Fim</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, index) => (
                <tr key={index} className={index % 2 === 0 ? "even" : ""}>
                  <td>01/01/2025</td>
                  <td>08:00</td>
                  <td>10:00</td>
                  <td>Aprovado</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="table-navigation">
            <button className="nav-button" onClick={goToPreviousPage}>Anterior</button>
            <button className="nav-button" onClick={goToNextPage}>Próximo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultarHorario;
