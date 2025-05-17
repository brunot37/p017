import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CoordenadorConsultar.css";

function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (e) {
    console.error("Erro a ler token JWT:", e);
    return null;
  }
}

const exemploDocente = {
  id: 999,
  nome: "Exemplo Docente",
  disponibilidade: [
    { dia: "Segunda" },
    { dia: "Quarta" },
    { dia: "Sexta" }
  ],
};

const ModalConfirmacao = ({ visible, onConfirm, onCancel, docenteNome, dia, acao }) => {
  if (!visible) return null;

  return (
    <div className="cd-modal-overlay" onClick={onCancel}>
      <div className="cd-modal-content" onClick={e => e.stopPropagation()}>
        <h3>Confirmar ação</h3>
        <p>
          Tem a certeza que deseja <strong>{acao === "aprovo" ? "aprovar" : "não aprovar"}</strong> o docente <strong>{docenteNome}</strong> para o dia <strong>{dia}</strong>?
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
  const [docentes, setDocentes] = useState([exemploDocente]);
  const [loading, setLoading] = useState(false);
  const [coordenadorNome, setCoordenadorNome] = useState("");
  const [diasSelecionados, setDiasSelecionados] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDocente, setModalDocente] = useState(null);
  const [modalDia, setModalDia] = useState("");
  const [modalAcao, setModalAcao] = useState("");
  const [avisoVisible, setAvisoVisible] = useState(false);
  const [avisoMensagem, setAvisoMensagem] = useState("");
  const navigate = useNavigate();
  const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  useEffect(() => {
    const user = getUserFromToken();
    setCoordenadorNome(user?.nome || "Coordenador");
  }, []);

  const fetchDocentes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/docentes/com-horarios");
      const data = await response.json();
      if (data?.length) setDocentes(data);
    } catch (error) {
      console.error("Erro ao buscar docentes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocentes();
  }, []);

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
  };

  const abrirModal = (docente, acao) => {
    const dia = diasSelecionados[docente.id];
    if (!dia) {
      setAvisoMensagem("Por favor, selecione o dia que quer aprovar ou não aprovar.");
      setAvisoVisible(true);
      return;
    }
    setModalDocente(docente);
    setModalDia(dia);
    setModalAcao(acao);
    setModalVisible(true);
  };

  const confirmarAcao = () => {
    setModalVisible(false);
    setAvisoMensagem(modalAcao === "aprovo" ? "Aprovação registada com sucesso!" : "Rejeição registada com sucesso!");
    setAvisoVisible(true);
  };

  const fecharAviso = () => {
    setAvisoVisible(false);
  };

  const totalPaginas = Math.ceil(docentes.length / docentesPorPagina);

  return (
    <>
      <div className="cd-container">
        <aside className="cd-sidebar">
          <div className="cd-user">
            <span>Olá, <strong>{coordenadorNome}</strong></span>
            <button className="cd-btn-perfil" onClick={() => navigate("/GerirPerfilCoordenador")}>Gerir Perfil</button>
            <hr className="cd-divider" />
          </div>

          <nav className="cd-menu">
            <ul>
              <li className="active">Disponibilidades dos Docentes</li>
              <li onClick={() => navigate("/HorarioDosDocentes")}>Horário dos Docentes</li>
            </ul>
          </nav>

          <button className="cd-btn-logout" onClick={handleLogout}>SAIR</button>
        </aside>

        <main className="cd-main">
          <h2 className="cd-titulo">Olá, {coordenadorNome}</h2>

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
                  <tr><td colSpan="8">Carregando...</td></tr>
                ) : docentesPaginaAtual.length === 0 ? (
                  <tr><td colSpan="8">Sem dados para exibir</td></tr>
                ) : docentesPaginaAtual.map(docente => (
                  <tr key={docente.id}>
                    <td className="cd-col-nome">{docente.nome}</td>
                    {dias.map(dia => {
                      const dispo = docente.disponibilidade.some(h => h.dia === dia) ? "Disponível" : "-";
                      return <td key={`${docente.id}-${dia}`} className="cd-col-dia">{dispo}</td>;
                    })}
                    <td>
                      <select
                        className="cd-select-dia"
                        value={diasSelecionados[docente.id] || ""}
                        onChange={e => handleDiaChange(docente.id, e.target.value)}
                      >
                        <option value="">Selecionar dia</option>
                        {docente.disponibilidade.map(disp => (
                          <option key={disp.dia} value={disp.dia}>{disp.dia}</option>
                        ))}
                      </select>
                      <div style={{ marginTop: "8px" }}>
                        <button className="cd-btn-aprovar" onClick={() => abrirModal(docente, "aprovo")}>Aprovo</button>
                        <button className="cd-btn-rejeitar" onClick={() => abrirModal(docente, "nao aprovo")} style={{ marginLeft: "6px" }}>Não aprovo</button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              Página {paginaIndex} de {totalPaginas}
            </span>
            <button
              className="cd-paginacao-btn"
              disabled={paginaIndex === totalPaginas}
              onClick={() => mudarPagina(1)}
            >
              &#x276F;
            </button>
          </div>
        </main>
      </div>

      <ModalConfirmacao
        visible={modalVisible}
        onConfirm={confirmarAcao}
        onCancel={() => setModalVisible(false)}
        docenteNome={modalDocente?.nome || ""}
        dia={modalDia}
        acao={modalAcao}
      />

      <ModalAviso
        visible={avisoVisible}
        mensagem={avisoMensagem}
        onClose={fecharAviso}
      />
    </>
  );
};

export default CoordenadorConsultar;
