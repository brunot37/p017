import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GerirCoordenadores.css";

const Modal = ({ message, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <p>{message}</p>
      <button onClick={onClose}>OK</button>
    </div>
  </div>
);

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <p>{message}</p>
      <div style={{ marginTop: "20px" }}>
        <button
          className="dep-btn-save"
          onClick={onConfirm}
          style={{ marginRight: "10px" }}
        >
          Sim
        </button>
        <button className="dep-btn-cancel" onClick={onCancel}>
          Não
        </button>
      </div>
    </div>
  </div>
);

const ITEMS_PER_PAGE = 5;

const GerirCoordenadores = () => {
  const navigate = useNavigate();
  const [paginaAtiva, setPaginaAtiva] = useState("gerirCoordenadores");

  const [coordenadores, setCoordenadores] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);

  const [alteracoes, setAlteracoes] = useState({});

  // Modal de mensagem simples
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal de confirmação (para futuras ações tipo remover)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [idParaRemover, setIdParaRemover] = useState(null);

  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.ceil(coordenadores.length / ITEMS_PER_PAGE);

  const coordenadoresPagina = coordenadores.slice(
    (pagina - 1) * ITEMS_PER_PAGE,
    pagina * ITEMS_PER_PAGE
  );

  const abrirModal = (msg) => {
    setModalMessage(msg);
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
  };

  // Por agora não há remoção no código, mas fica a estrutura:
  const pedirConfirmRemover = (id) => {
    setIdParaRemover(id);
    setConfirmModalOpen(true);
  };

  const cancelarRemover = () => {
    setIdParaRemover(null);
    setConfirmModalOpen(false);
  };

  const confirmarRemover = () => {
    // Aqui colocaria a lógica para remover coordenador se existir
    setConfirmModalOpen(false);
    abrirModal("Funcionalidade de remoção não implementada.");
  };

  const handleDepartamentoChange = (idCoord, novoDepId) => {
    setAlteracoes((prev) => ({
      ...prev,
      [idCoord]: Number(novoDepId),
    }));
  };

  const confirmarAlteracao = (idCoord) => {
    const novoDepId = alteracoes[idCoord];
    if (novoDepId === undefined) {
      abrirModal("Por favor, selecione um departamento antes de confirmar.");
      return;
    }

    setCoordenadores((prev) =>
      prev.map((c) =>
        c.id === idCoord ? { ...c, departamentoId: novoDepId } : c
      )
    );

    const coordenador = coordenadores.find((c) => c.id === idCoord);
    const departamento = departamentos.find((d) => d.id === novoDepId);

    abrirModal(
      `Departamento "${departamento?.nome}" atribuído ao coordenador "${coordenador?.nome}".`
    );

    setAlteracoes((prev) => {
      const copy = { ...prev };
      delete copy[idCoord];
      return copy;
    });
  };

  const paginaAnterior = () => {
    if (pagina > 1) setPagina(pagina - 1);
  };
  const paginaSeguinte = () => {
    if (pagina < totalPaginas) setPagina(pagina + 1);
  };

  const handleGerirUtilizadores = () => {
    setPaginaAtiva("gerirUtilizadores");
    navigate("/Adm");
  };
  const handleGerirEscolas = () => {
    setPaginaAtiva("gerirEscolas");
    navigate("/GerirEscolas");
  };
  const handleGerirDepartamento = () => {
    setPaginaAtiva("gerirDepartamento");
    navigate("/GerirDepartamento");
  };
  const handleGerirCoordenadores = () => {
    setPaginaAtiva("gerirCoordenadores");
    navigate("/GerirCoordenadores");
  };
  const handleLogout = () => {
    navigate("/");
  };

  useEffect(() => {
    fetch("/api/coordenadores")
      .then((res) => res.json())
      .then((data) => setCoordenadores(data))
      .catch(() => abrirModal("Erro ao carregar coordenadores."));

    fetch("/api/departamentos")
      .then((res) => res.json())
      .then((data) => setDepartamentos(data))
      .catch(() => abrirModal("Erro ao carregar departamentos."));
  }, []);

  return (
    <>
      <div className="horario-container">
        <aside className="horario-sidebar">
          <nav className="menu">
            <ul>
              <li
                onClick={handleGerirUtilizadores}
                className={
                  paginaAtiva === "gerirUtilizadores"
                    ? "active gerir-utilizadores"
                    : ""
                }
              >
                Gerir Utilizadores
              </li>
              <li
                onClick={handleGerirEscolas}
                className={paginaAtiva === "gerirEscolas" ? "active" : ""}
              >
                Gerir Escolas
              </li>
              <li
                onClick={handleGerirDepartamento}
                className={paginaAtiva === "gerirDepartamento" ? "active" : ""}
              >
                Gerir Departamento
              </li>
              <li
                onClick={handleGerirCoordenadores}
                className={paginaAtiva === "gerirCoordenadores" ? "active" : ""}
              >
                Gerir Coordenadores
              </li>
            </ul>
          </nav>
          <button onClick={handleLogout} className="logout">
            SAIR
          </button>
        </aside>

        <main className="horario-content">
          <table className="tabela-coordenadores">
            <thead>
              <tr>
                <th>Coordenador</th>
                <th>Cargo</th>
                <th>Alterar Departamento</th>
              </tr>
            </thead>
            <tbody>
              {coordenadoresPagina.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center" }}>
                    Nenhum coordenador encontrado
                  </td>
                </tr>
              )}

              {coordenadoresPagina.map(({ id, nome, cargo, departamentoId }) => (
                <tr key={id}>
                  <td>{nome}</td>
                  <td>{cargo}</td>
                  <td className="td-alterar-departamento">
                    <select
                      value={
                        alteracoes[id] !== undefined
                          ? alteracoes[id]
                          : departamentoId || ""
                      }
                      onChange={(e) => handleDepartamentoChange(id, e.target.value)}
                      className="select-departamento"
                    >
                      <option value="">Selecionar Departamento</option>
                      {departamentos.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nome}
                        </option>
                      ))}
                    </select>
                    <button
                      className="dep-btn-save"
                      onClick={() => confirmarAlteracao(id)}
                      type="button"
                    >
                      Confirmar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="tabela-navegacao">
            <button
              className="btn-seta"
              onClick={paginaAnterior}
              disabled={pagina === 1}
              title="Página anterior"
              aria-label="Página anterior"
            >
              &#x276E;
              <span className="tooltip">Página anterior</span>
            </button>

            <span className="pagina-atual">
              Página {pagina} de {totalPaginas}
            </span>

            <button
              className="btn-seta"
              onClick={paginaSeguinte}
              disabled={pagina === totalPaginas}
              title="Próxima página"
              aria-label="Próxima página"
            >
              &#x276F;
              <span className="tooltip">Próxima página</span>
            </button>
          </div>
        </main>
      </div>

      {isModalOpen && <Modal message={modalMessage} onClose={fecharModal} />}

      {confirmModalOpen && (
        <ConfirmModal
          message="Tem certeza que deseja remover este coordenador?"
          onConfirm={confirmarRemover}
          onCancel={cancelarRemover}
        />
      )}
    </>
  );
};

export default GerirCoordenadores;
