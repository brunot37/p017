import React from 'react';
import './Login.css';


function Login() {
  return (
    <div className="login-container">
      <div className="login-left">
      <img src="/src/assets/LogoAgenda.png" alt="Caderno" className="illustration" />
      </div>

      <div className="login-right">
        <a href="#" className="back-link">← Voltar Página Principal</a>

        <h2>Gestão de Disponibilidade de Horários</h2>
        <p>LOGIN PARA CONTINUAR</p>

        <form>
          <div className="input-group">
            <input type="email" placeholder="exemplo@gmail.com" />
          </div>

          <div className="input-group">
            <input type="password" placeholder="********" />
          </div>

          <button type="submit">Login →</button>
        </form>

        <a href="#" className="forgot-password">Esqueceu a sua password?</a>

        <div className="help-link">
          <a href="#">❔ Precisa de Ajuda?</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
