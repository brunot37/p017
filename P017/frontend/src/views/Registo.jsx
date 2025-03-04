import React from "react";
import { Link } from "react-router-dom";
import "./Registo.css";

const Registo = () => {
  return (
    <div className="registo-container">
      <div className="registo-illustration">
      <img src="/src/assets/LogoAgenda.png" alt="Caderno" className="illustration" />
      </div>
      <div className="registo-form">
        <Link to="/" className="back-link">&larr; Voltar Página Principal</Link>
        <h2>Gestão de Disponibilidade de Horários</h2>
        <p>REGISTRE-SE PARA CONTINUAR</p>
        <form>
          <div className="input-group">
            <input type="text" placeholder="Utilizador" required />
          </div>
          <div className="input-group">
            <input type="email" placeholder="exemplo@gmail.com" required />
          </div>
          <div className="input-group">
            <input type="password" placeholder="********" required />
          </div>
          <button type="submit" className="register-button">Registrar &rarr;</button>
        </form>
        <p className="help-link">
         <Link to="/ajuda">Precisa de Ajuda?</Link>
        </p>
      </div>
    </div>
  );
};

export default Registo;
