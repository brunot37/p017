import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Link } from "react-router-dom"; 
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState(""); 
  const [error, setError] = useState("");
  const navigate = useNavigate(); 

  const handleLogin = async (event) => {
    event.preventDefault(); 

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }), 
      });

      const data = await response.json();

      if (response.ok) {
        if (data.tipo_conta === "docente") {
          navigate("/DocenteVizualizarHorario"); 
        } else if (data.tipo_conta === "coordenador") {
          navigate("/ColaboradorConsultar"); 
        } else {
          setError("Tipo de conta não reconhecido.");
        }
      } else {
        setError(data.message || "Credenciais incorretas");
      }
    } catch (err) {
      setError("Erro ao comunicar com o servidor.");
    }
  };

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
        <h2 className="registration-title">Inicia Sessão</h2>
        <p className="registration-description">
          Insere os teus dados para continuar
        </p>
        <form onSubmit={handleLogin}>
          <div className="input-field email">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-field password">
            <input
              type="password"
              placeholder="Palavra-passe"
              value={senha}  
              onChange={(e) => setSenha(e.target.value)} 
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
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
