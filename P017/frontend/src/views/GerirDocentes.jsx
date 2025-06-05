import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  const openModal = (msg) => {
    setModalMessage(msg);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const docentesResponse = await fetch("/api/docentes", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (docentesResponse.ok) {
          const docentesData = await docentesResponse.json();
          setDocentes(Array.isArray(docentesData) ? docentesData : []);
        }
        
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
    navigate("/GerirPerfilCoordenador");
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
              <th>Departamento Atual</th>
              <th style={{ textAlign: "center" }}>Adicionar/Alterar Departamento</th>
            </tr>
          </thead>
          <tbody>
            {docentesPagina.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "20px" }}>
                  Nenhum docente encontrado.
                </td>
              </tr>
            )}
            {docentesPagina.map((docente) => (
              <tr key={docente.id}>
                <td className="docentes-name" title={docente.nome}>
                  {docente.nome}
                </td>
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

