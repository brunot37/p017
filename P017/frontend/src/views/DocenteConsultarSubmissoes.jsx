import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DocenteVisualizarHorario.css";

const DocenteVisualizarHorario = () => {
  const navigate = useNavigate();

  const [submissoes, setSubmissoes] = useState([]);
  const [pagina, setPagina] = useState(1); 
  const [carregando, setCarregando] = useState(true); 
  const [paginaAtiva, setPaginaAtiva] = useState('consultarSubmissoes'); 

  const fetchData = async () => {
    
    const data = [
      { dataSubmissao: "12/05/2025 10:30:00", estado: "Pendente" },
      { dataSubmissao: "13/05/2025 14:45:00", estado: "Aprovado" },
      { dataSubmissao: "14/05/2025 08:15:00", estado: "Rejeitado" },
      { dataSubmissao: "15/05/2025 09:20:00", estado: "Pendente" },
      { dataSubmissao: "16/05/2025 10:05:00", estado: "Aprovado" },
      { dataSubmissao: "17/05/2025 11:00:00", estado: "Rejeitado" },
      { dataSubmissao: "18/05/2025 12:30:00", estado: "Pendente" },
      { dataSubmissao: "19/05/2025 13:15:00", estado: "Aprovado" },
      { dataSubmissao: "20/05/2025 14:00:00", estado: "Rejeitado" },
      { dataSubmissao: "21/05/2025 15:30:00", estado: "Pendente" },
      { dataSubmissao: "22/05/2025 16:00:00", estado: "Aprovado" },
      { dataSubmissao: "23/05/2025 17:15:00", estado: "Rejeitado" }
    ];
    setSubmissoes(data);
    setCarregando(false); 
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmeterDisponibilidade = () => {
    setPaginaAtiva('submeterDisponibilidade');
    navigate('/DocenteSubmeter');
  };

  const handleConsultarSubmissoes = () => {
    setPaginaAtiva('consultarSubmissoes');
    
  };

  const handleVisualizarHorario = () => {
    setPaginaAtiva('visualizarHorario');
    navigate('/DocenteVisualizarHorario');o
  };

  const handleLogout = () => {
    navigate("/App"); 
  };

  const paginasPorMostrar = 10;
  const paginacaoSubmissoes = submissoes.slice((pagina - 1) * paginasPorMostrar, pagina * paginasPorMostrar);

  const irParaPaginaAnterior = () => {
    if (pagina > 1) {
      setPagina(pagina - 1);
    }
  };

  const irParaProximaPagina = () => {
    if (pagina < Math.ceil(submissoes.length / paginasPorMostrar)) {
      setPagina(pagina + 1);
    }
  };

  return (
    <div className="horario-container fade-in">
      <aside className="horario-sidebar">
        <nav className="menu">
          <ul>
            <li onClick={handleVisualizarHorario} className={paginaAtiva === 'visualizarHorario' ? 'active' : ''}>Visualizar Horário</li>
            <li onClick={handleSubmeterDisponibilidade}>Submeter Disponibilidade</li>
            <li onClick={handleConsultarSubmissoes} className={paginaAtiva === 'consultarSubmissoes' ? 'active' : ''}>Consultar Submissões</li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout">SAIR</button> 
      </aside>

      <main className="horario-content">
        <div className="horario-header">
          <div className="semana-navegacao">
            <button onClick={irParaPaginaAnterior}>&larr; Anterior</button>
            <button onClick={irParaProximaPagina}>Próxima &rarr;</button>
          </div>
        </div>

        {!carregando && submissoes.length === 0 && (
          <p>Ainda não há submissões para exibir.</p> 
        )}

        {!carregando && submissoes.length > 0 && (
          <div className="horario-tabela-wrapper">
            <table className="horario-tabela">
              <thead>
                <tr>
                  <th>Data de Submissão</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {paginacaoSubmissoes.map((submissao, index) => (
                  <tr key={index}>
                    <td className="horario-celula">{submissao.dataSubmissao}</td>
                    <td className="horario-celula">{submissao.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {carregando && <p>Carregando dados...</p>} 
      </main>
    </div>
  );
};

export default DocenteVisualizarHorario;
