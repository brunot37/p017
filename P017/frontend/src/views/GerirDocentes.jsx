import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GerirDocentes.css";

const GerirDocentes = () => {
  const navigate = useNavigate();
  const [paginaAtiva, setPaginaAtiva] = useState("gerirDocentes");
  const [docentes, setDocentes] = useState([]);
  const [alteracoes, setAlteracoes] = useState({});
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 5;
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const departamentosEstáticos = [
    { id: 1, nome: "Departamento A" },
    { id: 2, nome: "Departamento B" },
    { id: 3, nome: "Departamento C" },
  ];

  const openModal = (msg) => {
    setModalMessage(msg);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("/api/docentes", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setDocentes(Array.isArray(data) ? data : []);
      })
      .catch(() => setDocentes([]));
  }, []);

  const totalPaginas = Math.ceil(docentes.length / itensPorPagina);
  const docentesPagina = docentes.slice(
    (pagina - 1) * itensPorPagina,
    pagina * itensPorPagina
  );

  const handleDepartamentoChange = (idDocente, novoDepId) => {
    setAlteracoes((prev) => ({
      ...prev,
      [idDocente]: novoDepId === "" ? null : Number(novoDepId),
    }));
  };

  const confirmarAlteracao = (idDocente) => {
    if (!(idDocente in alteracoes)) {
      openModal("Por favor, selecione um departamento antes de confirmar.");
      return;
    }
    const novoDepId = alteracoes[idDocente];

    const departamento = departamentosEstáticos.find((d) => d.id === novoDepId);

    openModal(
      `Departamento "${
        departamento ? departamento.nome : "Nenhum"
      }" atribuído ao docente com ID ${idDocente}. (Simulação)`
    );

    setAlteracoes((prev) => {
      const copy = { ...prev };
      delete copy[idDocente];
      return copy;
    });
  };

  const irParaPaginaAnterior = () => {
    if (pagina > 1) setPagina(pagina - 1);
  };

  const irParaProximaPagina = () => {
    if (pagina < totalPaginas) setPagina(pagina + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleGerirPerfil = () => {
    navigate("/GerirPerfilCoordenador");
  };

  return (
    <div className="docentes-container">
      <aside className="docentes-sidebar">
        <div className="docentes-user">
          <span>
            Olá, <strong>Coordenador</strong>
          </span>
          <button className="docentes-btn-perfil" onClick={handleGerirPerfil}>
            Gerir Perfil
          </button>
          <hr className="docentes-divider" />
        </div>
        <nav className="docentes-menu">
          <ul>
            <li className="active" onClick={() => navigate("/GerirDocentes")}>
              Gerir Docentes
            </li>
            <li onClick={() => navigate("/CoordenadorConsultar")}>
              Disponibilidades dos Docentes
            </li>
            <li onClick={() => navigate("/HorarioDosDocentes")}>
              Horário dos Docentes
            </li>
          </ul>
        </nav>
        <button className="docentes-btn-logout" onClick={handleLogout}>
          SAIR
        </button>
      </aside>
      <main className="docentes-content">
        <table className="docentes-table">
          <thead>
            <tr>
              <th>Docente</th>
              <th style={{ textAlign: "center" }}>Adicionar Departamento</th>
            </tr>
          </thead>
          <tbody>
            {docentesPagina.length === 0 && (
              <tr>
                <td colSpan={2} style={{ textAlign: "center", padding: "20px" }}>
                  Nenhum docente encontrado.
                </td>
              </tr>
            )}
            {docentesPagina.map((docente) => (
              <tr key={docente.id || docente.pk}>
                <td className="docentes-name" title={docente.nome}>
                  {docente.nome}
                </td>
                <td className="docentes-action-cell">
                  <select
                    className="docentes-select"
                    value={
                      alteracoes[docente.id] !== undefined
                        ? alteracoes[docente.id] === null
                          ? ""
                          : alteracoes[docente.id]
                        : ""
                    }
                    onChange={(e) =>
                      handleDepartamentoChange(docente.id, e.target.value)
                    }
                  >
                    <option value="">Nenhum</option>
                    {departamentosEstáticos.map((dep) => (
                      <option key={dep.id} value={dep.id}>
                        {dep.nome}
                      </option>
                    ))}
                  </select>
                  <button
                    className="docentes-btn-confirm"
                    onClick={() => confirmarAlteracao(docente.id || docente.pk)}
                    type="button"
                  >
                    Confirmar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="docentes-pagination">
          <button
            onClick={irParaPaginaAnterior}
            disabled={pagina === 1}
            className="docentes-btn-arrow"
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
            onClick={irParaProximaPagina}
            disabled={pagina === totalPaginas || totalPaginas === 0}
            className="docentes-btn-arrow"
            title="Próxima página"
            aria-label="Próxima página"
          >
            &#x276F;
            <span className="tooltip">Próxima página</span>
          </button>
        </div>
      </main>
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <p>{modalMessage}</p>
            <button className="modal-btn-close" onClick={closeModal}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerirDocentes;

