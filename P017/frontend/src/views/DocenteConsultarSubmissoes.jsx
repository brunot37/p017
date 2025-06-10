import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verificarDepartamentoDocente } from "../utils/verificarDepartamento";
import { navegarParaPerfilCorreto } from "../utils/navegacao";
import "./DocenteConsultarSubmissoes.css";

const DocenteConsultarSubmissoes = () => {
  const navigate = useNavigate();
  const [verificandoDepartamento, setVerificandoDepartamento] = useState(true);

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
    setCarregando(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token não encontrado");
        navigate("/");
        return;
      }

      const response = await fetch("http://localhost:8000/api/submeter-disponibilidade", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        const submissoesFormatadas = data.map(item => {
          let dataSubmissao;
          if (item.created_at) {
            dataSubmissao = new Date(item.created_at);
          } else if (item.data_submissao) {
            dataSubmissao = new Date(item.data_submissao);
          } else {
            dataSubmissao = new Date();
          }
          
          return {
            id: item.id,
            dataSubmissao: formatarDataHora(dataSubmissao), 
            estado: item.estado || "Pendente",
            dia: item.dia,
            hora_inicio: item.hora_inicio,
            hora_fim: item.hora_fim,
            semestre: item.semestre,
            ano_letivo: item.ano_letivo
          };
        });
        
        setSubmissoes(submissoesFormatadas);
      } else {
        console.error("Erro ao carregar submissões:", await response.text());
        setSubmissoes([]);
      }
    } catch (error) {
      console.error("Erro ao buscar submissões:", error);
      setSubmissoes([]);
    } finally {
      setCarregando(false);
    }
  };

  const formatarDataHora = (data) => {
    if (!(data instanceof Date) || isNaN(data.getTime())) {
      console.warn("Data inválida fornecida:", data);
      return "Data não disponível";
    }
    
    try {
      return data.toLocaleString('pt-BR', {
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Erro na formatação";
    }
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
    navegarParaPerfilCorreto(navigate);
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

  const confirmarApagar = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !submissaoParaApagar) {
        setPopupAtivo(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/api/submeter-disponibilidade/${submissaoParaApagar.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSubmissoes((prev) => prev.filter((sub) => sub.id !== submissaoParaApagar.id));
        setMensagemSucesso("Submissão apagada com sucesso.");
        
        if ((pagina - 1) * paginasPorMostrar >= submissoes.length - 1 && pagina > 1) {
          setPagina(pagina - 1);
        }
      } else {
        const erro = await response.json();
        setMensagemSucesso(`Erro ao apagar: ${erro.message || "Ocorreu um erro"}`);
      }
    } catch (error) {
      setMensagemSucesso("Erro ao tentar apagar a submissão.");
      console.error("Erro:", error);
    } finally {
      setPopupAtivo(false);
      setSubmissaoParaApagar(null);
      setTimeout(() => setMensagemSucesso(""), 3000);
    }
  };

  useEffect(() => {
    const verificarAcesso = async () => {
      const resultado = await verificarDepartamentoDocente(navigate);
      if (resultado.redirecionado) {
        return; // Já foi redirecionado
      }
      setVerificandoDepartamento(false);
    };
    
    verificarAcesso();
  }, [navigate]);

  // Se ainda está verificando o departamento, mostrar loading
  if (verificandoDepartamento) {
    return (
      <div className="consultar-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div className="carregando-indicador">Verificando permissões...</div>
        </div>
      </div>
    );
  }

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
                    <th>Dia da Semana</th>
                    <th>Horário</th>
                    <th>Semestre</th>
                    <th>Ano Letivo</th>
                    <th>Estado</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginacaoSubmissoes.map((submissao) => {
                    const dataObj = submissao.dia ? new Date(submissao.dia) : null;
                    const diaSemana = dataObj ? 
                      ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dataObj.getDay()] : 
                      '—';
                    
                    return (
                      <tr key={submissao.id}>
                        <td className="docente-submissoes-celula">{submissao.dataSubmissao}</td>
                        <td className="docente-submissoes-celula">{diaSemana}</td>
                        <td className="docente-submissoes-celula">
                          {submissao.hora_inicio && submissao.hora_fim 
                            ? `${submissao.hora_inicio} às ${submissao.hora_fim}` 
                            : '—'}
                        </td>
                        <td className="docente-submissoes-celula">
                          {submissao.semestre ? `${submissao.semestre}º Semestre` : '—'}
                        </td>
                        <td className="docente-submissoes-celula">{submissao.ano_letivo || '—'}</td>
                        <td className="docente-submissoes-celula">
                          <span className={`estado-${submissao.estado.toLowerCase()}`}>
                            {submissao.estado}
                          </span>
                        </td>
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
                    );
                  })}
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
