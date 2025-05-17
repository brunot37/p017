import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CoordenadorConsultar.css";

function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

const docentesExemplo = [
  {
    id: 1,
    nome: "Ana Silva",
    disponibilidade: [
      { dia: "Segunda", horas: ["09:00-11:00", "14:00-16:00"] },
      { dia: "Quarta", horas: ["10:00-12:00"] },
      { dia: "Sexta", horas: ["08:00-09:30", "13:00-14:00"] }
    ]
  },
  {
    id: 2,
    nome: "Bruno Costa",
    disponibilidade: [
      { dia: "Terça", horas: ["09:00-12:00"] },
      { dia: "Quinta", horas: ["13:00-15:00"] }
    ]
  },
  {
    id: 3,
    nome: "Carla Mendes",
    disponibilidade: [
      { dia: "Segunda", horas: ["08:00-10:00"] },
      { dia: "Quarta", horas: ["14:00-16:00"] },
      { dia: "Sexta", horas: ["09:00-11:00"] }
    ]
  }
];

const ModalConfirmacao = ({ visible, onConfirm, onCancel, docenteNome, dia, hora, acao }) => {
  if (!visible) return null;

  return (
    <div className="cd-modal-overlay" onClick={onCancel}>
      <div className="cd-modal-content" onClick={e => e.stopPropagation()}>
        <h3>Confirmar ação</h3>
        <p>
          Tem a certeza que deseja <strong>{acao === "aprovo" ? "aprovar" : "não aprovar"}</strong> o docente <strong>{docenteNome}</strong> para o dia <strong>{dia}</strong> na hora <strong>{hora}</strong>?
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
  const [docentes, setDocentes] = useState(docentesExemplo);
  const [loading, setLoading] = useState(false);
  const [coordenadorNome, setCoordenadorNome] = useState("");
  const [diasSelecionados, setDiasSelecionados] = useState({});
  const [horasSelecionadas, setHorasSelecionadas] = useState({});
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
    const user = getUserFromToken();
    setCoordenadorNome(user?.nome || "Coordenador");
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
    setHorasSelecionadas(prev => ({ ...prev, [docenteId]: "" }));
  };

  const handleHoraChange = (docenteId, hora) => {
    setHorasSelecionadas(prev => ({ ...prev, [docenteId]: hora }));
  };

  const abrirModal = (docente, acao) => {
    const dia = diasSelecionados[docente.id];
    const hora = horasSelecionadas[docente.id];
    if (!dia) {
      setAvisoMensagem("Por favor, selecione o dia que quer aprovar ou não aprovar.");
      setAvisoVisible(true);
      return;
    }
    if (!hora) {
      setAvisoMensagem("Por favor, selecione a hora que quer aprovar ou não aprovar.");
      setAvisoVisible(true);
      return;
    }
    setModalDocente(docente);
    setModalDia(dia);
    setModalHora(hora);
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
    <div className="cd-container fade-in">
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
              ) : docentesPaginaAtual.map(docente => {
                const diaSelecionado = diasSelecionados[docente.id];
                const dispoObj = docente.disponibilidade.find(h => h.dia === diaSelecionado);

                return (
                  <tr key={docente.id}>
                    <td className="cd-col-nome">{docente.nome}</td>
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
                        <button className="cd-btn-aprovar" onClick={() => abrirModal(docente, "aprovo")}>Aprovo</button>
                        <button className="cd-btn-rejeitar" onClick={() => abrirModal(docente, "nao aprovo")} style={{ marginLeft: "6px" }}>Não aprovo</button>
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
