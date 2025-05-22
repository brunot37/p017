import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GerirCoordenadores.css";

const GerirCoordenadores = () => {
  const navigate = useNavigate();
  const [paginaAtiva, setPaginaAtiva] = useState("gerirCoordenadores");

  const [coordenadores, setCoordenadores] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);

  const [alteracoes, setAlteracoes] = useState({});

  const [popup, setPopup] = useState({
    aberto: false,
    mensagem: "",
  });

  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 5;

  useEffect(() => {
    const todosCoordenadores = [
      { id: 1, nome: "User00", cargo: "Pendente", departamentoId: 1 },
      { id: 2, nome: "User01", cargo: "Ativo", departamentoId: 2 },
      { id: 3, nome: "User02", cargo: "Ativo", departamentoId: 1 },
      { id: 4, nome: "User03", cargo: "Pendente", departamentoId: 3 },
      { id: 5, nome: "User04", cargo: "Ativo", departamentoId: 2 },
      { id: 6, nome: "User05", cargo: "Ativo", departamentoId: 3 },
      { id: 7, nome: "User06", cargo: "Pendente", departamentoId: 1 },
    ];
    setCoordenadores(todosCoordenadores);

    setDepartamentos([
      { id: 1, nome: "Departamento A" },
      { id: 2, nome: "Departamento B" },
      { id: 3, nome: "Departamento C" },
    ]);
  }, []);

  const totalPaginas = Math.ceil(coordenadores.length / itensPorPagina);

  const coordenadoresPagina = coordenadores.slice(
    (pagina - 1) * itensPorPagina,
    pagina * itensPorPagina
  );

  const handleDepartamentoChange = (idCoord, novoDepId) => {
    setAlteracoes((prev) => ({
      ...prev,
      [idCoord]: Number(novoDepId),
    }));
  };

  const confirmarAlteracao = (idCoord) => {
    const novoDepId = alteracoes[idCoord];
    if (novoDepId === undefined) {
      abrirPopup("Por favor, selecione um departamento antes de confirmar.");
      return;
    }

    setCoordenadores((prev) =>
      prev.map((c) =>
        c.id === idCoord ? { ...c, departamentoId: novoDepId } : c
      )
    );

    const coordenador = coordenadores.find((c) => c.id === idCoord);
    const departamento = departamentos.find((d) => d.id === novoDepId);

    abrirPopup(
      `Departamento "${departamento?.nome}" atribuído ao coordenador "${coordenador?.nome}".`
    );

    setAlteracoes((prev) => {
      const copy = { ...prev };
      delete copy[idCoord];
      return copy;
    });
  };

  const abrirPopup = (msg) => {
    setPopup({
      aberto: true,
      mensagem: msg,
    });
  };

  const fecharPopup = () => {
    setPopup({
      aberto: false,
      mensagem: "",
    });
  };

  const paginaAnterior = () => {
    if (pagina > 1) setPagina(pagina - 1);
  };
  const paginaSeguinte = () => {
    if (pagina < totalPaginas) setPagina(pagina + 1);
  };

  // Ordem corrigida dos botões no menu:
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
            className="btn-seta"
            onClick={paginaAnterior}
            disabled={pagina === 1}
            title="Página anterior"
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

export default GerirCoordenadores;
