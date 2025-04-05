import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  
import { Link } from "react-router-dom"; 
import "./Registo.css";

const Registo = () => {
  const [tipoConta, setTipoConta] = useState("docente");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);  
  const [popupSucesso, setPopupSucesso] = useState(false);
  const [popupErro, setPopupErro] = useState({ visivel: false, mensagem: "" });
  const [tipoContaCriada, setTipoContaCriada] = useState("");
  const navigate = useNavigate();  

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      setPopupErro({ visivel: true, mensagem: "Email inválido. Por favor, insere um email válido." });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/registo", {
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
      console.log("Resposta do backend:", data);

      if (response.ok) {
        setTipoContaCriada(data.tipo_conta);
        setPopupSucesso(true);
      } else {
        setPopupErro({ visivel: true, mensagem: data.message || "Erro ao registar conta." });
      }
    } catch (err) {
      setPopupErro({ visivel: true, mensagem: "Erro ao registar conta. Tente novamente mais tarde." });
    } finally {
      setLoading(false);
    }
  };

  const fecharPopupSucesso = () => {
    setPopupSucesso(false);
    navigate("/Login");
  };

  const fecharPopupErro = () => {
    setPopupErro({ visivel: false, mensagem: "" });
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

        <p className="help-section">
          <Link to="/ajuda" className="help-link">Precisas de ajuda?</Link>
        </p>
      </div>

      {popupSucesso && (
        <PopupSucesso tipoConta={tipoContaCriada} onClose={fecharPopupSucesso} />
      )}

      {popupErro.visivel && (
        <PopupErro mensagem={popupErro.mensagem} onClose={fecharPopupErro} />
      )}
    </div>
  );
};

// Popup de sucesso
const PopupSucesso = ({ tipoConta, onClose }) => {
  if (!tipoConta) return null;

  const tipoFormatado = tipoConta.charAt(0).toUpperCase() + tipoConta.slice(1);

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3>Conta criada com sucesso!</h3>
        <p>O tipo de conta <strong>{tipoFormatado}</strong> foi criado com sucesso.</p>
        <button onClick={onClose} className="popup-button">OK</button>
      </div>
    </div>
  );
};


// Popup de erro
const PopupErro = ({ mensagem, onClose }) => (
  <div className="popup-overlay">
    <div className="popup-box">
      <h3 style={{ color: "#cc0000" }}>Erro</h3>
      <p>{mensagem}</p>
      <button onClick={onClose} className="popup-button">Fechar</button>
    </div>
  </div>
);

export default Registo;
