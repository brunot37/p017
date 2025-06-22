import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificacoes } from '../hooks/useNotificacoes';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const {
    notificacoes,
    naoLidas,
    loading,
    marcarComoLida,
    marcarTodasComoLidas
  } = useNotificacoes();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificacaoClick = async (notificacao) => {
    if (!notificacao.lida) {
      await marcarComoLida(notificacao.id);
    }
    
    // Fechar dropdown
    setIsOpen(false);
    
    // Navegar para a página de notificações se necessário
    // navigate('/notificacoes');
  };

  const handleVerTodas = () => {
    setIsOpen(false);
    navigate('/notificacoes');
  };

  const handleMarcarTodasLidas = async () => {
    const sucesso = await marcarTodasComoLidas();
    if (sucesso) {
      // Opcional: mostrar feedback de sucesso
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'disponibilidade_aprovada':
        return '✅';
      case 'disponibilidade_rejeitada':
        return '❌';
      case 'horario_criado':
        return '📅';
      case 'docente_adicionado':
        return '👤';
      case 'coordenador_atribuido':
        return '👨‍💼';
      case 'departamento_alterado':
        return '🏢';
      default:
        return '📢';
    }
  };

  // Mostrar apenas as 5 notificações mais recentes no dropdown
  const notificacoesRecentes = notificacoes.slice(0, 5);

  return (
    <div className="notification-dropdown">
      <button 
        className={`notification-button ${naoLidas > 0 ? 'has-unread' : ''}`}
        onClick={toggleDropdown}
        title="Notificações"
      >
        <span className="notification-icon">🔔</span>
        {naoLidas > 0 && (
          <span className="notification-badge">{naoLidas > 99 ? '99+' : naoLidas}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown-menu">
          <div className="notification-header">
            <h3>Notificações</h3>
            {naoLidas > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={handleMarcarTodasLidas}
                title="Marcar todas como lidas"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="notification-content">
            {loading ? (
              <div className="notification-loading">Carregando...</div>
            ) : notificacoesRecentes.length === 0 ? (
              <div className="notification-empty">
                <p>Não há notificações</p>
              </div>
            ) : (
              <>
                <ul className="notification-list">
                  {notificacoesRecentes.map((notificacao) => (
                    <li 
                      key={notificacao.id}
                      className={`notification-item ${!notificacao.lida ? 'unread' : ''}`}
                      onClick={() => handleNotificacaoClick(notificacao)}
                    >
                      <div className="notification-icon-container">
                        <span className="notification-type-icon">
                          {getTipoIcon(notificacao.tipo)}
                        </span>
                      </div>
                      <div className="notification-content-text">
                        <h4 className="notification-title">{notificacao.titulo}</h4>
                        <p className="notification-message">{notificacao.mensagem}</p>
                        <span className="notification-time">{notificacao.tempo_relativo}</span>
                      </div>
                      {!notificacao.lida && <div className="unread-indicator"></div>}
                    </li>
                  ))}
                </ul>
                
                {notificacoes.length > 5 && (
                  <div className="notification-footer">
                    <button 
                      className="view-all-btn"
                      onClick={handleVerTodas}
                    >
                      Ver todas ({notificacoes.length})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Overlay para fechar quando clicar fora */}
      {isOpen && (
        <div 
          className="notification-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationDropdown;
