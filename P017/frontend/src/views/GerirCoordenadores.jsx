import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GerirCoordenadores.css";

const GerirCoordenadores = () => {
  const navigate = useNavigate();
  const [paginaAtiva, setPaginaAtiva] = useState("gerirCoordenadores");

  const [coordenadores, setCoordenadores] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);

  useEffect(() => {
    // Simulação: dados de coordenadores da API
    setCoordenadores([
      { id: 1, nome: "User00", cargo: "Pendente", departamentoId: 1 },
      { id: 2, nome: "User01", cargo: "Ativo", departamentoId: 2 },
    ]);

    // Simulação: departamentos da API
    setDepartamentos([
      { id: 1, nome: "Departamento A" },
      { id: 2, nome: "Departamento B" },
      { id: 3, nome: "Departamento C" },
    ]);
  }, []);

  const handleDepartamentoChange = (idCoord, novoDepId) => {
    setCoordenadores((prev) =>
      prev.map((c) =>
        c.id === idCoord ? { ...c, departamentoId: Number(novoDepId) } : c
      )
    );
    // Aqui podes fazer PUT para a API para guardar alteração
  };

  // Handlers sidebar
  const handleGerirUtilizadores = () => {
    setPaginaAtiva("gerirUtilizadores");
    navigate("/Adm");
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
              <th>Utilizador</th>
              <th>Cargo</th>
              <th>Alterar Departamento</th>
            </tr>
          </thead>
          <tbody>
            {coordenadores.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center" }}>
                  Nenhum coordenador encontrado
                </td>
              </tr>
            )}

            {coordenadores.map(({ id, nome, cargo, departamentoId }) => (
              <tr key={id}>
                <td>{nome}</td>
                <td>{cargo}</td>
                <td>
                  <select
                    value={departamentoId || ""}
                    onChange={(e) => handleDepartamentoChange(id, e.target.value)}
                  >
                    <option value="">Selecionar Departamento</option>
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nome}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default GerirCoordenadores;
