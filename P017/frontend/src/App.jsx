import React from "react";

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
          <button className="btn">Login →</button>
          <button className="btn">Registar →</button>
        </div>
        <footer className="footer">Precisas de ajuda?</footer>
      </div>
    </div>
  );
};

export default Home;