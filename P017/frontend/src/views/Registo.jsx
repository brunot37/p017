import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  
import { Link } from "react-router-dom"; 
import "./Registo.css";

const Registo = () => {
  const [tipoConta, setTipoConta] = useState("docente");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");  
  const [loading, setLoading] = useState(false);  
  const navigate = useNavigate();  

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      setMensagemSucesso("Email inválido. Por favor, insira um email válido.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8000/api/registo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo_conta: tipoConta,
          nome: nome,
          email: email,
          senha: password,
        }),
      });
  
      const data = await response.json();
      console.log("Resposta do backend:", data);  // Verifique se a resposta está correta
  
      if (response.ok) {
        setMensagemSucesso(`${data.tipo_conta.charAt(0).toUpperCase() + data.tipo_conta.slice(1)} criado com sucesso!`);
        setTimeout(() => {
          navigate("/Login");
        }, 2000);
      } else {
        setMensagemSucesso(data.message || "Erro ao criar conta!");
      }
    } catch (err) {
      setMensagemSucesso("Erro ao registrar, tente novamente mais tarde.");
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
        <h2 className="registration-title">Cria a tua conta</h2>
        <p className="registration-description">Começa agora a gerir a tua disponibilidade</p>
        <form onSubmit={handleSubmit}>
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
            <input
              type="text"
              placeholder="Utilizador"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Aguarde..." : "Registar →"}
          </button>
        </form>

        {mensagemSucesso && <p className="success-message">{mensagemSucesso}</p>}

        <p className="help-section">
          <Link to="/ajuda" className="help-link">Precisas de ajuda?</Link>
        </p>
      </div>
    </div>
  );
};

export default Registo;
