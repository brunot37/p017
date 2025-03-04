import React from "react";
import "./App.css";
 
const Home = () => {
  return (
    <div className="home-container">
      <div className="illustration-section">
        <img src="/src/assets/LogoAgenda.png" alt="Caderno" className="illustration" />
      </div>
      <div className="content-section">
        <h1>Gestão de Disponibilidade de Horários</h1>
        <p>
          ENCONTRE O HORÁRIO IDEAL PARA TODOS OS DOCENTES COM BASE NA SUA
          DISPONIBILIDADE
        </p>
        <div className="buttons">
          <button className="btn">
            Login <span className="arrow">→</span>
          </button>
          <button className="btn">
            Registar <span className="arrow">→</span>
          </button>
        </div>
        <footer className="footer">
          <span className="help">Precisas de ajuda?</span>
        </footer>
      </div>
    </div>
  );
};

export default Home;
