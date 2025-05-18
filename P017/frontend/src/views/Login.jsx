import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(true); // Inicia visível
  const [senhaError, setSenhaError] = useState("");
  const [popupErro, setPopupErro] = useState({ visivel: false, mensagem: "" });
  const [popupSucesso, setPopupSucesso] = useState({ visivel: false, tipoConta: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (senha.length > 0 && senha.length < 6) {
      setSenhaError("A senha deve ter pelo menos 6 caracteres.");
    } else {
      setSenhaError("");
    }
  }, [senha]);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setPopupErro({ visivel: true, mensagem: "Por favor, insira o email." });
      return;
    }
    if (!senha.trim()) {
      setPopupErro({ visivel: true, mensagem: "Por favor, insira a palavra-passe." });
      return;
    }
    if (senhaError) {
      setPopupErro({ visivel: true, mensagem: senhaError });
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      });

      const data = await response.json();

      if (response.ok) {
        if (
          data.tipo_conta === "docente" ||
          data.tipo_conta === "coordenador" ||
          data.tipo_conta === "adm"
        ) {
          localStorage.setItem("token", data.token);
          setPopupSucesso({ visivel: true, tipoConta: data.tipo_conta });
        } else {
          setPopupErro({ visivel: true, mensagem: "Tipo de conta não reconhecido." });
        }
      } else {
        setPopupErro({ visivel: true, mensagem: data.message || "Erro ao fazer login." });
      }
    } catch {
      setPopupErro({ visivel: true, mensagem: "Erro ao comunicar com o servidor." });
    }
  };

  const fecharPopupErro = () => setPopupErro({ visivel: false, mensagem: "" });

  const fecharPopupSucesso = (tipoContaLocal) => {
    setPopupSucesso({ visivel: false, tipoConta: "" });
    if (tipoContaLocal === "docente") navigate("/DocenteVisualizarHorario");
    else if (tipoContaLocal === "coordenador") navigate("/CoordenadorConsultar");
    else if (tipoContaLocal === "adm") navigate("/Adm");
  };

  return (
    <div className="registration-container fade-in">
      <div className="registration-illustration">
        <img src="/src/assets/LogoAgenda.png" alt="Caderno" className="illustration-image" />
      </div>
      <div className="registration-form">
        <Link to="/" className="back-to-home-link">← Voltar</Link>
        <h2 className="registration-title">Inicie Sessão</h2>
        <p className="registration-description">Insira os seus dados para continuar!</p>
        <form onSubmit={handleLogin}>
          <div className="input-field email">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              spellCheck="false"
            />
          </div>
          <div className="input-field password">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Palavra-passe"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
            >
              {showPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
            </button>
          </div>
          {senhaError && <p className="validation-error">{senhaError}</p>}

          <div className="forgot-password-link">
            <Link to="/RecuperarPassword">Esqueceste-te da palavra-passe?</Link>
          </div>
          <button type="submit" className="register-button">Login →</button>
        </form>
      </div>

      {popupErro.visivel && (
        <PopupErroLogin mensagem={popupErro.mensagem} onClose={fecharPopupErro} />
      )}

      {popupSucesso.visivel && (
        <PopupSucessoLogin tipoConta={popupSucesso.tipoConta} onClose={fecharPopupSucesso} />
      )}
    </div>
  );
};

const PopupErroLogin = ({ mensagem, onClose }) => (
  <div className="popup-overlay">
    <div className="popup-box">
      <h3 style={{ color: "#cc0000" }}>Erro</h3>
      <p>{mensagem}</p>
      <button onClick={onClose} className="popup-button">Fechar</button>
      <Link to="/Registo" className="popup-link">Não tens conta? Criar conta</Link>
    </div>
  </div>
);

const PopupSucessoLogin = ({ tipoConta, onClose }) => {
  let tipoFormatado = tipoConta === "docente"
    ? "Docente"
    : tipoConta === "coordenador"
    ? "Coordenador"
    : tipoConta === "adm"
    ? "Administrador"
    : tipoConta;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3 style={{ color: "#008000" }}>Login efetuado com sucesso</h3>
        <p>Login de <strong>{tipoFormatado}</strong> com sucesso.</p>
        <button onClick={() => onClose(tipoConta)} className="popup-button">Continuar</button>
      </div>
    </div>
  );
};

export default Login;
