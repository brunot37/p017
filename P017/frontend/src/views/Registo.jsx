import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Registo.css";

const Registo = () => {
  const [tipoConta, setTipoConta] = useState("docente");

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
        <h2 className="registration-title">Cria a tua conta</h2>
        <p className="registration-description">
          Começa agora a gerir a tua disponibilidade
        </p>
        <form>
          <div className="role-select">
            <label>
              <input
                type="radio"
                value="docente"
                checked={tipoConta === "docente"}
                onChange={() => setTipoConta("docente")}
              />
              Docente
            </label>
            <label>
              <input
                type="radio"
                value="coordenador"
                checked={tipoConta === "coordenador"}
                onChange={() => setTipoConta("coordenador")}
              />
              Coordenador
            </label>
          </div>

          <div className="input-field user">
            <input type="text" placeholder="Utilizador" required />
          </div>
          <div className="input-field email">
            <input type="email" placeholder="Email" required />
          </div>
          <div className="input-field password">
            <input type="password" placeholder="Palavra-passe" required />
          </div>

          {/* ✅ Botão atualizado com apenas a classe correta */}
          <button type="submit" className="register-button">Registar →</button>
        </form>

        <p className="help-section">
          <Link to="/ajuda" className="help-link">Precisas de ajuda?</Link>
        </p>
      </div>
    </div>
  );
};

export default Registo;
