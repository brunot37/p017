import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";  
import "./RecuperarPassword.css";

const Modal = ({ children, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const PopupErro = ({ mensagem, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h3 style={{ color: "#cc0000" }}>Erro</h3>
      <p>{mensagem}</p>
      <button onClick={onClose} className="register-button" style={{ width: "100%" }}>
        Fechar
      </button>
    </div>
  </div>
);

const RecuperarPassword = () => {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showResetPrompt, setShowResetPrompt] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const navigate = useNavigate();

  const handleRecuperarSubmit = e => {
    e.preventDefault();
    if (!email) {
      alert("Por favor, insere um email válido.");
      return;
    }
    setShowCodeModal(true);
  };

  const handleConfirmCode = () => {
    if (codeInput === "1234") {
      setShowCodeModal(false);
      setShowResetPrompt(true);
      setCodeInput("");
    } else {
      setErrorMessage("Código incorreto! Por favor, verifica o código e tenta novamente.");
      setShowErrorPopup(true);
    }
  };

  const handleRedefinirSenha = () => {
    navigate("/AlterarPassword");
  };

  const closeErrorPopup = () => {
    setShowErrorPopup(false);
    setCodeInput("");
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
        <h2 className="registration-title">Recuperar Palavra-passe</h2>
        <p className="registration-description">Verifique o seu email para redefinir a palavra-passe!</p>
        <form onSubmit={handleRecuperarSubmit}>
          <div className="input-field email">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="register-button">Recuperar palavra-passe</button>
        </form>
      </div>

      {showCodeModal && (
        <Modal onClose={() => setShowCodeModal(false)}>
          <h3>Introduz o código recebido por email!</h3>
          <input
            type="text"
            placeholder="Código"
            value={codeInput}
            onChange={e => setCodeInput(e.target.value)}
            maxLength={10}
            style={{ padding: "10px", fontSize: "1rem", width: "100%", margin: "10px 0" }}
          />
          <button onClick={handleConfirmCode} className="register-button" style={{ width: "100%" }}>
            Confirmar
          </button>
        </Modal>
      )}

      {showResetPrompt && (
        <Modal onClose={() => setShowResetPrompt(false)}>
          <p>Altere a sua palavra-passe agora!</p>
          <button
            onClick={handleRedefinirSenha}
            className="register-button"
            style={{ width: "100%" }}
          >
            Alterar palavra-passe
          </button>
        </Modal>
      )}

      {showErrorPopup && (
        <PopupErro mensagem={errorMessage} onClose={closeErrorPopup} />
      )}
    </div>
  );
};

export default RecuperarPassword;
