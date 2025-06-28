import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Notificacoes.css";
import apiCliente from "../api/apiCliente";

const Modal = ({ message, onClose, onConfirm, isConfirm = false }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3>{isConfirm ? "Confirmar Ação" : "Informação"}</h3>
      <p>{message}</p>
      <div className="modal-buttons">
        {isConfirm ? (
          <>
            <button className="btn-modal secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-modal primary" onClick={onConfirm}>
              Confirmar
            </button>
          </>
        ) : (
          <button className="btn-modal primary" onClick={onClose}>
            OK
          </button>
        )}
      </div>
    </div>
  </div>
);

const Notificacoes = () => {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [userTipo, setUserTipo] = useState("");
  const [totalNotificacoes, setTotalNotificacoes] = useState(0);
  const [naoLidas, setNaoLidas] = useState(0);

  // Modal states
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/Login");
      return;
    }

    carregarDadosUsuario();
    carregarNotificacoes();
  }, [navigate]);

  const carregarDadosUsuario = async () => {
    try {
      const response = await apiCliente.get("/user/info");
      if (response.data) {
        setUserName(response.data.nome || response.data.email);
        setUserTipo(response.data.tipo_conta);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
  };

  const carregarNotificacoes = async () => {
    try {
      setLoading(true);
      const response = await apiCliente.get("/notificacoes");

      if (response.data) {
        setNotificacoes(response.data.notificacoes || []);
        setTotalNotificacoes(response.data.total || 0);
        setNaoLidas(response.data.nao_lidas || 0);
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      setError("Erro ao carregar notificações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (notificacaoId) => {
    try {
      await apiCliente.post(`/notificacoes/${notificacaoId}/marcar-lida`);

      // Atualizar estado local
      setNotificacoes(prev =>
        prev.map(notif =>
          notif.id === notificacaoId
            ? { ...notif, lida: true }
            : notif
        )
      );

      setNaoLidas(prev => prev - 1);
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      openModal("Erro ao marcar notificação como lida.");
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      await apiCliente.post("/notificacoes/marcar-todas-lidas");

      // Atualizar estado local
      setNotificacoes(prev =>
        prev.map(notif => ({ ...notif, lida: true }))
      );

      setNaoLidas(0);
      openModal("Todas as notificações foram marcadas como lidas!");
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
      openModal("Erro ao marcar notificações como lidas.");
    }
  };

  const handleNotificacaoClick = (notificacao) => {
    if (!notificacao.lida) {
      marcarComoLida(notificacao.id);
    }
  };

  const openModal = (message, isConfirm = false, action = null) => {
    setModalMessage(message);
    setIsConfirmModal(isConfirm);
    setConfirmAction(() => action);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
    setIsConfirmModal(false);
    setConfirmAction(null);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    closeModal();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/Login");
  };

  const getMenuItems = () => {
    const baseItems = [
      { label: "Notificações", active: true }
    ];

    switch (userTipo) {
      case "docente":
        return [
          ...baseItems,
          { label: "Submeter Disponibilidade", action: () => navigate("/DocenteSubmeter") },
          { label: "Consultar Submissões", action: () => navigate("/DocenteConsultarSubmissoes") },
          { label: "Visualizar Horário", action: () => navigate("/DocenteVisualizarHorario") }
        ];
      case "coordenador":
        return [
          ...baseItems,
          { label: "Consultar Disponibilidades", action: () => navigate("/CoordenadorConsultar") },
          { label: "Gerir Docentes", action: () => navigate("/GerirDocentes") },
          { label: "Horário dos Docentes", action: () => navigate("/HorarioDosDocentes") }
        ];
      case "admin":
        return [
          ...baseItems,
          { label: "Gerir Coordenadores", action: () => navigate("/GerirCoordenadores") },
          { label: "Gerir Departamentos", action: () => navigate("/GerirDepartamento") },
          { label: "Gerir Escolas", action: () => navigate("/GerirEscolas") },
          { label: "Administrar", action: () => navigate("/Adm") }
        ];
      default:
        return baseItems;
    }
  };

  const getTipoClassName = (tipo) => {
    return `notificacao-tipo tipo-${tipo}`;
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      'disponibilidade_aprovada': 'Aprovado',
      'disponibilidade_rejeitada': 'Rejeitado',
      'horario_criado': 'Horário',
      'docente_adicionado': 'Docente',
      'coordenador_atribuido': 'Coordenador',
      'departamento_alterado': 'Departamento',
      'geral': 'Geral'
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <div className="notificacoes-container">
        <div className="loading">Carregando notificações...</div>
      </div>
    );
  }

  return (
    <div className="notificacoes-container">
      {/* Sidebar */}
      <div className="notificacoes-sidebar">
        <div className="user-greeting">
          <p>Olá, {userName}!</p>
          <button
            className="btn-gerir-perfil"
            onClick={() => {
              if (userTipo === "coordenador") {
                navigate("/GerirPerfilCoordenador");
              } else if (userTipo === "docente") {
                navigate("/GerirPerfilDocente");
              }
            }}
          >
            Gerir Perfil
          </button>
        </div>

        <div className="menu">
          <ul>
            {getMenuItems().map((item, index) => (
              <li
                key={index}
                className={item.active ? "active" : ""}
                onClick={item.action}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <button className="logout" onClick={handleLogout}>
          Terminar Sessão
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="notificacoes-content">
        <div className="notificacoes-header">
          <h1 className="notificacoes-titulo">Notificações</h1>
          <div className="notificacoes-actions">
            <button
              className="btn-marcar-todas"
              onClick={() => openModal(
                "Tem certeza que deseja marcar todas as notificações como lidas?",
                true,
                marcarTodasComoLidas
              )}
              disabled={naoLidas === 0}
            >
              Marcar Todas como Lidas
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {/* Estatísticas */}
        <div className="notificacoes-stats">
          <div className="stat-card">
            <div className="stat-number">{totalNotificacoes}</div>
            <div className="stat-label">Total de Notificações</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{naoLidas}</div>
            <div className="stat-label">Não Lidas</div>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="notificacoes-lista">
          {notificacoes.length === 0 ? (
            <div className="notificacoes-empty">
              <h3>Nenhuma notificação</h3>
              <p>Você não possui notificações no momento.</p>
            </div>
          ) : (
            notificacoes.map((notificacao) => (
              <div
                key={notificacao.id}
                className={`notificacao-item ${notificacao.lida ? 'lida' : 'nao-lida'}`}
                onClick={() => handleNotificacaoClick(notificacao)}
              >
                <div className="notificacao-header">
                  <h3 className="notificacao-titulo">{notificacao.titulo}</h3>
                  <span className="notificacao-tempo">{notificacao.tempo_relativo}</span>
                </div>
                <p className="notificacao-mensagem">{notificacao.mensagem}</p>
                <span className={getTipoClassName(notificacao.tipo)}>
                  {getTipoLabel(notificacao.tipo)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          message={modalMessage}
          onClose={closeModal}
          onConfirm={handleConfirm}
          isConfirm={isConfirmModal}
        />
      )}
    </div>
  );
};

export default Notificacoes;
