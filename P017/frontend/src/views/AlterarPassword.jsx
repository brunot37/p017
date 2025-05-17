import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "./AlterarPassword.css";

const Modal = ({ children, onClose }) => {
  return (
    <div className="alterar-modal-overlay" onClick={onClose}>
      <div className="alterar-modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const AlterarPassword = () => {
  const navigate = useNavigate();

  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [newPwdError, setNewPwdError] = useState("");
  const [confirmPwdError, setConfirmPwdError] = useState("");

  
  const pwdRegex = /^.{6,}$/;

  useEffect(() => {
    if (newPassword.length > 0 && !pwdRegex.test(newPassword)) {
      setNewPwdError("Senha deve ter pelo menos 6 caracteres.");
    } else {
      setNewPwdError("");
    }
  }, [newPassword]);

  useEffect(() => {
    if (newPasswordConfirm.length === 0) {
      setConfirmPwdError("");
    } else if (newPasswordConfirm !== newPassword) {
      setConfirmPwdError("As senhas não coincidem.");
    } else {
      setConfirmPwdError("");
    }
  }, [newPasswordConfirm, newPassword]);

  const handleAlterarSubmit = (e) => {
    e.preventDefault();

    if (!currentPassword) {
      alert("Por favor, digite a sua senha atual.");
      return;
    }
    if (!newPassword) {
      alert("Por favor, digite a sua nova senha.");
      return;
    }
    if (newPwdError) {
      alert(newPwdError);
      return;
    }
    if (confirmPwdError) {
      alert(confirmPwdError);
      return;
    }

   
    const fakeSuccess = true;

    if (fakeSuccess) {
      setResultMessage("Sua senha foi alterada com sucesso.");
      setShowResultModal(true);
    } else {
      setResultMessage("Ocorreu um erro ao alterar a senha. Tente novamente.");
      setShowResultModal(true);
    }
  };

  const closeResultModal = () => {
    setShowResultModal(false);
    if (resultMessage === "Sua senha foi alterada com sucesso.") {
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      navigate("/login");
    }
  };

  return (
    <div className="alterar-container fade-in">
      <div className="alterar-illustration">
        <img
          src="/src/assets/LogoAgenda.png"
          alt="Caderno"
          className="alterar-illustration-image"
        />
      </div>
      <div className="alterar-form">
        <Link to="/" className="alterar-back-link">
          ← Voltar
        </Link>
        <h2 className="alterar-title">Alterar Palavra-passe</h2>
        <p className="alterar-description">
          Digite as informações abaixo para alterar a sua senha!
        </p>
        <form onSubmit={handleAlterarSubmit}>
          <div className="alterar-input-field password-field">
            <input
              type="password"
              placeholder="Digite sua senha atual"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              style={{ flex: 1 }}
            />
          </div>

          <div className="alterar-input-field password-field">
            <input
              type={showNewPwd ? "text" : "password"}
              placeholder="Digite sua nova senha"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="show-hide-btn"
              onClick={() => setShowNewPwd((prev) => !prev)}
              tabIndex={-1}
              aria-label={
                showNewPwd ? "Esconder nova senha" : "Mostrar nova senha"
              }
            >
              {showNewPwd ? (
                <AiOutlineEyeInvisible size={22} />
              ) : (
                <AiOutlineEye size={22} />
              )}
            </button>
          </div>
          {newPwdError && <p className="validation-error">{newPwdError}</p>}

          <div className="alterar-input-field password-field">
            <input
              type={showConfirmPwd ? "text" : "password"}
              placeholder="Digite a nova senha novamente"
              required
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="show-hide-btn"
              onClick={() => setShowConfirmPwd((prev) => !prev)}
              tabIndex={-1}
              aria-label={
                showConfirmPwd
                  ? "Esconder confirmação de senha"
                  : "Mostrar confirmação de senha"
              }
            >
              {showConfirmPwd ? (
                <AiOutlineEyeInvisible size={22} />
              ) : (
                <AiOutlineEye size={22} />
              )}
            </button>
          </div>
          {confirmPwdError && (
            <p className="validation-error">{confirmPwdError}</p>
          )}

          <button type="submit" className="alterar-button">
            Alterar
          </button>
        </form>
      </div>

      {showResultModal && (
        <Modal onClose={closeResultModal}>
          <p>{resultMessage}</p>
          <button
            onClick={closeResultModal}
            className="alterar-button"
            style={{ width: "100%" }}
          >
            Fechar
          </button>
        </Modal>
      )}
    </div>
  );
};

export default AlterarPassword;
