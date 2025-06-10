import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { navegarParaPerfilCorreto } from "../utils/navegacao";
import "./GerirDocentes.css";

const GerirDocentes = () => {
  const navigate = useNavigate();
  const [paginaAtiva, setPaginaAtiva] = useState("gerirDocentes");
  const [docentes, setDocentes] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [alteracoes, setAlteracoes] = useState({});
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 5;
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasDepartment, setHasDepartment] = useState(true);
  const [coordenadorDepartamento, setCoordenadorDepartamento] = useState(null);
  const [userTipo, setUserTipo] = useState("");
  const [userName, setUserName] = useState(""); // Adicionar estado para o nome

  const openModal = (msg) => {
    setModalMessage(msg);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    const fetchUserInfo = async () => {
      try {
        const userResponse = await fetch("/api/user/info", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserTipo(userData.tipo_conta);
          setUserName(userData.nome); // Armazenar o nome do usuário
        }
      } catch (error) {
        console.error("Erro ao buscar informações do usuário:", error);
      }
    };
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        await fetchUserInfo();
        
        const docentesResponse = await fetch("/api/docentes", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (docentesResponse.ok) {
          const data = await docentesResponse.json();
          
          if (data.docentes) {
            setDocentes(Array.isArray(data.docentes) ? data.docentes : []);
            setHasDepartment(data.has_department);
            setCoordenadorDepartamento(data.coordenador_departamento);
          } else {
            setDocentes(Array.isArray(data) ? data : []);
          }
        }
        
        // Só buscar departamentos se for admin
        const userInfoResponse = await fetch("/api/user/info", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          
          if (userInfo.tipo_conta === 'adm') {
            const departamentosResponse = await fetch("/api/departamentos", {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            
            if (departamentosResponse.ok) {
              const departamentosData = await departamentosResponse.json();
              setDepartamentos(Array.isArray(departamentosData) ? departamentosData : []);
            }
          }
        }
        
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        openModal("Erro ao carregar dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalPaginas = Math.ceil(docentes.length / itensPorPagina);
  const docentesPagina = docentes.slice(
    (pagina - 1) * itensPorPagina,
    pagina * itensPorPagina
  );

  // Função para coordenadores - adicionar/remover docente
  const toggleDocenteCoordenacao = async (idDocente, temCoordenador) => {
    const token = localStorage.getItem("token");
    const action = temCoordenador ? "remove" : "add";

    try {
      const requestBody = {
        action: action,
      };

      // Se está adicionando e tem departamento do coordenador, incluir o departamento_id
      if (action === "add" && coordenadorDepartamento) {
        requestBody.departamento_id = coordenadorDepartamento.id;
      }

      const response = await fetch(`/api/docentes/${idDocente}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const docenteAtualizado = await response.json();
        
        setDocentes(prev => prev.map(docente => 
          docente.id === idDocente ? docenteAtualizado : docente
        ));

        const mensagem = action === "add" 
          ? `Docente ${docenteAtualizado.nome} foi adicionado à sua coordenação e vinculado ao departamento ${coordenadorDepartamento?.nome} com sucesso!`
          : `Docente ${docenteAtualizado.nome} foi removido da sua coordenação com sucesso!`;
        
        openModal(mensagem);
      } else {
        const errorData = await response.json();
        openModal(`Erro: ${errorData.detail || "Erro desconhecido"}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar coordenação:", error);
      openModal("Erro ao comunicar com o servidor. Tente novamente.");
    }
  };

  // Função para administradores - alterar departamento
  const handleDepartamentoChange = (idDocente, novoDepId) => {
    setAlteracoes((prev) => ({
      ...prev,
      [idDocente]: novoDepId === "" ? null : Number(novoDepId),
    }));
  };

  const confirmarAlteracao = async (idDocente) => {
    if (!(idDocente in alteracoes)) {
      openModal("Por favor, selecione um departamento antes de confirmar.");
      return;
    }
    
    const token = localStorage.getItem("token");
    const novoDepId = alteracoes[idDocente];

    try {
      const response = await fetch(`/api/docentes/${idDocente}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departamento_id: novoDepId,
        }),
      });

      if (response.ok) {
        const docenteAtualizado = await response.json();
        
        setDocentes(prev => prev.map(docente => 
          docente.id === idDocente ? docenteAtualizado : docente
        ));

        const departamento = departamentos.find((d) => d.id === novoDepId);
        openModal(
          `Departamento "${
            departamento ? departamento.nome : "Nenhum"
          }" atribuído ao docente ${docenteAtualizado.nome} com sucesso!`
        );

        setAlteracoes((prev) => {
          const copy = { ...prev };
          delete copy[idDocente];
          return copy;
        });
      } else {
        const errorData = await response.json();
        openModal(`Erro ao atribuir departamento: ${errorData.detail || "Erro desconhecido"}`);
      }
    } catch (error) {
      console.error("Erro ao confirmar alteração:", error);
      openModal("Erro ao comunicar com o servidor. Tente novamente.");
    }
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
    navegarParaPerfilCorreto(navigate);
  };

  if (loading) {
    return (
      <div className="docentes-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px' 
        }}>
          Carregando...
        </div>
      </div>
    );
  }

  // Se for coordenador e não tem departamento
  if (userTipo === 'coordenador' && !hasDepartment) {
    return (
      <div className="docentes-container">
        <aside className="docentes-sidebar">
          <div className="docentes-user">
            <span>
              Olá, <strong>{userName}</strong>
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
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '60vh',
            textAlign: 'center',
            padding: '20px'
          }}>
            <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>
              Departamento Não Atribuído
            </h2>
            <p style={{ fontSize: '16px', color: '#7f8c8d', maxWidth: '500px', lineHeight: '1.5' }}>
              Ainda não foi atribuído nenhum departamento a este coordenador. 
              Entre em contato com o administrador do sistema para que seja feita a atribuição de departamento.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="docentes-container">
      <aside className="docentes-sidebar">
        <div className="docentes-user">
          <span>
            Olá, <strong>{userName}</strong>
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
        {coordenadorDepartamento && (
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '10px 15px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            border: '1px solid #27ae60'
          }}>
            <strong>Departamento:</strong> {coordenadorDepartamento.nome}
          </div>
        )}
        
        <table className="docentes-table">
          <thead>
            <tr>
              <th>Docente</th>
              {userTipo === 'adm' ? (
                <>
                  <th>Departamento Atual</th>
                  <th style={{ textAlign: "center" }}>Adicionar/Alterar Departamento</th>
                </>
              ) : (
                <>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Ação</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {docentesPagina.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "20px" }}>
                  {userTipo === 'coordenador' 
                    ? "Nenhum docente encontrado no seu departamento."
                    : "Nenhum docente encontrado."
                  }
                </td>
              </tr>
            )}
            {docentesPagina.map((docente) => (
              <tr key={docente.id}>
                <td className="docentes-name" title={docente.nome}>
                  {docente.nome}
                </td>
                
                {userTipo === 'adm' ? (
                  // Interface para administrador
                  <>
                    <td className="docentes-current-dept">
                      {docente.departamento ? docente.departamento.nome : "Nenhum"}
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
                        {departamentos.map((dep) => (
                          <option key={dep.id} value={dep.id}>
                            {dep.nome}
                          </option>
                        ))}
                      </select>
                      <button
                        className="docentes-btn-confirm"
                        onClick={() => confirmarAlteracao(docente.id)}
                        type="button"
                      >
                        Confirmar
                      </button>
                    </td>
                  </>
                ) : (
                  // Interface para coordenador
                  <>
                    <td className="docentes-current-dept">
                      {docente.tem_coordenador ? (
                        <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
                          Sob sua coordenação
                        </span>
                      ) : (
                        <span style={{ color: '#e74c3c' }}>
                          Sem coordenador
                        </span>
                      )}
                    </td>
                    <td className="docentes-action-cell">
                      <button
                        className={`docentes-btn-confirm ${
                          docente.tem_coordenador ? 'btn-remove' : 'btn-add'
                        }`}
                        onClick={() => toggleDocenteCoordenacao(docente.id, docente.tem_coordenador)}
                        type="button"
                        style={{
                          backgroundColor: docente.tem_coordenador ? '#e74c3c' : '#27ae60',
                          color: 'white',
                          border: 'none',
                          padding: '8px 15px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {docente.tem_coordenador ? 'Remover' : 'Adicionar'}
                      </button>
                    </td>
                  </>
                )}
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

