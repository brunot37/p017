import React from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  return (
    <div className="registration-container">
      <div className="registration-illustration">
        <img src="/src/assets/LogoAgenda.png" alt="Caderno" className="illustration-image" />
      </div>
      <div className="registration-form">
    
        <Link to="/" className="back-to-home-link">&larr; Voltar Página Principal</Link>
        <h2 className="registration-title">Gestão de Disponibilidade de Horários</h2>
        <p className="registration-description">REGISTRE-SE PARA CONTINUAR</p>
        <form>
          <div className="input-field">
            <input type="email" placeholder="exemplo@gmail.com" required className="input-field__red" />
          </div>
          <div className="input-field">
            <input type="password" placeholder="********" required className="input-field__red" />
          </div>
          <button type="submit" className="register-button red-button">Login &rarr;</button>
        </form>
        <p className="help-section">
          <Link to="/ajuda" className="help-link">Precisa de Ajuda?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login