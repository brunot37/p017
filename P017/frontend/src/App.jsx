import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./App.css";

const App = () => {  
  const navigate = useNavigate();

  return (
    <div className="home-container animate-fade-in">
      <div className="illustration-section">
        <img src="/src/assets/LogoAgenda.png" alt="Caderno" className="illustration" />
      </div>
      <div className="content-section">
        <h1 className="modern-title">Gestão de Disponibilidade de Horários</h1>
        <p className="modern-subtitle">
          ENCONTRE O HORÁRIO IDEAL COM BASE NA SUA
          DISPONIBILIDADE
        </p>
        <div className="buttons">
          <button className="btn" onClick={() => navigate("/Login")}>Login <span className="arrow">→</span></button>
          <button className="btn" onClick={() => navigate("/Registo")}>Registar <span className="arrow">→</span></button>
        </div>
      </div>
    </div>
  );
};

export default App;
