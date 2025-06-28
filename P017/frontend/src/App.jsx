import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired, isValidJWTFormat, clearAuthData } from './utils/tokenUtils';
import "./App.css";
import LogoAgenda from './assets/LogoAgenda.png';


const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      // Se há um token, verificar se é válido
      if (!isValidJWTFormat(token) || isTokenExpired(token)) {
        console.log('Token inválido ou expirado encontrado na página inicial, limpando...');
        clearAuthData();
      }
    }
  }, []);

  return (
    <div className="home-container animate-fade-in">
      <div className="illustration-section">
        <img src={LogoAgenda} alt="Caderno" className="illustration" />
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
