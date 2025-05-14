import React from "react";
import "./Pendente.css";

const Pendente = () => {
  return (
    <div className="pending-container fade-in">
      <div className="pending-illustration">
        <img
          src="/src/assets/LogoAgenda.png"
          alt="Caderno"
          className="illustration-image"
        />
      </div>
      <div className="pending-content">
        <p className="waiting-text">
          <strong>Por favor, aguarde enquanto o seu cargo é atribuído</strong>
        </p>
      </div>
    </div>
  );
};

export default Pendente;
