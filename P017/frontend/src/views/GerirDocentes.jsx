import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GerirDocentes.css";

const GerirDocentes = () => {
  const navigate = useNavigate();
  const [paginaAtiva, setPaginaAtiva] = useState("gerirDocentes");

  const [docentes, setDocentes] = useState([]);
  const [coordenadores, setCoordenadores] = useState([]);

  const [alteracoes, setAlteracoes] = useState({});

  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 5;

  const [popup, setPopup] = useState({ aberto: false, mensagem: "" });

  useEffect(() => {
    setDocentes([
      { id: 1, nome: "Docente 01", coordenadorId: 1 },
      { id: 2, nome: "Docente 02", coordenadorId: 2 },
      { id: 3, nome: "Docente 03", coordenadorId: null },
      { id: 4, nome: "Docente 04", coordenadorId: 3 },
      { id: 5, nome: "Docente 05", coordenadorId: null },
      { id: 6, nome: "Docente 06", coordenadorId: 1 },
      { id: 7, nome: "Docente 07", coordenadorId: 2 },
    ]);

    setCoordenadores([
      { id: 1, nome: "User00" },
      { id: 2, nome: "User01" },
      { id: 3, nome: "User02" },
    ]);
  }, []);

  const totalPaginas = Math.ceil(docentes.length / itensPorPagina);

  const docentesPagina = docentes.slice(
    (pagina - 1) * itensPorPagina,
    pagina * itensPorPagina
  );

  const abrirPopup = (msg) => {
    setPopup({ aberto: true, mensagem: msg });
  };

  const fecharPopup = () => {
    setPopup({ aberto: false, mensagem: "" });
  };

  const handleCoordenadorChange = (idDocente, novoCoordId) => {
    setAlteracoes((prev) => ({
      ...prev,
      [idDocente]: novoCoordId === "" ? null : Number(novoCoordId),
    }));
  };

  const confirmarAlteracao = (idDocente) => {
    if (!(idDocente in alteracoes)) {
      abrirPopup("Por favor, selecione um coordenador antes de confirmar.");
      return;
    }

    const novoCoordId = alteracoes[idDocente];

    setDocentes((prev) =>
      prev.map((doc) =>
        doc.id === idDocente ? { ...doc, coordenadorId: novoCoordId } : doc
      )
    );

    const docente = docentes.find((d) => d.id === idDocente);
    const coordenador = coordenadores.find((c) => c.id === novoCoordId);

    abrirPopup(
      `Coordenador "${coordenador ? coordenador.nome : "Nenhum"}" atribuído ao docente "${docente.nome}".`
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
  const handleGerirDocentes = () => {
    setPaginaAtiva("gerirDocentes");
    navigate("/GerirDocentes");
  };
  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="horario-container">
      <aside className="horario-sidebar">
        <nav className="menu">
          <ul>
            <li
              onClick={handleGerirUtilizadores}
              className={paginaAtiva === "gerirUtilizadores" ? "active gerir-utilizadores" : ""}
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
            <li
              onClick={handleGerirDocentes}
              className={paginaAtiva === "gerirDocentes" ? "active" : ""}
            >
              Gerir Docentes
            </li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout">
          SAIR
        </button>
      </aside>

      <main className="horario-content">
        <table className="tabela-gerir-docentes">
          <thead>
            <tr>
              <th style={{ width: "30%" }}>Docente</th>
              <th style={{ textAlign: "center" }}>Alterar Coordenador</th>
            </tr>
          </thead>
          <tbody>
            {docentesPagina.length === 0 && (
              <tr>
                <td colSpan={2} style={{ textAlign: "center" }}>
                  Nenhum docente encontrado
                </td>
              </tr>
            )}

            {docentesPagina.map(({ id, nome, coordenadorId }) => (
              <tr key={id}>
                <td className="td-docente-nome" title={nome}>
                  {nome}
                </td>
                <td className="td-alterar-coordenador">
                  <select
                    className="select-coordenador"
                    value={alteracoes[id] !== undefined ? alteracoes[id] || "" : coordenadorId || ""}
                    onChange={(e) => handleCoordenadorChange(id, e.target.value)}
                  >
                    <option value="">Selecionar Coordenador</option>
                    {coordenadores.map((coord) => (
                      <option key={coord.id} value={coord.id}>
                        {coord.nome}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn-confirmar"
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
            onClick={irParaPaginaAnterior}
            disabled={pagina === 1}
            className="btn-seta"
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
            className="btn-seta"
            title="Próxima página"
            aria-label="Próxima página"
          >
            &#x276F;
            <span className="tooltip">Próxima página</span>
          </button>
        </div>
      </main>

      {popup.aberto && (
        <div className="popup-overlay" onClick={fecharPopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <p>{popup.mensagem}</p>
            <button className="btn-fechar-popup" onClick={fecharPopup}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerirDocentes;
