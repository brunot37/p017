import React, { useState, useEffect } from "react";
import "./DocenteVisualizarHorario.css";

const DocenteVisualizarHorario = () => {
  const [paginaIndex, setPaginaIndex] = useState(1);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);

  const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  // Função para buscar dados da base de dados
  const fetchDocentes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/docentes"); // Substitua por sua URL de API
      const data = await response.json();
      setDocentes(data);
    } catch (error) {
      console.error("Erro ao buscar docentes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar dados ao carregar o componente
  useEffect(() => {
    fetchDocentes();
  }, []);

  // Limitar docentes por página
  const docentesPorPagina = 10;
  const inicio = (paginaIndex - 1) * docentesPorPagina;
  const fim = inicio + docentesPorPagina;
  const docentesPaginaAtual = docentes.slice(inicio, fim);

  // Função para enviar a aprovação ou rejeição para a base de dados
  const atualizarAprovacao = async (docenteId, aprovacao) => {
    try {
      const response = await fetch(`/api/docentes/${docenteId}/aprovacao`, {
        method: "PUT", // Ou "POST", dependendo do seu backend
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ aprovacao }), // Enviando o status de aprovação
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar a aprovação");
      }

      // Atualizar a lista de docentes após a resposta da API
      fetchDocentes();
    } catch (error) {
      console.error("Erro ao atualizar aprovação:", error);
    }
  };

  const mudarPagina = (direcao) => {
    setPaginaIndex((prev) => prev + direcao);
  };

  return (
    <div className="horario-container fade-in">
      <aside className="horario-sidebar">
        <nav className="menu">
          <ul>
            <li className="active">Disponibilidades dos Docentes</li>
            <li>Gerar Horário</li>
          </ul>
        </nav>
        <button className="logout">SAIR</button>
      </aside>

      <main className="horario-content">
        <div className="horario-header">
          <h2 className="horario-titulo">
            Disponibilidade - Página {paginaIndex}
          </h2>
          <div className="semana-navegacao">
            <button onClick={() => mudarPagina(-1)}>&larr; Anterior</button>
            <button onClick={() => mudarPagina(1)}>Próxima &rarr;</button>
          </div>
        </div>

        <div className="horario-tabela-wrapper">
          <table className="horario-tabela">
            <thead>
              <tr>
                <th>Docentes</th>
                {dias.map((dia) => <th key={dia}>{dia}</th>)}
                <th>Aprovação</th> {/* Nova coluna Aprovação */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Carregando...</td>
                </tr>
              ) : docentesPaginaAtual.length === 0 ? (
                <tr>
                  <td colSpan="7">Sem dados para exibir</td>
                </tr>
              ) : (
                docentesPaginaAtual.map((docente) => (
                  <tr key={docente.id}>
                    <td className="hora-coluna">{docente.nome}</td>
                    {dias.map((dia) => {
                      const disponibilidade = docente.disponibilidade.includes(dia) ? "Disponível" : "-";
                      return (
                        <td key={`${docente.id}-${dia}`} className="horario-celula">{disponibilidade}</td>
                      );
                    })}
                    <td>
                      <button 
                        onClick={() => atualizarAprovacao(docente.id, "aceito")}
                        className="aceitar-btn">
                        Aceitar
                      </button>
                      <button 
                        onClick={() => atualizarAprovacao(docente.id, "rejeitado")}
                        className="rejeitar-btn">
                        Rejeitar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default DocenteVisualizarHorario;
