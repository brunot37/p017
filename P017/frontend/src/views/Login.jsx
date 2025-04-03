import React from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  return (
    <div className="registration-container fade-in">
      <div className="registration-illustration">
        <img src="/src/assets/LogoAgenda.png" alt="Caderno" className="illustration-image" />
      </div>
      <div className="registration-form">
        <Link to="/" className="back-to-home-link">← Voltar</Link>
        <h2 className="registration-title">Inicia Sessão</h2>
        <p className="registration-description">Insere os teus dados para continuar</p>
        <form>
          <div className="input-field">
            <input type="email" placeholder="Email" required />
          </div>
          <div className="input-field">
            <input type="password" placeholder="Palavra-passe" required />
          </div>
          <div className="forgot-password-link">
            <Link to="/RecuperarPassword">Esqueceste-te da palavra-passe?</Link>
          </div>
          <button type="submit" className="register-button">Login →</button>
        </form>
        <p className="help-section">
          <Link to="/ajuda" className="help-link">Precisas de ajuda?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
