import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "./Registo.css";

const Registo = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true); 
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [popupSucesso, setPopupSucesso] = useState(false);
  const [popupErro, setPopupErro] = useState({ visivel: false, mensagem: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (password.length > 0 && password.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres.");
    } else {
      setPasswordError("");
    }
  }, [password]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      setPopupErro({ visivel: true, mensagem: "Email inválido. Por favor, insere um email válido." });
      setLoading(false);
      return;
    }
    if (!nome.trim()) {
      setPopupErro({ visivel: true, mensagem: "Por favor, insere o nome de utilizador." });
      setLoading(false);
      return;
    }
    if (!password) {
      setPopupErro({ visivel: true, mensagem: "Por favor, insere a palavra-passe." });
      setLoading(false);
      return;
    }
    if (passwordError) {
      setPopupErro({ visivel: true, mensagem: passwordError });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/registo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_conta: "docente", // Ignorado no backend
          nome: nome,
          email: email,
          senha: password,
        }),
      });

      const data = await response.json();
      console.log("Resposta do backend:", data);

      if (response.ok) {
        setPopupSucesso(true);
      } else {
        setPopupErro({ visivel: true, mensagem: data.message || "Erro ao registar conta." });
      }
    } catch {
      setPopupErro({ visivel: true, mensagem: "Erro ao registar conta. Tente novamente mais tarde." });
    } finally {
      setLoading(false);
    }
  };

  const fecharPopupSucesso = () => {
    setPopupSucesso(false);
    navigate("/Login");
  };

  const fecharPopupErro = () => setPopupErro({ visivel: false, mensagem: "" });

  return (
    <div className="registration-container fade-in">
      <div className="registration-illustration">
        <img src="/src/assets/LogoAgenda.png" alt="Caderno" className="illustration-image" />
      </div>
      <div className="registration-form">
        <Link to="/" className="back-to-home-link">← Voltar</Link>
        <h2 className="registration-title">Crie a sua conta</h2>
        <p className="registration-description">Insira os seus dados para fazer o seu registo!</p>
        <form onSubmit={handleSubmit}>
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
          <div className="input-field password password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Palavra-passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="button"
              className="show-hide-btn"
              onClick={() => setShowPassword(prev => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
            >
              {showPassword ? <AiOutlineEye size={22} /> : <AiOutlineEyeInvisible size={22} />}
            </button>
          </div>
          {passwordError && <p className="validation-error">{passwordError}</p>}

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Aguarde..." : "Registar →"}
          </button>
        </form>
      </div>

      {popupSucesso && <PopupSucesso onClose={fecharPopupSucesso} />}
      {popupErro.visivel && <PopupErro mensagem={popupErro.mensagem} onClose={fecharPopupErro} />}
    </div>
  );
};

const PopupSucesso = ({ onClose }) => (
  <div className="popup-overlay">
    <div className="popup-box">
      <h3>Conta criada com sucesso!</h3>
      <p>Por favor, aguarde a atribuição do seu cargo pelo administrador.</p>
      <button onClick={onClose} className="popup-button">OK</button>
    </div>
  </div>
);

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
