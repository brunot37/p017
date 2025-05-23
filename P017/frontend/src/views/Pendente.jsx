import React, { useEffect, useState } from "react";
import LogoAgenda from '../assets/LogoAgenda.png';
import './Pendente.css';

const Pendente = () => {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(dots => (dots.length >= 3 ? "." : dots + "."));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pendente-container fade-in">
      <div className="pendente-illustration">
        <img src={LogoAgenda} alt="Logo Agenda" />
      </div>
      <div className="pendente-content">
        <h2 className="pendente-title">Aguardando Atribuição</h2>
        <p className="pendente-description">
          Por favor, aguarde enquanto o seu cargo é atribuído{dots}
        </p>
        <div className="progress-bar">
          <div className="progress-bar-fill"></div>
        </div>
        <p className="pendente-footer-text">
          Estamos a processar a sua solicitação. Isto pode levar alguns momentos.
        </p>
      </div>
    </div>
  );
};

export default Pendente;
