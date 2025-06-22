import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { navegarParaPerfilCorreto } from "../utils/navegacao";
import NotificationDropdown from "../components/NotificationDropdown";
import "./CoordenadorConsultar.css";

const getUserInfo = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    const response = await fetch("/api/user/info", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Erro ao obter informações do usuário:", error);
    return null;
  }
};

const ModalConfirmacao = ({ visible, onConfirm, onCancel, docenteNome, dia, hora, acao }) => {
  if (!visible) return null;

  return (
    <div className="cd-modal-overlay" onClick={onCancel}>
      <div className="cd-modal-content" onClick={e => e.stopPropagation()}>
        <h3>Confirmar ação</h3>
        <p>
          Tem a certeza que deseja <strong>{acao === "aprovar" ? "aprovar" : "rejeitar"}</strong> o docente <strong>{docenteNome}</strong> para o dia <strong>{dia}</strong> na hora <strong>{hora}</strong>?
        </p>
        <div className="cd-modal-buttons">
          <button className="cd-btn-aprovar" onClick={onConfirm}>Confirmar</button>
          <button className="cd-btn-rejeitar" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

const ModalAviso = ({ visible, mensagem, onClose }) => {
  if (!visible) return null;

  return (
    <div className="cd-modal-overlay" onClick={onClose}>
      <div className="cd-modal-content" onClick={e => e.stopPropagation()}>
        <h3>Aviso</h3>
        <p>{mensagem}</p>
        <div className="cd-modal-buttons">
          <button className="cd-btn-rejeitar" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

const CoordenadorConsultar = () => {
  const [paginaIndex, setPaginaIndex] = useState(1);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coordenadorNome, setCoordenadorNome] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [diasSelecionados, setDiasSelecionados] = useState({});
  const [horasSelecionadas, setHorasSelecionadas] = useState({});
  const [disponibilidadesSelecionadas, setDisponibilidadesSelecionadas] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDocente, setModalDocente] = useState(null);
  const [modalDia, setModalDia] = useState("");
  const [modalHora, setModalHora] = useState("");
  const [modalAcao, setModalAcao] = useState("");
  const [avisoVisible, setAvisoVisible] = useState(false);
  const [avisoMensagem, setAvisoMensagem] = useState("");
  const navigate = useNavigate();
  const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        const user = await getUserInfo();
        
        if (!user) {
          setAvisoMensagem("Erro ao obter informações do usuário. Faça login novamente.");
          setAvisoVisible(true);
          setTimeout(() => {
            localStorage.removeItem("token");
            navigate("/");
          }, 2000);
          return;
        }
        
        setUserInfo(user);
        setCoordenadorNome(user.nome || "Coordenador");
        
        if (!['coordenador', 'adm'].includes(user.tipo_conta)) {
          setAvisoMensagem(`Acesso negado. Tipo de conta: ${user.tipo_conta}. Apenas coordenadores podem acessar esta área.`);
          setAvisoVisible(true);
          setTimeout(() => {
            navigate("/");
          }, 3000);
          return;
        }
        
        await carregarDisponibilidades();
      } catch (error) {
        console.error("Erro na inicialização:", error);
        setAvisoMensagem("Erro ao inicializar a página.");
        setAvisoVisible(true);
      }
    };
    
    initializeComponent();
  }, [navigate]);

  const carregarDisponibilidades = async () => {
    const token = localStorage.getItem("token");
    
    try {
      setLoading(true);
      
      const response = await fetch("/api/consultar-disponibilidades", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocentes(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json();
        setAvisoMensagem(errorData.detail || "Erro ao carregar disponibilidades.");
        setAvisoVisible(true);
      }
    } catch (error) {
      console.error("Erro ao carregar disponibilidades:", error);
      setAvisoMensagem("Erro ao comunicar com o servidor.");
      setAvisoVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const docentesPorPagina = 10;
  const inicio = (paginaIndex - 1) * docentesPorPagina;
  const fim = inicio + docentesPorPagina;
  const docentesPaginaAtual = docentes.slice(inicio, fim);

  const mudarPagina = (direcao) => {
    setPaginaIndex(prev => {
      const nova = prev + direcao;
      if (nova < 1 || nova > Math.ceil(docentes.length / docentesPorPagina)) return prev;
      return nova;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleDiaChange = (docenteId, dia) => {
    setDiasSelecionados(prev => ({ ...prev, [docenteId]: dia }));
    setHorasSelecionadas(prev => ({ ...prev, [docenteId]: "" }));
    setDisponibilidadesSelecionadas(prev => ({ ...prev, [docenteId]: null }));
  };

  const handleHoraChange = (docenteId, hora) => {
    setHorasSelecionadas(prev => ({ ...prev, [docenteId]: hora }));
    
    const docente = docentes.find(d => d.id === docenteId);
    const dia = diasSelecionados[docenteId];
    const disponibilidadeDia = docente?.disponibilidade.find(d => d.dia === dia);
    const disponibilidadeDetalhe = disponibilidadeDia?.detalhes?.find(d => d.hora === hora);
    
    if (disponibilidadeDetalhe) {
      setDisponibilidadesSelecionadas(prev => ({ 
        ...prev, 
        [docenteId]: disponibilidadeDetalhe.id 
      }));
    }
  };

  const abrirModal = (docente, acao) => {
    const dia = diasSelecionados[docente.id];
    const hora = horasSelecionadas[docente.id];
    
    if (!dia) {
      setAvisoMensagem("Por favor, selecione o dia que quer aprovar ou rejeitar.");
      setAvisoVisible(true);
      return;
    }
    if (!hora) {
      setAvisoMensagem("Por favor, selecione a hora que quer aprovar ou rejeitar.");
      setAvisoVisible(true);
      return;
    }
    
    setModalDocente(docente);
    setModalDia(dia);
    setModalHora(hora);
    setModalAcao(acao);
    setModalVisible(true);
  };

  const confirmarAcao = async () => {
    const token = localStorage.getItem("token");
    const disponibilidadeId = disponibilidadesSelecionadas[modalDocente.id];
    
    if (!disponibilidadeId) {
      setAvisoMensagem("Erro: Disponibilidade não encontrada.");
      setAvisoVisible(true);
      setModalVisible(false);
      return;
    }

    try {
      const response = await fetch("/api/gerenciar-aprovacao", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disponibilidade_id: disponibilidadeId,
          acao: modalAcao === "aprovar" ? "aprovar" : "rejeitar",
          observacoes: `${modalAcao === "aprovar" ? "Aprovado" : "Rejeitado"} pelo coordenador`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setModalVisible(false);
        setAvisoMensagem(data.message);
        setAvisoVisible(true);
        
        await carregarDisponibilidades();
        
        setDiasSelecionados(prev => ({ ...prev, [modalDocente.id]: "" }));
        setHorasSelecionadas(prev => ({ ...prev, [modalDocente.id]: "" }));
        setDisponibilidadesSelecionadas(prev => ({ ...prev, [modalDocente.id]: null }));
      } else {
        const errorData = await response.json();
        setModalVisible(false);
        setAvisoMensagem(errorData.detail || "Erro ao processar aprovação.");
        setAvisoVisible(true);
      }
    } catch (error) {
      console.error("Erro ao confirmar ação:", error);
      setModalVisible(false);
      setAvisoMensagem("Erro ao comunicar com o servidor.");
      setAvisoVisible(true);
    }
  };

  const fecharAviso = () => {
    setAvisoVisible(false);
  };

  const totalPaginas = Math.ceil(docentes.length / docentesPorPagina);

  if (!userInfo && !avisoVisible) {
    return (
      <div className="cd-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px' 
        }}>
          Verificando permissões...
        </div>
      </div>
    );
  }

  return (
    <div className="cd-container fade-in">
      <aside className="cd-sidebar">
        <div className="cd-user">
          <span>Olá, <strong>{coordenadorNome}</strong></span>
          <div className="sidebar-actions">
            <button className="cd-btn-perfil" onClick={() => navegarParaPerfilCorreto(navigate)}>Gerir Perfil</button>
            <NotificationDropdown />
          </div>
          <hr className="cd-divider" />
        </div>

        <nav className="cd-menu">
          <ul>
            <li onClick={() => navigate("/GerirDocentes")}>Gerir Docentes</li>
            <li className="active">Disponibilidades dos Docentes</li>
            <li onClick={() => navigate("/HorarioDosDocentes")}>Horário dos Docentes</li>
          </ul>
        </nav>

        <button className="cd-btn-logout" onClick={handleLogout}>SAIR</button>
      </aside>

      <main className="cd-main">
        <h2 className="cd-titulo">Disponibilidades dos Docentes</h2>

        <div className="cd-table-wrapper">
          <table className="cd-table">
            <thead>
              <tr>
                <th>Docentes</th>
                {dias.map(dia => <th key={dia}>{dia}</th>)}
                <th>Aprovação</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7">Carregando...</td></tr>
              ) : docentesPaginaAtual.length === 0 ? (
                <tr><td colSpan="7">Nenhuma disponibilidade encontrada</td></tr>
              ) : docentesPaginaAtual.map(docente => {
                const diaSelecionado = diasSelecionados[docente.id];
                const dispoObj = docente.disponibilidade.find(h => h.dia === diaSelecionado);

                return (
                  <tr key={docente.id}>
                    <td className="cd-col-nome">
                      <div>
                        <strong>{docente.nome}</strong>
                        {docente.departamento && (
                          <div style={{ fontSize: '0.8em', color: '#666' }}>
                            {docente.departamento}
                          </div>
                        )}
                      </div>
                    </td>
                    {dias.map(dia => {
                      const dispo = docente.disponibilidade.find(h => h.dia === dia);
                      return (
                        <td key={`${docente.id}-${dia}`} className="cd-col-dia">
                          {dispo && dispo.horas && dispo.horas.length > 0
                            ? dispo.horas.join(", ")
                            : "-"
                          }
                        </td>
                      );
                    })}
                    <td>
                      <select
                        className="cd-select-dia"
                        value={diaSelecionado || ""}
                        onChange={e => handleDiaChange(docente.id, e.target.value)}
                      >
                        <option value="">Selecionar dia</option>
                        {docente.disponibilidade.map(disp => (
                          <option key={disp.dia} value={disp.dia}>{disp.dia}</option>
                        ))}
                      </select>

                      {diaSelecionado && dispoObj && (
                        <select
                          className="cd-select-dia"
                          value={horasSelecionadas[docente.id] || ""}
                          onChange={e => handleHoraChange(docente.id, e.target.value)}
                          style={{ marginTop: "6px" }}
                        >
                          <option value="">Selecionar hora</option>
                          {dispoObj.horas.map(hora => (
                            <option key={hora} value={hora}>{hora}</option>
                          ))}
                        </select>
                      )}

                      <div style={{ marginTop: "8px" }}>
                        <button className="cd-btn-aprovar" onClick={() => abrirModal(docente, "aprovar")}>Aprovo</button>
                        <button className="cd-btn-rejeitar" onClick={() => abrirModal(docente, "rejeitar")} style={{ marginLeft: "6px" }}>Não aprovo</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="cd-paginacao">
          <button
            className="cd-paginacao-btn"
            disabled={paginaIndex === 1}
            onClick={() => mudarPagina(-1)}
          >
            &#x276E;
          </button>
          <span className="cd-paginacao-texto">
            Página {paginaIndex} de {totalPaginas || 1}
          </span>
          <button
            className="cd-paginacao-btn"
            disabled={paginaIndex === totalPaginas || totalPaginas === 0}
            onClick={() => mudarPagina(1)}
          >
            &#x276F;
          </button>
        </div>
      </main>

      <ModalConfirmacao
        visible={modalVisible}
        onConfirm={confirmarAcao}
        onCancel={() => setModalVisible(false)}
        docenteNome={modalDocente?.nome || ""}
        dia={modalDia}
        hora={modalHora}
        acao={modalAcao}
      />

      <ModalAviso
        visible={avisoVisible}
        mensagem={avisoMensagem}
        onClose={fecharAviso}
      />
    </div>
  );
};

export default CoordenadorConsultar;

