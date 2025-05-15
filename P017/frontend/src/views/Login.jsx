import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [popupErro, setPopupErro] = useState({ visivel: false, mensagem: "" });
  const [popupSucesso, setPopupSucesso] = useState({ visivel: false, tipoConta: "" });
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       
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
    } catch (err) {
      setPopupErro({ visivel: true, mensagem: "Erro ao comunicar com o servidor." });
    }
  };

  const fecharPopupErro = () => {
    setPopupErro({ visivel: false, mensagem: "" });
  };

  const fecharPopupSucesso = (tipoContaLocal) => {
    setPopupSucesso({ visivel: false, tipoConta: "" });
    if (tipoContaLocal === "docente") {
      navigate("/DocenteVisualizarHorario");
    } else if (tipoContaLocal === "coordenador") {
      navigate("/CoordenadorConsultar");
    } else if (tipoContaLocal === "adm") {
      navigate("/Adm");
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
        <Link to="/" className="back-to-home-link">
          ← Voltar
        </Link>
        <h2 className="registration-title">Inicia Sessão</h2>
        <p className="registration-description">Insere os teus dados para continuar</p>
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

          <div className="forgot-password-link">
            <Link to="/RecuperarPassword">Esqueceste-te da palavra-passe?</Link>
          </div>
          <button type="submit" className="register-button">
            Login →
          </button>
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
      <button onClick={onClose} className="popup-button">
        Fechar
      </button>
      <Link to="/Registo" className="popup-link">
        Não tens conta? Criar conta
      </Link>
    </div>
  </div>
);

const PopupSucessoLogin = ({ tipoConta, onClose }) => {
  let tipoFormatado;
  if (tipoConta === "docente") tipoFormatado = "Docente";
  else if (tipoConta === "coordenador") tipoFormatado = "Coordenador";
  else if (tipoConta === "adm") tipoFormatado = "Administrador";
  else tipoFormatado = tipoConta;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3 style={{ color: "#008000" }}>Login efetuado com sucesso</h3>
        <p>
          Login de <strong>{tipoFormatado}</strong> com sucesso.
        </p>
        <button onClick={() => onClose(tipoConta)} className="popup-button">
          Continuar
        </button>
      </div>
    </div>
  );
};

export default Login;
