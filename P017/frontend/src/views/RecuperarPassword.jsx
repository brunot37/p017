import React from "react";
import { Link } from "react-router-dom";  
import "./RecuperarPassword.css";

const RecuperarPassword = () => {
  return (
    <div className="registration-container fade-in">
      <div className="registration-illustration">
        <img
          src="/src/assets/LogoAgenda.png"
          alt="Caderno"
          className="illustration-image"
        />
      </div>
      <div className="registration-form">
        <Link to="/" className="back-to-home-link">← Voltar</Link>
        <h2 className="registration-title">Recuperar Palavra-passe</h2>
        <p className="registration-description">Verifica o teu email para redefinir a palavra-passe</p>
        <form>
          <div className="input-field email">
            <input
              type="email"
              placeholder="Email"
              required
            />
          </div>
          <button type="submit" className="register-button">Recuperar →</button>
        </form>
      </div>
    </div>
  );
};

export default RecuperarPassword;
