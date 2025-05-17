import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DocenteConsultarSubmissoes.css";

const DocenteConsultarSubmissoes = () => {
  const navigate = useNavigate();

  const [submissoes, setSubmissoes] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [paginaAtiva, setPaginaAtiva] = useState("consultarSubmissoes");
  const [nomeUtilizador, setNomeUtilizador] = useState("");
  const [popupAtivo, setPopupAtivo] = useState(false);
  const [submissaoParaApagar, setSubmissaoParaApagar] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  useEffect(() => {
    setNomeUtilizador("Docente");
  }, []);

  const fetchData = async () => {
    const data = [
      { id: 1, dataSubmissao: "12/05/2025 10:30:00", estado: "Pendente" },
      { id: 2, dataSubmissao: "13/05/2025 14:45:00", estado: "Aprovado" },
      { id: 3, dataSubmissao: "14/05/2025 08:15:00", estado: "Rejeitado" },
      { id: 4, dataSubmissao: "15/05/2025 09:20:00", estado: "Pendente" },
      { id: 5, dataSubmissao: "16/05/2025 10:05:00", estado: "Aprovado" },
      { id: 6, dataSubmissao: "17/05/2025 11:00:00", estado: "Rejeitado" },
      { id: 7, dataSubmissao: "18/05/2025 12:30:00", estado: "Pendente" },
      { id: 8, dataSubmissao: "19/05/2025 13:15:00", estado: "Aprovado" },
      { id: 9, dataSubmissao: "20/05/2025 14:00:00", estado: "Rejeitado" },
      { id: 10, dataSubmissao: "21/05/2025 15:30:00", estado: "Pendente" },
      { id: 11, dataSubmissao: "22/05/2025 16:00:00", estado: "Aprovado" },
      { id: 12, dataSubmissao: "23/05/2025 17:15:00", estado: "Rejeitado" },
    ];
    setSubmissoes(data);
    setCarregando(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmeterDisponibilidade = () => {
    setPaginaAtiva("submeterDisponibilidade");
    navigate("/DocenteSubmeter");
  };

  const handleConsultarSubmissoes = () => {
    setPaginaAtiva("consultarSubmissoes");
  };

  const handleVisualizarHorario = () => {
    setPaginaAtiva("visualizarHorario");
    navigate("/DocenteVisualizarHorario");
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleGerirPerfil = () => {
    navigate("/GerirPerfilDocente");
  };

  const paginasPorMostrar = 10;
  const totalPaginas = Math.ceil(submissoes.length / paginasPorMostrar);

  const paginacaoSubmissoes = submissoes.slice(
    (pagina - 1) * paginasPorMostrar,
    pagina * paginasPorMostrar
  );

  const irParaPaginaAnterior = () => {
    if (pagina > 1) setPagina(pagina - 1);
  };

  const irParaProximaPagina = () => {
    if (pagina < totalPaginas) setPagina(pagina + 1);
  };

  const abrirPopupApagar = (submissao) => {
    setSubmissaoParaApagar(submissao);
    setPopupAtivo(true);
  };

  const cancelarApagar = () => {
    setPopupAtivo(false);
    setSubmissaoParaApagar(null);
  };

  const confirmarApagar = () => {
    setSubmissoes((prev) => prev.filter((sub) => sub.id !== submissaoParaApagar.id));
    setPopupAtivo(false);
    setSubmissaoParaApagar(null);
    setMensagemSucesso("Submissão apagada com sucesso.");
    setTimeout(() => {
      setMensagemSucesso("");
      if ((pagina - 1) * paginasPorMostrar >= submissoes.length - 1 && pagina > 1) {
        setPagina(pagina - 1);
      }
    }, 3000);
  };

  return (
    <div className="docente-submissoes-container docente-submissoes-fade-in">
      <aside className="docente-submissoes-sidebar">
        <div className="user-greeting">
          <p>
            Olá, <strong>{nomeUtilizador || "Utilizador"}</strong>
          </p>
          <button className="btn-gerir-perfil" onClick={handleGerirPerfil}>
            Gerir Perfil
          </button>
        </div>

      <nav className="docente-submissoes-menu">
  <ul>
    <li onClick={handleSubmeterDisponibilidade}>Submeter Disponibilidade</li>
    <li
      onClick={handleConsultarSubmissoes}
      className={paginaAtiva === "consultarSubmissoes" ? "active" : ""}
    >
      Consultar Submissões
    </li>
    <li
      onClick={handleVisualizarHorario}
      className={paginaAtiva === "visualizarHorario" ? "active" : ""}
    >
      Visualizar Horário
    </li>
  </ul>
</nav>


        <button onClick={handleLogout} className="docente-submissoes-logout">
          SAIR
        </button>
      </aside>

      <main className="docente-submissoes-content">
        <div className="docente-submissoes-header"></div>

        {mensagemSucesso && (
          <div className="docente-submissoes-popup-sucesso">
            {mensagemSucesso}
          </div>
        )}

        {carregando && <p>Carregando dados...</p>}

        {!carregando && submissoes.length === 0 && <p>Ainda não há submissões para exibir.</p>}

        {!carregando && submissoes.length > 0 && (
          <>
            <div className="docente-submissoes-tabela-wrapper">
              <table className="docente-submissoes-tabela">
                <thead>
                  <tr>
                    <th>Data de Submissão</th>
                    <th>Estado</th>
                    <th>Apagar</th>
                  </tr>
                </thead>
                <tbody>
                  {paginacaoSubmissoes.map((submissao) => (
                    <tr key={submissao.id}>
                      <td className="docente-submissoes-celula">{submissao.dataSubmissao}</td>
                      <td className="docente-submissoes-celula">{submissao.estado}</td>
                      <td className="docente-submissoes-celula">
                        <button
                          className="docente-submissoes-btn-apagar"
                          onClick={() => abrirPopupApagar(submissao)}
                          title="Apagar submissão"
                        >
                          Apagar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="docente-submissoes-paginacao-rodape">
              <button
                onClick={irParaPaginaAnterior}
                className="docente-submissoes-btn-seta"
                disabled={pagina === 1}
              >
                &#x276E;
              </button>
              <span className="docente-submissoes-pagina-info">
                Página {pagina} de {totalPaginas}
              </span>
              <button
                onClick={irParaProximaPagina}
                className="docente-submissoes-btn-seta"
                disabled={pagina === totalPaginas}
              >
                &#x276F;
              </button>
            </div>
          </>
        )}

        {popupAtivo && (
          <div className="docente-submissoes-popup-overlay" onClick={cancelarApagar}>
            <div
              className="docente-submissoes-popup-confirmacao"
              onClick={(e) => e.stopPropagation()}
            >
              <p>Deseja apagar esta submissão?</p>
              <div className="docente-submissoes-popup-botoes">
                <button className="docente-submissoes-btn-cancelar" onClick={cancelarApagar}>
                  Cancelar
                </button>
                <button className="docente-submissoes-btn-confirmar" onClick={confirmarApagar}>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DocenteConsultarSubmissoes;
