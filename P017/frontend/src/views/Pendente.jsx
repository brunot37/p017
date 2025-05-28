import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import LogoAgenda from '../assets/LogoAgenda.png';
import './Pendente.css';

const Pendente = () => {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? "." : d + "."));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pendente-container fade-in">
      <div className="pendente-illustration">
        <img src={LogoAgenda} alt="Logo Agenda" />
      </div>
      <div className="pendente-content">
        <Link to="/login" className="back-to-home-link">← Voltar</Link>
        <div className="pendente-main-content">
          <h2 className="pendente-title">Aguardando Atribuição de Cargo</h2>
          <p className="pendente-description">
            Por favor, aguarde enquanto o seu cargo é atribuído{dots}
          </p>
          <div className="progress-bar">
            <div className="progress-bar-fill"></div>
          </div>
          <p className="pendente-footer-text">
            Estamos a processar a sua solicitação. Isto pode levar algum momentos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pendente;
