import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Adm.css";

const DocenteVisualizarHorario = () => {
  const navigate = useNavigate();

  const [submissoes, setSubmissoes] = useState([]);
  const [pagina, setPagina] = useState(1); 
  const [carregando, setCarregando] = useState(true); 
  const [paginaAtiva, setPaginaAtiva] = useState('consultarSubmissoes'); 

  // Dados fictícios para simular a base de dados
  const fetchData = async () => {
    const data = [
      { utilizador: "João", cargo: "Pendente" },
      { utilizador: "Maria", cargo: "Pendente" },
      { utilizador: "Pedro", cargo: "Pendente" },
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

  const handleGerirUtilizadores = () => {
    setPaginaAtiva('gerirUtilizadores');
    navigate('/GerirUtilizadores');
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

  // Função para alterar o cargo do utilizador
  const handleAlterarCargo = (index, novoCargo) => {
    const novaLista = [...submissoes];
    novaLista[index].cargo = novoCargo;
    setSubmissoes(novaLista);
  };

  return (
    <div className="horario-container fade-in">
      <aside className="horario-sidebar">
        <nav className="menu">
          <ul>
            <li onClick={handleGerirUtilizadores} className={paginaAtiva === 'gerirUtilizadores' ? 'active' : ''}>Gerir Utilizadores</li>
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
          <p>Ainda não há utilizadores para exibir.</p> 
        )}

        {!carregando && submissoes.length > 0 && (
          <div className="horario-tabela-wrapper">
            <table className="horario-tabela">
              <thead>
                <tr>
                  <th>Utilizador</th>
                  <th>Cargo</th>
                  <th>Alterar Cargo</th>
                </tr>
              </thead>
              <tbody>
                {paginacaoSubmissoes.map((submissao, index) => (
                  <tr key={index}>
                    <td className="horario-celula">{submissao.utilizador}</td>
                    <td className="horario-celula">{submissao.cargo}</td>
                    <td className="horario-celula">
                      <select
                        value={submissao.cargo} // Cargo inicial é "Pendente" por padrão
                        onChange={(e) => handleAlterarCargo(index, e.target.value)}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Docente">Docente</option>
                        <option value="Coordenador">Coordenador</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                    </td>
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
